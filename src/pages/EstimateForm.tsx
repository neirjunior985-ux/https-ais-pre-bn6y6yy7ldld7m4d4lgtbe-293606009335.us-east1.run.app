import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Client, Service, EstimateItem, BusinessProfile } from '../types';
import { Plus, Trash2, Save, FileText, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, cn } from '../lib/utils';
import { generateEstimatePDF } from '../lib/pdf';

export default function EstimateForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  
  const [selectedClientId, setSelectedClientId] = useState('');
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const clientsSnap = await getDocs(query(collection(db, 'clients'), where('ownerId', '==', user.uid)));
      const servicesSnap = await getDocs(query(collection(db, 'services'), where('ownerId', '==', user.uid)));
      const profileSnap = await getDoc(doc(db, 'businessProfiles', user.uid));
      
      setClients(clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
      setServices(servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
      if (profileSnap.exists()) setProfile({ id: profileSnap.id, ...profileSnap.data() } as BusinessProfile);
    };
    fetchData();
  }, [user]);

  const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);
  const total = subtotal - discount;

  const addItem = (service: Service) => {
    setItems([...items, {
      serviceId: service.id,
      name: service.name,
      description: service.description,
      quantity: 1,
      unitPrice: service.unitPrice,
      total: service.unitPrice
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    newItems[index].total = quantity * newItems[index].unitPrice;
    setItems(newItems);
  };

  const handleSave = async (generatePdf = false) => {
    if (!user || !selectedClientId || items.length === 0) {
      alert('Selecione um cliente e adicione pelo menos um item.');
      return;
    }
    
    setLoading(true);
    const client = clients.find(c => c.id === selectedClientId);
    const estimateNumber = `${Date.now().toString().slice(-6)}`;
    
    const estimateData = {
      estimateNumber,
      clientId: selectedClientId,
      clientName: client?.name || 'Cliente Desconhecido',
      items,
      subtotal,
      discount,
      total,
      status: 'pending',
      notes,
      expiryDate,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'estimates'), estimateData);
      if (generatePdf) {
        generateEstimatePDF({ id: docRef.id, ...estimateData, createdAt: { toDate: () => new Date() } } as any, profile);
      }
      navigate('/estimates');
    } catch (error) {
      console.error('Error saving estimate:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Voltar
        </button>
        <h2 className="text-2xl font-bold">Novo Orçamento</h2>
        <div className="w-20"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Client Selection */}
          <div className="card">
            <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o Cliente</label>
            <select 
              className="input"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="">-- Selecione um cliente --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="mt-2 text-xs text-amber-600">Você ainda não tem clientes cadastrados.</p>
            )}
          </div>

          {/* Items Section */}
          <div className="card space-y-4">
            <h3 className="font-bold flex items-center justify-between">
              Itens do Orçamento
              <button type="button" className="text-slate-500 hover:text-slate-900"><Plus className="w-5 h-5" /></button>
            </h3>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl relative group">
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Qtd</label>
                    <input 
                      type="number" 
                      min="1"
                      className="input py-1 px-2 text-sm" 
                      value={item.quantity} 
                      onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="text-right">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Total</label>
                    <p className="font-bold">{formatCurrency(item.total)}</p>
                  </div>
                  <button 
                    onClick={() => removeItem(index)}
                    className="absolute -right-2 -top-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border-dashed border-2">
                  Adicione itens do catálogo abaixo.
                </div>
              )}
            </div>

            {/* Catalog Selection */}
            <div className="pt-6 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-4">Adicionar do Catálogo</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                {services.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => addItem(s)}
                    className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-left group flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-sm">{s.name}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(s.unitPrice)}</p>
                    </div>
                    <Plus className="w-4 h-4 text-slate-300 group-hover:text-slate-900" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary & Date */}
          <div className="card space-y-4">
            <h3 className="font-bold">Resumo</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data de Validade</label>
              <input type="date" className="input" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
            </div>
            
            <div className="space-y-2 pt-4 border-t border-slate-50">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-500">Desconto (BRL)</label>
                <div className="flex justify-between items-center gap-4">
                  <input 
                    type="number" 
                    className="input py-1 px-3 text-sm h-8" 
                    value={discount} 
                    onChange={e => setDiscount(parseFloat(e.target.value) || 0)} 
                  />
                  <span className="text-red-500 font-medium">-{formatCurrency(discount)}</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4 border-t border-slate-100">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
            <textarea 
              className="input min-h-[100px] text-sm" 
              placeholder="Condições de pagamento, prazos..."
              value={notes} 
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <button 
              disabled={loading} 
              onClick={() => handleSave(true)} 
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" /> Salvar e Gerar PDF
            </button>
            <button 
              disabled={loading} 
              onClick={() => handleSave(false)} 
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" /> Apenas Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
