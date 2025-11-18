export interface Note {
  id: number;
  title: string;
  description?: string;            // URL or local path
}

export interface ViewNoteTopCardProps {
  contact: Note;
}