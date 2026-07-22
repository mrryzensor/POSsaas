import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showToast } from '../shared/toastStore';
import { useModalStore } from '../shared/modalStore';
import { generateReceiptPDF } from '../shared/pdfExporter';
import { Plus, Package, Clock, Building2, TrendingUp, Layers, Tag, DollarSign, Printer } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModalStore();

  const [newItemForm, setNewItemForm] = useState({
    name: '',
    sku: '',
    price: '',
    type: 'PHYSICAL',
    stock: '10',
    durationMin: '30',
    category: 'General',
  });

  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    type: 'BRANCH',
    parentId: '',
  });

  // Queries
  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => fetch('/api/items').then((res) => res.json()),
  });

  const { data: orgs = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => fetch('/api/organizations').then((res) => res.json()),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => fetch('/api/sales').then((res) => res.json()),
  });

  // Mutations
  const createItemMutation = useMutation({
    mutationFn: (data: any) =>
      fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      showToast.success('Ítem Creado', 'El producto/servicio fue añadido al catálogo polimórfico.');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setNewItemForm({ name: '', sku: '', price: '', type: 'PHYSICAL', stock: '10', durationMin: '30', category: 'General' });
    },
  });

  const createOrgMutation = useMutation({
    mutationFn: (data: any) =>
      fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      showToast.success('Nodo Creado', 'La entidad jerárquica ha sido agregada.');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setNewOrgForm({ name: '', type: 'BRANCH', parentId: '' });
    },
  });

  const totalSalesRevenue = sales.reduce((acc: number, curr: any) => acc + curr.total, 0);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.name || !newItemForm.price) {
      showToast.warning('Campos incompletos', 'Nombre y Precio son requeridos.');
      return;
    }
    createItemMutation.mutate(newItemForm);
  };

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgForm.name) {
      showToast.warning('Campo requerido', 'El nombre de la organización es obligatorio.');
      return;
    }
    createOrgMutation.mutate(newOrgForm);
  };

  return (
    <div className="p-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)] space-y-8 overflow-y-auto">
      {/* SaaS Dashboard Stats Header */}
      <div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          SaaS Management & Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Administración Multijerárquica Multi-tenant | Usuario: <span className="text-indigo-400 font-medium">daviex14@gmail.com</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Ingresos Totales</p>
            <h3 className="text-xl font-extrabold text-white">${totalSalesRevenue.toFixed(2)} USD</h3>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Ventas Registradas</p>
            <h3 className="text-xl font-extrabold text-white">{sales.length} Órdenes</h3>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Catálogo Polimórfico</p>
            <h3 className="text-xl font-extrabold text-white">{items.length} Ítems</h3>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Nodos Organizacionales</p>
            <h3 className="text-xl font-extrabold text-white">{orgs.length} Unidades</h3>
          </div>
        </div>
      </div>

      {/* Main Admin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Item & Create Org Forms */}
        <div className="space-y-6">
          {/* Create SellableItem */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" /> Crear Ítem de Catálogo
            </h2>
            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Nombre del Producto / Servicio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Latte Vainilla / Asesoría"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Tipo</label>
                  <select
                    value={newItemForm.type}
                    onChange={(e) => setNewItemForm({ ...newItemForm, type: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PHYSICAL">Producto Físico</option>
                    <option value="SERVICE">Servicio Profesional</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Precio ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="15.00"
                    value={newItemForm.price}
                    onChange={(e) => setNewItemForm({ ...newItemForm, price: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {newItemForm.type === 'PHYSICAL' ? (
                <div>
                  <label className="text-xs text-slate-400 font-medium">Stock Inicial</label>
                  <input
                    type="number"
                    value={newItemForm.stock}
                    onChange={(e) => setNewItemForm({ ...newItemForm, stock: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs text-slate-400 font-medium">Duración estimada (Minutos)</label>
                  <input
                    type="number"
                    value={newItemForm.durationMin}
                    onChange={(e) => setNewItemForm({ ...newItemForm, durationMin: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 font-medium">Categoría</label>
                <input
                  type="text"
                  placeholder="Bebidas / Servicios / Postres"
                  value={newItemForm.category}
                  onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all mt-2"
              >
                Guardar en Catálogo
              </button>
            </form>
          </div>

          {/* Create Hierarchy Org Node */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" /> Crear Estructura Organizacional
            </h2>
            <form onSubmit={handleCreateOrg} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Nombre del Nodo / Sucursal</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sucursal Medellín"
                  value={newOrgForm.name}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Nivel Nodal</label>
                  <select
                    value={newOrgForm.type}
                    onChange={(e) => setNewOrgForm({ ...newOrgForm, type: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="REGION">Región / Zona</option>
                    <option value="BRANCH">Sucursal</option>
                    <option value="POS">Punto de Venta / Caja</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium">Padre Jerárquico</label>
                  <select
                    value={newOrgForm.parentId}
                    onChange={(e) => setNewOrgForm({ ...newOrgForm, parentId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">(Sin Padre - Raíz)</option>
                    {orgs.map((o: any) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-600/30 transition-all mt-2"
              >
                Agregar a Jerarquía
              </button>
            </form>
          </div>
        </div>

        {/* Right Columns: Tables & Hierarchy Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hierarchy Tree */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" /> Jerarquía Organizacional Infinitamente Escalable
            </h2>
            <div className="space-y-2">
              {orgs.map((org: any) => (
                <div
                  key={org.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    org.parentId ? 'ml-6 border-slate-800/80 bg-slate-950/60' : 'border-indigo-500/30 bg-indigo-950/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className={`w-4 h-4 ${org.parentId ? 'text-slate-400' : 'text-indigo-400'}`} />
                    <div>
                      <span className="font-semibold text-sm text-slate-200">{org.name}</span>
                      <span className="ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {org.type}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{org.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sales History Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center justify-between">
              <span>Histórico de Transacciones de Venta</span>
              <span className="text-xs font-normal text-slate-400">{sales.length} Registros</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">ID Orden</th>
                    <th className="p-3">Cajero</th>
                    <th className="p-3">Método</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sales.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-semibold text-indigo-300">{s.id}</td>
                      <td className="p-3">{s.userEmail}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {s.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white">${s.total.toFixed(2)} USD</td>
                      <td className="p-3 text-slate-500">{new Date(s.createdAt).toLocaleTimeString()}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            generateReceiptPDF(s, s.lines || []);
                            showToast.info('Reimprimiendo Recibo', `Generando PDF para la orden #${s.id}`);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-semibold ml-auto transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" /> Reimprimir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
