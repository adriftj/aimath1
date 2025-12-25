import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicsModule } from './topics/topics.module';
import { QuestionsModule } from './questions/questions.module';
import { AiModule } from './ai/ai.module';
import { Topic } from './topics/entities/topic.entity';
import { Question } from './questions/entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'math_learning.db',
      entities: [Topic, Question],
      synchronize: true, // 开发环境自动同步数据库结构
    }),
    TopicsModule,
    QuestionsModule,
    AiModule,
  ],
})
export class AppModule {}


