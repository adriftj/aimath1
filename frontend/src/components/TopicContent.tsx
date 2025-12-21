import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { type Topic } from '../api/topics';
import { questionsApi, type Question } from '../api/questions';
import { QuestionCard } from './QuestionCard';
import './TopicContent.css';

interface TopicContentProps {
  topic: Topic | null;
}

export function TopicContent({ topic }: TopicContentProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (topic) {
      loadQuestions();
    } else {
      setQuestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  const loadQuestions = async () => {
    if (!topic) return;
    try {
      setLoading(true);
      const data = await questionsApi.getByTopicId(topic.id);
      setQuestions(data);
    } catch (error) {
      console.error('获取题目列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestion = async () => {
    if (!topic) return;
    try {
      setGenerating(true);
      const newQuestion = await questionsApi.generate({
        topicId: topic.id,
        topicContent: topic.content,
      });
      console.log('生成的题目:', newQuestion);
      if (newQuestion && newQuestion.id) {
        setQuestions((prev) => [newQuestion, ...prev]);
      } else {
        console.error('返回的题目数据无效:', newQuestion);
        alert('生成题目失败：返回数据无效');
      }
    } catch (error: any) {
      console.error('生成题目失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '未知错误';
      alert(`生成题目失败：${errorMessage}`);
    } finally {
      setGenerating(false);
    }
  };

  if (!topic) {
    return (
      <div className="topic-content">
        <div className="topic-content-empty">请选择一个专题</div>
      </div>
    );
  }

  return (
    <div className="topic-content">
      <div className="topic-content-header">
        <h1 className="topic-title">{topic.title}</h1>
        <button
          className="generate-button"
          onClick={handleGenerateQuestion}
          disabled={generating}
        >
          {generating ? '生成中...' : '出个题给我做做'}
        </button>
      </div>
      <div className="topic-content-body">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {topic.content}
        </ReactMarkdown>
      </div>
      <div className="questions-section">
        {loading ? (
          <div className="loading">加载题目中...</div>
        ) : (
          questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))
        )}
      </div>
    </div>
  );
}

