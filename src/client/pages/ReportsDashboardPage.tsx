import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { showToast } from '../shared/toastStore';
import { exportToExcel } from '../shared/excelExporter';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Calendar, Download, TrendingUp, DollarSign, ShoppingBag, Users, Package, Filter, FileSpreadsheet } from 'lucide-react';

export const ReportsDashboardPage: React.FC = () => {
  const [presetFilter, setPresetFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Queries
  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: () => fetch('/api/sales').then((res) => res.json()),
  });

  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => fetch('/api/items').then((res) => res.json()),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((res) => res.json()),
  });

  const { data: orgs = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => fetch('/api/organizations').then((res) => res.json()),
  });

  // Date Filtering Logic
  const filteredSales = sales.filter((sale: any) => {
    const saleDate = new Date(sale.createdAt);
    const now = new Date();

    if (presetFilter === 'TODAY') {
      return saleDate.toDateString() === now.toDateString();
    }

    if (presetFilter === 'WEEK') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return saleDate >= oneWeekAgo;
    }

    if (presetFilter === 'MONTH') {
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    }

    if (presetFilter === 'CUSTOM' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      return saleDate >= start && saleDate <= end;
    }

    return true;
  });

  // Calculate Metrics
  const totalRevenue = filteredSales.reduce((sum: number, s: any) => sum + s.total, 0);
  const totalOrders = filteredSales.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Chart Data 1: Sales over Time
  const salesByDateMap: Record<string, number> = {};
  filteredSales.forEach((s: any) => {
    const dateStr = new Date(s.createdAt).toLocaleDateString();
    salesByDateMap[dateStr] = (salesByDateMap[dateStr] || 0) + s.total;
  });
  const salesTrendData = Object.keys(salesByDateMap).map((date) => ({
    date,
    Ventas: salesByDateMap[date],
  }));

  // Chart Data 2: Payment Methods Breakdown
  const paymentMethodMap: Record<string, number> = {};
  filteredSales.forEach((s: any) => {
    const method = s.paymentMethod || 'CASH';
    paymentMethodMap[method] = (paymentMethodMap[method] || 0) + s.total;
  });
  const paymentMethodData = Object.keys(paymentMethodMap).map((method) => ({
    name: method === 'CASH' ? 'Efectivo' : method === 'CARD' ? 'Tarjeta' : method,
    value: paymentMethodMap[method],
  }));

  // Chart Data 3: Top Selling Items
  const itemSalesMap: Record<string, { name: string; totalQty: number; revenue: number }> = {};
  filteredSales.forEach((s: any) => {
    if (s.lines) {
      s.lines.forEach((line: any) => {
        if (!itemSalesMap[line.itemName]) {
          itemSalesMap[line.itemName] = { name: line.itemName, totalQty: 0, revenue: 0 };
        }
        itemSalesMap[line.itemName].totalQty += line.quantity;
        itemSalesMap[line.itemName].revenue += line.subtotal;
      });
    }
  });
  const topItemsData = Object.values(itemSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];

  // Export Complete System to Excel
  const handleExportAllToExcel = () => {
    const salesExport = filteredSales.map((s: any) => ({
      ID_Orden: s.id,
      Tenant: s.tenantId,
      Sucursal: s.organizationId,
      Cajero: s.userEmail,
      Total_USD: s.total,
      Metodo_Pago: s.paymentMethod,
      Estado: s.status,
      Fecha: new Date(s.createdAt).toLocaleString(),
    }));

    const itemsExport = items.map((i: any) => ({
      ID: i.id,
      Nombre: i.name,
      SKU: i.sku,
      Precio_USD: i.price,
      Tipo: i.type,
      Stock: i.stock,
      Duracion_Min: i.durationMin,
      Categoria: i.category,
    }));

    const usersExport = users.map((u: any) => ({
      ID: u.id,
      Nombre: u.name,
      Email: u.email,
      Rol: u.role,
      Permiso_Reset_Password: u.canResetPassword ? 'SÍ' : 'NO',
      Fecha_Registro: new Date(u.createdAt).toLocaleString(),
    }));

    const orgsExport = orgs.map((o: any) => ({
      ID: o.id,
      Nombre: o.name,
      Tipo: o.type,
      ID_Padre: o.parentId || 'RAIZ',
    }));

    exportToExcel('POS_SaaS_Reporte_General', [
      { name: 'Ventas Transacciones', data: salesExport },
      { name: 'Catálogo Productos', data: itemsExport },
      { name: 'Usuarios', data: usersExport },
      { name: 'Jerarquía Organizacional', data: orgsExport },
    ]);

    showToast.success('Exportación Exitosa', 'Todas las operaciones, ventas y usuarios fueron exportados a Excel.');
  };

  return (
    <div className="p-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)] space-y-8 overflow-y-auto">
      {/* Header & Export Action */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Dashboard de Reportes y Analíticas SaaS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gráficas ejecutivas e inteligencia de negocio con filtrado temporal interactivo.
          </p>
        </div>

        <button
          onClick={handleExportAllToExcel}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" /> Exportar Todo a Excel (.xlsx)
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">Filtro de Fecha:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'TODAY', 'WEEK', 'MONTH', 'CUSTOM'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPresetFilter(mode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                presetFilter === mode
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {mode === 'ALL' ? 'Todo el Histórico' : mode === 'TODAY' ? 'Hoy' : mode === 'WEEK' ? 'Esta Semana' : mode === 'MONTH' ? 'Este Mes' : 'Rango Personalizado'}
            </button>
          ))}
        </div>

        {presetFilter === 'CUSTOM' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            />
            <span className="text-xs text-slate-500">hasta</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            />
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Ingresos Totales (Período)</p>
            <h2 className="text-2xl font-black text-white">${totalRevenue.toFixed(2)} USD</h2>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Transacciones</p>
            <h2 className="text-2xl font-black text-white">{totalOrders} Órdenes</h2>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Ticket Promedio</p>
            <h2 className="text-2xl font-black text-white">${avgTicket.toFixed(2)} USD</h2>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Sales Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Tendencia de Ventas en el Tiempo
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="Ventas" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Selling Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-400" /> Top Ítems Más Vendidos (Ingresos)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItemsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="revenue" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
