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
  userId: string;
  archivedAt?: Date;
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

  get userId(): string {
    return this.props.userId;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }
  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  get archivedAt(): Date | undefined {
    return this.props.archivedAt;
  }

  isArchived(): boolean {
    return this.props.status === StatusEnum.ARCHIVED;
  }

  archive() {
    this.props.status = StatusEnum.ARCHIVED;
    this.props.archivedAt = new Date();
    this.props.updatedAt = new Date();
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
      userId: this.userId,
      archivedAt: this.props.archivedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
