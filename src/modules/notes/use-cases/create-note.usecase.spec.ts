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
    expect(inMemoryNotesRepository.notes[0].title).toBe('test');
    expect(inMemoryNotesRepository.notes[0].content).toBe('test content');
    expect(inMemoryNotesRepository.notes[0].status).toBe('active');
    expect(inMemoryNotesRepository.notes[0].createdAt).toBeInstanceOf(Date);
    expect(inMemoryNotesRepository.notes[0].updatedAt).toBeInstanceOf(Date);
  });
});
