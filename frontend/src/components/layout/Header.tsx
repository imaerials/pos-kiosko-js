import { useState, useEffect } from 'react';
import { Package, ShoppingCart, ClipboardList, Settings, LogOut, Box, TrendingUp, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: <Package size={20} />, label: 'POS', path: '/', show: true },
    { icon: <ClipboardList size={20} />, label: 'Transacciones', path: '/transactions', show: true },
    { icon: <Box size={20} />, label: 'Productos', path: '/products', show: user?.role !== 'cashier' },
    { icon: <Settings size={20} />, label: 'Inventario', path: '/inventory', show: user?.role !== 'cashier' },
    { icon: <TrendingUp size={20} />, label: 'Finanzas', path: '/finance', show: user?.role === 'admin' },
  ].filter((i) => i.show);

  return (
    <header className="bg-white shadow-sm border-b shrink-0">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Grocery POS</h1>
            <p className="hidden sm:block text-sm text-gray-500">Sistema de Punto de Venta</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <NavItem key={item.path} icon={item.icon} label={item.label} path={item.path} />
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="hidden sm:block p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t bg-white">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavItem key={item.path} icon={item.icon} label={item.label} path={item.path} mobile />
            ))}
            <div className="border-t mt-2 pt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavItem({
  icon,
  label,
  path,
  mobile = false,
}: {
  icon: React.ReactNode;
  label: string;
  path: string;
  mobile?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        mobile ? 'w-full justify-start' : ''
      } ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
