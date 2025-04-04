import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { formatDistanceToNow } from 'date-fns';
import { Star, Search, Folder, Tag, PlusCircle, AlertTriangle, Trash2 } from 'lucide-react';
import Fuse from 'fuse.js';
import DeleteConfirmDialog from './DeleteConfirmDialog';

export default function NoteList() {
  const { notes, setCurrentNote, currentNote, updateNote, folders, tags, createNote, getDefaultFolder, deleteNote } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFolderWarning, setShowFolderWarning] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Show warning if no folders exist
    setShowFolderWarning(folders.length === 0);
  }, [folders]);

  // Initialize Fuse.js for searching
  const fuse = new Fuse(notes, {
    keys: ['title', 'content'],
    includeScore: true,
    threshold: 0.4,
  });

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote({
        title: 'Untitled Note',
        content: '',
        folder_id: selectedFolder,
        is_favorite: false
      });
      setCurrentNote(newNote);
    } catch (error) {
      if (error instanceof Error && error.message === 'Please create a folder first') {
        setShowFolderWarning(true);
      }
    }
  };

  const toggleFavorite = async (noteId: string, isFavorite: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateNote(noteId, { is_favorite: !isFavorite });
  };

  const handleDeleteNote = async () => {
    if (noteToDelete) {
      await deleteNote(noteToDelete);
      setNoteToDelete(null);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Filter and search notes
  const filteredNotes = React.useMemo(() => {
    let filtered = notes;

    // Filter by folder
    if (selectedFolder) {
      filtered = filtered.filter(note => note.folder_id === selectedFolder);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => 
        selectedTags.every(tagId => 
          note.tags?.some(noteTag => noteTag.id === tagId)
        )
      );
    }

    // Search
    if (searchQuery) {
      const searchResults = fuse.search(searchQuery);
      filtered = searchResults.map(result => result.item);
    }

    return filtered;
  }, [notes, selectedFolder, selectedTags, searchQuery]);

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Search and filters */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 mr-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <button
            onClick={handleCreateNote}
            disabled={showFolderWarning}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle size={18} className="mr-1" />
            New Note
          </button>
        </div>

        {showFolderWarning && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
            <div className="flex items-center text-yellow-800 dark:text-yellow-200">
              <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
              <p className="text-sm">Please create a folder first before creating notes.</p>
            </div>
          </div>
        )}

        {/* Folder filter */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Folder size={16} className="mr-2 text-gray-500" />
            <span className="text-sm font-medium">Folders</span>
          </div>
          <select
            value={selectedFolder || ''}
            onChange={(e) => setSelectedFolder(e.target.value || null)}
            className="w-full p-2 rounded border dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
          >
            <option value="">All Folders</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>
        </div>

        {/* Tag filter */}
        <div>
          <div className="flex items-center mb-2">
            <Tag size={16} className="mr-2 text-gray-500" />
            <span className="text-sm font-medium">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                style={{ backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Note list */}
      <div className="overflow-auto h-[calc(100%-16rem)]">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
              currentNote?.id === note.id ? 'bg-gray-50 dark:bg-gray-700' : ''
            }`}
            onClick={() => setCurrentNote(note)}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{note.title || 'Untitled'}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNoteToDelete(note.id);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={(e) => toggleFavorite(note.id, note.is_favorite, e)}
                  className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${
                    note.is_favorite ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                >
                  <Star size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
              {note.content || 'No content'}
            </p>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
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
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
            </p>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDeleteNote}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
      />
    </div>
  );
}