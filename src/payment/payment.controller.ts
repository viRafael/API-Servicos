import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Post,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { SetRoleAccess } from 'src/auth/decorator/set-role.decorator';
import { Roles } from 'src/auth/enum/roles.enum';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @SetRoleAccess(Roles.CLIENT)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Post('create-intent')
  createPaymentIntent(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    return this.paymentService.createPaymentIntent(
      tokenPayload.sub,
      createPaymentIntentDto,
    );
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get(':id')
  findOne(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentService.findOne(tokenPayload.sub, id);
  }

  @SetRoleAccess(Roles.ADMIN)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @SetRoleAccess(Roles.ADMIN)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.remove(id);
  }
}
