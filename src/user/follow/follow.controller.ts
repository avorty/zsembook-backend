import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../auth/decorator/getUser.decorator';
import { JwtAuthDto } from '../../auth/dto/jwt-auth.dto';
import { FriendIdDto } from './dto/friendId.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('user/follow')
export class FollowController {
  constructor(private readonly friendsService: FollowService) {}

  @Get('/followers/:userId')
  getAllFollowers(@Param('userId') userId: string): Promise<object[]> {
    if ((+userId as any).isNan())
      throw new Error(
        'request should looks like /user/follows/followers/:userId where userId is integer number',
      );
    return this.friendsService.getAllFollowers(+userId);
  }

  @Get('/following/:userId')
  getAllFollowing(@Param('userId') userId: string): Promise<object[]> {
    if ((+userId as any).isNan())
      throw new Error(
        'request should looks like /user/follows/following/:userId where userId is integer number',
      );
    return this.friendsService.getAllFollowing(+userId);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/follow')
  async follow(@GetUser() user: JwtAuthDto, @Body() dto: FriendIdDto) {
    await this.friendsService.followUser(user.userId, dto.friendId);
  }

  @HttpCode(HttpStatus.OK)
  @Delete()
  async unfollow(
    @GetUser() user: JwtAuthDto,
    @Body('friendId') friendId: number,
  ) {
    await this.friendsService.unfollowUser(user.userId, friendId);
  }
}