export abstract class Encrypter<T> {
  abstract encrypt(
    payload: Record<string, unknown>,
    options?: T,
  ): Promise<string>;
}
