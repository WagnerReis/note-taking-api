import { BaseRepository } from '@/core/repositories/base.repository';
import { Note } from '../entities/note.entity';

// eslint-disable-next-line prettier/prettier
export abstract class NoteRepositoryInterface extends BaseRepository<Note> { }
