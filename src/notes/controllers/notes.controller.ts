import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Render,
  Put,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Redirect,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { NotesService } from '../services/notes.service';
import { CreateNoteDto } from '../dtos/create-note.dto';
import { NoteModel } from 'src/databases/models/note.model';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import { MapToNotesPipe } from '../pipes/map-to-notes.pipe';
import { UsersService } from 'src/users/services/users.service';
import { CreateSharedNoteDto } from 'src/shared-notes/dtos/create-shared-note.dto';
import { SharedNotesService } from 'src/shared-notes/services/shared-notes.service';
import { SharedNoteModel } from 'src/databases/models/shared-notes.model';
import { UserModel } from 'src/databases/models/user.model';

@UseGuards(AuthGuard)
@Controller('notes')
export class NotesController {
  constructor(
    private notesService: NotesService,
    private usersService: UsersService,
    private sharedNotesService: SharedNotesService,
  ) {}
  // @Get()
  public async getMyNotes(
    @AuthUser() user: UserModel,
  ): Promise<{ notes: NoteModel[] }> {
    const notes = await this.notesService.getMyNotes(user.id);
    return { notes };
  }

  @Render('notes')
  @Get()
  public async getNotes(
    @AuthUser() user: UserModel,
    @Query('shared') notes: 'all' | 'createdByMe' | 'sharedWithMe',
  ): Promise<
    | { myNotes: NoteModel[]; sharedToMe: SharedNoteModel[] }
    | { myNotes: NoteModel[] }
    | { sharedToMe: SharedNoteModel[] }
  > {
    const sharedToMe: SharedNoteModel[] =
      await this.sharedNotesService.notesSharedToMe(user.id);
    const myNotes: NoteModel[] = await this.notesService.getMyNotes(user.id);
    if (notes === 'all') {
      return { myNotes, sharedToMe };
    } else if (notes === 'createdByMe') {
      return { myNotes };
    } else if (notes === 'sharedWithMe') {
      return { sharedToMe };
    }
    return { myNotes: myNotes, sharedToMe: sharedToMe };
  }

  @Get(':noteId/share')
  @Render('usersList')
  public async shareWithUsers(
    @Param('noteId', ParseIntPipe, MapToNotesPipe) note: NoteModel,
    @AuthUser() users: UserModel,
  ) {
    const allUsers: UserModel[] = await this.usersService.findAll();
    const filteredUsers: UserModel[] = allUsers.filter((user) => {
      return users.id !== user.id;
    });
    return { filteredUsers, note: note.toJSON() };
  }

  @Render('createNotes')
  @UseGuards(AuthGuard)
  @Get('create')
  public showCreateNote(@AuthUser() authUser: UserModel) {
    return { user: authUser };
  }

  @Get(':id/edit')
  @Render('editNotes')
  public Note(@Param('id', ParseIntPipe, MapToNotesPipe) note: NoteModel) {
    return { note };
  }

  @Post()
  @Redirect('/notes')
  public create(
    @AuthUser() user: UserModel,
    @Body() createNote: CreateNoteDto,
  ): void {
    this.notesService.create(createNote, user.id);
  }

  // ROUTE FOR SHARING THE NOTE.
  @Post(':noteId/share')
  @Redirect('/notes')
  public sharedWithSingleUser(
    @Param('noteId', ParseIntPipe, MapToNotesPipe) note: NoteModel,
    @AuthUser() user: UserModel,
    @Body() sharedNoteDto: CreateSharedNoteDto,
  ) {
    this.sharedNotesService.create(sharedNoteDto, user.id, note);
  }

  @Get(':id')
  public findAll(@AuthUser() user: UserModel): Promise<NoteModel[]> {
    return this.notesService.findAllByUser(user.id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  @Redirect('/notes')
  public editNote(
    @Param('id', ParseIntPipe, MapToNotesPipe) note: NoteModel,
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<NoteModel> {
    return this.notesService.update(note, createNoteDto);
  }

  @Redirect('/notes')
  @Delete(':id')
  public remove(
    @Param('id', ParseIntPipe, MapToNotesPipe) note: NoteModel,
  ): Promise<null> {
    return this.notesService.remove(note);
  }
}
