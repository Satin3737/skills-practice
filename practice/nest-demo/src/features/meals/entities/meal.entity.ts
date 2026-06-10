import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Meal {
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Column({unique: true})
    public name: string;

    @Column({type: 'varchar', nullable: true})
    public description: string | null;

    @Column()
    public isVegan: boolean;
}
