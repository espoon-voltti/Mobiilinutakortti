import { Junior } from '../entities';
import { formatName } from '../junior.helper';

export class JuniorUserViewModel {
    id: string;
    phoneNumber: string;
    displayName: string;
    firstName: string;
    lastName: string;
    nickName: string;
    postCode: string;
    parentsName: string;
    parentsPhoneNumber: string;
    gender: string;
    birthday: string;
    homeYouthClub: string;

    constructor(entity: Junior) {
        this.id = entity.id;
        this.firstName = entity.firstName;
        this.lastName = entity.lastName;
        this.nickName = entity.nickName;
        this.phoneNumber = entity.phoneNumber;
        this.parentsName = entity.parentsName;
        this.postCode = entity.postCode;
        this.parentsPhoneNumber = entity.parentsPhoneNumber;
        this.gender = entity.gender;
        this.homeYouthClub = entity.homeYouthClub;
        this.birthday = entity.birthday;
        this.displayName = formatName(entity.firstName, entity.lastName, entity.nickName);
    }
}
