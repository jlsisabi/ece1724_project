import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { formatDistanceToNow } from 'date-fns';
import { Star, Plus, X, Edit2, Check, FolderOpen } from 'lucide-react';
import NoteEditor from './NoteEditor';
import DeleteConfirmDialog from './DeleteConfirmDialog';

export default function Folders() {
  const { folders, notes, createFolder, updateFolder, deleteFolder, setCurrentNote, currentNote } = useStore();
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await createFolder({
        name: newFolderName.trim()
      });
      setNewFolderName('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdateFolder = async (id: string) => {
    try {
      await updateFolder(id, {
        name: editName.trim()
      });
      setEditingFolder(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const startEditing = (folder: { id: string; name: string }) => {
    setEditingFolder(folder.id);
    setEditName(folder.name);
    setError(null);
  };

  const handleDeleteFolder = async () => {
    if (folderToDelete) {
      try {
        await deleteFolder(folderToDelete);
        setFolderToDelete(null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  };

  const getNotesInFolder = (folderId: string) => {
    return notes.filter(note => note.folder_id === folderId);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Folders section */}
        <div className="col-span-12 lg:col-span-5">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Folders</h2>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Create new folder form */}
          <form onSubmit={handleCreateFolder} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Add Folder
            </button>
          </form>

          {/* Folders list */}
          <div className="space-y-4">
            {folders.map(folder => (
              <div key={folder.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                {editingFolder === folder.id ? (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button
                      onClick={() => handleUpdateFolder(folder.id)}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingFolder(null);
                        setError(null);
                      }}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FolderOpen size={20} className="text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {folder.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditing(folder)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setFolderToDelete(folder.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Notes in this folder */}
                <div className="space-y-2">
                  {getNotesInFolder(folder.id).map(note => (
                    <div
                      key={note.id}
                      className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setCurrentNote(note)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {note.title || 'Untitled'}
                        </span>
                        {note.is_favorite && (
                          <Star size={14} className="text-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note Editor section */}
        <div className="col-span-12 lg:col-span-7">
          <NoteEditor />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onConfirm={handleDeleteFolder}
        title="Delete Folder"
        description="Are you sure you want to delete this folder? All notes in this folder will also be deleted. This action cannot be undone."
      />
    </div>
  );
}