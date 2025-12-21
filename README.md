# 数学AI辅助学习系统

一个基于NestJS后端和React前端的数学AI辅助学习单页应用，支持专题管理、Markdown+LaTeX内容展示、DeepSeek API出题和答案显示/隐藏功能。

## 技术栈

- **后端**: NestJS + TypeORM + SQLite
- **前端**: React + TypeScript + Vite
- **Markdown渲染**: react-markdown
- **LaTeX渲染**: KaTeX
- **AI服务**: DeepSeek API / Google Gemini API（可通过代理访问）

## 项目结构

```
jbemath/
├── backend/          # NestJS后端
│   ├── src/
│   │   ├── topics/   # 专题模块
│   │   ├── questions/ # 题目模块
│   │   ├── ai/       # AI服务集成（支持DeepSeek和Gemini）
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── frontend/         # React前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopicList.tsx      # 左栏专题列表
│   │   │   ├── TopicContent.tsx   # 右栏内容展示
│   │   │   └── QuestionCard.tsx   # 题目卡片组件
│   │   ├── api/      # API调用封装
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## 环境配置

### 后端环境变量

在 `backend` 目录下创建 `.env` 文件：

```env
# AI提供商选择: deepseek 或 gemini (默认: deepseek)
AI_PROVIDER=deepseek

# DeepSeek API配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Gemini API配置（使用Gemini时需要）
GEMINI_API_KEY=your_gemini_api_key_here
# Gemini模型名称（可选，默认: gemini-1.5-flash）
# 可选值: gemini-1.5-flash, gemini-1.5-pro, gemini-3-pro 等
GEMINI_MODEL=gemini-3-pro

# 代理配置（Gemini需要通过代理访问时使用，默认: http://127.0.0.1:1080）
PROXY_URL=http://127.0.0.1:1080

# 服务器端口
PORT=7000
```

### 前端配置

前端API基础URL配置在 `frontend/src/api/config.ts`，默认指向 `http://localhost:7000/api`。

## 安装和运行

### 后端

```bash
cd backend
npm install

# 配置环境变量（创建.env文件，设置DEEPSEEK_API_KEY）
# 然后运行初始化脚本添加示例专题数据（可选）
npm run init:topics

# 启动开发服务器
npm run start:dev
```

后端服务将在 `http://localhost:7000` 启动。

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端应用将在 `http://localhost:7001` 启动。

## 功能特性

1. **专题管理**
   - 左栏显示专题列表
   - 点击专题在右栏显示内容
   - 默认选中第一个专题

2. **内容展示**
   - 支持Markdown格式
   - 支持行内LaTeX公式（$...$）
   - 支持多行LaTeX公式（$$...$$）

3. **AI出题**
   - 点击"出个题给我做做"按钮
   - 调用AI服务（DeepSeek或Gemini）生成题目
   - 题目显示在内容下方，按钮自动移动到最后
   - 可以多次点击生成多道题目
   - 支持通过环境变量切换AI提供商

4. **答案显示/隐藏**
   - 每道题下方有"显示答案"链接
   - 点击后显示答案，链接变为"隐藏答案"
   - 再次点击可隐藏答案

## API接口

### 专题接口

- `GET /api/topics` - 获取所有专题列表
- `GET /api/topics/:id` - 获取专题详情
- `POST /api/topics` - 创建专题
- `PATCH /api/topics/:id` - 更新专题
- `DELETE /api/topics/:id` - 删除专题

### 题目接口

- `GET /api/questions?topicId=xxx` - 获取某专题的题目列表
- `POST /api/questions/generate` - 生成题目
  - 请求体: `{ topicId: number, topicContent: string }`

## 数据库

使用SQLite数据库，数据库文件为 `backend/math_learning.db`。

### Topic（专题）表
- id: number (主键)
- title: string (专题标题)
- content: text (Markdown格式内容)
- order: number (排序顺序)
- createdAt: datetime
- updatedAt: datetime

### Question（题目）表
- id: number (主键)
- topicId: number (外键，关联Topic)
- question: text (题目内容，Markdown格式)
- answer: text (答案内容，Markdown格式)
- createdAt: datetime

## 注意事项

1. 首次运行前需要配置AI API密钥：
   - 使用DeepSeek：设置 `DEEPSEEK_API_KEY`
   - 使用Gemini：设置 `GEMINI_API_KEY` 和 `AI_PROVIDER=gemini`
2. Gemini API需要通过代理访问时，设置 `PROXY_URL`（默认：`http://127.0.0.1:1080`）
3. 数据库会在首次运行时自动创建
4. 可以通过API接口创建和管理专题数据
5. 题目生成需要调用AI API，请确保网络连接正常（Gemini需要代理）

