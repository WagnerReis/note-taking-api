import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from './models/note.model';
import { NotesController } from './notes.controller';
import { NoteRepository, QueryProps } from './repositories/note.repository';
import { NoteRepositoryInterface } from './repositories/note.repository.interface';
import { ArchiveNoteUseCase } from './use-cases/archive-note.usecase';
import { CreateNoteUseCase } from './use-cases/create-note.usecase';
import { DeleteNoteUseCase } from './use-cases/delete-note.usecase';
import { GetNotesUseCase } from './use-cases/get-notes.usecase';
import { UpdateNoteUseCase } from './use-cases/update-note.usecase';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
  ],
  controllers: [NotesController],
  providers: [
    {
      provide: NoteRepositoryInterface<QueryProps>,
      useClass: NoteRepository,
    },
    GetNotesUseCase,
    CreateNoteUseCase,
    DeleteNoteUseCase,
    ArchiveNoteUseCase,
    UpdateNoteUseCase,
  ],
  exports: [],
})
export class NotesModule {}
