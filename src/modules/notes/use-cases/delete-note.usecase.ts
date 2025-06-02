import { BadRequestException, Injectable } from '@nestjs/common';
import { NoteRepositoryInterface } from '../repositories/note.repository.interface';
import { QueryProps } from '../repositories/note.repository';
import { Either, left, right } from '@/core/either';

type DeleteNoteResponse = Either<BadRequestException, void>;

@Injectable()
export class DeleteNoteUseCase {
  constructor(
    private readonly noteRepository: NoteRepositoryInterface<QueryProps>,
  ) {}

  async execute(id: string): Promise<DeleteNoteResponse> {
    try {
      await this.noteRepository.delete(id);
      return right(undefined);
    } catch (error) {
      return left(new BadRequestException(error));
    }
  }
}
