import { useState, useEffect } from 'react';
import { topicsApi, type Topic } from '../api/topics';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './TopicManage.css';

export function TopicManage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    order: 0,
  });

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const data = await topicsApi.getAll();
      setTopics(data);
    } catch (error) {
      console.error('获取专题列表失败:', error);
      alert('获取专题列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await topicsApi.create(formData);
      alert('创建成功');
      setShowCreateForm(false);
      setFormData({ title: '', content: '', order: 0 });
      loadTopics();
    } catch (error: any) {
      console.error('创建失败:', error);
      alert(`创建失败: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!editingTopic) return;
    try {
      await topicsApi.update(editingTopic.id, formData);
      alert('更新成功');
      setEditingTopic(null);
      setFormData({ title: '', content: '', order: 0 });
      loadTopics();
    } catch (error: any) {
      console.error('更新失败:', error);
      alert(`更新失败: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个专题吗？')) return;
    try {
      await topicsApi.delete(id);
      alert('删除成功');
      loadTopics();
    } catch (error: any) {
      console.error('删除失败:', error);
      alert(`删除失败: ${error.response?.data?.message || error.message}`);
    }
  };

  const startEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      content: topic.content,
      order: topic.order,
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingTopic(null);
    setShowCreateForm(false);
    setFormData({ title: '', content: '', order: 0 });
  };

  return (
    <div className="topic-manage">
      <div className="topic-manage-header">
        <h1>专题管理</h1>
        <button
          className="btn-create"
          onClick={() => {
            setShowCreateForm(true);
            setEditingTopic(null);
            setFormData({ title: '', content: '', order: 0 });
          }}
        >
          创建新专题
        </button>
      </div>

      {(showCreateForm || editingTopic) && (
        <div className="topic-form">
          <h2>{editingTopic ? '编辑专题' : '创建专题'}</h2>
          <div className="form-group">
            <label>标题：</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="专题标题"
            />
          </div>
          <div className="form-group">
            <label>排序：</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>内容（Markdown格式）：</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="专题内容，支持Markdown和LaTeX公式"
              rows={15}
            />
          </div>
          <div className="form-actions">
            <button
              className="btn-save"
              onClick={editingTopic ? handleUpdate : handleCreate}
            >
              {editingTopic ? '保存' : '创建'}
            </button>
            <button className="btn-cancel" onClick={cancelEdit}>
              取消
            </button>
          </div>
        </div>
      )}

      <div className="topics-list">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <table className="topics-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>标题</th>
                <th>排序</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.id}>
                  <td>{topic.id}</td>
                  <td>{topic.title}</td>
                  <td>{topic.order}</td>
                  <td>{new Date(topic.createdAt).toLocaleString('zh-CN')}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => startEdit(topic)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(topic.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


