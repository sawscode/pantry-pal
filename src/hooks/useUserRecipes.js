import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useUserRecipes(householdId) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recipes on mount
  useEffect(() => {
    if (!householdId) return;

    const fetchRecipes = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('user_recipes')
          .select('*')
          .eq('household_id', householdId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setRecipes(data || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`recipes-${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_recipes',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRecipes((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRecipes((prev) =>
              prev.map((recipe) => (recipe.id === payload.new.id ? payload.new : recipe))
            );
          } else if (payload.eventType === 'DELETE') {
            setRecipes((prev) => prev.filter((recipe) => recipe.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [householdId]);

  const createRecipe = async (recipe) => {
    try {
      const { data, error: insertError } = await supabase
        .from('user_recipes')
        .insert([
          {
            household_id: householdId,
            name: recipe.name,
            ingredients: recipe.ingredients || [],
            instructions: recipe.instructions || '',
            prep_time_minutes: recipe.prepTime || null,
            cook_time_minutes: recipe.cookTime || null,
            servings: recipe.servings || 1,
            notes: recipe.notes || '',
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    } catch (err) {
      setError(err.message || 'Failed to create recipe');
      throw err;
    }
  };

  const updateRecipe = async (id, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('user_recipes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    } catch (err) {
      setError(err.message || 'Failed to update recipe');
      throw err;
    }
  };

  const deleteRecipe = async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('user_recipes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to delete recipe');
      throw err;
    }
  };

  return {
    recipes,
    loading,
    error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  };
}
