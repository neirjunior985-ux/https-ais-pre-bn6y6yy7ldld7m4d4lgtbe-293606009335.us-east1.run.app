import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Client } from '../types';
import { Plus, Search, Trash2, Mail, Phone, MapPin } from 'lucide-react';

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '', notes: '' });

  const fetchClients = async () => {
    if (!user) return;
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'clients'), where('ownerId', '==', user.uid)));
    setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newClient.name) return;
    await addDoc(collection(db, 'clients'), {
      ...newClient,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });
    setNewClient({ name: '', email: '', phone: '', address: '', notes: '' });
    setIsModalOpen(false);
    fetchClients();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteDoc(doc(db, 'clients', id));
      fetchClients();
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-slate-500">Gerencie sua agenda de clientes.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar por nome ou e-mail..." 
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
          {filteredClients.map(client => (
            <div key={client.id} className="card group relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{client.name}</h3>
                    {client.email && (
                      <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                        <Mail className="w-3 h-3" /> {client.email}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-2 pt-2">
                  {client.phone && (
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" /> {client.phone}
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <MapPin className="w-4 h-4 text-slate-400" /> {client.address}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
                 <button className="flex-1 text-sm font-medium py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">Editar</button>
              </div>
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="col-span-full py-20 text-center card bg-transparent border-dashed border-2">
              <p className="text-slate-400">Nenhum cliente encontrado.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6">Novo Cliente</h3>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                <input required type="text" className="input" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                  <input type="email" className="input" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <input type="text" className="input" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                <input type="text" className="input" value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas Internas</label>
                <textarea className="input min-h-[100px]" value={newClient.notes} onChange={e => setNewClient({...newClient, notes: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
