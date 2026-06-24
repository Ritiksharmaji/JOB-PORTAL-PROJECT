import React, { createContext, useState, useCallback } from 'react';

export const AppContext = createContext({
  role: 'applicant',
  setRole: () => {},
  savedJobs: [],
  toggleSave: () => {},
  historyTab: 'applied',
  setHistoryTab: () => {},
});

export function AppProvider({ children }) {
  const [role, setRole] = useState('applicant');
  const [savedJobs, setSavedJobs] = useState([1, 5]);
  const [historyTab, setHistoryTab] = useState('applied');

  const toggleSave = useCallback((id) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  return (
    <AppContext.Provider
      value={{ role, setRole, savedJobs, toggleSave, historyTab, setHistoryTab }}
    >
      {children}
    </AppContext.Provider>
  );
}
