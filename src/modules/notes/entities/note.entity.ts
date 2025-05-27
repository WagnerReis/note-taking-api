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
  tags: string[];
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

  get tags(): string[] {
    return this.props.tags;
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
        createdAt: props.createdAt || new Date(),
        updatedAt: props.updatedAt || new Date(),
      },
      id,
    );

    return note;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      status: this.status,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
