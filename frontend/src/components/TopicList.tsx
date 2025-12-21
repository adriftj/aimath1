import { useEffect, useState } from 'react';
import { topicsApi, type Topic } from '../api/topics';
import './TopicList.css';

interface TopicListProps {
  onTopicSelect: (topic: Topic) => void;
}

export function TopicList({ onTopicSelect }: TopicListProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await topicsApi.getAll();
        setTopics(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
          onTopicSelect(data[0]);
        }
      } catch (error) {
        console.error('获取专题列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTopicClick = (topic: Topic) => {
    setSelectedId(topic.id);
    onTopicSelect(topic);
  };

  if (loading) {
    return <div className="topic-list-loading">加载中...</div>;
  }

  return (
    <div className="topic-list">
      <h2 className="topic-list-title">数学专题</h2>
      <ul className="topic-list-items">
        {topics.map((topic) => (
          <li
            key={topic.id}
            className={`topic-item ${selectedId === topic.id ? 'selected' : ''}`}
            onClick={() => handleTopicClick(topic)}
          >
            {topic.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

