export function Dashboard({ items, recipes }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group items by location
  const itemsByLocation = {
    Pantry: items.filter((i) => i.location === 'Pantry'),
    Fridge: items.filter((i) => i.location === 'Fridge'),
    Freezer: items.filter((i) => i.location === 'Freezer'),
  };

  // Find expiring items (< 7 days)
  const expiringItems = items.filter((item) => {
    if (!item.expiration_date) return false;
    const expDate = new Date(item.expiration_date);
    expDate.setHours(0, 0, 0, 0);
    const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  }).sort((a, b) => {
    const dateA = new Date(a.expiration_date);
    const dateB = new Date(b.expiration_date);
    return dateA - dateB;
  });

  // Find expired items
  const expiredItems = items.filter((item) => {
    if (!item.expiration_date) return false;
    const expDate = new Date(item.expiration_date);
    expDate.setHours(0, 0, 0, 0);
    const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry < 0;
  }).sort((a, b) => {
    const dateA = new Date(a.expiration_date);
    const dateB = new Date(b.expiration_date);
    return dateB - dateA;
  });

  // Find forgotten items (added 30+ days ago and not touched)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const forgottenItems = items.filter((item) => {
    const createdDate = new Date(item.created_at);
    return createdDate < thirtyDaysAgo;
  });

  function daysUntilExpiry(expirationDate) {
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    return Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(itemsByLocation).map(([location, items]) => (
          <div
            key={location}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">{location}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {items.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        ))}
      </div>

      {/* Expired Items Alert */}
      {expiredItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-3">
            ⚠️ Expired Items ({expiredItems.length})
          </h3>
          <div className="space-y-2">
            {expiredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm text-red-700 dark:text-red-300 bg-white dark:bg-red-900/30 p-2 rounded"
              >
                <span>
                  {item.name} ({item.location})
                </span>
                <span className="text-xs font-semibold">
                  {item.expiration_date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiring Soon */}
      {expiringItems.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200 mb-3">
            ⏰ Expiring Soon ({expiringItems.length})
          </h3>
          <div className="space-y-2">
            {expiringItems.map((item) => {
              const days = daysUntilExpiry(item.expiration_date);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm text-orange-700 dark:text-orange-300 bg-white dark:bg-orange-900/30 p-2 rounded"
                >
                  <span>
                    {item.name} ({item.location})
                  </span>
                  <span className="text-xs font-semibold">
                    {days === 0 ? 'Today' : `${days}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Forgotten Items */}
      {forgottenItems.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-3">
            🤔 Forgotten Items ({forgottenItems.length})
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            These haven't been used in 30+ days
          </p>
          <div className="space-y-2">
            {forgottenItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm text-yellow-700 dark:text-yellow-300 bg-white dark:bg-yellow-900/30 p-2 rounded"
              >
                <span>
                  {item.name} ({item.location})
                </span>
                <span className="text-xs font-semibold">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
            {forgottenItems.length > 5 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                +{forgottenItems.length - 5} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* All Clear */}
      {expiredItems.length === 0 && expiringItems.length === 0 && forgottenItems.length === 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <p className="text-lg font-bold text-green-800 dark:text-green-200">
            ✓ All Clear!
          </p>
          <p className="text-sm text-green-700 dark:text-green-300 mt-2">
            No expiring or forgotten items
          </p>
        </div>
      )}

      {/* Recipe Summary */}
      {recipes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            📖 Your Recipes
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {recipes.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            recipes saved
          </p>
        </div>
      )}
    </div>
  );
}
