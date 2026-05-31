export function RecipeDetail({ recipe, onBack, pantryItems }) {
  if (!recipe) return null;

  // Check which ingredients are in pantry
  const ingredientStatus = (recipe.ingredients || []).map((ing) => {
    const inPantry = pantryItems.some(
      (item) => item.name.toLowerCase() === ing.name.toLowerCase()
    );
    return { ...ing, inPantry };
  });

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
      >
        ← Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {recipe.name}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap gap-6 mb-6 text-sm">
          {recipe.prep_time_minutes && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">Prep Time</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {recipe.prep_time_minutes} min
              </p>
            </div>
          )}
          {recipe.cook_time_minutes && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">Cook Time</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {recipe.cook_time_minutes} min
              </p>
            </div>
          )}
          {totalTime > 0 && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">Total Time</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {totalTime} min
              </p>
            </div>
          )}
          {recipe.servings && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">Servings</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {recipe.servings}
              </p>
            </div>
          )}
        </div>

        {/* Ingredients */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Ingredients
          </h2>
          <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            {ingredientStatus.filter((i) => i.inPantry).length} of{' '}
            {ingredientStatus.length} in your pantry
          </div>
          <ul className="space-y-2">
            {ingredientStatus.map((ing, idx) => (
              <li
                key={idx}
                className={`p-3 rounded-lg flex items-center justify-between ${
                  ing.inPantry
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <span className="text-gray-900 dark:text-white">
                  {ing.quantity} {ing.unit} {ing.name}
                </span>
                {ing.inPantry && (
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-900 px-2 py-1 rounded">
                    ✓ Have it
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Instructions
          </h2>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {recipe.instructions}
            </p>
          </div>
        </div>

        {/* Notes */}
        {recipe.notes && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Notes
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-700 dark:text-gray-300">{recipe.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
