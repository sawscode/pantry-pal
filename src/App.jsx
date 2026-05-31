import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { usePantryItems } from './hooks/usePantryItems';
import { LoginForm } from './components/LoginForm';
import { AddItemForm } from './components/AddItemForm';
import { PantryList } from './components/PantryList';

export default function App() {
  const [user, setUser] = useState(null);
  const [householdId, setHouseholdId] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [householdLoading, setHouseholdLoading] = useState(false);

  const { items, loading, error, networkError, addItem, deleteItem, units } =
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
            {/* Add Item Form */}
            <AddItemForm
              onAdd={addItem}
              units={units}
              loading={loading}
              error={error}
            />

            {/* Pantry List */}
            <PantryList
              items={items}
              onDelete={deleteItem}
              networkError={networkError}
            />
          </>
        )}
      </div>
    </div>
  );
}
