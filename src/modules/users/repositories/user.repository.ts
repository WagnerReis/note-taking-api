import { InjectModel } from '@nestjs/mongoose';
import { UserRepositoryInterface } from './user.respository.interface';
import { User, UserDocument } from '../models/user.model';
import { Model } from 'mongoose';
import { User as UserEntity } from '../entities/user.entity';
import { MongoCreateUserMapper } from '../mappers/mongo-create-user.mapper';

export class UserRepository implements UserRepositoryInterface {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      return null;
    }

    return MongoCreateUserMapper.toDomain(user);
  }

  async create(data: UserEntity): Promise<void> {
    const user = MongoCreateUserMapper.toPersistence(data);

    await this.userModel.create(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById({ id });
    if (!user) {
      return null;
    }

    return MongoCreateUserMapper.toDomain(user);
  }

  async update(entity: UserEntity): Promise<void> {
    await this.userModel.findByIdAndUpdate(entity.id, {
      $set: MongoCreateUserMapper.toPersistence(entity),
    });
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.userModel.find();
    return users.map((user) => MongoCreateUserMapper.toDomain(user));
  }
}
