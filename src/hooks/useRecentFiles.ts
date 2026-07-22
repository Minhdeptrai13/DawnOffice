import { useState, useEffect, useCallback } from 'react';

const RECENT_FILES_KEY = 'dawn_recent_files';
const MAX_RECENT_FILES = 10;

export interface RecentFile {
  path: string;
  name: string;
  lastOpened: number;
}

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_FILES_KEY);
      if (stored) {
        setRecentFiles(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse recent files', e);
    }
  }, []);

  const addRecentFile = useCallback((filePath: string) => {
    setRecentFiles((prev) => {
      const name = filePath.split('\\').pop()?.split('/').pop() || 'Untitled';
      const newFile: RecentFile = { path: filePath, name, lastOpened: Date.now() };
      
      // Remove existing entry if it exists to avoid duplicates
      const filtered = prev.filter(f => f.path !== filePath);
      const updated = [newFile, ...filtered].slice(0, MAX_RECENT_FILES);
      
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeRecentFile = useCallback((filePath: string) => {
    setRecentFiles((prev) => {
      const updated = prev.filter(f => f.path !== filePath);
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentFiles = useCallback(() => {
    setRecentFiles([]);
    localStorage.removeItem(RECENT_FILES_KEY);
  }, []);

  return { recentFiles, addRecentFile, removeRecentFile, clearRecentFiles };
}
