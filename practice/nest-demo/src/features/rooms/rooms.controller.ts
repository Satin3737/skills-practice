import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post} from '@nestjs/common';
import {Room} from '@/features/rooms/entities/room.entity';
import {CreateRoomDto} from './dto/create-room.dto';
import {UpdateRoomDto} from './dto/update-room.dto';
import {RoomsService} from './rooms.service';

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Get()
    public findAll(): Promise<Room[]> {
        return this.roomsService.findAll();
    }

    @Get(':id')
    public findOne(@Param('id', ParseIntPipe) id: number): Promise<Room> {
        return this.roomsService.findOne(id);
    }

    @Post()
    public create(@Body() createRoomDto: CreateRoomDto): Promise<Room> {
        return this.roomsService.create(createRoomDto);
    }

    @Patch(':id')
    public update(@Param('id', ParseIntPipe) id: number, @Body() updateRoomDto: UpdateRoomDto): Promise<Room> {
        return this.roomsService.update(id, updateRoomDto);
    }

    @Delete(':id')
    public remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.roomsService.remove(id);
    }
}
