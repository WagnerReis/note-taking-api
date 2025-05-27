import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { NoteDocument, Note as NoteModel } from '../models/note.model';
import { Note } from '../entities/note.entity';

export class MongoNoteMapper {
  static toDomain(raw: NoteDocument): Note {
    return Note.create(
      {
        title: raw.title,
        content: raw.content,
        status: raw.status,
        tags: raw.tags,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }
  static toPersistence(entity: Note): NoteModel {
    return {
      title: entity.title,
      content: entity.content,
      status: entity.status,
      tags: entity.tags,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
