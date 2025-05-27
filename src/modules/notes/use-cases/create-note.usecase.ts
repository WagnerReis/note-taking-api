import { Injectable } from '@nestjs/common';
import { NoteRepositoryInterface } from '../repositories/note.repository.interface';
import { Note, StatusEnum } from '../entities/note.entity';
import { Either, right } from '@/core/either';

interface CreateNoteBody {
  title: string;
  content: string;
  status: string;
}

type CreateNoteResponse = Either<
  null,
  {
    note: Note;
  }
>;

@Injectable()
export class CreateNoteUseCase {
  constructor(private readonly noteRepository: NoteRepositoryInterface) { }

  async execute(data: CreateNoteBody): Promise<CreateNoteResponse> {
    const { title, content, status } = data;

    const note = Note.create({ title, content, status: status as StatusEnum });

    await this.noteRepository.create(note);

    return right({ note });
  }
}
