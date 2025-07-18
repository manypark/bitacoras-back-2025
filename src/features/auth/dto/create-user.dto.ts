import { IsBoolean, IsDate, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateAuthDto {

    @IsString()
    @MinLength(4)
    @MaxLength(50)
    firstName:string;

    @IsString()
    @MinLength(4)
    @MaxLength(50)
    lastName:string;
    
    @IsEmail()
    email:string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password:string;

    @IsBoolean()
    @IsOptional()
    active:boolean;

    @IsDate()
    @IsOptional()
    lastLogin:Date;

    @IsString()
    @IsOptional()
    avatarUrl:string;
    
}
