import { useState } from 'react';

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
        <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
