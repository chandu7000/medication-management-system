import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Pill, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Check,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { medicationAPI, dashboardAPI } from '../services/api';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import AddMedicationModal from '../components/AddMedicationModal';
import MedicationCard from '../components/MedicationCard';

export default function PatientDashboard() {
  const { user, logout } = useAuthContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: medications, isLoading: medicationsLoading, error: medicationsError } = useQuery(
    'medications',
    medicationAPI.getAll
  );

  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    dashboardAPI.getStats
  );

  const markAsTakenMutation = useMutation(
    ({ id, date }) => medicationAPI.markAsTaken(id, date),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('medications');
        queryClient.invalidateQueries('dashboard-stats');
        setSuccessMessage('Medication marked as taken!');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
    }
  );

  const handleMarkAsTaken = (medicationId) => {
    const today = new Date().toISOString().split('T')[0];
    markAsTakenMutation.mutate({ id: medicationId, date: today });
  };

  // Ensure we always have an array to work with
  const medicationsData = React.useMemo(() => {
    if (!medications || !medications.data) return [];
    if (!Array.isArray(medications.data)) return [];
    return medications.data;
  }, [medications]);

  // Safe filtering with proper array checks
  const todaysMedications = React.useMemo(() => {
    if (!Array.isArray(medicationsData)) return [];
    
    const today = new Date().toISOString().split('T')[0];
    return medicationsData.filter(med => {
      if (!med || typeof med !== 'object') return false;
      const takenDates = Array.isArray(med.taken_dates) ? med.taken_dates : [];
      return !takenDates.includes(today);
    });
  }, [medicationsData]);

  const adherenceRate = stats?.data?.adherenceRate || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                MedsBuddy
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <SuccessMessage 
            message={successMessage} 
            onClose={() => setSuccessMessage('')}
            className="mb-6"
          />
        )}

        {medicationsError && (
          <ErrorMessage 
            message={medicationsError.message || 'Failed to load medications'}
            className="mb-6"
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="bg-success-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Adherence Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    `${Math.round(adherenceRate)}%`
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Pill className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Medications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {medicationsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    medicationsData.length
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="bg-warning-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Due Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {medicationsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    todaysMedications.length
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Medications */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Today's Medications</h2>
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Medication
            </Button>
          </div>

          {medicationsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : todaysMedications.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {medicationsData.length === 0 ? 'No medications added yet!' : 'No medications due today!'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {medicationsData.length === 0 
                  ? 'Add your first medication to get started.'
                  : 'Great job staying on track with your medication schedule.'
                }
              </p>
              {medicationsData.length === 0 && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4"
                >
                  Add Your First Medication
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {todaysMedications.map((medication) => (
                <div
                  key={medication.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <Pill className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">{medication.name}</h3>
                      <p className="text-sm text-gray-600">
                        {medication.dosage} • {medication.frequency?.replace(/_/g, ' ')}
                      </p>
                      {medication.instructions && (
                        <p className="text-xs text-gray-500 mt-1">{medication.instructions}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleMarkAsTaken(medication.id)}
                    loading={markAsTakenMutation.isLoading}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Mark as Taken
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Medications */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">All Medications</h2>
          
          {medicationsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : medicationsData.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No medications added yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Add your first medication to get started.
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="mt-4"
              >
                Add Medication
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicationsData.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onMarkAsTaken={handleMarkAsTaken}
                  isLoading={markAsTakenMutation.isLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddMedicationModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            setSuccessMessage('Medication added successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
          }}
        />
      )}
    </div>
  );
}