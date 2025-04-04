import React from 'react';
import { useStore } from '../lib/store';
import { formatDistanceToNow } from 'date-fns';
import { Star } from 'lucide-react';
import NoteEditor from './NoteEditor';

export default function Favorites() {
  const { notes, setCurrentNote, currentNote, updateNote } = useStore();
  
  // Filter only favorite notes
  const favoriteNotes = notes.filter(note => note.is_favorite);

  const toggleFavorite = async (noteId: string, isFavorite: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateNote(noteId, { is_favorite: !isFavorite });
  };

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Favorites list */}
        <div className="col-span-12 lg:col-span-5">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Favorite Notes</h2>
          
          {favoriteNotes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <Star className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No favorite notes yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Star your important notes to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteNotes.map(note => (
                <div
                  key={note.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                    currentNote?.id === note.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setCurrentNote(note)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {note.title || 'Untitled'}
                    </h3>
                    <button
                      onClick={(e) => toggleFavorite(note.id, note.is_favorite, e)}
                      className="p-1 text-yellow-500 hover:text-yellow-600"
                    >
                      <Star size={16} />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                    {note.content || 'No content'}
                  </p>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {note.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ backgroundColor: tag.color, color: '#fff' }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note Editor section */}
        <div className="col-span-12 lg:col-span-7">
          <NoteEditor />
        </div>
      </div>
    </div>
  );
}