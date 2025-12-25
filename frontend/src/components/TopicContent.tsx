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
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [exampleContent, setExampleContent] = useState('');
  const [aiProvider, setAiProvider] = useState<'deepseek' | 'gemini'>('deepseek');

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

  const handleGenerateQuestionClick = () => {
    setShowExampleModal(true);
    setExampleContent('');
  };

  const handleModalConfirm = async () => {
    if (!topic) return;
    setShowExampleModal(false);
    try {
      setGenerating(true);
      const newQuestion = await questionsApi.generate({
        topicId: topic.id,
        topicContent: topic.content,
        exampleContent: exampleContent.trim(),
        aiProvider: aiProvider,
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
      setExampleContent('');
    }
  };

  const handleModalCancel = () => {
    setShowExampleModal(false);
    setExampleContent('');
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
        <div className="generate-controls">
          <select
            className="ai-provider-select"
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value as 'deepseek' | 'gemini')}
            disabled={generating}
          >
            <option value="deepseek">DeepSeek</option>
            <option value="gemini">Gemini</option>
          </select>
          <button
            className="generate-button"
            onClick={handleGenerateQuestionClick}
            disabled={generating}
          >
            {generating ? '生成中...' : '出个题给我做做'}
          </button>
        </div>
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

      {showExampleModal && (
        <div className="modal-overlay" onClick={handleModalCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>输入例题</h2>
              <button className="modal-close" onClick={handleModalCancel}>×</button>
            </div>
            <div className="modal-body">
              <label className="modal-label">
                请输入一道与专题相关的例题（包含题目和解题方法）：
              </label>
              <textarea
                className="modal-textarea"
                value={exampleContent}
                onChange={(e) => setExampleContent(e.target.value)}
                placeholder={`例如：
题目：求解方程 $x^2 + 2x - 3 = 0$

解题方法：
使用配方法，将方程化为 $(x+1)^2 = 4$，然后开平方得到 $x+1 = \\pm 2$，所以 $x = 1$ 或 $x = -3$。`}
                rows={12}
              />
            </div>
            <div className="modal-footer">
              <button className="modal-button modal-button-cancel" onClick={handleModalCancel}>
                取消
              </button>
              <button className="modal-button modal-button-confirm" onClick={handleModalConfirm}>
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

