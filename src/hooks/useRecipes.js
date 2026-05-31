import { useState, useCallback } from 'react';
import axios from 'axios';

const SPOONACULAR_API_KEY = 'cb82eed8c48f4438a427ababb8aa0baf';
const API_BASE = 'https://api.spoonacular.com/recipes';

export function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchRecipes = useCallback(async (query, number = 12) => {
    if (!query.trim()) {
      setRecipes([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE}/complexSearch`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          query,
          number,
          addRecipeInformation: true,
          fillIngredients: true,
        },
      });

      setRecipes(response.data.results || []);
    } catch (err) {
      setError(err.message || 'Failed to search recipes');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecipeDetails = useCallback(async (recipeId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE}/${recipeId}/information`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          includeNutrition: false,
        },
      });

      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch recipe details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recipes,
    loading,
    error,
    searchRecipes,
    getRecipeDetails,
  };
}
