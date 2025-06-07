import { Either, right } from '@/core/either';
import { Injectable } from '@nestjs/common';
import { Note, StatusEnum } from '../entities/note.entity';
import { QueryProps } from '../repositories/note.repository';
import { NoteRepositoryInterface } from '../repositories/note.repository.interface';

interface CreateNoteBody {
  title: string;
  content: string;
  status: string;
  userId: string;
  tags: string[];
}

type CreateNoteResponse = Either<
  null,
  {
    note: Note;
  }
>;

@Injectable()
export class CreateNoteUseCase {
  constructor(
    private readonly noteRepository: NoteRepositoryInterface<QueryProps>,
  ) {}

  async execute(data: CreateNoteBody): Promise<CreateNoteResponse> {
    const { title, content, status, tags } = data;

    const note = Note.create({
      title,
      content,
      status: status as StatusEnum,
      tags,
      userId: data.userId,
    });

    await this.noteRepository.create(note);

    return right({ note });
  }
}
