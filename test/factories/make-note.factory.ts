import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Note, StatusEnum } from '@/modules/notes/entities/note.entity';

export function makeNote(override: Partial<Note> = {}, id?: UniqueEntityId) {
  const note = Note.create(
    {
      title: 'Note title',
      content: 'Note content',
      status: StatusEnum.ACTIVE,
      tags: ['tag1', 'tag2'],
      userId: new UniqueEntityId('user-1'),
      ...override,
    },
    id,
  );

  return note;
}
