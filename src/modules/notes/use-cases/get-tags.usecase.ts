import { Either, right } from '@/core/either';
import { Injectable } from '@nestjs/common';
import { QueryProps } from '../repositories/note.repository';
import { NoteRepositoryInterface } from '../repositories/note.repository.interface';

type GetTagsResponse = Either<
  null,
  {
    tags: string[];
  }
>;

@Injectable()
export class GetTagsUseCase {
  constructor(
    private readonly notesRepository: NoteRepositoryInterface<QueryProps>,
  ) {}

  async execute(): Promise<GetTagsResponse> {
    const tags = await this.notesRepository.findTags();

    return right({
      tags,
    });
  }
}
