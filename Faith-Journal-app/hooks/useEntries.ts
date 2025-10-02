
import { useState, useEffect, useCallback } from 'react';
import { type Entry } from '../types.ts';
import * as db from '../services/db.ts';

export const useEntries = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const allEntries = await db.getEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(async (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await db.addEntry(entry);
      await fetchEntries(); // Refetch to update list
    } catch (error) {
      console.error("Failed to add entry:", error);
    }
  }, [fetchEntries]);

  const updateEntry = useCallback(async (entry: Omit<Entry, 'updatedAt'>) => {
    try {
      await db.updateEntry(entry);
      await fetchEntries(); // Refetch to update list
    } catch (error) {
      console.error("Failed to update entry:", error);
    }
  }, [fetchEntries]);

  const deleteEntry = useCallback(async (id: number) => {
    try {
      await db.deleteEntry(id);
      await fetchEntries(); // Refetch to update list
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  }, [fetchEntries]);
  
  const clearAllEntries = useCallback(async () => {
    try {
      await db.clearAllEntries();
      await fetchEntries();
    } catch (error) {
      console.error("Failed to clear entries:", error);
    }
  }, [fetchEntries]);
