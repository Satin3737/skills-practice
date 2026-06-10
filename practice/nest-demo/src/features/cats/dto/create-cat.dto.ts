import {IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MinLength} from 'class-validator';

export class CreateCatDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    public name: string;

    @IsInt()
    @IsPositive()
    public age: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    public description?: string | null;

    @IsBoolean()
    public isHungary: boolean;

    @IsArray()
    @IsInt({each: true})
    @IsPositive({each: true})
    public mealIds: number[];

    @IsInt()
    @IsPositive()
    public roomId: number;
}
