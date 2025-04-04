export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_folder_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  content: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  files?: File[];
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface NoteTag {
  note_id: string;
  tag_id: string;
}

export interface File {
  id: string;
  note_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

export interface SearchResult {
  item: Note;
  score?: number;
}