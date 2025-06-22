import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ErrorMessage({ message, onClose, className = '' }) {
  if (!message) return null;

  return (
    <div className={`bg-error-50 border border-error-200 rounded-lg p-4 animate-slide-up ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-error-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-error-700">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-error-400 hover:text-error-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}