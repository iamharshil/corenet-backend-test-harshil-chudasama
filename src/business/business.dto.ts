import {
  IsEmail,
  IsInt,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class RegisterBusinessDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  mobile: string;
  @IsString()
  @MinLength(6, { message: 'password must be at least 6 characters' })
  password: string;
}

export class LoginBusinessDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}

export class UpdateProfileDto {
  @IsString()
  name: string;
  @IsString()
  mobile: string;
}

export class CreateServiceDto {
  @IsString()
  name: string;
  @IsString()
  description: string;
  @IsInt()
  @Min(1, { message: 'duration must be at least 1 minute' })
  duration: number;
  @IsNumber()
  @Min(0, { message: 'price can not be negative' })
  price: number;
}

export class CreateAvailabilityDto {
  @IsInt()
  @Min(0, { message: 'day must be 0 (monday) to 6 (sunday)' })
  @Max(6, { message: 'day must be 0 (monday) to 6 (sunday)' })
  day: number;
  @Matches(/^\d{2}:\d{2}$/, { message: 'startsAt must be in HH:MM format' })
  startsAt: string;
  @Matches(/^\d{2}:\d{2}$/, { message: 'endsAt must be in HH:MM format' })
  endsAt: string;
}
