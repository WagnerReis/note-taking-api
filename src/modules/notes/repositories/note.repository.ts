import { NoteDocument } from '@/modules/notes/models/note.model';
import { Note } from '../entities/note.entity';
import { MongoNoteMapper } from '../mappers/mongo-note-mapper';
import { NoteRepositoryInterface } from './note.repository.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export class NoteRepository implements NoteRepositoryInterface {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
  ) { }

  async create(data: Note): Promise<void> {
    const note = MongoNoteMapper.toPersistence(data);

    await this.noteModel.create(note);
  }

  async findById(id: string): Promise<Note | null> {
    const note = await this.noteModel.findById({ id });
    if (!note) {
      return null;
    }

    return MongoNoteMapper.toDomain(note);
  }

  async update(entity: Note): Promise<void> {
    await this.noteModel.findByIdAndUpdate(entity.id, {
      $set: MongoNoteMapper.toPersistence(entity),
    });
  }

  async delete(id: string): Promise<void> {
    await this.noteModel.findByIdAndDelete(id);
  }

  async findAll(): Promise<Note[]> {
    const notes = await this.noteModel.find();
    return notes.map((note) => MongoNoteMapper.toDomain(note));
  }
}
