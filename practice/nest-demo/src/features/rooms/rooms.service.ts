import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreateRoomDto} from './dto/create-room.dto';
import {UpdateRoomDto} from './dto/update-room.dto';
import {Room} from './entities/room.entity';

@Injectable()
export class RoomsService {
    public constructor(
        @InjectRepository(Room)
        private readonly roomRepository: Repository<Room>
    ) {}

    public async findAll(): Promise<Room[]> {
        return await this.roomRepository.find({relations: {cats: true}});
    }

    public async findOne(id: number): Promise<Room> {
        const room = await this.roomRepository.findOne({where: {id}, relations: {cats: true}});
        if (!room) throw new NotFoundException(`Room with ID ${id} not found`);
        return room;
    }

    public async create(createRoomDto: CreateRoomDto): Promise<Room> {
        const {name} = createRoomDto;

        const existedRoom = await this.roomRepository.findOneBy({name});
        if (existedRoom) throw new BadRequestException(`Room with name: ${name} already exists`);

        return this.roomRepository.save(createRoomDto);
    }

    public async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
        const {name, ...rest} = updateRoomDto;
        const errorMessages: string[] = [];

        const room = await this.roomRepository.findOneBy({id});
        if (!room) errorMessages.push(`Room with ID ${id} not found`);

        if (name) {
            const currentRoom = await this.roomRepository.findOneBy({name});
            if (!!currentRoom && currentRoom?.id !== room?.id) {
                errorMessages.push(`Room with name ${name} already exists`);
            }
        }

        if (errorMessages.length) throw new BadRequestException(errorMessages);

        return await this.roomRepository.save({
            ...room,
            ...rest,
            ...(!!name && {name})
        });
    }

    public async remove(id: number): Promise<void> {
        const result = await this.roomRepository.delete(id);
        if (!result.affected) throw new NotFoundException(`Room with ID ${id} not found`);
    }
}
