import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from './models/note.model';
import { CreateNoteUseCase } from './use-cases/create-note.usecase';
import { NoteRepository } from './repositories/note.repository';
import { NoteRepositoryInterface } from './repositories/note.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
  ],
  controllers: [NotesController],
  providers: [
    CreateNoteUseCase,
    {
      provide: NoteRepositoryInterface,
      useClass: NoteRepository,
    },
  ],
  exports: [],
})
export class NotesModule {}
