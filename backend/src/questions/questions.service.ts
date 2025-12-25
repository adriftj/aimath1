import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { AiService } from '../ai/ai.service';
import { TopicsService } from '../topics/topics.service';
import { GenerateQuestionDto } from './dto/generate-question.dto';

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    private aiService: AiService,
    private topicsService: TopicsService,
  ) {}

  async findAll(topicId?: number): Promise<Question[]> {
    const where = topicId ? { topicId } : {};
    return await this.questionsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async generateQuestion(generateQuestionDto: GenerateQuestionDto): Promise<Question> {
    this.logger.log(`开始生成题目，topicId: ${generateQuestionDto.topicId}`);
    
    // 验证专题是否存在
    this.logger.log('验证专题是否存在...');
    const topic = await this.topicsService.findOne(generateQuestionDto.topicId);
    this.logger.log(`专题验证成功: ${topic.title}`);

    // 调用AI服务生成题目
    this.logger.log(`调用AI服务生成题目...，使用AI引擎: ${generateQuestionDto.aiProvider || '默认'}`);
    const { question, answer } = await this.aiService.generateQuestion(
      generateQuestionDto.topicContent,
      generateQuestionDto.exampleContent,
      generateQuestionDto.aiProvider,
    );
    this.logger.log(`AI返回题目长度: ${question?.length || 0}, 答案长度: ${answer?.length || 0}`);

    // 保存题目到数据库
    this.logger.log('保存题目到数据库...');
    const newQuestion = this.questionsRepository.create({
      topicId: generateQuestionDto.topicId,
      question,
      answer,
    });

    const savedQuestion = await this.questionsRepository.save(newQuestion);
    this.logger.log(`题目保存成功，ID: ${savedQuestion.id}`);
    
    // 确保返回的对象不包含topic关系，避免序列化问题
    const result = {
      id: savedQuestion.id,
      topicId: savedQuestion.topicId,
      question: savedQuestion.question,
      answer: savedQuestion.answer,
      createdAt: savedQuestion.createdAt,
    } as Question;
    
    this.logger.log(`准备返回结果，result.id=${result.id}, result.question长度=${result.question?.length || 0}`);
    return result;
  }
}

