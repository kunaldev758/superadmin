import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Star, 
  Users, 
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
  Check,
  X,
  Eye,
  Settings,
  BarChart3,
  ArrowUpDown
} from 'lucide-react';

const getDefaultPlanFormData = () => ({
  name: '',
  displayName: '',
  description: '',
  pricing: {
    monthly: 0,
    yearly: 0,
    currency: 'USD'
  },
  limits: {
    maxQueries: 100,
    maxStorage: 10485760,
    maxAgentsPerAccount: 1,
    maxHumanAgentsPerAccount: 1
  },
  metadata: {
    trial: {
      enabled: false,
      days: 0
    },
    color: '#6B7280',
    icon: 'default-plan',
    popular: false
  },
  status: 'active'
});

const buildFormDataFromPlan = (plan) => {
  const base = getDefaultPlanFormData();
  if (!plan) return base;
  return {
    ...base,
    ...plan,
    pricing: { ...base.pricing, ...(plan.pricing || {}) },
    limits: { ...base.limits, ...(plan.limits || {}) },
    metadata: {
      ...base.metadata,
      ...(plan.metadata || {}),
      trial: { ...base.metadata.trial, ...(plan.metadata?.trial || {}) }
    }
  };
};

function PlanFormModal({ show, onClose, onSubmit, plan = null, title }) {
  const [formData, setFormData] = useState(() => getDefaultPlanFormData());

  useEffect(() => {
    if (!show) return;
    setFormData(buildFormDataFromPlan(plan));
  }, [show, plan?._id]);

  const coerceNum = (v, fallback = 0) => {
    if (v === '' || v === null || v === undefined) return fallback;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const handleSubmit = () => {
    const fd = formData;
    onSubmit({
      ...fd,
      pricing: {
        ...fd.pricing,
        monthly: coerceNum(fd.pricing?.monthly, 0),
        yearly: coerceNum(fd.pricing?.yearly, 0)
      },
      limits: {
        ...fd.limits,
        maxQueries: coerceNum(fd.limits?.maxQueries, 0),
        maxStorage: coerceNum(fd.limits?.maxStorage, 0),
        maxAgentsPerAccount: coerceNum(fd.limits?.maxAgentsPerAccount, 1),
        maxHumanAgentsPerAccount: coerceNum(fd.limits?.maxHumanAgentsPerAccount, 1)
      },
      metadata: {
        ...fd.metadata,
        trial: {
          ...fd.metadata?.trial,
          days: coerceNum(fd.metadata?.trial?.days, 0)
        }
      }
    });
  };

  const parseIntInput = (raw) => {
    if (raw === '') return '';
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? '' : n;
  };

  const parseFloatInput = (raw) => {
    if (raw === '') return '';
    const n = parseFloat(raw);
    return Number.isNaN(n) ? '' : n;
  };

  const numberFieldValue = (v) =>
    v === '' || v === undefined || v === null ? '' : v;

  const updateFormData = (path, value) => {
    const keys = path.split('.');
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        current[k] = { ...(current[k] || {}) };
        current = current[k];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={formData.name ?? ''}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  disabled={!!plan}
                  title={plan ? 'Internal id — set at creation only' : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                  placeholder="e.g., basic, pro, enterprise"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={formData.displayName ?? ''}
                  onChange={(e) => updateFormData('displayName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Basic Plan"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description ?? ''}
                onChange={(e) => updateFormData('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Plan description"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price</label>
                <input
                  type="number"
                  value={numberFieldValue(formData.pricing?.monthly)}
                  onChange={(e) => updateFormData('pricing.monthly', parseFloatInput(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Price</label>
                <input
                  type="number"
                  value={numberFieldValue(formData.pricing?.yearly)}
                  onChange={(e) => updateFormData('pricing.yearly', parseFloatInput(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={formData.pricing?.currency || 'USD'}
                  onChange={(e) => updateFormData('pricing.currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Limits</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Queries</label>
                <input
                  type="number"
                  value={numberFieldValue(formData.limits?.maxQueries)}
                  onChange={(e) => updateFormData('limits.maxQueries', parseIntInput(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Storage (bytes)</label>
                <input
                  type="number"
                  value={numberFieldValue(formData.limits?.maxStorage)}
                  onChange={(e) => updateFormData('limits.maxStorage', parseIntInput(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="number"
                  value={numberFieldValue(formData.limits?.maxAgentsPerAccount)}
                  onChange={(e) => updateFormData('limits.maxAgentsPerAccount', parseIntInput(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Human Agents per Account</label>
                <input
                  type="number"
                  value={numberFieldValue(formData.limits?.maxHumanAgentsPerAccount)}
                  onChange={(e) => updateFormData('limits.maxHumanAgentsPerAccount', parseIntInput(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata & Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Color</label>
                <input
                  type="color"
                  value={formData.metadata?.color || '#6B7280'}
                  onChange={(e) => updateFormData('metadata.color', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => updateFormData('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.metadata?.popular || false}
                    onChange={(e) => updateFormData('metadata.popular', e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Mark as Popular</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.metadata?.trial?.enabled || false}
                    onChange={(e) => updateFormData('metadata.trial.enabled', e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Trial</span>
                </label>
              </div>
            </div>

            {formData.metadata?.trial?.enabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Trial Days</label>
                <input
                  type="number"
                  value={numberFieldValue(formData.metadata?.trial?.days)}
                  onChange={(e) => updateFormData('metadata.trial.days', parseIntInput(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="365"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {plan ? 'Update Plan' : 'Create Plan'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PlanManagementPanel = () => {
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [error, setError] = useState(null);

  // API Configuration - replace with your actual API base URL
  const apiUrl = import.meta.env.VITE_API_URL;

  const getAuthToken = () => localStorage.getItem('superAdminToken'); // Replace with your token storage method

  // API Functions
  const apiCall = async (endpoint, options = {}) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await apiCall(`/plan?status=${statusFilter}&search=${searchTerm}`);
      return response.data || [];
    } catch (error) {
      setError('Failed to fetch plans');
      console.log(error);
      return [];
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiCall('/plan/stats');
      return response.data;
    } catch (error) {
      setError('Failed to fetch stats');
      console.log(error);
      return null;
    }
  };

  const createPlan = async (planData) => {
    try {
      const response = await apiCall('/plan', {
        method: 'POST',
        body: JSON.stringify(planData)
      });
      return response.data;
    } catch (error) {
      setError('Failed to create plan');
      throw error;
    }
  };

  const updatePlan = async (planId, planData) => {
    try {
      const response = await apiCall(`/plan/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(planData)
      });
      return response.data;
    } catch (error) {
      setError('Failed to update plan');
      throw error;
    }
  };

  const deletePlan = async (planId, forceDelete = false) => {
    try {
      const response = await apiCall(`/plan/${planId}?forceDelete=${forceDelete}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      setError('Failed to delete plan');
      throw error;
    }
  };

  const setDefaultPlan = async (planId) => {
    try {
      const response = await apiCall(`/plan/${planId}/set-default`, {
        method: 'POST'
      });
      return response.data;
    } catch (error) {
      setError('Failed to set default plan');
      throw error;
    }
  };

  // Load data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansData, statsData] = await Promise.all([
        fetchPlans(),
        fetchStats()
      ]);
      
      setPlans(plansData);
      setStats(statsData);
    } catch (error) {
      setError('Failed to load data');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reload plans when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        loadData();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePlan = async (planData) => {
    try {
      const newPlan = await createPlan(planData);
      setPlans([...plans, newPlan]);
      setShowCreateModal(false);
      setError(null);
    } catch (error) {
      console.log(error);
      // Error already set in createPlan function
    }
  };

  const handleEditPlan = async (planData) => {
    try {
      const updatedPlan = await updatePlan(selectedPlan._id, planData);
      setPlans(plans.map(p => p._id === selectedPlan._id ? updatedPlan : p));
      setShowEditModal(false);
      setSelectedPlan(null);
      setError(null);
    } catch (error) {
      console.log(error);
      // Error already set in updatePlan function
    }
  };

  const handleDeletePlan = async (forceDelete = false) => {
    try {
      await deletePlan(selectedPlan._id, forceDelete);
      setPlans(plans.filter(p => p._id !== selectedPlan._id));
      setShowDeleteModal(false);
      setSelectedPlan(null);
      setError(null);
    } catch (error) {
      console.log(error);
      // Error already set in deletePlan function
    }
  };

  const handleSetDefault = async (planId) => {
    try {
      await setDefaultPlan(planId);
      setPlans(plans.map(p => ({ ...p, isDefault: p._id === planId })));
      setError(null);
    } catch (error) {
      console.log(error);
      // Error already set in setDefaultPlan function
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to format features from the API response
  const formatFeatures = (plan) => {
    const features = [];
    
    // Add pricing info
    if (plan.pricing?.monthly === 0) {
      features.push('Free forever');
    } else {
      features.push(`${plan.pricing?.monthly}/month`);
    }
    
    // Add limits
    if (plan.limits?.maxQueries) features.push(`${plan.limits.maxQueries} queries`);
    if (plan.limits?.maxPages) features.push(`${plan.limits.maxPages} pages`);
    if (plan.limits?.maxAgentsPerAccount) features.push(`${plan.limits.maxAgentsPerAccount} users`);
    
    return features.slice(0, 5); // Show max 5 features
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const PlanCard = ({ plan }) => {
    const features = formatFeatures(plan);
    const clientsCount = stats?.planBreakdown?.find(p => p.name === plan.name)?.clientsCount || 0;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{plan.displayName}</h3>
              {plan.isDefault && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
              {plan.metadata?.popular && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  Popular
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900" style={{ color: plan.metadata?.color }}>
                ${plan.pricing?.monthly || 0}
                {plan.pricing?.monthly > 0 && <span className="text-sm font-normal text-gray-500">/month</span>}
              </span>
              {plan.pricing?.yearly && plan.pricing.yearly > 0 && (
                <span className="text-sm text-gray-500">
                  (${plan.pricing.yearly}/year)
                </span>
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                plan.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {plan.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedPlan(plan);
                setShowEditModal(true);
              }}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedPlan(plan);
                setShowDeleteModal(true);
              }}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{clientsCount} clients</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min((clientsCount / 1500) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
            <div className="flex flex-wrap gap-1">
              {features.slice(0, 3).map((feature, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {feature}
                </span>
              ))}
              {features.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{features.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Limits:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>Queries: {plan.limits?.maxQueries || 'Unlimited'}</div>
              <div>Storage: {plan.limits?.maxStorage ? formatFileSize(plan.limits.maxStorage) : 'Unlimited'}</div>
              <div>Users: {plan.limits?.maxAgentsPerAccount || 'Unlimited'}</div>
            </div>
          </div>

          {plan.metadata?.trial?.enabled && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-blue-800">
                  {plan.metadata.trial.days}-day free trial
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <button
            onClick={() => handleSetDefault(plan._id)}
            disabled={plan.isDefault}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              plan.isDefault 
                ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {plan.isDefault ? 'Default Plan' : 'Set as Default'}
          </button>
          <span className="text-xs text-gray-500">Order: {plan.order}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plan & Pricing Management</h1>
            <p className="text-gray-600 mt-2">Manage subscription plans and pricing for your clients</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Package}
            title="Total Plans"
            value={stats?.totalPlans || 0}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            title="Active Plans"
            value={stats?.activePlans || 0}
            color="green"
          />
          <StatCard
            icon={Users}
            title="Total Clients"
            value={stats?.totalClients || 0}
            color="purple"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                onClick={() => setShowStatsModal(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Stats
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlans.map(plan => (
            <PlanCard key={plan._id} plan={plan} />
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <PlanFormModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePlan}
        title="Create New Plan"
      />

      <PlanFormModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPlan(null);
        }}
        onSubmit={handleEditPlan}
        plan={selectedPlan}
        title="Edit Plan"
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Plan</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the "{selectedPlan?.displayName}" plan? 
              {selectedPlan?.clientsCount > 0 && (
                <span className="block text-red-600 text-sm mt-2">
                  Warning: {selectedPlan.clientsCount} clients are currently using this plan.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeletePlan}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPlan(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagementPanel;