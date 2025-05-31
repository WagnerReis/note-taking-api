import { ZodValidationPipe } from '@/core/pipes/zod-validation.pipe';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { z } from 'zod';
import { CreateNoteUseCase } from './use-cases/create-note.usecase';
import { Request, Response } from 'express';
import { GetNotesUseCase } from './use-cases/get-notes.usecase';
import { StatusEnum } from './entities/note.entity';
import { NotePresenter } from './presenters/note-presenter';

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
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createNoteBodySchema)) body: CreateNoteBody,
    @Res() res: Response,
  ) {
    const { title, content, status, tags } = body;

    await this.createNoteUseCase.execute({
      title,
      content,
      status,
      tags,
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
}
