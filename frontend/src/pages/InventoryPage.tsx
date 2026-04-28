import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../services/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';

export function InventoryPage() {
  const queryClient = useQueryClient();
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryApi.getAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      inventoryApi.update(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory updated');
    },
    onError: () => {
      toast.error('Failed to update inventory');
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Inventory Management</h2>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.map((item) => (
              <InventoryRow
                key={item.id}
                item={item}
                onUpdate={(quantity) => updateMutation.mutate({ productId: item.product_id, quantity })}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InventoryRow({
  item,
  onUpdate,
}: {
  item: { product_id: string; quantity: number; low_stock_threshold: number; product_name?: string; sku?: string };
  onUpdate: (quantity: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);

  const isLowStock = item.quantity <= item.low_stock_threshold;

  const handleSave = () => {
    onUpdate(quantity);
    setEditing(false);
  };

  return (
    <tr className={isLowStock ? 'bg-orange-50' : ''}>
      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{item.sku || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap font-medium">{item.product_name || 'Unknown'}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editing ? (
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            className="w-24"
          />
        ) : (
          <span className={isLowStock ? 'text-orange-600 font-medium' : ''}>{item.quantity}</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.low_stock_threshold}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isLowStock ? (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
            Low Stock
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            In Stock
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editing ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
}
