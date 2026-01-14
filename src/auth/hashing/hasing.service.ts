export abstract class HashingService {
  abstract hash(password: string): Promise<string>;
  abstract compare(password: string, hashed: string): Promise<boolean>;
}
