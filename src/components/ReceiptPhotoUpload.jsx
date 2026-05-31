import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

export function ReceiptPhotoUpload({ onItemsExtracted }) {
  const [photo, setPhoto] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhoto(e.target.result);
      extractItemsWithClaude(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const extractItemsWithClaude = async (imageData) => {
    setExtracting(true);
    try {
      const response = await fetch('/.netlify/functions/extract-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to extract items');
      }

      const { items } = await response.json();

      if (items.length === 0) {
        toast.error('No items found in receipt');
        setExtracting(false);
        return;
      }

      setExtracted(items);
      setConfirming(true);
      toast.success(`Found ${items.length} items!`);
    } catch (err) {
      console.error('Claude extraction error:', err);
      toast.error(err.message || 'Failed to extract items from receipt');
    } finally {
      setExtracting(false);
    }
  };

  const handleConfirmItems = () => {
    if (extracted.length === 0) {
      toast.error('No items extracted');
      return;
    }

    onItemsExtracted(extracted);
    resetForm();
  };

  const handleRemoveItem = (index) => {
    setExtracted(extracted.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...extracted];
    updated[index][field] = value;
    setExtracted(updated);
  };

  const resetForm = () => {
    setPhoto(null);
    setExtracted([]);
    setConfirming(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show confirmation UI if we have extracted items
  if (confirming && extracted.length > 0) {
    return (
      <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg p-4 mb-4 border-2 border-green-400 dark:border-green-600">
        <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-3">
          📸 Extracted Items ({extracted.length}):
        </p>

        {/* Photo preview */}
        {photo && (
          <img
            src={photo}
            alt="Receipt"
            className="w-full max-h-40 object-cover rounded-lg mb-3"
          />
        )}

        {/* Extracted items list */}
        <div className="space-y-2 mb-4">
          {extracted.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded"
            >
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Item name"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleUpdateItem(idx, 'quantity', parseFloat(e.target.value) || 1)
                }
                className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                min="0.1"
                step="0.5"
              />
              <select
                value={item.unit}
                onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
              >
                <option>count</option>
                <option>cups</option>
                <option>oz</option>
                <option>lbs</option>
                <option>g</option>
                <option>kg</option>
              </select>
              <button
                onClick={() => handleRemoveItem(idx)}
                className="px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleConfirmItems}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            ✓ Add All Items ({extracted.length})
          </button>
          <button
            onClick={resetForm}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Try Another
          </button>
        </div>
      </div>
    );
  }

  // Show photo input
  if (extracting) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-800 text-center">
        <p className="text-blue-900 dark:text-blue-200 font-medium">
          📸 Analyzing receipt...
        </p>
      </div>
    );
  }

  // Show camera button
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoCapture}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mb-4"
      >
        <span className="text-xl">📸</span>
        Scan Receipt
      </button>
    </>
  );
}
