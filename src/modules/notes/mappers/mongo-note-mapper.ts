import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Note } from '../entities/note.entity';
import { NoteDocument, Note as NoteModel } from '../models/note.model';

export class MongoNoteMapper {
  static toDomain(raw: NoteDocument): Note {
    return Note.create(
      {
        title: raw.title,
        content: raw.content,
        status: raw.status,
        tags: raw.tags,
        userId: raw.userId,
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
      userId: entity.userId,
      archivedAt: entity.archivedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
