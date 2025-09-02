import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AppSettings {
  // General settings
  pageSize: number;
  defaultSortBy: string;
  defaultSortOrder: 'asc' | 'desc';
  
  // Security
  deleteConfirmation: boolean;
  
  // Appearance
  darkMode: boolean;
  compactView: boolean;
}

const defaultSettings: AppSettings = {
  pageSize: 10,
  defaultSortBy: 'firstName',
  defaultSortOrder: 'asc',
  deleteConfirmation: true,
  darkMode: false,
  compactView: false,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      // Save to localStorage
      try {
        localStorage.setItem('appSettings', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error);
      }
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem('appSettings');
    } catch (error) {
      console.error('Failed to remove settings from localStorage:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}