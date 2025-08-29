import toast from 'react-hot-toast';

export const showToast = {
  message: (message) => {
    toast.message(message, {
      style: {
        background: '#f1f1f1',
        color: '#333',
        padding: '14px 18px',
        borderRadius: '18px',
        maxWidth: '80%',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        lineHeight: '1.4',
        border: '1px solid #ddd',
      },
      iconTheme: {
        primary: '#4A90E2',
        secondary: '#fff',
      },
      duration: 3500,
    })
  },
  success: (message) => {
    toast.success(message, {
      style: {
        background: '#4CAF50',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#4CAF50',
      },
      duration: 3000,
    });
  },
  error: (message) => {
    toast.error(message, {
      style: {
        background: '#f44336',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#f44336',
      },
      duration: 4000,
    });
  },
};