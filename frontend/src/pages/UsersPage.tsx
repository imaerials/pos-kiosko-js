import { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { authApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export function UsersPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'cashier' | 'manager'>('cashier');
  const [isLoading, setIsLoading] = useState(false);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setIsLoading(true);

    try {
      await authApi.createUser(name, email, password, role);
      toast.success(`Usuario creado exitosamente`);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('cashier');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Crear Usuario</h1>
        <p className="text-gray-500 mt-1">Agregar un nuevo cajero o gerente al sistema</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre completo"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Pérez"
            required
          />
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juan@ejemplo.com"
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repetí la contraseña"
            error={passwordMismatch ? 'Las contraseñas no coinciden' : undefined}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'cashier' | 'manager')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="cashier">Cajero</option>
              <option value="manager">Gerente</option>
            </select>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading || passwordMismatch}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Crear Usuario
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}