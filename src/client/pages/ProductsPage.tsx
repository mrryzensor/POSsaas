import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showToast } from '../shared/toastStore';
import { useModalStore } from '../shared/modalStore';
import { Plus, Edit2, Trash2, Search, Package, Clock, Tag } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModalStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [formState, setFormState] = useState({
    name: '',
    sku: '',
    price: '',
    type: 'PHYSICAL',
    stock: '10',
    durationMin: '30',
    category: 'General',
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => fetch('/api/items').then((res) => res.json()),
  });

  const createItemMutation = useMutation({
    mutationFn: (data: any) =>
      fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      showToast.success('Producto Agregado', 'El producto ha sido añadido con éxito.');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      resetForm();
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      showToast.success('Producto Actualizado', 'Los cambios han sido guardados.');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      resetForm();
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/items/${id}`, { method: 'DELETE' }).then((res) => res.json()),
    onSuccess: () => {
      showToast.success('Producto Eliminado', 'El artículo ha sido borrado del catálogo.');
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const resetForm = () => {
    setEditingItem(null);
    setFormState({
      name: '',
      sku: '',
      price: '',
      type: 'PHYSICAL',
      stock: '10',
      durationMin: '30',
      category: 'General',
    });
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setFormState({
      name: item.name,
      sku: item.sku,
      price: item.price.toString(),
      type: item.type,
      stock: item.stock.toString(),
      durationMin: item.durationMin ? item.durationMin.toString() : '0',
      category: item.category || 'General',
    });
  };

  const handleDeleteClick = (item: any) => {
    openModal({
      title: 'Eliminar Producto',
      description: `¿Estás seguro de que deseas eliminar "${item.name}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Eliminar',
      onConfirm: () => deleteItemMutation.mutate(item.id),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.price) {
      showToast.warning('Campos incompletos', 'Nombre y Precio son requeridos.');
      return;
    }

    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data: formState });
    } else {
      createItemMutation.mutate(formState);
    }
  };

  const filteredItems = items.filter(
    (item: any) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)] space-y-8 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Sección de Productos y Servicios
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Administra de forma completa los artículos vendibles de tu catálogo SaaS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center justify-between">
            <span>{editingItem ? 'Editar Producto' : 'Agregar Nuevo Producto'}</span>
            {editingItem && (
              <button onClick={resetForm} className="text-xs text-indigo-400 hover:underline">
                Cancelar Edición
              </button>
            )}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium">Nombre del Artículo</label>
              <input
                type="text"
                required
                placeholder="Ej. Café Molido 500g"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">SKU (Código)</label>
                <input
                  type="text"
                  placeholder="AUTO"
                  value={formState.sku}
                  onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Precio ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="12.50"
                  value={formState.price}
                  onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Tipo</label>
                <select
                  value={formState.type}
                  onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="PHYSICAL">Producto Físico</option>
                  <option value="SERVICE">Servicio</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Categoría</label>
                <input
                  type="text"
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {formState.type === 'PHYSICAL' ? (
              <div>
                <label className="text-xs text-slate-400 font-medium">Stock Disponible</label>
                <input
                  type="number"
                  value={formState.stock}
                  onChange={(e) => setFormState({ ...formState, stock: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs text-slate-400 font-medium">Duración (Minutos)</label>
                <input
                  type="number"
                  value={formState.durationMin}
                  onChange={(e) => setFormState({ ...formState, durationMin: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all mt-2"
            >
              {editingItem ? 'Guardar Cambios' : 'Agregar Producto'}
            </button>
          </form>
        </div>

        {/* List Table Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-100">Catálogo de Productos ({filteredItems.length})</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por Nombre/SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Stock / Duración</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">Cargando productos...</td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">No hay productos registrados</td>
                  </tr>
                ) : (
                  filteredItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{item.sku}</td>
                      <td className="p-3 font-semibold text-slate-100">{item.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.type === 'SERVICE' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white">${item.price.toFixed(2)}</td>
                      <td className="p-3">
                        {item.type === 'PHYSICAL' ? `${item.stock} unids` : `${item.durationMin} mins`}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
