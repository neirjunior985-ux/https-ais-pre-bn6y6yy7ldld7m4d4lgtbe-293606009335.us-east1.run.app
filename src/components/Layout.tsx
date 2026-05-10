import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { logout } from '../lib/firebase';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { label: 'Painel', icon: LayoutDashboard, path: '/' },
    { label: 'Orçamentos', icon: FileText, path: '/estimates' },
    { label: 'Clientes', icon: Users, path: '/clients' },
    { label: 'Serviços', icon: Briefcase, path: '/services' },
    { label: 'Perfil', icon: User, path: '/profile' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orçamento Pro</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                location.pathname === item.path 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between z-50">
        <h1 className="text-xl font-bold text-slate-900">Orçamento Pro</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 h-full bg-white flex flex-col p-6" onClick={e => e.stopPropagation()}>
            <nav className="flex-1 space-y-2 pt-12">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium",
                    location.pathname === item.path ? "bg-slate-900 text-white" : "text-slate-500"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 font-medium"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-20 md:pt-0 p-6 md:p-10 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
