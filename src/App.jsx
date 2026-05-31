import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabaseClient';
import { usePantryItems } from './hooks/usePantryItems';
import { LoginForm } from './components/LoginForm';
import { AddItemForm } from './components/AddItemForm';
import { PantryList } from './components/PantryList';
import { RecipeSearch } from './components/RecipeSearch';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [user, setUser] = useState(null);
  const [householdId, setHouseholdId] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [householdLoading, setHouseholdLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('pantry');

  const { items, loading, error, networkError, addItem, deleteItem, units, categories } =
    usePantryItems(householdId);

  // Check for existing session and set up auth listener
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await initializeHousehold(session.user.id);
      }

      setUserLoading(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        initializeHousehold(session.user.id);
      } else {
        setUser(null);
        setHouseholdId(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const initializeHousehold = async (userId) => {
    setHouseholdLoading(true);
    try {
      // Check if user has a household
      let { data: households, error: fetchError } = await supabase
        .from('user_households')
        .select('household_id')
        .eq('user_id', userId)
        .limit(1);

      if (fetchError) throw fetchError;

      if (households && households.length > 0) {
        setHouseholdId(households[0].household_id);
      } else {
        // Create a new household for this user
        const { data: household, error: createHhError } = await supabase
          .from('households')
          .insert([{ name: 'My Household' }])
          .select('id')
          .single();

        if (createHhError) throw createHhError;

        // Link user to household
        const { error: linkError } = await supabase
          .from('user_households')
          .insert([
            {
              user_id: userId,
              household_id: household.id,
            },
          ]);

        if (linkError) throw linkError;

        setHouseholdId(household.id);
      }
    } catch (err) {
      console.error('Household initialization failed:', err);
    } finally {
      setHouseholdLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHouseholdId(null);
  };

  const handleAddItem = async (name, quantity, unit, category) => {
    try {
      await addItem(name, quantity, unit, category);
      toast.success(`Added ${name}`);
    } catch (err) {
      toast.error('Failed to add item');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteItem(id);
      toast.success('Item deleted');
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Toaster position="top-center" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Pantry Pal
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sharing with: <span className="font-medium">{user.email}</span>
        </p>

        {householdLoading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Setting up your household...
          </p>
        ) : (
          <>
            {/* Pantry Tab */}
            {currentTab === 'pantry' && (
              <>
                <AddItemForm
                  onAdd={handleAddItem}
                  units={units}
                  categories={categories}
                  loading={loading}
                  error={error}
                />

                <PantryList
                  items={items}
                  onDelete={handleDeleteItem}
                  networkError={networkError}
                  categories={categories}
                />
              </>
            )}

            {/* Recipes Tab */}
            {currentTab === 'recipes' && (
              <RecipeSearch householdId={householdId} pantryItems={items} />
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      {!householdLoading && (
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      )}
    </div>
  );
}
