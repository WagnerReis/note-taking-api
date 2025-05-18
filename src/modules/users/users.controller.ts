import { ZodValidationPipe } from '@/core/pipes/zod-validation.pipe';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { z } from 'zod';
import { CreateUserUseCase } from './use-cases/create-user';
import { UserAlreadyExistsError } from './use-cases/errors/user-already-exists-error';

const createUserBodySchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
});

type CreateUserBody = z.infer<typeof createUserBodySchema>;

@Controller('users')
export class UsersController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserBodySchema)) body: CreateUserBody,
  ) {
    const { name, email, password } = body;

    const result = await this.createUserUseCase.execute({
      name,
      email,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
  }

  @Get()
  findAll() {
    // implement
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // implement
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    // implement
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // implement
  }
}
