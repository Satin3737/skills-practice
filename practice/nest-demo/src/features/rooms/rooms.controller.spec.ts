import {NotFoundException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {CreateRoomDto} from './dto/create-room.dto';
import {UpdateRoomDto} from './dto/update-room.dto';
import {Room} from './entities/room.entity';
import {RoomsController} from './rooms.controller';
import {RoomsService} from './rooms.service';

const mockRoom: Room = {
    id: 1,
    name: 'Living Room',
    objects: [],
    cats: []
};

const mockRoomsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
};

describe('RoomsController', () => {
    let controller: RoomsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RoomsController],
            providers: [{provide: RoomsService, useValue: mockRoomsService}]
        }).compile();

        controller = module.get<RoomsController>(RoomsController);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('returns all rooms', async () => {
            mockRoomsService.findAll.mockResolvedValue([mockRoom]);
            const result = await controller.findAll();
            expect(result).toEqual([mockRoom]);
            expect(mockRoomsService.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('findOne', () => {
        it('returns a room by id', async () => {
            mockRoomsService.findOne.mockResolvedValue(mockRoom);
            const result = await controller.findOne(1);
            expect(result).toEqual(mockRoom);
            expect(mockRoomsService.findOne).toHaveBeenCalledWith(1);
        });

        it('throws NotFoundException when room does not exist', async () => {
            mockRoomsService.findOne.mockRejectedValue(new NotFoundException());
            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('creates and returns a new room', async () => {
            const dto: CreateRoomDto = {name: 'Living Room', objects: []};
            mockRoomsService.create.mockResolvedValue(mockRoom);
            const result = await controller.create(dto);
            expect(result).toEqual(mockRoom);
            expect(mockRoomsService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('update', () => {
        it('updates and returns the room', async () => {
            const dto: UpdateRoomDto = {name: 'Bedroom'};
            const updated = {...mockRoom, name: 'Bedroom'};
            mockRoomsService.update.mockResolvedValue(updated);
            const result = await controller.update(1, dto);
            expect(result).toEqual(updated);
            expect(mockRoomsService.update).toHaveBeenCalledWith(1, dto);
        });

        it('throws NotFoundException when room does not exist', async () => {
            mockRoomsService.update.mockRejectedValue(new NotFoundException());
            await expect(controller.update(999, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('removes a room', async () => {
            mockRoomsService.remove.mockResolvedValue(undefined);
            await expect(controller.remove(1)).resolves.toBeUndefined();
            expect(mockRoomsService.remove).toHaveBeenCalledWith(1);
        });

        it('throws NotFoundException when room does not exist', async () => {
            mockRoomsService.remove.mockRejectedValue(new NotFoundException());
            await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
        });
    });
});