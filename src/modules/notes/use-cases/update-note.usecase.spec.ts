import { InternalServerError } from '@/core/errors/internal-server.error';
import { makeNote } from 'test/factories/make-note.factory';
import { makeUser } from 'test/factories/make-user.factory';
import { InMemoryNotesRepository } from 'test/repositories/in-memory-note.repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-user.repository';
import { NoteNotFoundError } from './errors/note-not-found.error';
import { UpdateNoteUseCase } from './update-note.usecase';

let inMemoryNotesRepository: InMemoryNotesRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let SUT: UpdateNoteUseCase;

describe('Update notes use case', () => {
  beforeEach(() => {
    inMemoryNotesRepository = new InMemoryNotesRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    SUT = new UpdateNoteUseCase(inMemoryNotesRepository);
  });

  it('should be able to update a note', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const note = makeNote({ userId: user.id });
    await inMemoryNotesRepository.create(note);

    const result = await SUT.execute({
      id: note.id.toString(),
      data: {
        title: 'New title',
        content: 'New content',
        tags: ['new-tag'],
      },
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryNotesRepository.notes[0]).toMatchObject({
      title: 'New title',
      content: 'New content',
      tags: ['new-tag'],
    });
  });

  it('should not be able to update a non existing note', async () => {
    const result = await SUT.execute({
      id: 'non-existing-note-id',
      data: {
        title: 'New title',
        content: 'New content',
        tags: ['new-tag'],
      },
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NoteNotFoundError);
  });

  it('should return InternalServerError when fails to update a note', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const note = makeNote({ userId: user.id });
    await inMemoryNotesRepository.create(note);

    vi.spyOn(inMemoryNotesRepository, 'update').mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await SUT.execute({
      id: note.id.toString(),
      data: {
        title: 'New title',
        content: 'New content',
        tags: ['new-tag'],
      },
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalServerError);
  });
});
