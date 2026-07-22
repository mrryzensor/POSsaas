import React from 'react';
import { useModalStore } from './modalStore';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export const ModalContainer: React.FC = () => {
  const { isOpen, options, closeModal } = useModalStore();

  if (!isOpen || !options) return null;

  const isDanger = options.type === 'danger';
  const confirmText = options.confirmText || (isDanger ? 'Eliminar' : 'Confirmar');
  const cancelText = options.cancelText || 'Cancelar';

  const handleConfirm = async () => {
    if (options.onConfirm) {
      await options.onConfirm();
    }
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isDanger ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
              }`}
            >
              {isDanger ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">{options.title}</h3>
              {options.description && <p className="text-sm text-slate-400 mt-1">{options.description}</p>}
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {options.content && <div className="py-2">{options.content}</div>}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          {options.onConfirm && (
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-5 py-2 text-sm font-semibold rounded-xl shadow-lg transition-all ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
