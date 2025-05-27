import { BaseRepository } from '@/core/repositories/base.repository';
import { Note } from '../entities/note.entity';

export abstract class NoteRepositoryInterface<T> extends BaseRepository<Note> {
  abstract find(query: T): Promise<Note[]>;
}
