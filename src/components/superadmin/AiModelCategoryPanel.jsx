import React, { useEffect, useState } from 'react';
import { ChevronDown, Edit, Plus, Tag, Trash2, X, AlertCircle, Info } from 'lucide-react';
import { toast } from 'react-toastify';

export const AI_MODEL_CATEGORIES_ENDPOINT = '/ai-model-categories';

export const getCategoryId = (category) => {
  if (!category) return null;
  if (typeof category === 'string') return category;
  if (typeof category === 'object') return category._id;
  return null;
};

export const getCategoryName = (category) => {
  if (!category) return '';
  if (typeof category === 'string') return category;
  if (typeof category === 'object') return category.category || category.name || '';
  return '';
};

const toCategoryOption = (item) => {
  if (typeof item === 'string') {
    return { value: item, label: item };
  }

  if (!item || typeof item !== 'object') return null;

  const value = item._id || item.category || item.name;
  const label = item.category || item.name || item._id || '';
  return value ? { value, label } : null;
};

export const mergeCategoryOptions = (apiCategories = []) =>
  apiCategories.map(toCategoryOption).filter(Boolean);

export const normalizeCategoryIds = (categories = []) =>
  categories.map(getCategoryId).filter(Boolean);

export const buildCategoryMap = (categoryOptions = []) =>
  categoryOptions.reduce((map, item) => {
    const value = item?.value || item?._id;
    const label = item?.label || getCategoryName(item) || value;
    if (value) {
      map[value] = label;
    }
    return map;
  }, {});

export const buildCategoryAssignmentMap = (models = []) => {
  const assignmentMap = {};

  models.forEach((model) => {
    (model.categories || []).forEach((category) => {
      const value = getCategoryId(category) || getCategoryName(category);
      if (value) {
        assignmentMap[value] = model.model || 'Another model';
      }
    });
  });

  return assignmentMap;
};

function CategoryReassignConfirmModal({ pending, onConfirm, onCancel }) {
  if (!pending) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mb-4">
            <Info className="w-8 h-8 text-sky-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Reassign category?</h3>
          <p className="text-sm text-gray-600 mt-3">
            <span className="font-medium capitalize">{pending.categoryLabel}</span> is currently assigned to{' '}
            <span className="font-medium">{pending.assignedTo}</span>. Do you want to assign it to this model?
          </p>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export function CategoryMultiSelect({ value, options, categoryAssignmentMap = {}, onChange }) {
  const [open, setOpen] = useState(false);
  const [pendingReassign, setPendingReassign] = useState(null);

  const toggleCategory = (categoryValue, categoryLabel) => {
    if (value.includes(categoryValue)) {
      onChange(value.filter((item) => item !== categoryValue));
      return;
    }

    const assignedTo = categoryAssignmentMap[categoryValue];
    if (assignedTo) {
      setPendingReassign({
        categoryValue,
        categoryLabel,
        assignedTo,
      });
      return;
    }

    onChange([...value, categoryValue]);
  };

  const handleConfirmReassign = () => {
    if (!pendingReassign) return;
    onChange([...value, pendingReassign.categoryValue]);
    setPendingReassign(null);
  };

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  const label =
    selectedLabels.length === 0
      ? options.length === 0
        ? 'No categories available'
        : 'Select categories'
      : selectedLabels.length <= 2
        ? selectedLabels.join(', ')
        : `${selectedLabels.slice(0, 2).join(', ')} +${selectedLabels.length - 2}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={options.length === 0}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white flex items-center justify-between text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
      >
        <span className={selectedLabels.length === 0 ? 'text-gray-400' : 'text-gray-900'}>{label}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="p-2 space-y-1">
              {options.map((option) => {
                const checked = value.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(option.value, option.label)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {option.label}
                      {categoryAssignmentMap[option.value] && !checked && (
                        <span className="text-gray-400 normal-case">
                          {' '}
                          (assigned to {categoryAssignmentMap[option.value]})
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}

      <CategoryReassignConfirmModal
        pending={pendingReassign}
        onConfirm={handleConfirmReassign}
        onCancel={() => setPendingReassign(null)}
      />
    </div>
  );
}

function CategoryDeleteConfirmModal({ category, onConfirm, onCancel, submitting = false }) {
  if (!category) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800">Delete this category?</h3>
          <p className="text-sm text-gray-500 mt-3">
            It will be removed from all models that use it.
          </p>
          <p className="text-sm font-semibold text-gray-700 mt-2 capitalize">{getCategoryName(category)}</p>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryManageModal({
  show,
  categories,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  submitting = false,
}) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    if (!show) {
      setNewCategoryName('');
      setEditingCategory(null);
      setEditCategoryName('');
      setPendingDelete(null);
    }
  }, [show]);

  if (!show) return null;

  const handleCreate = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast.error('Category name is required');
      return;
    }
    try {
      await onCreate(trimmed);
      setNewCategoryName('');
    } catch {
      // parent shows toast
    }
  };

  const handleStartEdit = (category) => {
    setEditingCategory(category);
    setEditCategoryName(getCategoryName(category));
  };

  const handleSaveEdit = async () => {
    const trimmed = editCategoryName.trim();
    if (!trimmed) {
      toast.error('Category name is required');
      return;
    }
    try {
      await onUpdate(editingCategory._id, trimmed);
      setEditingCategory(null);
      setEditCategoryName('');
    } catch {
      // parent shows toast
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await onDelete(pendingDelete._id);
      setPendingDelete(null);
    } catch {
      // parent shows toast
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Manage Categories</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              disabled={submitting}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-72 overflow-y-auto">
            {categories.length === 0 ? (
              <p className="px-4 py-8 text-sm text-gray-500 text-center">No categories yet. Add one above.</p>
            ) : (
              categories.map((category) => {
                const isEditing = editingCategory?._id === category._id;
                return (
                  <div key={category._id} className="flex items-center gap-2 px-4 py-3">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          disabled={submitting}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        />
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={submitting}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(null);
                            setEditCategoryName('');
                          }}
                          disabled={submitting}
                          className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium text-gray-900 capitalize">
                          {getCategoryName(category)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(category)}
                          disabled={submitting}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                          title="Edit category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(category)}
                          disabled={submitting}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>

      <CategoryDeleteConfirmModal
        category={pendingDelete}
        submitting={submitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !submitting && setPendingDelete(null)}
      />
    </div>
  );
}

const extractCategoryList = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload)) return payload;
  return [];
};

const AiModelCategoryPanel = ({ apiCall, onCategoriesChange, onCategoriesMutated }) => {
  const [categoryList, setCategoryList] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const syncCategories = (categories) => {
    setCategoryList(categories);
    onCategoriesChange?.(categories, mergeCategoryOptions(categories));
  };

  const loadCategories = async () => {
    try {
      const response = await apiCall(AI_MODEL_CATEGORIES_ENDPOINT);
      syncCategories(extractCategoryList(response));
    } catch (error) {
      console.error('Failed to fetch AI model categories:', error);
      syncCategories([]);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (categoryName) => {
    try {
      setCategorySubmitting(true);
      await apiCall(`${AI_MODEL_CATEGORIES_ENDPOINT}/create`, {
        method: 'POST',
        body: JSON.stringify({ category: categoryName }),
      });
      await loadCategories();
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error(error.message || 'Failed to add category');
      throw error;
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleUpdateCategory = async (categoryId, categoryName) => {
    try {
      setCategorySubmitting(true);
      await apiCall(`${AI_MODEL_CATEGORIES_ENDPOINT}/update`, {
        method: 'PUT',
        body: JSON.stringify({ categoryId, category: categoryName }),
      });
      await loadCategories();
      await onCategoriesMutated?.();
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error(error.message || 'Failed to update category');
      throw error;
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      setCategorySubmitting(true);
      await apiCall(`${AI_MODEL_CATEGORIES_ENDPOINT}/delete/${categoryId}`, { method: 'DELETE' });
      await loadCategories();
      await onCategoriesMutated?.();
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error(error.message || 'Failed to delete category');
      throw error;
    } finally {
      setCategorySubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowCategoryModal(true)}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 w-fit"
      >
        <Tag className="w-4 h-4" />
        Category
      </button>

      <CategoryManageModal
        show={showCategoryModal}
        categories={categoryList}
        submitting={categorySubmitting}
        onClose={() => !categorySubmitting && setShowCategoryModal(false)}
        onCreate={handleCreateCategory}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
      />
    </>
  );
};

export default AiModelCategoryPanel;
