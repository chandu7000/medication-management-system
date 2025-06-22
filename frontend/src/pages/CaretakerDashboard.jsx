import React from 'react';
import { useQuery } from 'react-query';
import { 
  Users, 
  Pill, 
  TrendingUp, 
  AlertTriangle,
  LogOut,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/api';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function CaretakerDashboard() {
  const { user, logout } = useAuthContext();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery(
    'caretaker-stats',
    dashboardAPI.getStats
  );

  const { data: activity, isLoading: activityLoading } = useQuery(
    'recent-activity',
    dashboardAPI.getRecentActivity
  );

  // Ensure we always have an array for activity data
  const activityData = React.useMemo(() => {
    if (!activity || !activity.data) return [];
    if (!Array.isArray(activity.data)) return [];
    return activity.data;
  }, [activity]);

  // Safe stats data with defaults
  const statsData = React.useMemo(() => {
    if (!stats || !stats.data) {
      return {
        totalPatients: 0,
        averageAdherence: 0,
        missedDoses: 0,
        activeMedications: 0
      };
    }
    return {
      totalPatients: stats.data.totalPatients || 0,
      averageAdherence: stats.data.averageAdherence || 0,
      missedDoses: stats.data.missedDoses || 0,
      activeMedications: stats.data.activeMedications || 0
    };
  }, [stats]);

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
                MedsBuddy - Caretaker Portal
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
        {statsError && (
          <ErrorMessage 
            message={statsError.message || 'Failed to load dashboard data'}
            className="mb-6"
          />
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? <LoadingSpinner size="sm" /> : statsData.totalPatients}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="bg-success-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Adherence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? <LoadingSpinner size="sm" /> : `${Math.round(statsData.averageAdherence)}%`}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="bg-warning-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Missed Doses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? <LoadingSpinner size="sm" /> : statsData.missedDoses}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Medications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? <LoadingSpinner size="sm" /> : statsData.activeMedications}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
            
            {activityLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : activityData.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
                <p className="text-sm text-gray-500 mt-1">
                  Patient activities will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activityData.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="bg-primary-100 p-2 rounded-full">
                      <Pill className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.description || 'Activity'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.timestamp || 'Unknown time'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patient Overview */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Patient Overview</h2>
            
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Patient management coming soon</p>
              <p className="text-sm text-gray-500 mt-1">
                This feature will allow you to manage multiple patients and their medications.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="p-6 h-auto flex-col hover:bg-gray-50 transition-colors">
              <Users className="w-8 h-8 text-gray-600 mb-2" />
              <span className="font-medium">Manage Patients</span>
              <span className="text-sm text-gray-500 mt-1 text-center">Add and manage patient profiles</span>
            </Button>
            
            <Button variant="outline" className="p-6 h-auto flex-col hover:bg-gray-50 transition-colors">
              <Calendar className="w-8 h-8 text-gray-600 mb-2" />
              <span className="font-medium">Schedule Review</span>
              <span className="text-sm text-gray-500 mt-1 text-center">Review medication schedules</span>
            </Button>
            
            <Button variant="outline" className="p-6 h-auto flex-col hover:bg-gray-50 transition-colors">
              <TrendingUp className="w-8 h-8 text-gray-600 mb-2" />
              <span className="font-medium">View Reports</span>
              <span className="text-sm text-gray-500 mt-1 text-center">Generate adherence reports</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}