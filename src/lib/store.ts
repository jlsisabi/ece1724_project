import { create } from 'zustand';
import { supabase } from './supabase';
import type { Note, Folder, Tag, File } from '../types';

interface NoteStore {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  files: File[];
  currentNote: Note | null;
  recentNotes: Note[];
  isLoading: boolean;
  error: string | null;
  
  // Notes
  fetchNotes: () => Promise<void>;
  createNote: (note: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, note: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
  
  // Folders
  fetchFolders: () => Promise<void>;
  createFolder: (folder: Partial<Folder>) => Promise<Folder>;
  updateFolder: (id: string, folder: Partial<Folder>) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
  getDefaultFolder: () => Folder | null;
  
  // Tags
  fetchTags: () => Promise<void>;
  createTag: (tag: Partial<Tag>) => Promise<Tag>;
  updateTag: (id: string, tag: Partial<Tag>) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  addTagToNote: (noteId: string, tagId: string) => Promise<void>;
  removeTagFromNote: (noteId: string, tagId: string) => Promise<void>;
  
  // Files
  uploadFile: (noteId: string, file: File) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
}

const MAX_RECENT_NOTES = 10;

export const useStore = create<NoteStore>((set, get) => ({
  notes: [],
  folders: [],
  tags: [],
  files: [],
  currentNote: null,
  recentNotes: [],
  isLoading: false,
  error: null,

  getDefaultFolder: () => {
    const folders = get().folders;
    return folders[0] || null;
  },

  fetchNotes: async () => {
    try {
      set({ isLoading: true });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          tags (
            id,
            name,
            color
          ),
          files (
            id,
            filename,
            file_type,
            file_size,
            storage_path,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      set({ notes: data || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createNote: async (note) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Check if folders exist
      const folders = get().folders;
      if (folders.length === 0) {
        throw new Error('Please create a folder first');
      }

      // Check for duplicate title in the same folder
      const existingNotes = get().notes.filter(n => 
        n.folder_id === note.folder_id && 
        n.title.toLowerCase() === note.title?.toLowerCase()
      );
      if (existingNotes.length > 0) {
        throw new Error('A note with this title already exists in this folder');
      }

      const newNote = {
        ...note,
        user_id: user.id,
        folder_id: note.folder_id || folders[0].id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select(`
          *,
          tags (
            id,
            name,
            color
          ),
          files (
            id,
            filename,
            file_type,
            file_size,
            storage_path,
            created_at
          )
        `)
        .single();

      if (error) throw error;
      set(state => ({ 
        notes: [data, ...state.notes],
        recentNotes: [data, ...state.recentNotes].slice(0, MAX_RECENT_NOTES)
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateNote: async (id, note) => {
    try {
      // Check for duplicate title in the same folder
      if (note.title) {
        const existingNotes = get().notes.filter(n => 
          n.id !== id && 
          n.folder_id === note.folder_id && 
          n.title.toLowerCase() === note.title.toLowerCase()
        );
        if (existingNotes.length > 0) {
          throw new Error('A note with this title already exists in this folder');
        }
      }

      const { data, error } = await supabase
        .from('notes')
        .update({ ...note, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          tags (
            id,
            name,
            color
          ),
          files (
            id,
            filename,
            file_type,
            file_size,
            storage_path,
            created_at
          )
        `)
        .single();

      if (error) throw error;
      set(state => {
        const updatedNotes = state.notes.map(n => n.id === id ? data : n);
        const updatedRecentNotes = [
          data,
          ...state.recentNotes.filter(n => n.id !== id)
        ].slice(0, MAX_RECENT_NOTES);

        return {
          notes: updatedNotes,
          recentNotes: updatedRecentNotes,
          currentNote: state.currentNote?.id === id ? data : state.currentNote
        };
      });
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteNote: async (id) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        notes: state.notes.filter(n => n.id !== id),
        recentNotes: state.recentNotes.filter(n => n.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  setCurrentNote: (note) => {
    if (note) {
      set(state => ({
        currentNote: note,
        recentNotes: [
          note,
          ...state.recentNotes.filter(n => n.id !== note.id)
        ].slice(0, MAX_RECENT_NOTES)
      }));
    } else {
      set({ currentNote: null });
    }
  },

  fetchFolders: async () => {
    try {
      set({ isLoading: true });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      set({ folders: data || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createFolder: async (folder) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Check for duplicate folder name
      const existingFolder = get().folders.find(
        f => f.name.toLowerCase() === folder.name?.toLowerCase()
      );
      if (existingFolder) {
        throw new Error('A folder with this name already exists');
      }

      const newFolder = {
        ...folder,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('folders')
        .insert([newFolder])
        .select()
        .single();

      if (error) throw error;
      set(state => ({ folders: [...state.folders, data] }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateFolder: async (id, folder) => {
    try {
      // Check for duplicate folder name
      if (folder.name) {
        const existingFolder = get().folders.find(
          f => f.id !== id && f.name.toLowerCase() === folder.name.toLowerCase()
        );
        if (existingFolder) {
          throw new Error('A folder with this name already exists');
        }
      }

      const { data, error } = await supabase
        .from('folders')
        .update({ ...folder, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        folders: state.folders.map(f => f.id === id ? data : f)
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteFolder: async (id) => {
    try {
      // First, delete all notes in the folder
      const notesInFolder = get().notes.filter(note => note.folder_id === id);
      for (const note of notesInFolder) {
        await supabase
          .from('notes')
          .delete()
          .eq('id', note.id);
      }

      // Then delete the folder
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        folders: state.folders.filter(f => f.id !== id),
        notes: state.notes.filter(n => n.folder_id !== id),
        recentNotes: state.recentNotes.filter(n => n.folder_id !== id),
        currentNote: state.currentNote?.folder_id === id ? null : state.currentNote
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  fetchTags: async () => {
    try {
      set({ isLoading: true });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      set({ tags: data || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createTag: async (tag) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Check for duplicate tag name
      const existingTag = get().tags.find(
        t => t.name.toLowerCase() === tag.name?.toLowerCase()
      );
      if (existingTag) {
        throw new Error('A tag with this name already exists');
      }

      const newTag = {
        ...tag,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tags')
        .insert([newTag])
        .select()
        .single();

      if (error) throw error;
      set(state => ({ tags: [...state.tags, data] }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateTag: async (id, tag) => {
    try {
      // Check for duplicate tag name
      if (tag.name) {
        const existingTag = get().tags.find(
          t => t.id !== id && t.name.toLowerCase() === tag.name.toLowerCase()
        );
        if (existingTag) {
          throw new Error('A tag with this name already exists');
        }
      }

      const { data, error } = await supabase
        .from('tags')
        .update({ ...tag, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update the tag in all notes that use it
      const updatedNotes = get().notes.map(note => {
        if (note.tags?.some(t => t.id === id)) {
          return {
            ...note,
            tags: note.tags.map(t => t.id === id ? data : t)
          };
        }
        return note;
      });

      // Update the tag in recent notes
      const updatedRecentNotes = get().recentNotes.map(note => {
        if (note.tags?.some(t => t.id === id)) {
          return {
            ...note,
            tags: note.tags.map(t => t.id === id ? data : t)
          };
        }
        return note;
      });

      // Update the tag in current note if it exists
      const currentNote = get().currentNote;
      const updatedCurrentNote = currentNote && currentNote.tags?.some(t => t.id === id)
        ? {
            ...currentNote,
            tags: currentNote.tags.map(t => t.id === id ? data : t)
          }
        : currentNote;

      set(state => ({
        tags: state.tags.map(t => t.id === id ? data : t),
        notes: updatedNotes,
        recentNotes: updatedRecentNotes,
        currentNote: updatedCurrentNote
      }));

      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteTag: async (id) => {
    try {
      // First, delete all note-tag relationships
      const { error: relationshipError } = await supabase
        .from('note_tags')
        .delete()
        .eq('tag_id', id);

      if (relationshipError) throw relationshipError;

      // Then delete the tag
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set(state => {
        const updatedNotes = state.notes.map(note => ({
          ...note,
          tags: note.tags?.filter(tag => tag.id !== id)
        }));

        return {
          tags: state.tags.filter(t => t.id !== id),
          notes: updatedNotes,
          currentNote: state.currentNote
            ? {
                ...state.currentNote,
                tags: state.currentNote.tags?.filter(tag => tag.id !== id)
              }
            : null,
          recentNotes: state.recentNotes.map(note => ({
            ...note,
            tags: note.tags?.filter(tag => tag.id !== id)
          }))
        };
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  addTagToNote: async (noteId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('note_tags')
        .insert([{ note_id: noteId, tag_id: tagId }]);

      if (error) throw error;

      // Fetch the updated note
      const { data: notes, error: noteError } = await supabase
        .from('notes')
        .select(`
          *,
          tags (
            id,
            name,
            color
          ),
          files (
            id,
            filename,
            file_type,
            file_size,
            storage_path,
            created_at
          )
        `)
        .eq('id', noteId);

      if (noteError) throw noteError;
      if (!notes || notes.length === 0) throw new Error('Note not found');

      const updatedNote = notes[0];
      set(state => ({
        notes: state.notes.map(n => n.id === noteId ? updatedNote : n),
        currentNote: state.currentNote?.id === noteId ? updatedNote : state.currentNote,
        recentNotes: state.recentNotes.map(n => n.id === noteId ? updatedNote : n)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  removeTagFromNote: async (noteId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('note_tags')
        .delete()
        .match({ note_id: noteId, tag_id: tagId });

      if (error) throw error;

      // Fetch the updated note
      const { data: notes, error: noteError } = await supabase
        .from('notes')
        .select(`
          *,
          tags (
            id,
            name,
            color
          ),
          files (
            id,
            filename,
            file_type,
            file_size,
            storage_path,
            created_at
          )
        `)
        .eq('id', noteId);

      if (noteError) throw noteError;
      if (!notes || notes.length === 0) throw new Error('Note not found');

      const updatedNote = notes[0];
      set(state => ({
        notes: state.notes.map(n => n.id === noteId ? updatedNote : n),
        currentNote: state.currentNote?.id === noteId ? updatedNote : state.currentNote,
        recentNotes: state.recentNotes.map(n => n.id === noteId ? updatedNote : n)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  uploadFile: async (noteId: string, file: File) => {
    try {
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(`${noteId}/${file.name}`, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('files')
        .insert([{
          note_id: noteId,
          filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: `${noteId}/${file.name}`
        }]);

      if (dbError) throw dbError;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteFile: async (id: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        files: state.files.filter(f => f.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  }
}));