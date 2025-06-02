import { InMemoryNotesRepository } from 'test/repositories/in-memory-note.repository';
import { Note, StatusEnum } from '../entities/note.entity';
import { DeleteNoteUseCase } from './delete-note.usecase';

const inMemoryNotesRepository = new InMemoryNotesRepository();
const SUT = new DeleteNoteUseCase(inMemoryNotesRepository);

describe('DeleteNoteUseCase', () => {
  it('should be able to delete a note', async () => {
    const note = Note.create({
      title: 'test',
      content: 'test content',
      status: StatusEnum.ACTIVE,
      tags: ['test', 'test2'],
    });

    await inMemoryNotesRepository.create(note);

    const result = await SUT.execute(note.id.toString());

    expect(result.isRight()).toBe(true);
    expect(inMemoryNotesRepository.notes).toHaveLength(0);
  });
});
