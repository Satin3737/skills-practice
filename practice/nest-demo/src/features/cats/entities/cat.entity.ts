import {Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Meal} from '@/features/meals/entities/meal.entity';
import {Room} from '@/features/rooms/entities/room.entity';

@Entity()
export class Cat {
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Column({unique: true})
    public name: string;

    @Column()
    public age: number;

    @Column({type: 'varchar', nullable: true})
    public description: string | null;

    @Column({default: false})
    public isHungary: boolean;

    @ManyToMany(() => Meal, {onDelete: 'CASCADE'})
    @JoinTable()
    public meals: Meal[];

    @ManyToOne(() => Room, room => room.cats)
    public room: Room;
}
