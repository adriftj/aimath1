import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as dotenv from 'dotenv';

dotenv.config();

type AiProvider = 'deepseek' | 'gemini';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: AiProvider;
  private readonly deepseekApiKey: string;
  private readonly geminiApiKey: string;
  private readonly geminiModel: string;
  private readonly deepseekApiUrl = 'https://api.deepseek.com/v1/chat/completions';
  private readonly geminiApiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private readonly proxyAgent: HttpsProxyAgent<string> | null;
  private readonly axiosInstance: AxiosInstance;
  private readonly geminiAxiosInstance: AxiosInstance;

  constructor() {
    // 确定使用的AI提供商（默认使用deepseek）
    this.provider = (process.env.AI_PROVIDER as AiProvider) || 'deepseek';
    
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || '';
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    // Gemini模型名称（默认：gemini-1.5-flash，可选：gemini-1.5-pro, gemini-2.5-flash, gemini-3-pro等）
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-pro';

    // 配置代理（用于Gemini和DeepSeek）
    const proxyUrl = process.env.PROXY_URL || 'http://127.0.0.1:1080';
    this.proxyAgent = new HttpsProxyAgent(proxyUrl);

    // 创建axios实例（用于DeepSeek，也使用代理）
    this.axiosInstance = axios.create({
      timeout: 300000, // 300秒（5分钟）超时，DeepSeek API可能需要更长时间
      responseType: 'json', // 明确指定响应类型为JSON
      httpsAgent: this.proxyAgent, // 使用代理访问DeepSeek API
      proxy: false, // 使用agent而不是proxy配置
    });

    // 创建Gemini专用的axios实例（带代理）- 总是创建，以支持运行时切换
    this.geminiAxiosInstance = axios.create({
      timeout: 300000, // 300秒（5分钟）超时
      httpsAgent: this.proxyAgent || undefined,
      proxy: false, // 使用agent而不是proxy配置
    });

    // 验证API密钥（仅在默认provider时验证，运行时切换时再验证）
    if (this.provider === 'deepseek' && !this.deepseekApiKey) {
      this.logger.warn('DEEPSEEK_API_KEY is not set in environment variables');
    }
    if (this.provider === 'gemini' && !this.geminiApiKey) {
      this.logger.warn('GEMINI_API_KEY is not set in environment variables');
    }

    this.logger.log(`AiService初始化完成，使用提供商: ${this.provider}`);
    if (this.provider === 'gemini') {
      this.logger.log(`Gemini模型: ${this.geminiModel}`);
    }
    this.logger.log(`代理配置: ${proxyUrl}`);
  }

  async generateQuestion(topicContent: string, exampleContent?: string, provider?: AiProvider): Promise<{ question: string; answer: string }> {
    const selectedProvider = provider || this.provider;
    
    // 验证所选provider的API密钥
    if (selectedProvider === 'deepseek' && !this.deepseekApiKey) {
      throw new HttpException('DEEPSEEK_API_KEY is not set', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (selectedProvider === 'gemini' && !this.geminiApiKey) {
      throw new HttpException('GEMINI_API_KEY is not set', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (selectedProvider === 'gemini') {
      return this.generateQuestionWithGemini(topicContent, exampleContent);
    } else {
      return this.generateQuestionWithDeepSeek(topicContent, exampleContent);
    }
  }

  /**
   * 生成AI提示词
   * @param topicContent 专题内容
   * @param exampleContent 可选的例题内容
   * @returns 生成的提示词
   */
  private buildPrompt(topicContent: string, exampleContent?: string): string {
    let prompt = `请生成一道可使用以下方法解决的的数学题目。

方法说明：
${topicContent}`;

    if (exampleContent && exampleContent.trim()) {
      prompt += `

参考例题：
${exampleContent.trim()}

请根据参考例题中使用的解题方法，生成一道使用相同或类似解题方法的题目。`;
    }

    prompt += `

要求：
1. 题目应该与专题内容相关，难度适中${exampleContent && exampleContent.trim() ? '，并且与参考例题的解题方法一致' : ''}
2. 题目使用Markdown格式，数学公式必须使用标准的LaTeX格式：
   - 行内公式：使用 $...$ 格式（例如：$x^2 + y^2 = r^2$）
   - 多行公式：使用 $$...$$ 格式（例如：$$\\int_a^b f(x)dx$$）
   - 重要：不要使用 (...) 或 [...] 等其他格式，必须使用 $ 和 $$ 符号
3. 答案也要使用Markdown格式，数学公式同样必须使用标准的LaTeX格式（$...$ 和 $$...$$）
4. 请按照以下格式返回：
题目：[题目内容]
答案：[答案内容]

请确保题目和答案都是完整的，可以直接使用。`;

    return prompt;
  }

  private async generateQuestionWithDeepSeek(topicContent: string, exampleContent?: string): Promise<{ question: string; answer: string }> {
    this.logger.log(`开始调用DeepSeek API，topicContent长度: ${topicContent?.length || 0}, exampleContent长度: ${exampleContent?.length || 0}`);
    
    const prompt = this.buildPrompt(topicContent, exampleContent);

    try {
      this.logger.log(`发送请求到DeepSeek API: ${this.deepseekApiUrl}`);
      const requestBody = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        stream: false, // 明确禁用流式响应
      };
      this.logger.debug(`请求体大小: ${JSON.stringify(requestBody).length} 字符`);
      
      const response = await this.axiosInstance.post(
        this.deepseekApiUrl,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.deepseekApiKey}`,
          },
          timeout: 300000, // 5分钟超时
        },
      );

      this.logger.log(`DeepSeek API响应状态: ${response.status}`);
      this.logger.debug(`DeepSeek API响应数据类型: ${typeof response.data}`);
      this.logger.debug(`DeepSeek API响应数据: ${JSON.stringify(response.data, null, 2)}`);

      // 检查响应数据格式
      if (!response.data || typeof response.data !== 'object') {
        this.logger.error(`DeepSeek API响应数据格式错误: ${typeof response.data}`);
        this.logger.error(`响应数据: ${response.data}`);
        throw new HttpException('AI返回数据格式错误', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const content = response.data.choices?.[0]?.message?.content;
      if (!content) {
        this.logger.error('AI返回内容为空');
        this.logger.error(`响应数据结构: ${JSON.stringify(response.data, null, 2)}`);
        throw new HttpException('AI返回内容为空', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return this.parseQuestionAnswer(content);
    } catch (error: any) {
      return this.handleError(error, 'DeepSeek');
    }
  }

  private async generateQuestionWithGemini(topicContent: string, exampleContent?: string): Promise<{ question: string; answer: string }> {
    this.logger.log(`开始调用Gemini API，topicContent长度: ${topicContent?.length || 0}, exampleContent长度: ${exampleContent?.length || 0}`);
    
    const prompt = this.buildPrompt(topicContent, exampleContent);

    try {
      // 使用正确的API端点格式
      const geminiApiUrl = `${this.geminiApiBaseUrl}/${this.geminiModel}:generateContent`;
      const url = `${geminiApiUrl}?key=${this.geminiApiKey}`;
      this.logger.log(`发送请求到Gemini API，模型: ${this.geminiModel}`);

      const response = await this.geminiAxiosInstance.post(
        url,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192, // 增加最大输出token数，避免截断（gemini-2.5-pro等模型需要更多token）
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Gemini API响应状态: ${response.status}`);
      this.logger.debug(`Gemini API响应数据: ${JSON.stringify(response.data, null, 2)}`);

      // 检查finishReason
      const finishReason = response.data.candidates?.[0]?.finishReason;
      if (finishReason === 'MAX_TOKENS') {
        this.logger.warn('Gemini响应被截断（达到最大token限制），尝试增加maxOutputTokens');
      }

      // 尝试多种方式获取内容
      let content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      // 如果没有找到，尝试其他可能的响应结构
      if (!content && response.data.candidates?.[0]?.content) {
        const candidateContent = response.data.candidates[0].content;
        // 检查是否有text字段直接存在
        if (candidateContent.text) {
          content = candidateContent.text;
        } else if (Array.isArray(candidateContent.parts)) {
          // 遍历parts数组查找text
          for (const part of candidateContent.parts) {
            if (part.text) {
              content = part.text;
              break;
            }
          }
        }
      }

      if (!content) {
        this.logger.error('Gemini返回内容为空');
        this.logger.error(`响应数据: ${JSON.stringify(response.data)}`);
        this.logger.error(`finishReason: ${finishReason}`);
        throw new HttpException('AI返回内容为空', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return this.parseQuestionAnswer(content);
    } catch (error: any) {
      return this.handleError(error, 'Gemini');
    }
  }

  private parseQuestionAnswer(content: string): { question: string; answer: string } {
    this.logger.log(`AI返回内容长度: ${content.length}`);

    // 解析返回内容，提取题目和答案
    const questionMatch = content.match(/题目[：:]\s*([\s\S]*?)(?=答案[：:]|$)/);
    const answerMatch = content.match(/答案[：:]\s*([\s\S]*?)$/);

    const question = questionMatch ? questionMatch[1].trim() : content;
    const answer = answerMatch ? answerMatch[1].trim() : '';

    this.logger.log(`解析结果 - 题目长度: ${question.length}, 答案长度: ${answer.length}`);

    if (!question) {
      this.logger.error('无法解析题目内容');
      throw new HttpException('无法解析题目内容', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const result = {
      question,
      answer: answer || '暂无答案',
    };
    
    this.logger.log(`AI服务返回成功，题目长度: ${result.question.length}, 答案长度: ${result.answer.length}`);
    return result;
  }

  private handleError(error: any, provider: string): never {
    if (error instanceof HttpException) {
      this.logger.error(`HttpException: ${error.message}`);
      throw error;
    }
    
    // 处理超时错误
    if (error.code === 'ECONNABORTED' || error.message?.includes('aborted') || error.message?.includes('timeout')) {
      this.logger.error(`${provider} API调用超时`);
      throw new HttpException(
        'AI服务调用超时，请稍后重试',
        HttpStatus.REQUEST_TIMEOUT,
      );
    }
    
    this.logger.error(`${provider} API调用失败: ${error.message}`, error.stack);
    if (error.response) {
      this.logger.error(`API响应错误: ${JSON.stringify(error.response.data)}`);
      this.logger.error(`API响应状态: ${error.response.status}`);
      this.logger.error(`请求URL: ${error.config?.url || 'unknown'}`);
    }
    if (error.request) {
      this.logger.error(`请求URL: ${error.config?.url || 'unknown'}`);
      this.logger.error(`请求方法: ${error.config?.method || 'unknown'}`);
    }
    
    throw new HttpException(
      `AI服务调用失败: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
