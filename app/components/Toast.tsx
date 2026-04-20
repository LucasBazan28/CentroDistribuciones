"use client";

import { useContext } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { ToastContext } from "@/app/lib/toastProvider";

export default function ToastContainer() {
  const context = useContext(ToastContext);

  if (!context) {
    return null;
  }

  const { toasts, removeToast } = context;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const bgColor =
          toast.type === "success"
            ? "bg-green-50 border-green-200"
            : toast.type === "error"
              ? "bg-red-50 border-red-200"
              : "bg-blue-50 border-blue-200";

        const textColor =
          toast.type === "success"
            ? "text-green-800"
            : toast.type === "error"
              ? "text-red-800"
              : "text-blue-800";

        const Icon =
          toast.type === "success" ? CheckCircle : toast.type === "error" ? XCircle : Info;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${bgColor}`}
          >
            <Icon size={20} className={textColor} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${textColor}`}>{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`flex-shrink-0 transition-colors hover:${textColor} opacity-70`}
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

