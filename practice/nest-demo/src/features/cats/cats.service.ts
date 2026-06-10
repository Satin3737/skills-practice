import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
import {Meal} from '@/features/meals/entities/meal.entity';
import {Room} from '@/features/rooms/entities/room.entity';
import {CreateCatDto} from './dto/create-cat.dto';
import {UpdateCatDto} from './dto/update-cat.dto';
import {Cat} from './entities/cat.entity';

@Injectable()
export class CatsService {
    public constructor(
        @InjectRepository(Cat)
        private readonly catsRepository: Repository<Cat>,

        @InjectRepository(Room)
        private readonly roomsRepository: Repository<Room>,

        @InjectRepository(Meal)
        private readonly mealsRepository: Repository<Meal>
    ) {}

    public async findAll(): Promise<Cat[]> {
        return await this.catsRepository.find({relations: {meals: true}});
    }

    public async findOne(id: number): Promise<Cat> {
        const cat = await this.catsRepository.findOne({where: {id}, relations: {meals: true}});
        if (!cat) throw new NotFoundException(`Cat with ID ${id} not found`);
        return cat;
    }

    public async create(createCatDto: CreateCatDto): Promise<Cat> {
        const {name, mealIds, roomId, ...rest} = createCatDto;
        const errorMessages: string[] = [];

        const [existedCat, room, mealsCount] = await Promise.all([
            this.catsRepository.findOneBy({name}),
            this.roomsRepository.findOneBy({id: roomId}),
            this.mealsRepository.countBy({id: In(mealIds)})
        ]);

        if (existedCat) errorMessages.push(`Cat with name ${name} already exists`);
        if (!room) errorMessages.push(`Room with ID ${roomId} not found`);
        if (mealsCount !== mealIds.length) errorMessages.push(`Meal with IDs ${mealIds} not found`);

        if (errorMessages.length) throw new BadRequestException(errorMessages);

        const {id} = await this.catsRepository.save({
            name,
            ...rest,
            meals: mealIds.map(id => ({id})),
            room: {id: roomId}
        });

        return this.findOne(id);
    }

    public async update(id: number, updateCatDto: UpdateCatDto): Promise<Cat> {
        const {mealIds, roomId, name, ...rest} = updateCatDto;
        const errorMessages: string[] = [];

        const cat = await this.catsRepository.findOneBy({id});
        if (!cat) errorMessages.push(`Cat with ID ${id} not found`);

        if (name) {
            const currentCat = await this.catsRepository.findOneBy({name});
            if (!!currentCat && currentCat?.id !== cat?.id) {
                errorMessages.push(`Cat with name ${name} already exists`);
            }
        }

        if (roomId) {
            const room = await this.roomsRepository.findOneBy({id: roomId});
            if (!room) errorMessages.push(`Room with ID ${roomId} not found`);
        }

        if (mealIds?.length) {
            const mealsCount = await this.mealsRepository.countBy({id: In(mealIds)});
            if (mealsCount !== mealIds.length) errorMessages.push(`Some meals not found`);
        }

        if (errorMessages.length) throw new BadRequestException(errorMessages);

        return await this.catsRepository.save({
            ...cat,
            ...rest,
            ...(!!name && {name}),
            ...(mealIds && {meals: mealIds.map(id => ({id}))}),
            ...(roomId && {room: {id: roomId}})
        });
    }

    public async remove(id: number): Promise<void> {
        const result = await this.catsRepository.delete(id);
        if (!result.affected) throw new NotFoundException(`Cat with ID ${id} not found`);
    }
}
