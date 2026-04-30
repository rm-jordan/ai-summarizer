import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SummarizeRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  text: string;
}
