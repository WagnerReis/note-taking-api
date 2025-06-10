import { Either, left, right } from '@/core/either';
import { BadRequestError } from '@/core/errors/bad-request.error';
import { ConflictError } from '@/core/errors/conflict.error';
import { InternalServerError } from '@/core/errors/internal-server.error';
import { Injectable } from '@nestjs/common';
import { Note } from '../entities/note.entity';
import { QueryProps } from '../repositories/note.repository';
import { NoteRepositoryInterface } from '../repositories/note.repository.interface';
import { NoteNotFoundError } from './errors/note-not-found.error';

export class ActivateNoteCommand {
  constructor(
    public readonly noteId: string,
    public readonly userId: string,
  ) {}
}

export class ActivateNoteResponse {
  note: Note;
}

type ActivateNoteUseCaseResponse = Either<
  NoteNotFoundError | BadRequestError | ConflictError | InternalServerError,
  ActivateNoteResponse
>;

@Injectable()
export class ActivateNoteUseCase {
  constructor(private notesRepository: NoteRepositoryInterface<QueryProps>) {}

  async execute(
    command: ActivateNoteCommand,
  ): Promise<ActivateNoteUseCaseResponse> {
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

    if (!note) {
      return left(new NoteNotFoundError());
    }

    if (note.isActive()) {
      return left(new ConflictError('Note is already activated'));
    }

    try {
      note.activate();

      await this.notesRepository.update(note);

      return right({
        note: note,
      });
    } catch (error) {
      return left(new InternalServerError(`Failed to activate note: ${error}`));
    }
  }
}
