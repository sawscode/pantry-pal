export function BottomNav({ currentTab, onTabChange }) {
  const tabs = [
    { id: 'inventory', label: 'Inventory', icon: '🥘' },
    { id: 'recipes', label: 'Recipes', icon: '📖' },
    { id: 'mealplan', label: 'Meal Plan', icon: '📅' },
    { id: 'shopping', label: 'Shopping', icon: '🛒' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
      <div className="max-w-2xl mx-auto px-2 flex justify-between">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-1 text-xs font-medium transition-colors min-w-[80px] ${
              currentTab === tab.id
                ? 'text-purple-600 dark:text-purple-400 border-t-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="line-clamp-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
