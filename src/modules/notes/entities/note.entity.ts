import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export enum StatusEnum {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}
interface NoteProps {
  title: string;
  content: string;
  status: StatusEnum;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Note extends Entity<NoteProps> {
  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get status(): StatusEnum {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }
  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  static create(props: NoteProps, id?: UniqueEntityId) {
    const note = new Note(
      {
        ...props,
      },
      id,
    );

    return note;
  }
}
