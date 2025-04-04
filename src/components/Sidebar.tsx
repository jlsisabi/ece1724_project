import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderOpen, 
  Tag, 
  Star, 
  Clock, 
  Settings,
  PenSquare,
  Home
} from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Logo area */}
      <div className="px-4 py-6">
        <Link to="/" className="flex items-center space-x-2">
          <PenSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">NoteFlow</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        <Link
          to="/"
          className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Home className="h-5 w-5 mr-3" />
          Home
        </Link>

        <Link
          to="/folders"
          className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <FolderOpen className="h-5 w-5 mr-3" />
          Folders
        </Link>

        <Link
          to="/tags"
          className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Tag className="h-5 w-5 mr-3" />
          Tags
        </Link>

        <Link
          to="/favorites"
          className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Star className="h-5 w-5 mr-3" />
          Favorites
        </Link>

        <Link
          to="/recent"
          className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Clock className="h-5 w-5 mr-3" />
          Recent
        </Link>
      </nav>

      {/* Settings */}
      <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/settings"
          className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </Link>
      </div>
    </div>
  );
}