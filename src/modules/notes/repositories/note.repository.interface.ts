import { BaseRepository } from '@/core/repositories/base.repository';
import { Note } from '../entities/note.entity';

// eslint-disable-next-line prettier/prettier
export abstract class NoteRepositoryInterface<T> extends BaseRepository<Note> { 
  abstract find(query: T): Promise<Note[]>;
}
