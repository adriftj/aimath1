import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Topic } from '../../topics/entities/topic.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  topicId: number;

  @ManyToOne(() => Topic, (topic) => topic.questions)
  @JoinColumn({ name: 'topicId' })
  topic: Topic;

  @Column('text')
  question: string;

  @Column('text')
  answer: string;

  @CreateDateColumn()
  createdAt: Date;
}


