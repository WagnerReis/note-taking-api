export abstract class BaseRepository<T> {
  abstract create(entity: T): Promise<void>;
  abstract findById(id: string): Promise<T | null>;
  abstract update(entity: T): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findAll(): Promise<T[]>;
}
