import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { SetRoleAccess } from 'src/auth/decorator/set-role.decorator';
import { Roles } from 'src/auth/enum/roles.enum';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @SetRoleAccess(Roles.CLIENT)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Post()
  create(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.create(tokenPayload.sub, createReviewDto);
  }

  @SetRoleAccess(Roles.CLIENT)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get()
  findAll(@Query('serviceId', ParseIntPipe) serviceId: number) {
    return this.reviewService.findAll(serviceId);
  }

  @SetRoleAccess(Roles.CLIENT)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.findOne(id);
  }

  @SetRoleAccess(Roles.ADMIN)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.remove(id);
  }
}
