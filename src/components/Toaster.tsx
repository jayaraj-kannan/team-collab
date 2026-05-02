"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'info' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastFunction: (message: string, type?: ToastType) => void;

export const toast = (message: string, type: ToastType = 'success') => {
  if (toastFunction) {
    toastFunction(message, type);
  }
};

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    toastFunction = addToast;
  }, [addToast]);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <div className="toast-icon">
            {t.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
            {t.type === 'info' && <Info size={18} color="var(--primary)" />}
            {t.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
          </div>
          <span style={{ flex: 1 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
