import {ArrayUnique, IsArray, IsIn, IsNotEmpty, IsString, MinLength} from 'class-validator';
import {IRoomObjects, RoomObjects} from '../entities/types';

export class CreateRoomDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    public name: string;

    @IsArray()
    @ArrayUnique()
    @IsIn(Object.values(RoomObjects), {each: true})
    public objects: IRoomObjects[];
}
