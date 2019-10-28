import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { IsPhoneNumber, Length, IsPositive, IsMobilePhone } from 'class-validator';
import { jsonDataToNumber, makePhoneNumberInternational } from '../../common/transformers';
import { CheckIn } from '../../club/entities';

@Entity()
export class Junior {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @IsPhoneNumber('FI')
    @Column({ unique: true, transformer: makePhoneNumberInternational })
    phoneNumber: string;

    @Column()
    postCode: string;

    @Column()
    parentsName: string;

    @IsPhoneNumber('FI')
    @Column({ transformer: makePhoneNumberInternational })
    parentsPhoneNumber: string;

    @Column()
    @Length(1, 1)
    gender: string;

    @Column({ transformer: jsonDataToNumber })
    @IsPositive()
    age: number;

    @Column()
    homeYouthClub: string;

    @ManyToMany(type => CheckIn, checkIn => checkIn.dayTimeStamp)
    checkIns: CheckIn[];
}
