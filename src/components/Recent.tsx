import React from 'react';
import { useStore } from '../lib/store';
import { formatDistanceToNow } from 'date-fns';
import { Star } from 'lucide-react';
import NoteEditor from './NoteEditor';

export default function Recent() {
  const { recentNotes, setCurrentNote, currentNote, updateNote } = useStore();

  const toggleFavorite = async (noteId: string, isFavorite: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateNote(noteId, { is_favorite: !isFavorite });
  };

  if (recentNotes.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
          <p>No recent notes found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Recent notes list */}
        <div className="col-span-12 lg:col-span-5">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Recent Notes</h2>
          <div className="space-y-4">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  currentNote?.id === note.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setCurrentNote(note)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {note.title || 'Untitled'}
                  </h3>
                  <button
                    onClick={(e) => toggleFavorite(note.id, note.is_favorite, e)}
                    className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      note.is_favorite ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  >
                    <Star size={16} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {note.content || 'No content'}
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
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
        </div>

        {/* Note Editor section */}
        <div className="col-span-12 lg:col-span-7">
          <NoteEditor />
        </div>
      </div>
    </div>
  );
}