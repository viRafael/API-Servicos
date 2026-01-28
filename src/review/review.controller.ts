import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
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

  @SetRoleAccess(Roles.PROVIDER)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get()
  findAllAsProvider(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.reviewService.findAllAsProvider(tokenPayload.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.findOne(id);
  }

  @UseGuards(AuthTokenGuard)
  @Patch(':id')
  update(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.update(tokenPayload.sub, id, updateReviewDto);
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  remove(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reviewService.remove(tokenPayload.sub, id);
  }
}
