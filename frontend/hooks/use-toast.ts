"use client";

import { useState, useEffect } from "react";

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

let memoryState: ToastProps[] = [];
let listeners: React.Dispatch<React.SetStateAction<ToastProps[]>>[] = [];

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>(memoryState);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const index = listeners.indexOf(setToasts);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const toast = ({ title, description, variant = "default" }: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, variant };
    memoryState = [...memoryState, newToast];
    listeners.forEach((listener) => listener(memoryState));

    setTimeout(() => {
      memoryState = memoryState.filter((t) => t.id !== id);
      listeners.forEach((listener) => listener(memoryState));
    }, 5000);
  };

  return { toast, toasts };
}
