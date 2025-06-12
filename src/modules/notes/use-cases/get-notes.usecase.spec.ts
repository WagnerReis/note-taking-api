import { InMemoryNotesRepository } from 'test/repositories/in-memory-note.repository';
import { StatusEnum } from '../entities/note.entity';
import { CreateNoteUseCase } from './create-note.usecase';
import { GetNotesUseCase } from './get-notes.usecase';

const inMemoryNotesRepository = new InMemoryNotesRepository();
const SUT = new GetNotesUseCase(inMemoryNotesRepository);
const createNoteUseCase = new CreateNoteUseCase(inMemoryNotesRepository);

describe('Create notes use case', () => {
  it('should be able to create a note', async () => {
    await createNoteUseCase.execute({
      title: 'test1',
      content: 'test content 1',
      status: 'active',
      tags: [],
      userId: 'user-id',
    });

    await createNoteUseCase.execute({
      title: 'test2',
      content: 'test content 2',
      status: 'archived',
      tags: [],
      userId: 'user-id',
    });

    const result = await SUT.execute({ status: StatusEnum.ACTIVE });

    expect(result.isRight()).toBe(true);
    expect(inMemoryNotesRepository.notes[0].title).toBe('test1');
    expect(inMemoryNotesRepository.notes[0].content).toBe('test content 1');
    expect(inMemoryNotesRepository.notes[0].status).toBe('active');
    expect(inMemoryNotesRepository.notes[0].createdAt).toBeInstanceOf(Date);
    expect(inMemoryNotesRepository.notes[0].updatedAt).toBeInstanceOf(Date);
  });
});
