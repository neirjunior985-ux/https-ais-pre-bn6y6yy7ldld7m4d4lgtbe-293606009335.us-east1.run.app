import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Estimate, BusinessProfile } from '../types';
import { Plus, Search, Trash2, FileText, Download, MoreVertical, Clock, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, cn } from '../lib/utils';
import { generateEstimatePDF } from '../lib/pdf';
import { format } from 'date-fns';

export default function EstimatesList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEstimates = async () => {
    if (!user) return;
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'estimates'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc')));
    setEstimates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Estimate)));
    
    const profileSnap = await getDoc(doc(db, 'businessProfiles', user.uid));
    if (profileSnap.exists()) setProfile({ id: profileSnap.id, ...profileSnap.data() } as BusinessProfile);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchEstimates();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      await deleteDoc(doc(db, 'estimates', id));
      fetchEstimates();
    }
  };

  const handleDownload = (est: Estimate, e: React.MouseEvent) => {
    e.stopPropagation();
    generateEstimatePDF(est, profile);
  };

  const filteredEstimates = estimates.filter(e => 
    e.estimateNumber.includes(searchTerm) || 
    e.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meus Orçamentos</h2>
          <p className="text-slate-500">Histórico de orçamentos criados.</p>
        </div>
        <button onClick={() => navigate('/estimates/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Novo Orçamento
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar por número ou cliente..." 
          className="input pl-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden divide-y divide-slate-100 p-0">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div></div>
        ) : filteredEstimates.length > 0 ? filteredEstimates.map(estimate => (
          <div 
            key={estimate.id} 
            className="p-6 hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer transition-all"
            onClick={() => navigate(`/estimates/new`)} // Simplified for now
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                <FileText className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-lg">#{estimate.estimateNumber}</span>
                  <span className={cn("text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full", 
                    estimate.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                  )}>
                    {estimate.status}
                  </span>
                </div>
                <p className="text-slate-500 font-medium">{estimate.clientName}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(estimate.createdAt?.toDate?.() || new Date()), 'dd MMM, yyyy')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 justify-between md:justify-end">
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900">{formatCurrency(estimate.total)}</p>
                <p className="text-xs text-slate-400">{estimate.items.length} itens</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleDownload(estimate, e)}
                  className="p-3 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all shadow-sm"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => handleDelete(estimate.id, e)}
                  className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="p-20 text-center text-slate-400">
            <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p>Nenhum orçamento encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
