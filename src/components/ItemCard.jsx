import { useState } from 'react';

const CATEGORY_COLORS = {
  Produce: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  Dairy: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  Pantry: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  Frozen: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
  Meat: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  Condiments: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  Other: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
};

function getExpirationStatus(expirationDate) {
  if (!expirationDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return { status: 'expired', label: 'Expired', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' };
  } else if (daysUntilExpiry === 0) {
    return { status: 'today', label: 'Expires today', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' };
  } else if (daysUntilExpiry <= 3) {
    return { status: 'soon', label: `Expires in ${daysUntilExpiry}d`, color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' };
  } else if (daysUntilExpiry <= 7) {
    return { status: 'week', label: `Expires in ${daysUntilExpiry}d`, color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' };
  }
  return null;
}

export function ItemCard({ item, onDelete, onUpdate }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const expirationStatus = getExpirationStatus(item.expiration_date);

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

  const handleDecrement = async () => {
    const newQty = item.quantity - 1;
    if (newQty <= 0) {
      setShowConfirm(true);
      return;
    }

    setUpdating(true);
    try {
      await onUpdate(item.id, { quantity: newQty });
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleIncrement = async () => {
    const newQty = item.quantity + 1;
    setUpdating(true);
    try {
      await onUpdate(item.id, { quantity: newQty });
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setUpdating(false);
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
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
      expirationStatus?.status === 'expired' || expirationStatus?.status === 'today'
        ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
        : expirationStatus?.status === 'soon'
        ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
          {item.category && (
            <span className={`text-xs font-semibold px-2 py-1 rounded ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other}`}>
              {item.category}
            </span>
          )}
          {item.location && (
            <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
              {item.location}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrement}
              disabled={updating}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-sm font-bold disabled:opacity-50"
            >
              −
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
              {item.quantity} {item.unit}
            </p>
            <button
              onClick={handleIncrement}
              disabled={updating}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-sm font-bold disabled:opacity-50"
            >
              +
            </button>
          </div>

          {expirationStatus && (
            <span className={`text-xs font-semibold px-2 py-1 rounded ${expirationStatus.color}`}>
              {expirationStatus.label}
            </span>
          )}
        </div>

        {item.notes && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {item.notes}
          </p>
        )}
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
