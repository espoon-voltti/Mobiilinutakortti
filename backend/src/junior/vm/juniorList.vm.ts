import {JuniorUserViewModel} from './index';

export class JuniorListViewModel {
  juniors: JuniorUserViewModel[];
  totalCount: number;

  constructor(juniors: JuniorUserViewModel[], totalCount: number) {
    this.juniors = juniors;
    this.totalCount = totalCount;
  }
}