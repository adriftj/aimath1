import { useState } from 'react';
import { TopicList } from './components/TopicList';
import { TopicContent } from './components/TopicContent';
import { TopicManage } from './components/TopicManage';
import { type Topic } from './api/topics';
import './App.css';

type ViewMode = 'learn' | 'manage';

function App() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('learn');

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-header-tabs">
          <button
            className={`tab-button ${viewMode === 'learn' ? 'active' : ''}`}
            onClick={() => setViewMode('learn')}
          >
            学习模式
          </button>
          <button
            className={`tab-button ${viewMode === 'manage' ? 'active' : ''}`}
            onClick={() => setViewMode('manage')}
          >
            专题管理
          </button>
        </div>
      </div>
      {viewMode === 'learn' ? (
        <div className="app-content">
          <div className="app-sidebar">
            <TopicList onTopicSelect={setSelectedTopic} />
          </div>
          <div className="app-main">
            <TopicContent topic={selectedTopic} />
          </div>
        </div>
      ) : (
        <div className="app-manage">
          <TopicManage />
        </div>
      )}
    </div>
  );
}

export default App;
