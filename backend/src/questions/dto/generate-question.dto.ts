import { IsNumber, IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

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

  @IsString()
  @IsOptional()
  @IsIn(['deepseek', 'gemini'])
  aiProvider?: 'deepseek' | 'gemini';
}


