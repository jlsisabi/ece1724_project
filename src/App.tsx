import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NoteEditor from './components/NoteEditor';
import NoteList from './components/NoteList';
import Settings from './components/Settings';
import Recent from './components/Recent';
import Tags from './components/Tags';
import Folders from './components/Folders';
import Favorites from './components/Favorites';
import Auth from './components/Auth';
import { useStore } from './lib/store';
import { useThemeStore } from './lib/themeStore';
import { supabase } from './lib/supabase';

function App() {
  const { fetchNotes, fetchFolders, fetchTags } = useStore();
  const { isDarkMode } = useThemeStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        fetchNotes();
        fetchFolders();
        fetchTags();
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });
  }, [fetchNotes, fetchFolders, fetchTags]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <div className="grid grid-cols-12 gap-4 h-full">
                <div className="col-span-4">
                  <NoteList />
                </div>
                <div className="col-span-8">
                  <NoteEditor />
                </div>
              </div>
            }
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/folders" element={<Folders />} />
          <Route path="/favorites" element={<Favorites />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;