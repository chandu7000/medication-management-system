import React from 'react';
import { CheckCircle, X } from 'lucide-react';

export default function SuccessMessage({ message, onClose, className = '' }) {
  if (!message) return null;

  return (
    <div className={`bg-success-50 border border-success-200 rounded-lg p-4 animate-slide-up ${className}`}>
      <div className="flex items-start">
        <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-success-700">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-success-400 hover:text-success-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}