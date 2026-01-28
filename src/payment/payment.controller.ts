import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { SetRoleAccess } from 'src/auth/decorator/set-role.decorator';
import { Roles } from 'src/auth/enum/roles.enum';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(AuthTokenGuard, RoleGuard)
  @SetRoleAccess(Roles.ADMIN)
  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @SetRoleAccess(Roles.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(id);
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @SetRoleAccess(Roles.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @SetRoleAccess(Roles.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.remove(id);
  }
}
