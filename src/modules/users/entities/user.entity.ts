import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

interface UserProps {
  name?: string;
  email: string;
  password: string;
  refreshToken?: string;
  googleId?: string;
  provider?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Entity<UserProps> {
  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  get refreshToken() {
    return this.props.refreshToken!;
  }

  set refreshToken(value: string) {
    this.props.refreshToken = value;
  }

  get googleId() {
    return this.props.googleId;
  }

  get provider() {
    return this.props.provider;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: UserProps, id?: UniqueEntityId) {
    const user = new User(
      {
        ...props,
        refreshToken: '',
      },
      id,
    );

    return user;
  }
}
