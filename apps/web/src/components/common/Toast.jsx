import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from "react";
import { T } from "./Theme.js";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const toast = useMemo(() => ({
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(t => {
          const colors = {
            success: { bg: T.greenLight, border: T.greenMid, color: T.green },
            error: { bg: T.redLight, border: T.redMid, color: T.red },
            info: { bg: T.blueLight, border: T.blueMid, color: T.blue },
          };
          const c = colors[t.type] || colors.info;
          return (
            <div key={t.id} style={{
              padding: "10px 16px",
              background: c.bg,
              border: `1px solid ${c.border}`,
              color: c.color,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: T.sans,
              boxShadow: T.shadow,
              maxWidth: 380,
              animation: "slideIn 0.2s ease-out",
            }}>
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
