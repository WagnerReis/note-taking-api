import { makeNote } from 'test/factories/make-note.factory';
import { makeUser } from 'test/factories/make-user.factory';
import { InMemoryNotesRepository } from 'test/repositories/in-memory-note.repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-user.repository';
import { GetTagsUseCase } from './get-tags.usecase';

let inMemoryNotesRepository: InMemoryNotesRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let SUT: GetTagsUseCase;

describe('Activate note use case', () => {
  beforeEach(() => {
    inMemoryNotesRepository = new InMemoryNotesRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    SUT = new GetTagsUseCase(inMemoryNotesRepository);
  });

  it('should be able to get all tags', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const note = makeNote();
    const note2 = makeNote({ tags: ['tag3', 'tag4'] });
    await inMemoryNotesRepository.create(note);
    await inMemoryNotesRepository.create(note2);

    const result = await SUT.execute();

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.tags).toHaveLength(4);
      expect(result.value.tags).toEqual(
        expect.arrayContaining(['tag1', 'tag2', 'tag3', 'tag4']),
      );
    }
  });
});
