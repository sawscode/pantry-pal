import { useState } from 'react';
import toast from 'react-hot-toast';

const UNITS = ['cups', 'oz', 'count', 'lbs', 'tsp', 'tbsp', 'g', 'kg', 'ml', 'l'];
const LOCATIONS = ['Pantry', 'Fridge', 'Freezer'];

export function QuickAddVoice({ onAdd, isListening, setIsListening }) {
  const [transcript, setTranscript] = useState('');
  const [parsed, setParsed] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(true); // Start with text input visible

  // Simple regex-based parsing
  function parseVoiceInput(text) {
    // Examples: "add 2 cups milk to fridge", "add 6 eggs", "milk 1 count"
    // Pattern: [qty] [unit] [item] [to location]

    const normalized = text.toLowerCase().trim();

    // Try to extract quantity and unit
    const qtyMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(cups?|oz|count|lbs?|tsp|tbsp|grams?|kilograms?|ml|liters?|l)\s+/);
    const qty = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
    let unit = qtyMatch ? qtyMatch[2] : 'count';

    // Normalize units
    unit = normalizeUnit(unit);

    // Extract item name (everything between quantity and "to" or end)
    let itemName = normalized;
    if (qtyMatch) {
      itemName = normalized.substring(qtyMatch[0].length).trim();
    } else {
      // No quantity found, try to extract item from start
      itemName = normalized.replace(/^add\s+/, '').trim();
    }

    // Extract location
    const locationMatch = itemName.match(/to\s+(pantry|fridge|freezer)/i);
    let location = locationMatch ? capitalizeFirst(locationMatch[1]) : 'Pantry';

    if (locationMatch) {
      itemName = itemName.substring(0, locationMatch.index).trim();
    }

    // Clean up item name
    itemName = itemName.replace(/^add\s+/, '').trim();
    if (!itemName) {
      toast.error('Couldn\'t understand the item name');
      return null;
    }

    return {
      name: itemName,
      quantity: qty,
      unit,
      location,
    };
  }

  function normalizeUnit(unit) {
    const normalized = {
      'cup': 'cups',
      'cups': 'cups',
      'oz': 'oz',
      'count': 'count',
      'lb': 'lbs',
      'lbs': 'lbs',
      'teaspoon': 'tsp',
      'tsp': 'tsp',
      'tablespoon': 'tbsp',
      'tbsp': 'tbsp',
      'gram': 'g',
      'grams': 'g',
      'g': 'g',
      'kilogram': 'kg',
      'kilograms': 'kg',
      'kg': 'kg',
      'ml': 'ml',
      'milliliter': 'ml',
      'liter': 'l',
      'liters': 'l',
      'l': 'l',
    };
    return normalized[unit] || 'count';
  }

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }


  const handleManualInput = () => {
    const parsed = parseVoiceInput(manualInput);
    if (parsed) {
      setTranscript(manualInput);
      setParsed(parsed);
      setConfirming(true);
      setShowManualInput(false);
    }
  };

  const confirmAdd = async () => {
    if (!parsed) return;

    try {
      await onAdd(
        parsed.name,
        parsed.quantity,
        parsed.unit,
        'Other',
        parsed.location,
        null
      );
      toast.success(`Added ${parsed.quantity} ${parsed.unit} ${parsed.name}`);

      // Reset
      setTranscript('');
      setParsed(null);
      setConfirming(false);
    } catch (err) {
      toast.error('Failed to add item');
    }
  };

  if (confirming && parsed) {
    return (
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-4 mb-4 border-2 border-purple-400 dark:border-purple-600">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Heard:</p>
        <p className="font-mono text-sm mb-4 text-gray-800 dark:text-gray-200">
          "{transcript}"
        </p>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Parsed as:</p>
        <div className="bg-white dark:bg-gray-800 rounded p-3 mb-4 space-y-1 text-sm">
          <p><strong>Item:</strong> {parsed.name}</p>
          <p><strong>Qty:</strong> {parsed.quantity} {parsed.unit}</p>
          <p><strong>Location:</strong> {parsed.location}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={confirmAdd}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            ✓ Confirm & Add
          </button>
          <button
            onClick={() => {
              setConfirming(false);
              setParsed(null);
              setTranscript('');
            }}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          💡 Tip: Say things like "add 2 cups milk to fridge" or "6 eggs to fridge"
        </p>
      </div>
    );
  }

  if (showManualInput) {
    return (
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-4 mb-4 border-2 border-purple-400 dark:border-purple-600">
        <p className="text-sm font-medium text-purple-900 dark:text-purple-200 mb-3">
          🚀 Quick Add (Say what you're adding):
        </p>
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="e.g., 2 cups milk to fridge"
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleManualInput();
          }}
          className="w-full px-4 py-3 border-2 border-purple-300 dark:border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-purple-900/50 dark:text-white mb-3 text-base"
          autoFocus
        />
        <button
          onClick={handleManualInput}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          ✓ Add Item
        </button>
        <p className="text-xs text-purple-700 dark:text-purple-300 mt-2">
          💡 Try: "2 cups milk to fridge" or "6 eggs"
        </p>
      </div>
    );
  }

  return null;
}
