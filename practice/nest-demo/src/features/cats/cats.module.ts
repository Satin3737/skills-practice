import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Meal} from '@/features/meals/entities/meal.entity';
import {Room} from '@/features/rooms/entities/room.entity';
import {CatsController} from './cats.controller';
import {CatsService} from './cats.service';
import {Cat} from './entities/cat.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Cat, Room, Meal])],
    controllers: [CatsController],
    providers: [CatsService]
})
export class CatsModule {}
