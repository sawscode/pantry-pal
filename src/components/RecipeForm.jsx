import { useState } from 'react';
import toast from 'react-hot-toast';

export function RecipeForm({ onSave, onCancel, initialRecipe = null }) {
  const [name, setName] = useState(initialRecipe?.name || '');
  const [ingredients, setIngredients] = useState(initialRecipe?.ingredients || []);
  const [currentIngredient, setCurrentIngredient] = useState({ name: '', quantity: '', unit: 'cups' });
  const [instructions, setInstructions] = useState(initialRecipe?.instructions || '');
  const [prepTime, setPrepTime] = useState(initialRecipe?.prep_time_minutes || '');
  const [cookTime, setCookTime] = useState(initialRecipe?.cook_time_minutes || '');
  const [servings, setServings] = useState(initialRecipe?.servings || '1');
  const [notes, setNotes] = useState(initialRecipe?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  const units = ['cups', 'oz', 'count', 'lbs', 'tsp', 'tbsp', 'g', 'kg', 'ml', 'l'];

  const addIngredient = () => {
    if (!currentIngredient.name.trim() || !currentIngredient.quantity) {
      toast.error('Enter ingredient name and quantity');
      return;
    }
    setIngredients([...ingredients, { ...currentIngredient, quantity: parseFloat(currentIngredient.quantity) }]);
    setCurrentIngredient({ name: '', quantity: '', unit: 'cups' });
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || ingredients.length === 0 || !instructions.trim()) {
      toast.error('Recipe needs name, at least 1 ingredient, and instructions');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        name,
        ingredients,
        instructions,
        prepTime: prepTime ? parseInt(prepTime) : null,
        cookTime: cookTime ? parseInt(cookTime) : null,
        servings: parseInt(servings) || 1,
        notes,
      });
      toast.success(initialRecipe ? 'Recipe updated' : 'Recipe created');
    } catch (err) {
      toast.error('Failed to save recipe');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
      <h2 className="text-2xl font-bold">{initialRecipe ? 'Edit Recipe' : 'Create Recipe'}</h2>

      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Recipe Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Pasta Carbonara"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Prep Time (min)</label>
          <input
            type="number"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Cook Time (min)</label>
          <input
            type="number"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Servings</label>
        <input
          type="number"
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          min="1"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Ingredients */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Ingredients *</h3>
        <div className="space-y-2 mb-4">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded">
              <span className="text-sm">
                {ing.quantity} {ing.unit} {ing.name}
              </span>
              <button
                type="button"
                onClick={() => removeIngredient(idx)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
          <input
            type="text"
            value={currentIngredient.name}
            onChange={(e) => setCurrentIngredient({ ...currentIngredient, name: e.target.value })}
            placeholder="Ingredient name"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="number"
            value={currentIngredient.quantity}
            onChange={(e) => setCurrentIngredient({ ...currentIngredient, quantity: e.target.value })}
            placeholder="Qty"
            step="0.25"
            min="0.25"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
          <select
            value={currentIngredient.unit}
            onChange={(e) => setCurrentIngredient({ ...currentIngredient, unit: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addIngredient}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium mb-2">Instructions *</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Step-by-step instructions..."
          rows="6"
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tips, variations, etc..."
          rows="2"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition-colors"
        >
          {submitting ? 'Saving...' : initialRecipe ? 'Update Recipe' : 'Create Recipe'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
