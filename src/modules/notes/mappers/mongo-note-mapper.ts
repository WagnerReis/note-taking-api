import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Note as NoteModel } from '../models/note.model';
import { Note, StatusEnum } from '../entities/note.entity';

export class MongoNoteMapper {
  static toDomain(raw: NoteModel): Note {
    return Note.create(
      {
        title: raw.title,
        content: raw.content,
        status: StatusEnum[raw.status as keyof typeof StatusEnum],
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(),
    );
  }
  static toPersistence(entity: Note): NoteModel {
    return {
      title: entity.title,
      content: entity.content,
      status: String(entity.status),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
