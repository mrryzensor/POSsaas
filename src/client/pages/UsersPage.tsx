import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showToast } from '../shared/toastStore';
import { useModalStore } from '../shared/modalStore';
import { useAuthStore } from '../shared/authStore';
import { UserPlus, Shield, Trash2, Mail, KeyRound, ToggleLeft, ToggleRight, Lock } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModalStore();
  const { user: currentUser } = useAuthStore();

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CASHIER',
    canResetPassword: false,
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((res) => res.json()),
  });

  const createUserMutation = useMutation({
    mutationFn: (data: any) =>
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      showToast.success('Usuario Registrado', 'El usuario ha sido añadido al tenant con su contraseña.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFormState({ name: '', email: '', password: '', role: 'CASHIER', canResetPassword: false });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/users/${id}`, { method: 'DELETE' }).then((res) => res.json()),
    onSuccess: () => {
      showToast.success('Usuario Eliminado', 'El usuario ya no tiene acceso.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      fetch(`/api/users/${id}/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      }).then((res) => res.json()),
    onSuccess: () => {
      showToast.success('Contraseña Restablecida', 'La nueva contraseña fue guardada con éxito.');
    },
  });

  const togglePermissionMutation = useMutation({
    mutationFn: ({ id, canResetPassword }: { id: string; canResetPassword: boolean }) =>
      fetch(`/api/users/${id}/toggle-reset-permission`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canResetPassword }),
      }).then((res) => res.json()),
    onSuccess: () => {
      showToast.success('Permisos Actualizados', 'Los permisos de reseteo han sido modificados.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.email || !formState.name || !formState.password) {
      showToast.warning('Campos requeridos', 'Por favor llena Nombre, Correo y Contraseña.');
      return;
    }
    createUserMutation.mutate(formState);
  };

  const handleResetPasswordModal = (user: any) => {
    let newPasswordInput = '';
    openModal({
      title: `Resetear Contraseña - ${user.name}`,
      description: `Ingresa la nueva contraseña para el usuario ${user.email}`,
      content: (
        <input
          type="password"
          placeholder="Nueva Contraseña..."
          onChange={(e) => (newPasswordInput = e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      ),
      confirmText: 'Guardar Contraseña',
      onConfirm: () => {
        if (!newPasswordInput) {
          showToast.warning('Campo vacío', 'Debes escribir una contraseña válida.');
          return;
        }
        resetPasswordMutation.mutate({ id: user.id, newPassword: newPasswordInput });
      },
    });
  };

  const handleDeleteUser = (user: any) => {
    if (user.email === 'daviex14@gmail.com') {
      showToast.error('Acción Bloqueada', 'No puedes eliminar el usuario Administrador Inicial (daviex14@gmail.com).');
      return;
    }

    openModal({
      title: 'Eliminar Usuario',
      description: `¿Estás seguro de deshabilitar la cuenta de ${user.email}?`,
      type: 'danger',
      confirmText: 'Eliminar',
      onConfirm: () => deleteUserMutation.mutate(user.id),
    });
  };

  return (
    <div className="p-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)] space-y-8 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Administración de Usuarios y Permisos
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Gestiona los accesos de administradores y cajeros del sistema POS SaaS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create User Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-400" /> Registrar Nuevo Usuario
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium">Nombre Completo</label>
              <input
                type="text"
                required
                placeholder="Ej. Carlos Pérez"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="usuario@empresa.com"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Contraseña Inicial</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formState.password}
                onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Rol de Usuario</label>
              <select
                value={formState.role}
                onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ADMIN">Administrador (Acceso Total)</option>
                <option value="MANAGER">Gerente de Sucursal</option>
                <option value="CASHIER">Cajero (Operador POS)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="canResetPassword"
                checked={formState.canResetPassword}
                onChange={(e) => setFormState({ ...formState, canResetPassword: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-950 border-slate-800 focus:ring-indigo-500"
              />
              <label htmlFor="canResetPassword" className="text-xs text-slate-300 cursor-pointer">
                Permitir resetear contraseñas a otros usuarios
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all mt-2"
            >
              Registrar Usuario
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-slate-100">Usuarios Registrados ({users.length})</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Permiso Reset</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">Cargando usuarios...</td>
                  </tr>
                ) : (
                  users.map((u: any) => {
                    const canPerformReset = currentUser?.role === 'ADMIN' || currentUser?.canResetPassword;
                    const isSelfAdmin = u.email === 'daviex14@gmail.com';

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-semibold text-slate-100">{u.name}</td>
                        <td className="p-3 font-mono text-indigo-300">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          {currentUser?.role === 'ADMIN' ? (
                            <button
                              onClick={() => togglePermissionMutation.mutate({ id: u.id, canResetPassword: !u.canResetPassword })}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                u.canResetPassword
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {u.canResetPassword ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                              {u.canResetPassword ? 'Habilitado' : 'Deshabilitado'}
                            </button>
                          ) : (
                            <span className="text-slate-500">{u.canResetPassword ? 'Sí' : 'No'}</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {canPerformReset && (
                            <button
                              onClick={() => handleResetPasswordModal(u)}
                              title="Resetear Contraseña"
                              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {!isSelfAdmin && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              title="Eliminar Usuario"
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
