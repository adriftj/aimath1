import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private topicsRepository: Repository<Topic>,
  ) {}

  async create(createTopicDto: CreateTopicDto): Promise<Topic> {
    const topic = this.topicsRepository.create(createTopicDto);
    return await this.topicsRepository.save(topic);
  }

  async findAll(): Promise<Topic[]> {
    return await this.topicsRepository.find({
      order: { order: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Topic> {
    const topic = await this.topicsRepository.findOne({ where: { id } });
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    return topic;
  }

  async update(id: number, updateTopicDto: UpdateTopicDto): Promise<Topic> {
    const topic = await this.findOne(id);
    Object.assign(topic, updateTopicDto);
    return await this.topicsRepository.save(topic);
  }

  async remove(id: number): Promise<void> {
    const topic = await this.findOne(id);
    await this.topicsRepository.remove(topic);
  }
}


