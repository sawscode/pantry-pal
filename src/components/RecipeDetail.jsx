import { useState, useEffect, useMemo } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import { useSavedRecipes } from '../hooks/useSavedRecipes';
import toast from 'react-hot-toast';

export function RecipeDetail({ recipe, onBack, householdId, pantryItems }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { getRecipeDetails } = useRecipes();
  const { isRecipeSaved, saveRecipe, deleteRecipe } = useSavedRecipes(householdId);

  const isSaved = isRecipeSaved(recipe.id);

  // Match recipe ingredients with pantry items
  const matchedIngredients = useMemo(() => {
    if (!details?.extendedIngredients || !pantryItems) return [];

    return details.extendedIngredients.map((ingredient) => {
      const pantryItem = pantryItems.find(
        (item) => item.name.toLowerCase() === ingredient.name.toLowerCase()
      );
      return {
        ...ingredient,
        inPantry: !!pantryItem,
      };
    });
  }, [details, pantryItems]);

  useEffect(() => {
    const fetchDetails = async () => {
      const recipeData = await getRecipeDetails(recipe.id);
      setDetails(recipeData);
      setLoading(false);
    };

    fetchDetails();
  }, [recipe.id, getRecipeDetails]);

  const handleSaveRecipe = async () => {
    setSaving(true);
    try {
      if (isSaved) {
        // Find and delete the saved recipe
        const savedId = details.id;
        await deleteRecipe(savedId);
        toast.success('Recipe removed');
      } else {
        // Save new recipe
        await saveRecipe(
          recipe.id,
          details.title,
          details.image,
          details.extendedIngredients || [],
          details.sourceUrl
        );
        toast.success('Recipe saved!');
      }
    } catch (err) {
      toast.error(isSaved ? 'Failed to remove recipe' : 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Loading recipe...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Failed to load recipe</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
      >
        ← Back to Recipes
      </button>

      {/* Recipe Image */}
      {details.image && (
        <img
          src={details.image}
          alt={details.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      {/* Recipe Title & Meta */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {details.title}
        </h1>

        <div className="flex flex-wrap gap-4 mb-4">
          {details.readyInMinutes && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ready in</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {details.readyInMinutes} min
              </p>
            </div>
          )}
          {details.servings && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Servings</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {details.servings}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleSaveRecipe}
          disabled={saving}
          className={`w-full px-4 py-2 font-medium rounded-lg transition-colors ${
            isSaved
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          } disabled:opacity-50`}
        >
          {saving ? 'Saving...' : isSaved ? '❤️ Saved' : '🤍 Save Recipe'}
        </button>
      </div>

      {/* Ingredients with Pantry Matching */}
      {matchedIngredients && matchedIngredients.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Ingredients
          </h2>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {matchedIngredients.filter((i) => i.inPantry).length} of{' '}
            {matchedIngredients.length} items in your pantry
          </div>
          <ul className="bg-white dark:bg-gray-800 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
            {matchedIngredients.map((ingredient, idx) => (
              <li
                key={idx}
                className={`p-4 flex items-center justify-between ${
                  ingredient.inPantry
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <span className="text-gray-900 dark:text-white">
                  {ingredient.original}
                </span>
                {ingredient.inPantry && (
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                    ✓ In Pantry
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Instructions */}
      {details.instructions && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Instructions
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {details.instructions}
            </p>
          </div>
        </div>
      )}

      {/* Source Link */}
      {details.sourceUrl && (
        <div className="mb-8">
          <a
            href={details.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            View Original Recipe
          </a>
        </div>
      )}
    </div>
  );
}
