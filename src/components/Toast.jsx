import { useState, useEffect, createContext, useContext } from "react";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`toast show align-items-center text-white bg-${getBootstrapType(toast.type)} border-0`}
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body">
              {toast.message}
            </div>
            <button 
              type="button" 
              className="btn-close btn-close-white me-2 m-auto" 
              onClick={() => onRemove(toast.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const getBootstrapType = (type) => {
  switch (type) {
    case 'success': return 'success';
    case 'error': return 'danger';
    case 'warning': return 'warning';
    default: return 'primary';
  }
};

const Toast = () => {
  return null; // ToastContainer is rendered by ToastProvider
};

export default Toast;