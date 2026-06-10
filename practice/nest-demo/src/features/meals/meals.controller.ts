import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post} from '@nestjs/common';
import {Meal} from '@/features/meals/entities/meal.entity';
import {CreateMealDto} from './dto/create-meal.dto';
import {UpdateMealDto} from './dto/update-meal.dto';
import {MealsService} from './meals.service';

@Controller('meals')
export class MealsController {
    constructor(private readonly mealsService: MealsService) {}

    @Get()
    public findAll(): Promise<Meal[]> {
        return this.mealsService.findAll();
    }

    @Get(':id')
    public findOne(@Param('id', ParseIntPipe) id: number): Promise<Meal> {
        return this.mealsService.findOne(id);
    }

    @Post()
    public create(@Body() createMealDto: CreateMealDto): Promise<Meal> {
        return this.mealsService.create(createMealDto);
    }

    @Patch(':id')
    public update(@Param('id', ParseIntPipe) id: number, @Body() updateMealDto: UpdateMealDto): Promise<Meal> {
        return this.mealsService.update(id, updateMealDto);
    }

    @Delete(':id')
    public remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.mealsService.remove(id);
    }
}
