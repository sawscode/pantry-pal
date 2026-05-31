import toast from 'react-hot-toast';

export function RecipesList({ recipes, onEdit, onDelete, onViewDetails }) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No recipes yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Create your first recipe</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {recipe.name}
          </h3>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            {recipe.prep_time_minutes && (
              <p>⏱️ Prep: {recipe.prep_time_minutes} min</p>
            )}
            {recipe.cook_time_minutes && (
              <p>🍳 Cook: {recipe.cook_time_minutes} min</p>
            )}
            {recipe.servings && (
              <p>🍽️ Servings: {recipe.servings}</p>
            )}
            {recipe.ingredients && (
              <p>📝 {recipe.ingredients.length} ingredients</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(recipe)}
              className="flex-1 px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              View
            </button>
            <button
              onClick={() => onEdit(recipe)}
              className="flex-1 px-3 py-2 text-sm font-medium bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete "${recipe.name}"?`)) {
                  onDelete(recipe.id);
                  toast.success('Recipe deleted');
                }
              }}
              className="flex-1 px-3 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
