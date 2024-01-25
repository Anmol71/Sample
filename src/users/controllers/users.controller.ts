import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Redirect,
  Render,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Render('thanksPage')
  @Post('register')
  public create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Render('register')
  @Get('register')
  public showRegister() {
    return {};
  }

  @Get()
  @Redirect('/users')
  // @Render('usersList')
  public findAll() {
    console.log('Find All');
    return this.usersService.findAll();
  }
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get(':id')
  public findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  //   @Patch(':id')
  //   update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //     return this.usersService.update(+id, updateUserDto);
  //   }

  @Delete(':id')
  public remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(+id);
  }
}
