import * as bcrypt from 'bcrypt';
import { HashingService } from './hasing.service';

export class BcryptHashingService extends HashingService {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async compare(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }
}
