import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {DbModule} from '@/database/db.module';
import {CatsModule} from '@/features/cats/cats.module';
import {MealsModule} from '@/features/meals/meals.module';
import {RoomsModule} from '@/features/rooms/rooms.module';

@Module({
    imports: [ConfigModule.forRoot({isGlobal: true}), DbModule, CatsModule, RoomsModule, MealsModule]
})
export class AppModule {}
