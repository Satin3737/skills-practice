import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CreateMealDto} from './dto/create-meal.dto';
import {UpdateMealDto} from './dto/update-meal.dto';
import {Meal} from './entities/meal.entity';

@Injectable()
export class MealsService {
    public constructor(
        @InjectRepository(Meal)
        private readonly mealsRepository: Repository<Meal>
    ) {}

    public async findAll(): Promise<Meal[]> {
        return await this.mealsRepository.find();
    }

    public async findOne(id: number): Promise<Meal> {
        const meal = await this.mealsRepository.findOneBy({id});
        if (!meal) throw new NotFoundException(`Meal with ID ${id} not found`);
        return meal;
    }

    public async create(createMealDto: CreateMealDto): Promise<Meal> {
        const existedMeal = await this.mealsRepository.findOneBy({name: createMealDto.name});
        if (existedMeal) throw new BadRequestException(`Meal with name ${createMealDto.name} already exists`);
        return await this.mealsRepository.save(createMealDto);
    }

    public async update(id: number, updateMealDto: UpdateMealDto): Promise<Meal> {
        const {name} = updateMealDto;

        const meal = await this.mealsRepository.findOneBy({id});
        if (!meal) throw new NotFoundException(`Meal with ID ${id} not found`);

        if (name) {
            const existedMeal = await this.mealsRepository.findOneBy({name});
            if (!!existedMeal && existedMeal.id !== meal.id) {
                throw new BadRequestException(`Meal with name ${name} already exists`);
            }
        }

        return await this.mealsRepository.save({
            ...meal,
            ...updateMealDto
        });
    }

    public async remove(id: number): Promise<void> {
        const result = await this.mealsRepository.delete(id);
        if (!result.affected) throw new NotFoundException(`Meal with ID ${id} not found`);
    }
}
