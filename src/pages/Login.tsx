import { FileText } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <FileText className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Orçamento Pro</h1>
        <p className="text-slate-400 mb-12 text-lg">Crie orçamentos profissionais em segundos e impressione seus clientes.</p>
        
        <button 
          onClick={handleLogin}
          className="w-full bg-white text-slate-900 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/10"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Entrar com Google
        </button>
        
        <p className="mt-12 text-slate-500 text-sm">
          Profissionalismo e agilidade para o seu negócio.
        </p>
      </div>
    </div>
  );
}
