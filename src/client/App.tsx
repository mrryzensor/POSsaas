import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PosPage } from './pages/PosPage';
import { AdminPage } from './pages/AdminPage';
import { ProductsPage } from './pages/ProductsPage';
import { UsersPage } from './pages/UsersPage';
import { LoginPage } from './pages/LoginPage';
import { ReportsDashboardPage } from './pages/ReportsDashboardPage';
import { ToastContainer } from './shared/ToastContainer';
import { ModalContainer } from './shared/ModalContainer';
import { useAuthStore } from './shared/authStore';
import { ShoppingCart, LayoutDashboard, User, Package, Users, LogOut, BarChart3 } from 'lucide-react';

const queryClient = new QueryClient();

const MainApp: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'POS' | 'SAAS' | 'PRODUCTS' | 'USERS' | 'REPORTS'>('POS');

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800/80 px-6 flex items-center justify-between shadow-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              POS SaaS
            </span>
            <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Pro Monolith
            </span>
          </div>
        </div>

        {/* Mode Selector Navigation */}
        <nav className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
          <button
            onClick={() => setActiveTab('POS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'POS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4" /> Modo POS
          </button>
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'PRODUCTS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" /> Productos
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'USERS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Usuarios
          </button>
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'REPORTS'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Reportes & Gráficas
          </button>
          <button
            onClick={() => setActiveTab('SAAS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'SAAS'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Jerarquía SaaS
          </button>
        </nav>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-200">{user.name}</span>
            <span className="text-[11px] text-indigo-400 font-mono">{user.email}</span>
          </div>
          <button
            onClick={logout}
            title="Cerrar Sesión"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Dynamic Page Rendering */}
      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'POS' && <PosPage />}
        {activeTab === 'PRODUCTS' && <ProductsPage />}
        {activeTab === 'USERS' && <UsersPage />}
        {activeTab === 'REPORTS' && <ReportsDashboardPage />}
        {activeTab === 'SAAS' && <AdminPage />}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
      <ToastContainer />
      <ModalContainer />
    </QueryClientProvider>
  );
};

export default App;
