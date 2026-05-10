import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Service } from '../types';
import { Plus, Search, Trash2, Tag, DollarSign } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function Services() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '', unitPrice: 0, category: '' });

  const fetchServices = async () => {
    if (!user) return;
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'services'), where('ownerId', '==', user.uid)));
    setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newService.name) return;
    await addDoc(collection(db, 'services'), {
      ...newService,
      ownerId: user.uid,
    });
    setNewService({ name: '', description: '', unitPrice: 0, category: '' });
    setIsModalOpen(false);
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      await deleteDoc(doc(db, 'services', id));
      fetchServices();
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Serviços e Produtos</h2>
          <p className="text-slate-500">Catálogo de itens para seus orçamentos.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Novo Item
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar no catálogo..." 
          className="input pl-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <div key={service.id} className="card group hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <Tag className="w-6 h-6 text-slate-400" />
                </div>
                <button 
                  onClick={() => handleDelete(service.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-lg font-bold mb-1">{service.name}</h3>
              {service.category && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {service.category}
                </span>
              )}
              
              <p className="text-slate-500 text-sm mt-3 line-clamp-2 h-10">
                {service.description || 'Sem descrição cadastrada.'}
              </p>
              
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-slate-900 font-bold text-xl">
                  {formatCurrency(service.unitPrice)}
                </div>
              </div>
            </div>
          ))}
          {filteredServices.length === 0 && (
            <div className="col-span-full py-20 text-center card bg-transparent border-dashed border-2">
              <p className="text-slate-400">Nenhum serviço encontrado no catálogo.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6">Novo Item no Catálogo</h3>
            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Serviço/Produto *</label>
                <input required type="text" className="input" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <input type="text" className="input" placeholder="Ex: Mão de Obra, Peças, Consultoria" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preço Unitário (BRL) *</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</div>
                   <input required type="number" step="0.01" className="input pl-12" value={newService.unitPrice} onChange={e => setNewService({...newService, unitPrice: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <textarea className="input min-h-[100px]" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Salvar no Catálogo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
