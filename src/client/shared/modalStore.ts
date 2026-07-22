import { create } from 'zustand';
import React from 'react';

export interface ModalOptions {
  title: string;
  description?: string;
  content?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'confirm' | 'danger' | 'info';
  onConfirm?: () => void | Promise<void>;
}

interface ModalState {
  isOpen: boolean;
  options: ModalOptions | null;
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  options: null,
  openModal: (options) => set({ isOpen: true, options }),
  closeModal: () => set({ isOpen: false, options: null }),
}));

export const confirmModal = (options: ModalOptions) => {
  useModalStore.getState().openModal(options);
};
