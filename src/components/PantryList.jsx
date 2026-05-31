import { useState, useMemo } from 'react';
import { ItemCard } from './ItemCard';

export function PantryList({ items, onDelete, onUpdate, networkError, categories, locations }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesLocation = selectedLocation === 'All' || item.location === selectedLocation;
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [items, searchQuery, selectedCategory, selectedLocation]);

  if (networkError) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-center">
        <p className="text-amber-800 dark:text-amber-200 font-medium">
          ⚠️ No connection
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
          Check your internet connection
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Inventory</h2>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Location Filter */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLocation('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedLocation === 'All'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLocation === loc
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'All'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {items.length === 0 ? 'Your inventory is empty' : 'No items found'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            {items.length === 0 ? 'Add your first item above' : 'Try a different search or filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={onDelete} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
