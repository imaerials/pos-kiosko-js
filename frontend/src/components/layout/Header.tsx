import { Package, ShoppingCart, ClipboardList, Settings, LogOut, Box } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Grocery POS</h1>
            <p className="text-sm text-gray-500">Point of Sale System</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <NavItem icon={<Package size={20} />} label="POS" path="/" />
          <NavItem icon={<ClipboardList size={20} />} label="Transactions" path="/transactions" />
          {user?.role !== 'cashier' && (
            <NavItem icon={<Box size={20} />} label="Products" path="/products" />
          )}
          {user?.role !== 'cashier' && (
            <NavItem icon={<Settings size={20} />} label="Inventory" path="/inventory" />
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

function NavItem({ icon, label, path }: { icon: React.ReactNode; label: string; path: string }) {
  const navigate = useNavigate();
  const isActive = window.location.pathname === path;

  return (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
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
