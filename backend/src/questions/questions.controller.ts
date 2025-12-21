import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { GenerateQuestionDto } from './dto/generate-question.dto';

@Controller('questions')
export class QuestionsController {
  private readonly logger = new Logger(QuestionsController.name);

  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(@Query('topicId') topicId?: string) {
    const topicIdNum = topicId ? parseInt(topicId, 10) : undefined;
    return this.questionsService.findAll(topicIdNum);
  }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generateQuestion(@Body() generateQuestionDto: GenerateQuestionDto) {
    this.logger.log(`收到生成题目请求: topicId=${generateQuestionDto.topicId}, topicContent长度=${generateQuestionDto.topicContent?.length || 0}`);
    
    try {
      const question = await this.questionsService.generateQuestion(generateQuestionDto);
      this.logger.log(`题目生成成功: id=${question.id}, question长度=${question.question?.length || 0}, answer长度=${question.answer?.length || 0}`);
      this.logger.debug(`返回的题目数据: ${JSON.stringify(question, null, 2)}`);
      return question;
    } catch (error) {
      this.logger.error(`生成题目失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}

