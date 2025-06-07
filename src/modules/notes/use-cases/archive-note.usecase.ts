import { Either, left, right } from '@/core/either';
import { BadRequestError } from '@/core/errors/bad-request.error';
import { ConflictError } from '@/core/errors/conflict.error';
import { InternalServerError } from '@/core/errors/internal-server.error';
import { Injectable } from '@nestjs/common';
import { QueryProps } from '../repositories/note.repository';
import { NoteRepositoryInterface } from '../repositories/note.repository.interface';
import { NoteNotFoundError } from './errors/note-not-found.error';

export class ArchiveNoteCommand {
  constructor(
    public readonly noteId: string,
    public readonly userId: string,
  ) {}
}

export class ArchiveNoteResponse {
  archivedAt: Date;
  noteId: string;
}

type ArchiveNoteUseCaseResponse = Either<
  NoteNotFoundError | BadRequestError | ConflictError | InternalServerError,
  ArchiveNoteResponse
>;

@Injectable()
export class ArchiveNoteUseCase {
  constructor(private notesRepository: NoteRepositoryInterface<QueryProps>) {}

  async execute(
    command: ArchiveNoteCommand,
  ): Promise<ArchiveNoteUseCaseResponse> {
    if (!command.noteId?.trim()) {
      return left(new BadRequestError('Note ID is required'));
    }

    if (!command.userId?.trim()) {
      return left(new BadRequestError('User ID is required'));
    }

    const [note] = await this.notesRepository.find({
      id: command.noteId,
      userId: command.userId,
    });
    console.log('rrrrrrrrrr', note);

    if (!note) {
      return left(new NoteNotFoundError());
    }

    if (note.isArchived()) {
      return left(new ConflictError('Note is already archived'));
    }

    try {
      note.archive();
      console.log(note);
      await this.notesRepository.update(note);

      if (!note.archivedAt) {
        return left(new InternalServerError('Failed to set archive date'));
      }

      return right({
        archivedAt: note.archivedAt,
        noteId: note.id.toString(),
      });
    } catch (error) {
      return left(new InternalServerError(`Failed to archive note: ${error}`));
    }
  }
}
