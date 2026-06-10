import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Cat} from '@/features/cats/entities/cat.entity';
import {IRoomObjects, RoomObjects} from './types';

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Column({unique: true})
    public name: string;

    @Column({type: 'set', enum: Object.values<IRoomObjects>(RoomObjects), default: []})
    public objects: IRoomObjects[];

    @OneToMany(() => Cat, cat => cat.room, {cascade: true})
    public cats: Cat[];
}
