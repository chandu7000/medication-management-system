import React from 'react';
import { Pill, Check, Clock } from 'lucide-react';
import Button from './Button';

export default function MedicationCard({ medication, onMarkAsTaken, isLoading }) {
  const today = new Date().toISOString().split('T')[0];
  const isTakenToday = medication.taken_dates?.includes(today);

  const frequencyDisplay = {
    once_daily: 'Once daily',
    twice_daily: 'Twice daily',
    three_times_daily: '3x daily',
    four_times_daily: '4x daily',
    every_8_hours: 'Every 8 hours',
    every_12_hours: 'Every 12 hours',
    as_needed: 'As needed',
  };

  return (
    <div className={`card-hover ${isTakenToday ? 'bg-success-50 border-success-200' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${isTakenToday ? 'bg-success-100' : 'bg-primary-100'}`}>
            <Pill className={`w-5 h-5 ${isTakenToday ? 'text-success-600' : 'text-primary-600'}`} />
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{medication.name}</h3>
            <p className="text-sm text-gray-600">{medication.dosage}</p>
          </div>
        </div>
        
        {isTakenToday && (
          <div className="bg-success-100 p-1 rounded-full">
            <Check className="w-4 h-4 text-success-600" />
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {frequencyDisplay[medication.frequency] || medication.frequency}
        </div>
        
        {medication.instructions && (
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {medication.instructions}
          </p>
        )}
      </div>

      {!isTakenToday && (
        <Button
          variant="success"
          size="sm"
          onClick={() => onMarkAsTaken(medication.id)}
          loading={isLoading}
          className="w-full flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Mark as Taken
        </Button>
      )}

      {isTakenToday && (
        <div className="text-center py-2">
          <span className="text-sm font-medium text-success-600">
            ✓ Taken today
          </span>
        </div>
      )}
    </div>
  );
}