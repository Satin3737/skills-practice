import {NotFoundException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {CatsController} from './cats.controller';
import {CatsService} from './cats.service';
import {CreateCatDto} from './dto/create-cat.dto';
import {UpdateCatDto} from './dto/update-cat.dto';
import {Cat} from './entities/cat.entity';

const mockCat: Cat = {
    id: 1,
    name: 'Tom',
    age: 3,
    description: null,
    isHungary: false,
    meals: [],
    room: {id: 1, name: 'Room 1', objects: [], cats: []}
};

const mockCatsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
};

describe('CatsController', () => {
    let controller: CatsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CatsController],
            providers: [{provide: CatsService, useValue: mockCatsService}]
        }).compile();

        controller = module.get<CatsController>(CatsController);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('returns all cats', async () => {
            mockCatsService.findAll.mockResolvedValue([mockCat]);
            const result = await controller.findAll();
            expect(result).toEqual([mockCat]);
            expect(mockCatsService.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('findOne', () => {
        it('returns a cat by id', async () => {
            mockCatsService.findOne.mockResolvedValue(mockCat);
            const result = await controller.findOne(1);
            expect(result).toEqual(mockCat);
            expect(mockCatsService.findOne).toHaveBeenCalledWith(1);
        });

        it('throws NotFoundException when cat does not exist', async () => {
            mockCatsService.findOne.mockRejectedValue(new NotFoundException());
            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('creates and returns a new cat', async () => {
            const dto: CreateCatDto = {name: 'Tom', age: 3, isHungary: false, mealIds: [1], roomId: 1};
            mockCatsService.create.mockResolvedValue(mockCat);
            const result = await controller.create(dto);
            expect(result).toEqual(mockCat);
            expect(mockCatsService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('update', () => {
        it('updates and returns the cat', async () => {
            const dto: UpdateCatDto = {name: 'Tommy'};
            const updated = {...mockCat, name: 'Tommy'};
            mockCatsService.update.mockResolvedValue(updated);
            const result = await controller.update(1, dto);
            expect(result).toEqual(updated);
            expect(mockCatsService.update).toHaveBeenCalledWith(1, dto);
        });

        it('throws NotFoundException when cat does not exist', async () => {
            mockCatsService.update.mockRejectedValue(new NotFoundException());
            await expect(controller.update(999, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('removes a cat', async () => {
            mockCatsService.remove.mockResolvedValue(undefined);
            await expect(controller.remove(1)).resolves.toBeUndefined();
            expect(mockCatsService.remove).toHaveBeenCalledWith(1);
        });

        it('throws NotFoundException when cat does not exist', async () => {
            mockCatsService.remove.mockRejectedValue(new NotFoundException());
            await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
        });
    });
});
