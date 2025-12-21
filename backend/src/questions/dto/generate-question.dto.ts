import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class GenerateQuestionDto {
  @IsNumber()
  @IsNotEmpty()
  topicId: number;

  @IsString()
  @IsNotEmpty()
  topicContent: string;
}

