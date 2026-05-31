import { ItemCard } from './ItemCard';

export function PantryList({ items, onDelete, networkError }) {
  if (networkError) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-center">
        <p className="text-amber-800 dark:text-amber-200 font-medium">
          ⚠️ No connection to pantry
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
          Check your internet connection
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Your pantry is empty
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Add your first item above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold mb-4">Pantry Items</h2>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  );
}
