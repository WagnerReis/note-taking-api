import { Either, right } from '@/core/either';
import { Note, StatusEnum } from '../entities/note.entity';
import { QueryProps } from '../repositories/note.repository';
import { NoteRepositoryInterface } from '../repositories/note.repository.interface';
import { Injectable } from '@nestjs/common';

type GetNotesInput = {
  status: StatusEnum;
};

type GetNotesResponse = Either<null, { notes: Note[] }>;

@Injectable()
export class GetNotesUseCase {
  constructor(
    private readonly notesRepository: NoteRepositoryInterface<QueryProps>,
  ) {}

  async execute({
    status = StatusEnum.ACTIVE,
  }: GetNotesInput): Promise<GetNotesResponse> {
    const notes = await this.notesRepository.find({ status });

    return right({ notes });
  }
}
