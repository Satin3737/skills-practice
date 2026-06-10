import {NotFoundException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {CreateMealDto} from './dto/create-meal.dto';
import {UpdateMealDto} from './dto/update-meal.dto';
import {Meal} from './entities/meal.entity';
import {MealsController} from './meals.controller';
import {MealsService} from './meals.service';

const mockMeal: Meal = {
    id: 1,
    name: 'Tuna',
    description: null,
    isVegan: false
};

const mockMealsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
};

describe('MealsController', () => {
    let controller: MealsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MealsController],
            providers: [{provide: MealsService, useValue: mockMealsService}]
        }).compile();

        controller = module.get<MealsController>(MealsController);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('returns all meals', async () => {
            mockMealsService.findAll.mockResolvedValue([mockMeal]);
            const result = await controller.findAll();
            expect(result).toEqual([mockMeal]);
            expect(mockMealsService.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('findOne', () => {
        it('returns a meal by id', async () => {
            mockMealsService.findOne.mockResolvedValue(mockMeal);
            const result = await controller.findOne(1);
            expect(result).toEqual(mockMeal);
            expect(mockMealsService.findOne).toHaveBeenCalledWith(1);
        });

        it('throws NotFoundException when meal does not exist', async () => {
            mockMealsService.findOne.mockRejectedValue(new NotFoundException());
            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('creates and returns a new meal', async () => {
            const dto: CreateMealDto = {name: 'Tuna', isVegan: false};
            mockMealsService.create.mockResolvedValue(mockMeal);
            const result = await controller.create(dto);
            expect(result).toEqual(mockMeal);
            expect(mockMealsService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('update', () => {
        it('updates and returns the meal', async () => {
            const dto: UpdateMealDto = {name: 'Salmon'};
            const updated = {...mockMeal, name: 'Salmon'};
            mockMealsService.update.mockResolvedValue(updated);
            const result = await controller.update(1, dto);
            expect(result).toEqual(updated);
            expect(mockMealsService.update).toHaveBeenCalledWith(1, dto);
        });

        it('throws NotFoundException when meal does not exist', async () => {
            mockMealsService.update.mockRejectedValue(new NotFoundException());
            await expect(controller.update(999, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('removes a meal', async () => {
            mockMealsService.remove.mockResolvedValue(undefined);
            await expect(controller.remove(1)).resolves.toBeUndefined();
            expect(mockMealsService.remove).toHaveBeenCalledWith(1);
        });

        it('throws NotFoundException when meal does not exist', async () => {
            mockMealsService.remove.mockRejectedValue(new NotFoundException());
            await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
        });
    });
});
