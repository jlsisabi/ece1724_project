import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { formatDistanceToNow } from 'date-fns';
import { Star, Plus, X, Edit2, Check } from 'lucide-react';
import DeleteConfirmDialog from './DeleteConfirmDialog';

export default function Tags() {
  const { tags, notes, createTag, updateTag, deleteTag, setCurrentNote } = useStore();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    await createTag({
      name: newTagName.trim(),
      color: newTagColor
    });

    setNewTagName('');
    setNewTagColor('#3B82F6');
  };

  const handleUpdateTag = async (id: string) => {
    await updateTag(id, {
      name: editName.trim(),
      color: editColor
    });
    setEditingTag(null);
  };

  const startEditing = (tag: { id: string; name: string; color: string }) => {
    setEditingTag(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleDeleteTag = async () => {
    if (tagToDelete) {
      await deleteTag(tagToDelete);
      setTagToDelete(null);
    }
  };

  const getNotesForTag = (tagId: string) => {
    return notes.filter(note => note.tags?.some(tag => tag.id === tagId));
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tags</h2>
        
        {/* Create new tag form */}
        <form onSubmit={handleCreateTag} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name"
            className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
          />
          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="w-12 h-10 rounded-md cursor-pointer"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Add Tag
          </button>
        </form>

        {/* Tags list */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tags.map(tag => (
            <div key={tag.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              {editingTag === tag.id ? (
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <button
                    onClick={() => handleUpdateTag(tag.id)}
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => setEditingTag(null)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tag.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditing(tag)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setTagToDelete(tag.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Notes with this tag */}
              <div className="space-y-2">
                {getNotesForTag(tag.id).map(note => (
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={handleDeleteTag}
        title="Delete Tag"
        description="Are you sure you want to delete this tag? The tag will be removed from all notes that use it. This action cannot be undone."
      />
    </div>
  );
}