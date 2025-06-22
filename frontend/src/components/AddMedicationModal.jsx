import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { X, Pill } from 'lucide-react';
import { medicationAPI } from '../services/api';
import FormInput from './FormInput';
import Button from './Button';
import ErrorMessage from './ErrorMessage';

export default function AddMedicationModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once_daily',
    instructions: '',
  });
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  const createMutation = useMutation(medicationAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('medications');
      queryClient.invalidateQueries('dashboard-stats');
      onSuccess();
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Medication name is required';
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    createMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Pill className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900">
              Add New Medication
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {createMutation.error && (
            <ErrorMessage message={createMutation.error.message} />
          )}

          <FormInput
            label="Medication Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="e.g., Ibuprofen"
          />

          <FormInput
            label="Dosage"
            type="text"
            name="dosage"
            value={formData.dosage}
            onChange={handleChange}
            error={errors.dosage}
            required
            placeholder="e.g., 200mg, 1 tablet"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency <span className="text-error-500">*</span>
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="once_daily">Once daily</option>
              <option value="twice_daily">Twice daily</option>
              <option value="three_times_daily">Three times daily</option>
              <option value="four_times_daily">Four times daily</option>
              <option value="every_8_hours">Every 8 hours</option>
              <option value="every_12_hours">Every 12 hours</option>
              <option value="as_needed">As needed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions (Optional)
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows={3}
              className="input-field resize-none"
              placeholder="e.g., Take with food, Before bedtime"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isLoading}
              disabled={createMutation.isLoading}
              className="flex-1"
            >
              Add Medication
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}