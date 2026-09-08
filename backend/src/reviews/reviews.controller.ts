import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: { userId: number },
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.userId, dto);
  }

  @Get('barber/:barberId')
  getBarberReviews(@Param('barberId', ParseIntPipe) barberId: number) {
    return this.reviewsService.getBarberReviews(barberId);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }
}
