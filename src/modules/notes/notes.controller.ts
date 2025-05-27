import { ZodValidationPipe } from '@/core/pipes/zod-validation.pipe';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { z } from 'zod';
import { CreateNoteUseCase } from './use-cases/create-note.usecase';
import { Response } from 'express';

const createNoteBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  status: z.enum(['active', 'archived']),
});

type CreateNoteBody = z.infer<typeof createNoteBodySchema>;

@Controller('notes')
export class NotesController {
  constructor(private readonly createNoteUseCase: CreateNoteUseCase) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createNoteBodySchema)) body: CreateNoteBody,
    @Res() res: Response,
  ) {
    const { title, content, status } = body;

    await this.createNoteUseCase.execute({
      title,
      content,
      status,
    });

    return res.sendStatus(HttpStatus.CREATED);
  }
}
