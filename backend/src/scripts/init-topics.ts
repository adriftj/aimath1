import { DataSource } from 'typeorm';
import { Topic } from '../topics/entities/topic.entity';
import { Question } from '../questions/entities/question.entity';
import * as path from 'path';

const dataSource = new DataSource({
  type: 'sqlite',
  database: path.join(__dirname, '../../math_learning.db'),
  entities: [Topic, Question],
  synchronize: true,
});

async function initTopics() {
  await dataSource.initialize();

  const topicRepository = dataSource.getRepository(Topic);

  // 检查是否已有数据
  const count = await topicRepository.count();
  if (count > 0) {
    console.log('专题数据已存在，跳过初始化');
    await dataSource.destroy();
    return;
  }

  // 创建示例专题
  const topics = [
    {
      title: '一元二次方程',
      content: `# 一元二次方程

一元二次方程是形如 $ax^2 + bx + c = 0$ 的方程，其中 $a \\neq 0$。

## 求解方法

### 1. 因式分解法

如果方程可以因式分解，例如：

$$x^2 - 5x + 6 = 0$$

可以分解为：

$$(x - 2)(x - 3) = 0$$

所以 $x = 2$ 或 $x = 3$。

### 2. 配方法

对于一般形式，可以使用配方法：

$$x^2 + bx + c = 0$$

配方后得到：

$$\\left(x + \\frac{b}{2}\\right)^2 = \\frac{b^2}{4} - c$$

### 3. 公式法（求根公式）

一元二次方程 $ax^2 + bx + c = 0$ 的求根公式为：

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

其中 $\\Delta = b^2 - 4ac$ 称为判别式：
- 当 $\\Delta > 0$ 时，方程有两个不同的实数根
- 当 $\\Delta = 0$ 时，方程有两个相同的实数根
- 当 $\\Delta < 0$ 时，方程没有实数根（有两个复数根）`,
      order: 1,
    },
    {
      title: '三角函数',
      content: `# 三角函数

三角函数是数学中重要的函数类型，描述了角度与边长之间的关系。

## 基本三角函数

### 正弦函数

$$\\sin \\theta = \\frac{\\text{对边}}{\\text{斜边}}$$

### 余弦函数

$$\\cos \\theta = \\frac{\\text{邻边}}{\\text{斜边}}$$

### 正切函数

$$\\tan \\theta = \\frac{\\sin \\theta}{\\cos \\theta} = \\frac{\\text{对边}}{\\text{邻边}}$$

## 重要恒等式

### 平方和恒等式

$$\\sin^2 \\theta + \\cos^2 \\theta = 1$$

### 和角公式

$$\\sin(\\alpha + \\beta) = \\sin \\alpha \\cos \\beta + \\cos \\alpha \\sin \\beta$$

$$\\cos(\\alpha + \\beta) = \\cos \\alpha \\cos \\beta - \\sin \\alpha \\sin \\beta$$

### 倍角公式

$$\\sin 2\\theta = 2\\sin \\theta \\cos \\theta$$

$$\\cos 2\\theta = \\cos^2 \\theta - \\sin^2 \\theta$$`,
      order: 2,
    },
    {
      title: '导数与微分',
      content: `# 导数与微分

导数是微积分中的重要概念，描述了函数在某一点的变化率。

## 导数的定义

函数 $f(x)$ 在点 $x_0$ 处的导数定义为：

$$f'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0 + h) - f(x_0)}{h}$$

## 常见函数的导数

- $(x^n)' = nx^{n-1}$，其中 $n$ 为常数
- $(\\sin x)' = \\cos x$
- $(\\cos x)' = -\\sin x$
- $(e^x)' = e^x$
- $(\\ln x)' = \\frac{1}{x}$

## 导数的运算法则

### 和差法则

$$(f(x) \\pm g(x))' = f'(x) \\pm g'(x)$$

### 乘积法则

$$(f(x) \\cdot g(x))' = f'(x)g(x) + f(x)g'(x)$$

### 商法则

$$\\left(\\frac{f(x)}{g(x)}\\right)' = \\frac{f'(x)g(x) - f(x)g'(x)}{g^2(x)}$$

### 链式法则

$$(f(g(x)))' = f'(g(x)) \\cdot g'(x)$$`,
      order: 3,
    },
  ];

  for (const topicData of topics) {
    const topic = topicRepository.create(topicData);
    await topicRepository.save(topic);
    console.log(`已创建专题: ${topic.title}`);
  }

  console.log('专题初始化完成！');
  await dataSource.destroy();
}

initTopics().catch((error) => {
  console.error('初始化失败:', error);
  process.exit(1);
});

