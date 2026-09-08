import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
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

  @Patch('push-token')
  saveToken(
    @CurrentUser() user: { userId: number },
    @Body() dto: SavePushTokenDto,
  ) {
    return this.notificationsService.savePushToken(user.userId, dto.pushToken);
  }
}
