import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../auth.constants';

export const Public = () => {
  return SetMetadata(IS_PUBLIC_KEY, true);
};
