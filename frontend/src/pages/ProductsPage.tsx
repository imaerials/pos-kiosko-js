import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi, categoriesApi, inventoryApi } from '../services/api';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { Product, Category } from '../types';

interface ProductFormData {
  sku: string;
  name: string;
  price: string;
  description: string;
  barcode: string;
  cost: string;
  category_id: string;
  initial_stock: string;
}

const emptyForm: ProductFormData = {
  sku: '',
  name: '',
  price: '',
  description: '',
  barcode: '',
  cost: '',
  category_id: '',
  initial_stock: '0',
};

function ProductFormModal({
  product,
  categories,
  onClose,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = product !== null;

  const [form, setForm] = useState<ProductFormData>(
    isEdit
      ? {
          sku: product.sku,
          name: product.name,
          price: String(product.price),
          description: product.description ?? '',
          barcode: product.barcode ?? '',
          cost: product.cost != null ? String(product.cost) : '',
          category_id: product.category_id ?? '',
          initial_stock: '0',
        }
      : emptyForm
  );

  const set = (field: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const product = await productsApi.create({
        sku: data.sku,
        name: data.name,
        price: parseFloat(data.price),
        description: data.description || undefined,
        barcode: data.barcode || undefined,
        cost: data.cost ? parseFloat(data.cost) : undefined,
        category_id: data.category_id || undefined,
      });
      const stock = parseInt(data.initial_stock) || 0;
      if (stock > 0) {
        await inventoryApi.update(product.id, stock);
      }
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Product created');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      productsApi.update(product!.id, {
        sku: data.sku,
        name: data.name,
        price: parseFloat(data.price),
        description: data.description || undefined,
        barcode: data.barcode || undefined,
        cost: data.cost ? parseFloat(data.cost) : undefined,
        category_id: data.category_id || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update product');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) updateMutation.mutate(form);
    else createMutation.mutate(form);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="SKU *" value={form.sku} onChange={set('sku')} required />
          <Input label="Barcode" value={form.barcode} onChange={set('barcode')} />
        </div>

        <Input label="Name *" value={form.name} onChange={set('name')} required />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Price *" type="number" step="any" min="0" value={form.price} onChange={set('price')} required />
          <Input label="Cost" type="number" step="any" min="0" value={form.cost} onChange={set('cost')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={form.category_id}
            onChange={set('category_id')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— No category —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {!isEdit && (
          <Input
            label="Initial stock"
            type="number"
            min="0"
            step="1"
            value={form.initial_stock}
            onChange={set('initial_stock')}
          />
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [modalProduct, setModalProduct] = useState<Product | null | undefined>(undefined);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const handleDelete = (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(product.id);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading products…</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <Button onClick={() => setModalProduct(null)}>
          <Plus size={18} className="mr-1" /> Add product
        </Button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((p) => {
              const lowStock = p.quantity != null && p.low_stock_threshold != null && p.quantity <= p.low_stock_threshold;
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">{p.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{p.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.category_name ?? '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">${Number(p.price).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {p.quantity != null ? (
                      <span className={`text-sm font-medium ${lowStock ? 'text-orange-600' : 'text-gray-700'}`}>
                        {p.quantity}{lowStock && ' ⚠'}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setModalProduct(p)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No products yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalProduct !== undefined && (
        <ProductFormModal
          product={modalProduct}
          categories={categories}
          onClose={() => setModalProduct(undefined)}
        />
      )}
    </div>
  );
}
