import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Check, ChevronDown, Edit, Plus, Search, Trash2, X, AlertCircle, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { superadminFetch } from '@/lib/superadminFetch';

const CATEGORY_OPTIONS = ['chat', 'embedding', 'intent', 'open-source'];
const STATUS_OPTIONS = ['active', 'inactive'];
const AI_MODELS_BASE_ENDPOINT = '/ai-models';
const DELETE_CONFIRM_TEXT = 'model-delete';

const getDefaultModelFormData = () => ({
  model: '',
  status: 'inactive',
  inputCost: '',
  outputCost: '',
  cacheCost: '',
  categories: [],
});

const normalizeNumber = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildFormDataFromModel = (modelData) => {
  if (!modelData) return getDefaultModelFormData();
  return {
    model: modelData.model ?? '',
    status: modelData.status ?? 'inactive',
    inputCost: modelData.inputCost ?? '',
    outputCost: modelData.outputCost ?? '',
    cacheCost: modelData.cacheCost ?? '',
    categories: Array.isArray(modelData.categories) ? modelData.categories : [],
  };
};

function CategoryMultiSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const toggleCategory = (category) => {
    if (value.includes(category)) {
      onChange(value.filter((item) => item !== category));
      return;
    }
    onChange([...value, category]);
  };

  const label =
    value.length === 0
      ? 'Select categories'
      : value.length <= 2
        ? value.join(', ')
        : `${value.slice(0, 2).join(', ')} +${value.length - 2}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white flex items-center justify-between text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <span className={value.length === 0 ? 'text-gray-400' : 'text-gray-900'}>{label}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="p-2 space-y-1">
              {CATEGORY_OPTIONS.map((category) => {
                const checked = value.includes(category);
                return (
                  <label
                    key={category}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(category)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{category}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ModelFormModal({ show, title, modelData, onClose, onSubmit }) {
  const [formData, setFormData] = useState(getDefaultModelFormData());

  useEffect(() => {
    if (!show) return;
    setFormData(buildFormDataFromModel(modelData));
  }, [show, modelData]);

  if (!show) return null;

  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!formData.model.trim()) {
      toast.error('Model name is required');
      return;
    }

    if (!formData.categories.length) {
      toast.error('Select at least one category');
      return;
    }

    if (
      normalizeNumber(formData.inputCost) <= 0 ||
      normalizeNumber(formData.outputCost) <= 0 ||
      normalizeNumber(formData.cacheCost) <= 0
    ) {
      toast.error('Input, output, and cache cost must be greater than 0');
      return;
    }

    onSubmit({
      model: formData.model.trim(),
      status: formData.status,
      inputCost: normalizeNumber(formData.inputCost),
      outputCost: normalizeNumber(formData.outputCost),
      cacheCost: normalizeNumber(formData.cacheCost),
      categories: formData.categories,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => updateFormData('model', e.target.value)}
                placeholder="e.g. gpt-5.4-nano"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => updateFormData('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <CategoryMultiSelect
                value={formData.categories}
                onChange={(categories) => updateFormData('categories', categories)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input $/1M</label>
              <input
                type="number"
                min="0"
                step="0.000001"
                value={formData.inputCost}
                onChange={(e) => updateFormData('inputCost', e.target.value)}
                placeholder="e.g. 2.5000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output $/1M</label>
              <input
                type="number"
                min="0"
                step="0.000001"
                value={formData.outputCost}
                onChange={(e) => updateFormData('outputCost', e.target.value)}
                placeholder="e.g. 10.0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cache $/1M</label>
              <input
                type="number"
                min="0"
                step="0.000001"
                value={formData.cacheCost}
                onChange={(e) => updateFormData('cacheCost', e.target.value)}
                placeholder="e.g. 0.0500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Costs are stored per 1M tokens and will be used anywhere the backend exposes these values.
          </p>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const formatCost = (value) => `$${normalizeNumber(value).toFixed(4)}`;

const GPTSettingsPanel = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCannotDeleteModal, setShowCannotDeleteModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const apiCall = async (endpoint, options = {}) => {
    const { headers: optHeaders = {}, ...rest } = options;
    const response = await superadminFetch(`${apiUrl}${endpoint}`, {
      ...rest,
      headers: {
        ...optHeaders,
      },
    });

    if (!response.ok) {
      let message = `API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        message = errorData?.message || message;
      } catch {
        // ignore json parse failure for non-json errors
      }
      throw new Error(message);
    }

    return response.json();
  };

  const extractList = (payload) => {
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.models)) return payload.models;
    if (Array.isArray(payload)) return payload;
    return [];
  };

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`${AI_MODELS_BASE_ENDPOINT}`);
      setModels(extractList(response));
    } catch (error) {
      console.error('Failed to fetch GPT models:', error);
      toast.error('Failed to fetch GPT settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const filteredModels = useMemo(() => {
    return models.filter((item) => {
      const modelName = item.model?.toLowerCase?.() || '';
      const categories = Array.isArray(item.categories) ? item.categories.join(' ').toLowerCase() : '';
      const matchesSearch =
        modelName.includes(searchTerm.toLowerCase()) ||
        categories.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [models, searchTerm, statusFilter]);

  const handleCreateModel = async (payload) => {
    try {
      setSubmitting(true);
      const response = await apiCall(`${AI_MODELS_BASE_ENDPOINT}/create`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const createdModel = response?.data || response?.model || payload;
      setModels((prev) => [createdModel, ...prev]);
      setShowCreateModal(false);
      toast.success('Model added successfully');
    } catch (error) {
      console.error('Failed to create GPT model:', error);
      toast.error(error.message || 'Failed to add model');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditModel = async (payload) => {
    if (!selectedModel?._id) return;
    try {
      setSubmitting(true);
      const response = await apiCall(`${AI_MODELS_BASE_ENDPOINT}/update`, {
        method: 'PUT',
        body: JSON.stringify({
          modelId: selectedModel._id,
          ...payload,
        }),
      });
      const updatedModel = response?.data || response?.model || { ...selectedModel, ...payload };
      setModels((prev) =>
        prev.map((item) => (item._id === selectedModel._id ? updatedModel : item))
      );
      setShowEditModal(false);
      setSelectedModel(null);
      toast.success('Model updated successfully');
    } catch (error) {
      console.error('Failed to update GPT model:', error);
      toast.error(error.message || 'Failed to update model');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (modelData) => {
    setSelectedModel(modelData);
    setDeleteConfirmationText('');
    if (modelData.status === 'active') {
      setShowCannotDeleteModal(true);
      return;
    }
    setShowDeleteModal(true);
  };

  const handleDeleteModel = async () => {
    if (!selectedModel?._id) return;
    if (deleteConfirmationText.trim() !== DELETE_CONFIRM_TEXT) {
      toast.error(`Type ${DELETE_CONFIRM_TEXT} to confirm delete`);
      return;
    }
    try {
      setSubmitting(true);
      await apiCall(`${AI_MODELS_BASE_ENDPOINT}/delete/${selectedModel._id}`, { method: 'DELETE' });
      await loadModels();
      setShowDeleteModal(false);
      setSelectedModel(null);
      setDeleteConfirmationText('');
      toast.success('Model deleted successfully');
    } catch (error) {
      console.error('Failed to delete GPT model:', error);
      toast.error(error.message || 'Failed to delete model');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        

          <div>
            <h1 className="text-3xl font-bold text-gray-900">GPT Settings</h1>
            <p className="text-gray-600 mt-2"> Manage available models, categories, status, and token pricing.</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            Add Model
          </button>
        </div>

        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search model or category..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div> */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Input</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Output</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  [...Array(5)].map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4" colSpan="6">
                        <div className="h-8 w-full animate-pulse rounded bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No models found</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Add a new model or adjust your search and status filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredModels.map((item) => (
                    <tr key={item._id || item.model} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.model}</div>
                        {'cacheCost' in item && (
                          <div className="text-xs text-gray-500 mt-1">
                            Cache: {formatCost(item.cacheCost)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {(item.categories || []).map((category) => (
                            <span
                              key={category}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCost(item.inputCost)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCost(item.outputCost)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedModel(item);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit model"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete model"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModelFormModal
        show={showCreateModal}
        title="Add Model"
        onClose={() => !submitting && setShowCreateModal(false)}
        onSubmit={handleCreateModel}
      />

      <ModelFormModal
        show={showEditModal}
        title="Update Model"
        modelData={selectedModel}
        onClose={() => {
          if (submitting) return;
          setShowEditModal(false);
          setSelectedModel(null);
        }}
        onSubmit={handleEditModel}
      />

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">Delete this model?</h3>
              <p className="text-sm text-gray-500 mt-3">
                This row will be removed from GPT settings.
              </p>
              <p className="text-sm font-semibold text-gray-700 mt-2">{selectedModel?.model}</p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type <span className="text-pink-500">{DELETE_CONFIRM_TEXT}</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder={DELETE_CONFIRM_TEXT}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedModel(null);
                  setDeleteConfirmationText('');
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteModel}
                disabled={submitting || deleteConfirmationText.trim() !== DELETE_CONFIRM_TEXT}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showCannotDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-sky-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">Cannot delete active model</h3>
              <p className="text-sm text-gray-600 mt-3">
                This is the currently active model. Switch to another active model first, then delete this one.
              </p>
              <p className="text-sm font-semibold text-gray-700 mt-2">({selectedModel?.model})</p>
            </div>

            <button
              onClick={() => {
                setShowCannotDeleteModal(false);
                setSelectedModel(null);
                setDeleteConfirmationText('');
              }}
              className="mt-8 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GPTSettingsPanel;
