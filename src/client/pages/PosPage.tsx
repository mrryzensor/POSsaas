import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '../shared/cartStore';
import { showToast } from '../shared/toastStore';
import { useModalStore } from '../shared/modalStore';
import { saveOfflineSale, getPendingOfflineSales, clearOfflineSales } from '../shared/offlineDb';
import { generateReceiptPDF } from '../shared/pdfExporter';
import { Search, ShoppingBag, Plus, Minus, Trash2, CreditCard, Banknote, ArrowRight, Wifi, WifiOff, Clock, Tag, FileText } from 'lucide-react';

export const PosPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  const queryClient = useQueryClient();
  const { items: cartItems, addItem, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const { openModal } = useModalStore();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    getPendingOfflineSales().then((pending) => setPendingCount(pending.length));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error('Error al obtener productos');
      return res.json();
    },
  });

  const categories = ['ALL', ...Array.from(new Set(items.map((i: any) => i.category || 'General')))];

  const filteredItems = items.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const [autoExportPdf, setAutoExportPdf] = useState(false);

  const processSaleMutation = useMutation({
    mutationFn: async (paymentMethod: string) => {
      if (cartItems.length === 0) return;

      const salePayload = {
        organizationId: 'org_pos_1',
        paymentMethod,
        userEmail: 'daviex14@gmail.com',
        items: cartItems,
      };

      if (!navigator.onLine) {
        await saveOfflineSale(salePayload);
        const pending = await getPendingOfflineSales();
        setPendingCount(pending.length);
        showToast.warning('Venta guardada Offline', 'Se sincronizará cuando vuelvas a conectarte');
        clearCart();
        return;
      }

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salePayload),
      });

      if (!res.ok) throw new Error('Error procesando la venta');
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        showToast.success('¡Venta Exitosa!', `Orden #${data.order.id} registrada correctamente.`);
        if (autoExportPdf) {
          generateReceiptPDF(data.order, data.lines);
        }
        clearCart();
        queryClient.invalidateQueries({ queryKey: ['items'] });
        queryClient.invalidateQueries({ queryKey: ['sales'] });
      }
    },
    onError: (error: any) => {
      showToast.error('Error de Checkout', error.message);
    },
  });

  const handleCheckout = (method: string) => {
    if (cartItems.length === 0) {
      showToast.warning('Carrito vacío', 'Agrega productos antes de procesar el pago.');
      return;
    }

    openModal({
      title: 'Confirmar Cobro POS',
      description: `¿Deseas completar la venta por un total de $${getTotal().toFixed(2)} USD utilizando el método ${method}?`,
      confirmText: 'Procesar Venta',
      cancelText: 'Cancelar',
      onConfirm: () => processSaleMutation.mutate(method),
    });
  };

  const handleSyncOffline = async () => {
    const pending = await getPendingOfflineSales();
    if (pending.length === 0) {
      showToast.info('Todo al día', 'No hay ventas pendientes por sincronizar.');
      return;
    }

    try {
      for (const sale of pending) {
        await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sale),
        });
      }
      await clearOfflineSales();
      setPendingCount(0);
      showToast.success('Sincronización Completada', `${pending.length} ventas offline fueron subidas con éxito.`);
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
    } catch (e: any) {
      showToast.error('Error de Sincronización', e.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden">
      {/* LEFT: POS CATALOG */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden border-r border-slate-800/60">
        {/* Header & Status Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Caja POS #01
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Operador: <span className="text-indigo-300 font-semibold">daviex14@gmail.com</span></p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'ONLINE' : 'OFFLINE MODE'}
            </div>

            {pendingCount > 0 && (
              <button
                onClick={handleSyncOffline}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all animate-pulse"
              >
                Sincronizar ({pendingCount})
              </button>
            )}
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Nombre o Código SKU (Escáner)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat: any) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'Todos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product & Services Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-20 text-slate-500">Cargando catálogo POS...</div>
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-20 text-slate-500">No se encontraron ítems</div>
          ) : (
            filteredItems.map((item: any) => {
              const isService = item.type === 'SERVICE';
              return (
                <div
                  key={item.id}
                  onClick={() => addItem(item)}
                  className="group relative bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/10 active:scale-95"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                        isService ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {isService ? 'Servicio' : 'Producto'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.sku}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <div>
                      {isService ? (
                        <span className="text-[11px] text-purple-300/80 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.durationMin} min
                        </span>
                      ) : (
                        <span className={`text-[11px] font-semibold ${item.stock > 10 ? 'text-slate-400' : 'text-amber-400'}`}>
                          Stock: {item.stock}
                        </span>
                      )}
                    </div>
                    <span className="text-base font-extrabold text-white">${item.price.toFixed(2)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: CART & CHECKOUT BOARD */}
      <div className="w-full lg:w-96 bg-slate-900/60 flex flex-col h-full border-t lg:border-t-0 border-slate-800/80">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-lg text-slate-100">Carrito de Venta</h2>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={() => {
                openModal({
                  title: 'Vaciar Carrito',
                  description: '¿Estás seguro de que deseas remover todos los artículos?',
                  type: 'danger',
                  confirmText: 'Vaciar',
                  onConfirm: clearCart,
                });
              }}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors p-1"
            >
              Vaciar
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
              <ShoppingBag className="w-12 h-12 stroke-1 mb-2 opacity-40" />
              <p className="text-sm font-medium">Carrito Vacío</p>
              <p className="text-xs text-slate-600 mt-1">Haz clic en productos para agregarlos</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800/90 rounded-xl p-3 flex items-center justify-between gap-3 shadow-md">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-200 truncate">{item.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">${item.price.toFixed(2)} USD c/u</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-slate-100 w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-4">
          {/* PDF Receipt Toggle */}
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Exportar a PDF (Recibo)
            </span>
            <button
              type="button"
              onClick={() => setAutoExportPdf(!autoExportPdf)}
              className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                autoExportPdf ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md"></div>
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-200">${getTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Impuestos (0%)</span>
              <span className="font-semibold text-slate-200">$0.00</span>
            </div>
            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
              <span>Total a Cobrar</span>
              <span className="text-indigo-400">${getTotal().toFixed(2)} USD</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              disabled={cartItems.length === 0}
              onClick={() => handleCheckout('CASH')}
              className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Banknote className="w-4 h-4" /> Efectivo
            </button>

            <button
              disabled={cartItems.length === 0}
              onClick={() => handleCheckout('CARD')}
              className="flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all"
            >
              <CreditCard className="w-4 h-4" /> Tarjeta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
