export function BottomNav({ currentTab, onTabChange }) {
  const tabs = [
    { id: 'pantry', label: 'Pantry', icon: '🥘' },
    { id: 'recipes', label: 'Recipes', icon: '📖' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-2xl mx-auto px-4 flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-4 px-2 text-sm font-medium transition-colors ${
              currentTab === tab.id
                ? 'text-purple-600 dark:text-purple-400 border-t-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="text-2xl mb-1">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
