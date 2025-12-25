import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GenerateQuestionDto {
  @IsNumber()
  @IsNotEmpty()
  topicId: number;

  @IsString()
  @IsNotEmpty()
  topicContent: string;

  @IsString()
  @IsOptional()
  exampleContent?: string;
}


