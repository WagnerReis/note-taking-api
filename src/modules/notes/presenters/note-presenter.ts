import { Note } from '../entities/note.entity';

interface NoteResponse {
  id: string;
  title: string;
  content: string;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export class NotePresenter {
  static toResponse(note: Note): NoteResponse {
    return {
      id: note.id.toString(),
      title: note.title,
      content: note.content,
      tags: note.tags,
      status: note.status,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  static toResponseList(notes: Note[]): NoteResponse[] {
    return notes.map((note) => NotePresenter.toResponse(note));
  }
}
