import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSavedRecipes(householdId) {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch saved recipes on mount or when householdId changes
  useEffect(() => {
    if (!householdId) return;

    const fetchSavedRecipes = async () => {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('household_id', householdId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSavedRecipes(data || []);
      } catch (err) {
        console.error('Failed to fetch saved recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`recipes-${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recipes',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSavedRecipes((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setSavedRecipes((prev) =>
              prev.filter((recipe) => recipe.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [householdId]);

  const saveRecipe = useCallback(
    async (externalRecipeId, name, imageUrl, ingredients, sourceUrl) => {
      if (!householdId) return;

      try {
        const { data, error } = await supabase
          .from('recipes')
          .insert([
            {
              household_id: householdId,
              external_recipe_id: externalRecipeId,
              name,
              image_url: imageUrl,
              ingredients,
              source_url: sourceUrl,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Failed to save recipe:', err);
        throw err;
      }
    },
    [householdId]
  );

  const deleteRecipe = useCallback(
    async (recipeId) => {
      try {
        const { error } = await supabase
          .from('recipes')
          .delete()
          .eq('id', recipeId);

        if (error) throw error;
      } catch (err) {
        console.error('Failed to delete recipe:', err);
        throw err;
      }
    },
    []
  );

  const isRecipeSaved = useCallback(
    (externalRecipeId) => {
      return savedRecipes.some(
        (recipe) => recipe.external_recipe_id === externalRecipeId
      );
    },
    [savedRecipes]
  );

  return {
    savedRecipes,
    loading,
    saveRecipe,
    deleteRecipe,
    isRecipeSaved,
  };
}
