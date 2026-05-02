import { ShoppingCart, Package, ClipboardList, TrendingUp, Shield, Barcode, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const features = [
  {
    icon: <ShoppingCart className="w-7 h-7" />,
    title: 'Punto de Venta',
    description: 'Interfaz rápida para cobrar. Escaneo de productos, cálculo de totales y vuelto automático.',
  },
  {
    icon: <Package className="w-7 h-7" />,
    title: 'Gestión de Inventario',
    description: 'Control de stock en tiempo real. Avisos de stock bajo, historial de reposiciones y seguimiento por producto.',
  },
  {
    icon: <ClipboardList className="w-7 h-7" />,
    title: 'Transacciones',
    description: 'Registro de todas las ventas. Búsqueda, filtro y gestión de reembolsos.',
  },
  {
    icon: <TrendingUp className="w-7 h-7" />,
    title: 'Reportes Financieros',
    description: 'Dashboards con métricas clave: ventas diarias, márgenes, productos más vendidos y tendencias.',
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: 'Roles y Permisos',
    description: 'Acceso según rol: Cajero, Gerente y Administrador con permisos diferenciados.',
  },
  {
    icon: <Barcode className="w-7 h-7" />,
    title: 'Productos y Categorías',
    description: 'Catálogo de productos con SKU, código de barras, precios y categorías.',
  },
];

export function LandingPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleGoToPOS = () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para acceder al sistema');
      navigate('/login');
      return;
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Sistema activo y funcionando
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Flow<span className="text-blue-600">POS</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto mb-4">
              Sistema de Punto de Venta profesional
            </p>
            <p className="text-lg text-slate-500 max-w-xl mx-auto mb-12">
              Gestión integral para tu almacén: ventas, inventario, transacciones y reportes en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleGoToPOS}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
                  >
                    Ir al POS
                    <ArrowRight size={20} />
                  </button>
                  <span className="text-slate-500">
                    Bienvenido, <span className="text-slate-800 font-medium">{user?.name}</span>
                  </span>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
                  >
                    Iniciar Sesión
                    <ArrowRight size={20} />
                  </Link>
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl transition-all border border-slate-300 shadow-sm"
                  >
                    Crear Cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Herramientas diseñadas para la operación diaria de tu negocio
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-white backdrop-blur-sm border border-slate-200 rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-5 group-hover:bg-blue-200 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-900 font-semibold">FlowPOS</span>
            </div>
            <p className="text-slate-500 text-sm">
              Hecho para almacenes y despensas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}