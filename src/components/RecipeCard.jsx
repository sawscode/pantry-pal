export function RecipeCard({ recipe, onSelect }) {
  return (
    <button
      onClick={() => onSelect(recipe)}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg transition-all"
    >
      {recipe.image && (
        <div className="w-full h-40 overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
          {recipe.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {recipe.usedIngredients?.length || 0} ingredients
        </p>
      </div>
    </button>
  );
}
