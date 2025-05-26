import { useEffect, useState, useRef } from 'react';
import useDebounce from './useDebounce';

interface AutoSaveOptions {
  interval?: number;
  enabled?: boolean;
}

/**
 * Hook to automatically save form data to localStorage
 */
function useAutoSave<T>(
  data: T, 
  storageKey: string, 
  options: AutoSaveOptions = {}
) {
  const { interval = 1000, enabled = true } = options;
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRestored, setIsRestored] = useState(false);
  const [restoredData, setRestoredData] = useState<T | null>(null);
  const initialLoadDone = useRef(false);
  const lastDataRef = useRef<string>('');
  
  // Debounce data changes to avoid excessive saves
  const debouncedData = useDebounce(data, interval);
  
  // Load draft on initial mount - this should run ONCE only
  useEffect(() => {
    if (initialLoadDone.current) return;
    
    try {
      const savedData = localStorage.getItem(storageKey);
      console.log(`[AutoSave] Checking for saved draft at ${storageKey}:`, savedData ? "Found" : "Not found");
      
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const { timestamp, data: storedData } = parsed;
        const savedDate = new Date(timestamp);
        
        // If the saved draft is less than 24 hours old
        const isRecent = (Date.now() - savedDate.getTime()) < 24 * 60 * 60 * 1000;
        
        if (isRecent) {
          console.log(`[AutoSave] Restoring draft from ${savedDate.toLocaleString()}`);
          setHasSavedDraft(true);
          setLastSaved(savedDate);
          setIsRestored(true);
          setRestoredData(storedData as T);
          
          // Initialize the lastDataRef with the current data
          lastDataRef.current = JSON.stringify(storedData);
        } else {
          console.log(`[AutoSave] Draft found but too old (${savedDate.toLocaleString()}), ignoring`);
        }
      }
    } catch (err) {
      console.error('[AutoSave] Failed to restore draft:', err);
      clearDraft(); // Clear corrupted data
    }
    
    initialLoadDone.current = true;
  }, [storageKey]); // Only depend on storageKey
  
  // Save data when it changes - but only if enabled
  useEffect(() => {
    if (!enabled || !initialLoadDone.current) return;
    
    const currentData = JSON.stringify(debouncedData);
    
    // Only save if data has actually changed
    if (currentData !== lastDataRef.current) {
      try {
        const now = new Date();
        localStorage.setItem(storageKey, JSON.stringify({
          timestamp: now.toISOString(),
          data: debouncedData
        }));
        setLastSaved(now);
        setHasSavedDraft(true);
        
        // Update the reference to the last saved data
        lastDataRef.current = currentData;
        console.log(`[AutoSave] Draft saved at ${now.toLocaleString()}`);
      } catch (err) {
        console.error('[AutoSave] Failed to save draft:', err);
      }
    }
  }, [debouncedData, enabled, storageKey]);
  
  // Function to clear saved draft
  const clearDraft = () => {
    console.log(`[AutoSave] Clearing draft from ${storageKey}`);
    localStorage.removeItem(storageKey);
    setHasSavedDraft(false);
    setLastSaved(null);
    setIsRestored(false);
    setRestoredData(null);
    lastDataRef.current = '';
  };

  // Format the saved date in a user-friendly way
  const formatSavedDate = () => {
    if (!lastSaved) return '';
    
    // Get current time
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    
    // If saved less than a minute ago
    if (diff < 60000) {
      return 'just now';
    }
    
    // If saved less than an hour ago
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // If saved today
    if (now.toDateString() === lastSaved.toDateString()) {
      return `today at ${lastSaved.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    
    // If saved yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === lastSaved.toDateString()) {
      return `yesterday at ${lastSaved.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    
    // Otherwise show full date
    return lastSaved.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return {
    hasSavedDraft,
    lastSaved,
    lastSavedFormatted: formatSavedDate(),
    isRestored,
    clearDraft,
    restoredData,
  };
}

export default useAutoSave;