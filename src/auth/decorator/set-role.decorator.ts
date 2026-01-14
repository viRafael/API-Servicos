import { SetMetadata } from '@nestjs/common';
import { Roles } from '../enum/roles.enum';
import { REQUIRE_ROLE_KEY } from '../auth.constants';

export const SetRoleAccess = (...role: Roles[]) => {
  return SetMetadata(REQUIRE_ROLE_KEY, role);
};
