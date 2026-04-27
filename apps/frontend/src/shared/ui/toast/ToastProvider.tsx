import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { ToastContext, type ToastApi, type ToastKind } from "./toast-context";

type ToastItem = {
  id: number;
  message: string;
  kind: ToastKind;
};

let toastCounter = 0;

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++toastCounter;
      setToasts((current) => [...current, { id, message, kind }]);
      setTimeout(() => removeToast(id), 3000);
    },
    [removeToast],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => pushToast("success", message),
      error: (message) => pushToast("error", message),
      info: (message) => pushToast("info", message),
    }),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.kind}`} role="status">
            <span>{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
