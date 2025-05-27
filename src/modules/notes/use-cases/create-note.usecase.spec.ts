import { InMemoryNotesRepository } from 'test/repositories/in-memory-note.repository';
import { CreateNoteUseCase } from './create-note.usecase';

const inMemoryNotesRepository = new InMemoryNotesRepository();
const SUT = new CreateNoteUseCase(inMemoryNotesRepository);

describe('Create notes use case', () => {
  it('should be able to create a note', async () => {
    const result = await SUT.execute({
      title: 'test',
      content: 'test content',
      status: 'active',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryNotesRepository.notes).toHaveLength(1);
  });
});
