import { ZodValidationPipe } from '@/core/pipes/zod-validation.pipe';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { z } from 'zod';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StatusEnum } from './entities/note.entity';
import { NotePresenter } from './presenters/note-presenter';
import {
  ArchiveNoteCommand,
  ArchiveNoteUseCase,
} from './use-cases/archive-note.usecase';
import { CreateNoteUseCase } from './use-cases/create-note.usecase';
import { DeleteNoteUseCase } from './use-cases/delete-note.usecase';
import { GetNotesUseCase } from './use-cases/get-notes.usecase';

const createNoteBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  status: z.enum(['active', 'archived']),
  tags: z.array(z.string()),
});

type CreateNoteBody = z.infer<typeof createNoteBodySchema>;

@Controller('notes')
export class NotesController {
  constructor(
    private readonly createNoteUseCase: CreateNoteUseCase,
    private readonly getNotesUseCase: GetNotesUseCase,
    private readonly deleteNoteUseCase: DeleteNoteUseCase,
    private readonly archiveNoteUseCase: ArchiveNoteUseCase,
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createNoteBodySchema)) body: CreateNoteBody,
    @CurrentUser('sub') userId: string,
    @Res() res: Response,
  ) {
    const { title, content, status, tags } = body;

    await this.createNoteUseCase.execute({
      title,
      content,
      status,
      tags,
      userId,
    });

    return res.sendStatus(HttpStatus.CREATED);
  }

  @Get()
  async list(@Res() res: Response, @Req() req: Request) {
    const { status } = req.query;

    const result = await this.getNotesUseCase.execute({
      status: status as StatusEnum,
    });

    if (result.isLeft()) {
      throw new BadRequestException('Internal server error');
    }

    return res.json(NotePresenter.toResponseList(result.value.notes));
  }

  @Delete(':id')
  async delete(@Res() res: Response, @Req() req: Request) {
    const { id } = req.params;

    await this.deleteNoteUseCase.execute(id);

    return res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @Patch(':id/archive')
  async archive(
    @CurrentUser('sub') userId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const { id } = req.params;

    const result = await this.archiveNoteUseCase.execute(
      new ArchiveNoteCommand(id, userId),
    );

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
