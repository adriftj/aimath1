import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { type Question } from '../api/questions';
import './QuestionCard.css';

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="question-card">
      <div className="question-content">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {question.question}
        </ReactMarkdown>
      </div>
      <div className="answer-toggle" onClick={() => setShowAnswer(!showAnswer)}>
        {showAnswer ? '隐藏答案' : '显示答案'}
      </div>
      {showAnswer && (
        <div className="answer-content">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {question.answer}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

