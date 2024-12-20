import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckIn, Club } from './entities';
import { LessThan, Repository } from 'typeorm';
import { Junior } from '../junior/entities';
import { ClubViewModel, LogBookViewModel } from './vm';
import * as content from '../content';
import { CheckInDto, LogBookDto } from './dto';
import * as ageRanges from './logbookAgeRanges.json';
import { Gender } from '../utils/constants';
import { Cron } from '@nestjs/schedule';
import { differenceInHours, sub } from 'date-fns';

@Injectable()
export class ClubService {

    private readonly logger = new Logger('Club Service');

    constructor(
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        @InjectRepository(CheckIn)
        private readonly checkInRepo: Repository<CheckIn>,
        @InjectRepository(Club)
        private readonly clubRepo: Repository<Club>,
    ) {}

    async getClubById(clubId: string): Promise<Club> {
        return await this.clubRepo.findOneBy({ id: clubId });
    }

    async getClubs(): Promise<ClubViewModel[]> {
        return (await this.clubRepo.find()).map(club => new ClubViewModel(club));
    }

    async checkIfAlreadyCheckedIn(juniorId: string, clubId: string): Promise<boolean> {
        const now = new Date();
        const checkIns = await this.getCheckinsForClub(clubId);
        return checkIns.some((checkIn) =>
            checkIn.junior.id === juniorId && differenceInHours(now, checkIn.checkInTime) < 2
        );
    }

    async getCheckinsForClub(clubId: string): Promise<CheckIn[]> {
        const club = await this.clubRepo.findOneBy({ id: clubId });
        if (!club) { throw new BadRequestException(content.ClubNotFound); }
        return await this.checkInRepo.find({ where: { club }, relations: ['club', 'junior'] });
    }

    async getCheckinsForClubForDate(logbookDetails: LogBookDto): Promise<CheckIn[]> {
        const startOfDay = new Date(logbookDetails.date).setHours(0, 0, 0, 0);
        const endOfDay = new Date(logbookDetails.date).setHours(23, 59, 59, 59);
        const clubCheckIns = (await this.getCheckinsForClub(logbookDetails.clubId))
            .filter(checkIn => (this.isBetween(new Date(checkIn.checkInTime).getTime(), startOfDay, endOfDay)) && checkIn.junior);
        if (clubCheckIns.length <= 0) { throw new BadRequestException(content.NoCheckins); }
        return clubCheckIns;
    }

    async checkInJunior(checkInData: CheckInDto): Promise<boolean> {
        const [junior, club] = await Promise.all([
            this.juniorRepo.findOneBy({ id: checkInData.juniorId }),
            this.clubRepo.findOneBy({ id: checkInData.clubId }),
        ]);
        if (!junior) { throw new BadRequestException(content.UserNotFound); }
        if (!club) { throw new BadRequestException(content.ClubNotFound); }
        await this.checkInRepo.save({ junior, club, checkInTime: new Date() });
        return true;
    }

    async generateLogBook(logbookDetails: LogBookDto): Promise<LogBookViewModel> {
        const checkIns = await this.getCheckinsForClubForDate(logbookDetails);
        const uniqueJuniors: Junior[] = [];
        checkIns.forEach(checkIn => {
            if (uniqueJuniors.findIndex(junior => junior && junior.id === checkIn.junior.id) < 0) {
                uniqueJuniors.push(checkIn.junior);
            }
        });

        // "Not disclosed" and "other" genders are combined for statistics.
        const byGender = {
            [Gender.Female]: [],
            [Gender.Male]: [],
            [Gender.Other]: [],
        };
        uniqueJuniors.forEach(junior => {
            const { gender } = junior;
            const key = gender === Gender.NotDisclosed ? Gender.Other : gender;
            byGender[key].push(junior);
        });
        const byGenderAndAge = Object.entries(byGender).reduce((result, [gender, juniors]) => ({
            ...result,
            [gender]: this.getAgesForLogBook(juniors.map(junior => new Date(junior.birthday))),
        }), {});

        return new LogBookViewModel(checkIns[0].club.name, byGenderAndAge);
    }

    private getAgesForLogBook(allJuniorAges: Date[]): Map<string, number> {
        const ages = new Map();
        const allJuniorAgesAsNumbers = allJuniorAges.map(age => this.getAgeFromDate(age));
        ageRanges.ranges.forEach(range => {
            const [min, max] = range.split('-');
            const total = allJuniorAgesAsNumbers.filter(a => this.isBetween(a, +min, +max)).length;
            ages.set(range, total);
        });
        return ages;
    }

    private getAgeFromDate(birthday: Date): number {
        const ageDateTime = new Date(Date.now() - birthday.setHours(0, 0, 0, 0));
        return Math.abs(ageDateTime.getUTCFullYear() - 1970);
    }

    private isBetween(value: number, min: number, max: number): boolean {
        return value <= max && value >= min;
    }

    // Delete checkins older than 14 days every night at 4 AM
    @Cron('0 4 * * *')
    async deleteOldCheckins(): Promise<void> {
        const cutoff = sub(new Date(), { days: 14 });
        const result = await this.checkInRepo.delete({ checkInTime: LessThan(cutoff) });
        this.logger.log(`Deleted ${result.affected} checkins that happened before ${cutoff.toISOString()}`);
    }

}
