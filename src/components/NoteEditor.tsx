import React, { useEffect, useCallback, useState } from 'react';
import { useStore } from '../lib/store';
import MDEditor from '@uiw/react-md-editor';
import { Upload, Star, Save, Tag, Plus, X, AlertCircle, FolderOpen } from 'lucide-react';

export default function NoteEditor() {
  const { currentNote, updateNote, uploadFile, tags, addTagToNote, removeTagFromNote, createNote, folders } = useStore();
  const [content, setContent] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [files, setFiles] = React.useState<File[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentNote) {
      setContent(currentNote.content);
      setTitle(currentNote.title);
      setError(null);
    } else {
      // Reset form for new note
      setContent('');
      setTitle('');
      // Only set default folder if none is selected
      if (!selectedFolderId && folders.length > 0) {
        setSelectedFolderId(folders[0].id);
      }
    }
  }, [currentNote, folders, selectedFolderId]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title for the note');
      return;
    }

    if (!currentNote && !selectedFolderId) {
      setError('Please select a folder for the note');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (currentNote) {
        await updateNote(currentNote.id, {
          title: title.trim(),
          content,
          updated_at: new Date().toISOString()
        });

        // Upload any pending files
        for (const file of files) {
          await uploadFile(currentNote.id, file);
        }
        setFiles([]);
      } else {
        // Create new note in selected folder
        await createNote({
          title: title.trim(),
          content,
          folder_id: selectedFolderId,
          is_favorite: false
        });
        
        // Reset form after successful save
        setTitle('');
        setContent('');
        setSelectedFolderId(folders[0]?.id || '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFiles(Array.from(files));
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles) {
      setFiles(Array.from(droppedFiles));
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleAddTag = async (tagId: string) => {
    if (currentNote) {
      try {
        await addTagToNote(currentNote.id, tagId);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add tag');
      }
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (currentNote) {
      try {
        await removeTagFromNote(currentNote.id, tagId);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove tag');
      }
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setError(null);
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFolderId(e.target.value);
    setError(null);
  };

  if (!currentNote && folders.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Please create a folder first to start creating notes
      </div>
    );
  }

  const unusedTags = tags.filter(
    tag => !currentNote?.tags?.some(noteTag => noteTag.id === tag.id)
  );

  return (
    <div 
      className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900/30">
          <div className="flex items-center text-red-600 dark:text-red-400">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center flex-1 space-x-4">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="text-xl font-semibold bg-transparent border-none focus:outline-none flex-1"
            placeholder="Note title"
          />
          {currentNote && (
            <button
              onClick={() => updateNote(currentNote.id, { is_favorite: !currentNote.is_favorite })}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentNote.is_favorite ? 'text-yellow-500' : 'text-gray-400'
              }`}
            >
              <Star size={20} />
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <Upload size={20} className="text-gray-600 dark:text-gray-300" />
            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileUpload}
              accept="image/*,.pdf"
            />
          </label>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center space-x-2 px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Folder Selection for New Notes */}
      {!currentNote && folders.length > 0 && (
        <div className="px-4 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Folder</span>
          </div>
          <select
            value={selectedFolderId}
            onChange={handleFolderChange}
            className="w-full p-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select a folder...</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tags Section */}
      {currentNote && (
        <div className="px-4 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</span>
            </div>
            <button
              onClick={() => setShowTagSelector(!showTagSelector)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentNote.tags?.map(tag => (
              <div
                key={tag.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-sm"
                style={{ backgroundColor: tag.color }}
              >
                <span className="text-white">{tag.name}</span>
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="text-white/80 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Tag Selector Dropdown */}
          {showTagSelector && unusedTags.length > 0 && (
            <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700">
              <div className="space-y-1">
                {unusedTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      handleAddTag(tag.id);
                      setShowTagSelector(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {tag.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Upload Preview */}
      {files.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
          <h3 className="text-sm font-medium mb-2">Files to upload:</h3>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded"
              >
                <span className="text-sm">{file.name}</span>
                <button
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <MDEditor
          value={content}
          onChange={(value) => setContent(value || '')}
          preview="edit"
          className="h-full border-none"
          height="100%"
        />
      </div>
    </div>
  );
}