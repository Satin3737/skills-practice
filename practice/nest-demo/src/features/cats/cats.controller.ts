import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post} from '@nestjs/common';
import {Cat} from '@/features/cats/entities/cat.entity';
import {CatsService} from './cats.service';
import {CreateCatDto} from './dto/create-cat.dto';
import {UpdateCatDto} from './dto/update-cat.dto';

@Controller('cats')
export class CatsController {
    constructor(private readonly catsService: CatsService) {}

    @Get()
    public findAll(): Promise<Cat[]> {
        return this.catsService.findAll();
    }

    @Get(':id')
    public findOne(@Param('id', ParseIntPipe) id: number): Promise<Cat> {
        return this.catsService.findOne(id);
    }

    @Post()
    public create(@Body() createCatDto: CreateCatDto): Promise<Cat> {
        return this.catsService.create(createCatDto);
    }

    @Patch(':id')
    public update(@Param('id', ParseIntPipe) id: number, @Body() updateCatDto: UpdateCatDto): Promise<Cat> {
        return this.catsService.update(id, updateCatDto);
    }

    @Delete(':id')
    public remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.catsService.remove(id);
    }
}
