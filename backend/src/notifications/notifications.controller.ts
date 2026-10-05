import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export class SavePushTokenDto {
  @IsString()
  @IsNotEmpty()
  pushToken: string;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: number }) {
    return this.notificationsService.getUserNotifications(user.userId);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: { userId: number }) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Patch(':id/read')
  markRead(
    @CurrentUser() user: { userId: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markAsRead(user.userId, id);
  }

  @Patch('push-token')
  saveToken(
    @CurrentUser() user: { userId: number },
    @Body() dto: SavePushTokenDto,
  ) {
    return this.notificationsService.savePushToken(user.userId, dto.pushToken);
  }
}
