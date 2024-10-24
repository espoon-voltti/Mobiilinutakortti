import { IsEmail } from 'class-validator';

/**
 * The dto to be used when upserting user from the ad login.
 */
export class UpsertAdminByEmail {
  @IsEmail()
  email: string;

  firstName: string;

  lastName: string;
}
