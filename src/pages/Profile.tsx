import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { BusinessProfile } from '../types';
import { Save, Building2, Mail, Phone, MapPin, CheckCircle, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, 'businessProfiles', user.uid));
      if (snap.exists()) {
        setProfile(snap.data() as BusinessProfile);
      } else {
        setProfile({
          name: user.displayName || '',
          email: user.email || '',
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'businessProfiles', user.uid), {
        ...profile,
        updatedAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center animate-pulse text-slate-400">Carregando dados...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Perfil Profissional</h2>
        <p className="text-slate-500">Estas informações aparecerão no cabeçalho dos seus orçamentos.</p>
      </header>

      <form onSubmit={handleSave} className="card space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-50">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200">
             {profile.logoUrl ? (
               <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
             ) : (
               <Building2 className="w-10 h-10 text-slate-300" />
             )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Logo da Empresa</h4>
            <p className="text-sm text-slate-500">Preferencialmente em PNG com fundo transparente.</p>
            <button type="button" className="text-sm font-bold text-slate-900 mt-2 hover:underline">Alterar Imagem</button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa ou Profissional *</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input required type="text" className="input pl-12" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail de Contato</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input type="email" className="input pl-12" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input type="text" className="input pl-12" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input type="text" className="input pl-12" placeholder="Cidade, Estado, Endereço..." value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button disabled={saving} type="submit" className={cn("btn-primary flex-1 flex items-center justify-center gap-2 transition-all", success ? "bg-green-600 hover:bg-green-600" : "")}>
            {success ? (
              <>
                <CheckCircle className="w-5 h-5" /> Dados Salvos!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> {saving ? 'Salvando...' : 'Salvar Alterações'}
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="card bg-blue-50 border-blue-100 flex gap-4 items-start">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-bold text-blue-900">Dica de Profissionalismo</h4>
          <p className="text-sm text-blue-800 leading-relaxed mt-1">
            Certifique-se de preencher todos os dados corretamente. Eles serão usados para gerar o seu PDF e transmitir confiança ao seu cliente.
          </p>
        </div>
      </div>
    </div>
  );
}
