import {IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength} from 'class-validator';

export class CreateMealDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    public name: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    public description?: string | null;

    @IsBoolean()
    public isVegan: boolean;
}
