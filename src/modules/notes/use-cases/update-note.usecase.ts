import { Either, left, right } from '@/core/either';
import { InternalServerError } from '@/core/errors/internal-server.error';
import { Injectable, Logger } from '@nestjs/common';
import { QueryProps } from '../repositories/note.repository';
import { NoteRepositoryInterface } from '../repositories/note.repository.interface';
import { NoteNotFoundError } from './errors/note-not-found.error';

interface UpdateNoteUseCaseRequest {
  id: string;
  data: {
    title?: string;
    content?: string;
    tags?: string[];
  };
}

type UpdateNoteUseCaseResponse = Either<
  NoteNotFoundError | InternalServerError,
  {
    title: string;
    content: string;
    tags: string[];
  }
>;

@Injectable()
export class UpdateNoteUseCase {
  constructor(private notesRepository: NoteRepositoryInterface<QueryProps>) {}
  private readonly logger = new Logger(UpdateNoteUseCase.name);

  async execute({
    id,
    data,
  }: UpdateNoteUseCaseRequest): Promise<UpdateNoteUseCaseResponse> {
    this.logger.log('Executing UpdateNoteUseCase', { id, data });
    const note = await this.notesRepository.findById(id);

    if (!note) {
      return left(new NoteNotFoundError());
    }

    try {
      note.title = data.title ?? note.title;
      note.content = data.content ?? note.content;
      note.tags = data.tags ?? note.tags;

      await this.notesRepository.update(note);

      return right({
        title: note.title,
        content: note.content,
        tags: note.tags,
      });
    } catch (error) {
      return left(new InternalServerError(error?.message as string));
    }
  }
}
