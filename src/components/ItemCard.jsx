import { useState } from 'react';

const CATEGORY_COLORS = {
  Produce: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  Dairy: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  Pantry: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  Frozen: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
  Meat: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  Other: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
};

export function ItemCard({ item, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(item.id);
      setShowConfirm(false);
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Delete "{item.name}"?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-1 px-3 rounded transition-colors text-sm"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={deleting}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-900 font-medium py-1 px-3 rounded transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
          {item.category && (
            <span className={`text-xs font-semibold px-2 py-1 rounded ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other}`}>
              {item.category}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {item.quantity} {item.unit}
        </p>
      </div>
      <button
        onClick={() => setShowConfirm(true)}
        className="ml-4 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
      >
        Delete
      </button>
    </div>
  );
}
