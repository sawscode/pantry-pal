import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabaseClient';
import { usePantryItems } from './hooks/usePantryItems';
import { useUserRecipes } from './hooks/useUserRecipes';
import { LoginForm } from './components/LoginForm';
import { AddItemForm } from './components/AddItemForm';
import { PantryList } from './components/PantryList';
import { RecipeForm } from './components/RecipeForm';
import { RecipesList } from './components/RecipesList';
import { RecipeDetail } from './components/RecipeDetail';
import { Dashboard } from './components/Dashboard';
import { QuickAddVoice } from './components/QuickAddVoice';
import { ReceiptPhotoUpload } from './components/ReceiptPhotoUpload';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [user, setUser] = useState(null);
  const [householdId, setHouseholdId] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [householdLoading, setHouseholdLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('inventory');

  const { items, loading, error, networkError, addItem, deleteItem, updateItem, units, categories, locations } =
    usePantryItems(householdId);

  const { recipes, createRecipe, updateRecipe, deleteRecipe } = useUserRecipes(householdId);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isListening, setIsListening] = useState(false);

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

  const handleAddItem = async (name, quantity, unit, category, location, expirationDate) => {
    try {
      await addItem(name, quantity, unit, category, location, expirationDate);
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

  const handleSaveRecipe = async (recipeData) => {
    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, {
          name: recipeData.name,
          ingredients: recipeData.ingredients,
          instructions: recipeData.instructions,
          prep_time_minutes: recipeData.prepTime,
          cook_time_minutes: recipeData.cookTime,
          servings: recipeData.servings,
          notes: recipeData.notes,
        });
      } else {
        await createRecipe(recipeData);
      }
      setShowRecipeForm(false);
      setEditingRecipe(null);
    } catch (err) {
      toast.error('Failed to save recipe');
    }
  };

  const handleDeleteRecipe = async (id) => {
    try {
      await deleteRecipe(id);
    } catch (err) {
      toast.error('Failed to delete recipe');
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
            {/* Inventory Tab */}
            {currentTab === 'inventory' && (
              <>
                <QuickAddVoice
                  onAdd={handleAddItem}
                  isListening={isListening}
                  setIsListening={setIsListening}
                />
                <ReceiptPhotoUpload
                  onItemsExtracted={(items) => {
                    items.forEach((item) => {
                      handleAddItem(item.name, item.quantity, item.unit, 'Other', item.location, null);
                    });
                  }}
                />
                <AddItemForm
                  onAdd={handleAddItem}
                  units={units}
                  categories={categories}
                  locations={locations}
                  loading={loading}
                  error={error}
                />
                <PantryList
                  items={items}
                  onDelete={handleDeleteItem}
                  onUpdate={updateItem}
                  networkError={networkError}
                  categories={categories}
                  locations={locations}
                />
              </>
            )}

            {/* Recipes Tab */}
            {currentTab === 'recipes' && (
              <>
                {selectedRecipe ? (
                  <RecipeDetail
                    recipe={selectedRecipe}
                    onBack={() => setSelectedRecipe(null)}
                    pantryItems={items}
                  />
                ) : showRecipeForm ? (
                  <RecipeForm
                    initialRecipe={editingRecipe}
                    onSave={handleSaveRecipe}
                    onCancel={() => {
                      setShowRecipeForm(false);
                      setEditingRecipe(null);
                    }}
                  />
                ) : (
                  <>
                    <div className="mb-6">
                      <button
                        onClick={() => {
                          setShowRecipeForm(true);
                          setEditingRecipe(null);
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors"
                      >
                        + Create Recipe
                      </button>
                    </div>
                    <RecipesList
                      recipes={recipes}
                      onEdit={(recipe) => {
                        setEditingRecipe(recipe);
                        setShowRecipeForm(true);
                      }}
                      onDelete={handleDeleteRecipe}
                      onViewDetails={setSelectedRecipe}
                    />
                  </>
                )}
              </>
            )}

            {/* Meal Plan Tab */}
            {currentTab === 'mealplan' && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  📅 Meal Planning Coming Soon
                </p>
              </div>
            )}

            {/* Shopping Tab */}
            {currentTab === 'shopping' && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  🛒 Shopping Lists Coming Soon
                </p>
              </div>
            )}

            {/* Dashboard Tab */}
            {currentTab === 'dashboard' && (
              <Dashboard items={items} recipes={recipes} />
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
