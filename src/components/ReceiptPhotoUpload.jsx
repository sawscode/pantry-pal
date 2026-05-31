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
      extractItemsFromImage(file);
    };
    reader.readAsDataURL(file);
  };

  const extractItemsFromImage = async (file) => {
    setExtracting(true);
    try {
      // Load Tesseract if not already loaded
      const Tesseract = window.Tesseract;
      if (!Tesseract) {
        // Fallback: show prompt for manual entry
        toast.error('OCR not available. Please enter items manually.');
        setExtracting(false);
        return;
      }

      // Convert file to data URL for Tesseract
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const { data } = await Tesseract.recognize(e.target.result, 'eng');
          const text = data.text;

          // Parse items from OCR text using simple regex
          const items = parseReceiptText(text);
          setExtracted(items);
          setConfirming(true);
        } catch (err) {
          console.error('OCR error:', err);
          toast.error('Failed to extract text from image');
        } finally {
          setExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('OCR setup error:', err);
      toast.error('OCR setup failed');
      setExtracting(false);
    }
  };

  const parseReceiptText = (text) => {
    // Simple parsing: look for patterns like "Item 1.99" or "Milk 3.50"
    const lines = text.split('\n').filter((l) => l.trim());
    const items = [];

    lines.forEach((line) => {
      // Skip lines that are clearly prices or totals
      if (line.includes('Total') || line.includes('Subtotal') || line.includes('Tax')) {
        return;
      }

      // Try to extract item name and quantity
      const match = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*$/);
      if (match) {
        const name = match[1].trim().toLowerCase();
        const price = parseFloat(match[2]);

        // Skip if price looks like quantity (< 20)
        if (price < 100 && name.length > 2 && !name.match(/^\d+$/)) {
          items.push({
            name,
            quantity: 1,
            unit: 'count',
            location: 'Pantry',
            confidence: 'high',
          });
        }
      }
    });

    return items.slice(0, 20); // Limit to 20 items
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
