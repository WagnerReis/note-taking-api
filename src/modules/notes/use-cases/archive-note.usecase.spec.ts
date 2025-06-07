import { BadRequestError } from '@/core/errors/bad-request.error';
import { ConflictError } from '@/core/errors/conflict.error';
import { InternalServerError } from '@/core/errors/internal-server.error';
import { User } from '@/modules/users/entities/user.entity';
import { InMemoryNotesRepository } from 'test/repositories/in-memory-note.repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-user.repository';
import { Note, StatusEnum } from '../entities/note.entity';
import { ArchiveNoteCommand, ArchiveNoteUseCase } from './archive-note.usecase';
import { NoteNotFoundError } from './errors/note-not-found.error';

let inMemoryNotesRepository: InMemoryNotesRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let SUT: ArchiveNoteUseCase;

describe('Archive notes use case', () => {
  beforeEach(() => {
    inMemoryNotesRepository = new InMemoryNotesRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    SUT = new ArchiveNoteUseCase(inMemoryNotesRepository);
  });

  it('should be able to archive a note', async () => {
    const user = User.create({
      email: 'test@test.com',
      name: 'test',
      password: 'test',
    });

    await inMemoryUsersRepository.create(user);

    const note = Note.create({
      title: 'test',
      content: 'test content',
      status: StatusEnum.ACTIVE,
      tags: ['test', 'test2'],
      userId: user.id.toString(),
    });

    await inMemoryNotesRepository.create(note);

    const command = new ArchiveNoteCommand(
      note.id.toString(),
      user.id.toString(),
    );

    const result = await SUT.execute(command);

    expect(result.isRight()).toBe(true);
    expect(inMemoryNotesRepository.notes).toHaveLength(1);
    expect(inMemoryNotesRepository.notes[0].status).toBe('archived');
  });

  it('should not be able to archive a non-existing note', async () => {
    const command = new ArchiveNoteCommand(
      'non-existing-note-id',
      'non-existing-user-id',
    );

    const result = await SUT.execute(command);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NoteNotFoundError);
  });

  it('should not be able to archive a note from a non-existing user', async () => {
    const note = Note.create({
      title: 'test',
      content: 'test content',
      status: StatusEnum.ACTIVE,
      tags: ['test', 'test2'],
      userId: 'existing-user-id',
    });

    await inMemoryNotesRepository.create(note);

    const command = new ArchiveNoteCommand(
      note.id.toString(),
      'non-existing-user-id',
    );

    const result = await SUT.execute(command);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NoteNotFoundError);
  });

  it('should throw a BadRequestError if noteId is not provided', async () => {
    const command = new ArchiveNoteCommand('', '');

    const result = await SUT.execute(command);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestError);
  });

  it('should throw a BadRequestError if userId is not provided', async () => {
    const command = new ArchiveNoteCommand('1231312', '');

    const result = await SUT.execute(command);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestError);
  });

  it('should throw a ConflictError if note is already archived', async () => {
    const note = Note.create({
      title: 'test',
      content: 'test content',
      status: StatusEnum.ACTIVE,
      tags: ['test', 'test2'],
      userId: 'existing-user-id',
    });

    note.archive();

    await inMemoryNotesRepository.create(note);

    const command = new ArchiveNoteCommand(
      note.id.toString(),
      note.userId.toString(),
    );

    const result = await SUT.execute(command);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ConflictError);
  });

  it('should throw InternalServerError if entity archive method fails to set date', async () => {
    const user = User.create({
      email: 'test@test.com',
      name: 'test',
      password: 'test',
    });

    await inMemoryUsersRepository.create(user);

    const note = Note.create({
      title: 'test',
      content: 'test content',
      status: StatusEnum.ACTIVE,
      tags: ['test', 'test2'],
      userId: user.id.toString(),
    });

    Object.defineProperty(note, 'archive', {
      value: vi.fn().mockImplementation(() => {
        Object.defineProperty(note, 'status', {
          value: StatusEnum.ARCHIVED,
          writable: true,
        });
      }),
      writable: true,
    });

    await inMemoryNotesRepository.create(note);

    const command = new ArchiveNoteCommand(
      note.id.toString(),
      user.id.toString(),
    );

    const result = await SUT.execute(command);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalServerError);
    if (result.value instanceof InternalServerError) {
      expect(result.value.message).toBe('Failed to set archive date');
    }
  });

  it('should throw InternalServerError if repository update fails', async () => {
    const user = User.create({
      email: 'test@test.com',
      name: 'test',
      password: 'test',
    });

    await inMemoryUsersRepository.create(user);

    const note = Note.create({
      title: 'test',
      content: 'test content',
      status: StatusEnum.ACTIVE,
      tags: ['test', 'test2'],
      userId: user.id.toString(),
    });

    await inMemoryNotesRepository.create(note);

    const updateError = new Error('Database connection failed');
    vi.spyOn(inMemoryNotesRepository, 'update').mockRejectedValueOnce(
      updateError,
    );

    const command = new ArchiveNoteCommand(
      note.id.toString(),
      user.id.toString(),
    );

    const result = await SUT.execute(command);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalServerError);
    if (result.value instanceof InternalServerError) {
      expect(result.value.message).toBe(
        'Failed to archive note: Error: Database connection failed',
      );
    }
  });
});
