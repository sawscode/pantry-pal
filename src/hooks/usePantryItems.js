import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const UNITS = ['cups', 'oz', 'count', 'lbs', 'tsp', 'tbsp', 'g', 'kg', 'ml', 'l'];
const CATEGORIES = ['Produce', 'Dairy', 'Pantry', 'Frozen', 'Meat', 'Condiments', 'Other'];
const LOCATIONS = ['Pantry', 'Fridge', 'Freezer'];

export function usePantryItems(householdId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(false);

  // Fetch initial items
  useEffect(() => {
    if (!householdId) return;

    const fetchItems = async () => {
      try {
        setNetworkError(false);
        const { data, error: fetchError } = await supabase
          .from('pantry_items')
          .select('*')
          .eq('household_id', householdId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setItems(data || []);
        setError(null);
      } catch (err) {
        setNetworkError(true);
        setError(err.message || 'Failed to load pantry items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`pantry-${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pantry_items',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((item) => (item.id === payload.new.id ? payload.new : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setNetworkError(false);
        } else if (status === 'CHANNEL_ERROR') {
          setNetworkError(true);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [householdId]);

  const addItem = async (name, quantity, unit, category = 'Other', location = 'Pantry', expirationDate = null) => {
    try {
      setNetworkError(false);

      // Create new item (no duplicate merging in V2)
      const { error: insertError } = await supabase
        .from('pantry_items')
        .insert([
          {
            household_id: householdId,
            name: name.trim(),
            quantity: parseFloat(quantity),
            unit,
            category,
            location,
            expiration_date: expirationDate,
          },
        ]);

      if (insertError) throw insertError;
      setError(null);
    } catch (err) {
      setNetworkError(true);
      setError(err.message || 'Failed to add item');
      throw err;
    }
  };

  const updateItem = async (id, updates) => {
    try {
      setNetworkError(false);
      const { error: updateError } = await supabase
        .from('pantry_items')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
      setError(null);
    } catch (err) {
      setNetworkError(true);
      setError(err.message || 'Failed to update item');
      throw err;
    }
  };

  const deleteItem = async (id) => {
    try {
      setNetworkError(false);
      const { error: deleteError } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setError(null);
    } catch (err) {
      setNetworkError(true);
      setError(err.message || 'Failed to delete item');
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    networkError,
    addItem,
    updateItem,
    deleteItem,
    units: UNITS,
    categories: CATEGORIES,
    locations: LOCATIONS,
  };
}
