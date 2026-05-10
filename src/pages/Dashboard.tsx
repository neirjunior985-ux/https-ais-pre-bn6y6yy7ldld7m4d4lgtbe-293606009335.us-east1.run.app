import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Estimate } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { FileText, Users, TrendingUp, Clock, ChevronRight, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalEstimates: 0, totalClients: 0, pendingValue: 0 });
  const [recentEstimates, setRecentEstimates] = useState<Estimate[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const estimatesSnap = await getDocs(query(collection(db, 'estimates'), where('ownerId', '==', user.uid)));
      const clientsSnap = await getDocs(query(collection(db, 'clients'), where('ownerId', '==', user.uid)));
      const items = estimatesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Estimate));
      setStats({
        totalEstimates: estimatesSnap.size,
        totalClients: clientsSnap.size,
        pendingValue: items.filter(item => item.status === 'pending').reduce((acc, curr) => acc + curr.total, 0),
      });
      const recentSnap = await getDocs(query(collection(db, 'estimates'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5)));
      setRecentEstimates(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Estimate)));
    };
    fetchData();
  }, [user]);

  const cards = [
    { label: 'Total Orçamentos', value: stats.totalEstimates, icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Clientes', value: stats.totalClients, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Valor Pendente', value: formatCurrency(stats.pendingValue), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Bem-vindo, {user?.displayName?.split(' ')[0]}!</h2>
        <p className="text-slate-500">Veja o que está acontecendo com seus orçamentos hoje.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className={cn("p-4 rounded-2xl", card.color)}><card.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Orçamentos Recentes</h3>
            <Link to="/estimates" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1">Ver todos <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="card p-0 overflow-hidden divide-y divide-slate-100">
            {recentEstimates.length > 0 ? recentEstimates.map((estimate) => (
              <div key={estimate.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900"># {estimate.estimateNumber}</p>
                  <p className="text-sm text-slate-500">{estimate.clientName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(estimate.total)}</p>
                  <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full inline-block", estimate.status === 'pending' ? "bg-amber-100 text-amber-700" : estimate.status === 'approved' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700")}>{estimate.status}</span>
                </div>
              </div>
            )) : <div className="p-12 text-center text-slate-400"><Clock className="w-8 h-8 mx-auto mb-2 opacity-20" /><p>Nenhum orçamento encontrado</p></div>}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Ações Rápidas</h3>
          <div className="space-y-3">
            <button onClick={() => navigate('/estimates/new')} className="w-full card p-4 flex items-center gap-4 hover:bg-slate-50 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center"><Plus className="w-5 h-5" /></div>
              <span className="font-semibold">Criar novo orçamento</span>
            </button>
            <button onClick={() => navigate('/clients')} className="w-full card p-4 flex items-center gap-4 hover:bg-slate-50 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center"><Users className="w-5 h-5" /></div>
              <span className="font-semibold">Gerenciar clientes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
