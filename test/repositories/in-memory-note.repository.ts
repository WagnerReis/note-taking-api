import { Note } from '@/modules/notes/entities/note.entity';
import { QueryProps } from '@/modules/notes/repositories/note.repository';
import { NoteRepositoryInterface } from '@/modules/notes/repositories/note.repository.interface';

export class InMemoryNotesRepository
  implements NoteRepositoryInterface<QueryProps>
{
  public notes: Note[] = [];

  async create(note: Note): Promise<void> {
    await Promise.resolve(this.notes.push(note));
  }

  async findById(id: string): Promise<Note | null> {
    const note = this.notes.find((item) => item.id.toString() === id);
    if (!note) {
      return Promise.resolve(null);
    }
    return Promise.resolve(note);
  }

  async update(note: Note): Promise<void> {
    const noteIndex = this.notes.findIndex((item) => item.id === note.id);
    this.notes[noteIndex] = note;
    await Promise.resolve();
  }

  delete(id: string): Promise<void> {
    const noteIndex = this.notes.findIndex((item) => item.id.toString() === id);
    this.notes.splice(noteIndex, 1);
    return Promise.resolve();
  }

  async findAll(): Promise<Note[]> {
    return Promise.resolve(this.notes);
  }

  async find(query: QueryProps): Promise<Note[]> {
    const notesFound = this.notes.filter(
      (note) => note.status === query.status,
    );

    return Promise.resolve(notesFound);
  }
}
