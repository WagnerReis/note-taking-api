import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from './models/note.model';
import { CreateNoteUseCase } from './use-cases/create-note.usecase';
import { GetNotesUseCase } from './use-cases/get-notes.usecase';
import { NoteRepository } from './repositories/note.repository';
import { NoteRepositoryInterface } from './repositories/note.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
  ],
  controllers: [NotesController],
  providers: [
    {
      provide: NoteRepositoryInterface,
      useClass: NoteRepository,
    },
    GetNotesUseCase,
    CreateNoteUseCase,
  ],
  exports: [],
})
export class NotesModule {}
