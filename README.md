# JsonToJs - 智能JSON转换工具

一个基于Vue 3的现代化JSON数据转换平台，提供可视化的JSON处理、JavaScript代码编辑和AI辅助转换功能。

## 🚀 核心特性

### 📊 可视化JSON处理

- **三列布局设计**：JSON展示+输入 → 代码编辑 → 结果预览
- **上下分割设计**：第一列采用上下分割，上部分展示JSON，下部分提供输入功能
- **实时数据同步**：所有面板数据实时联动更新
- **智能JSON解析**：支持复杂嵌套结构的JSON数据处理

### 💻 强大的代码编辑器

- **基于CodeMirror 6**：现代化的代码编辑体验
- **JavaScript语法高亮**：完整的ES6+语法支持
- **智能代码格式化**：内置Prettier格式化功能
- **快捷键支持**：`Ctrl + Enter` 执行代码，`Ctrl + S` 格式化代码

### 🤖 AI智能助手

- **自然语言转换**：用中文描述转换需求，AI自动生成代码
- **JSON结构分析**：智能分析JSON数据结构和字段关系
- **代码自动生成**：支持复杂的数据转换逻辑生成

### 📚 常用代码库

- **预置转换模板**：常见的JSON处理场景代码模板
- **一键应用**：快速插入常用的转换代码片段

## 🏗️ 技术架构

### 核心技术栈

- **前端框架**：Vue 3 + Composition API
- **构建工具**：Vite 6.x
- **UI组件库**：Vuetify 3.x
- **状态管理**：Pinia
- **代码编辑器**：CodeMirror 6
- **AI集成**：OpenAI API

## 📁 项目结构

```
src/
├── components/                 # 全局可复用组件
│   ├── base/                  # 基础UI组件
│   │   ├── BaseModal.vue      # 基础模态框
│   │   ├── ModalHeader.vue    # 模态框头部
│   │   └── GlobalErrorDisplay.vue # 全局错误显示
│   ├── layout/                # 布局相关组件
│   │   ├── ResizableContainer.vue  # 可调整大小容器
│   │   ├── ResizableLayout.vue     # 水平布局
│   │   ├── ResizableRowLayout.vue  # 垂直布局
│   │   ├── ColumnHeader.vue        # 列头组件
│   │   └── RowHeader.vue          # 行头组件
│   └── dialogs/               # 对话框组件
│       ├── AIAssistantDialog.vue   # AI助手对话框
│       └── CommonCodeDialog.vue    # 常用代码对话框
├── features/                  # 功能模块（按业务域组织）
│   └── json-processor/        # JSON处理功能模块
│       ├── components/        # JSON处理相关组件
│       │   ├── JsonView.vue           # JSON视图显示
│       │   ├── JsonDisplayWithInput.vue # JSON输入显示组合
│       │   ├── JsonResultDisplay.vue   # JSON结果显示
│       │   ├── CodeEditor.vue         # 代码编辑器
│       │   ├── CodeEditorWrapper.vue  # 代码编辑器包装
│       │   ├── CodeExecutor.vue       # 代码执行器
│       │   ├── JsTransformer.vue      # JS转换器（主组件）
│       │   ├── ActionButtons.vue      # 操作按钮
│       │   └── ErrorDisplay.vue       # 错误显示
│       └── composables/       # JSON处理相关组合式函数
│           └── useJsonContext.js      # JSON上下文管理
├── shared/                    # 共享资源
│   ├── composables/           # 全局组合式函数
│   │   ├── useErrorHandler.js # 错误处理
│   │   └── useEventBus.js     # 事件总线
│   ├── constants/             # 全局常量
│   │   ├── app-config.js      # 应用配置
│   │   └── ui-config.js       # UI配置
│   └── utils/                 # 工具函数
│       ├── commonCodes.js     # 常用代码
│       ├── editorUtils.js     # 编辑器工具
│       └── icons.js           # 图标配置
├── stores/                    # 状态管理
│   ├── jsonProcessor.js       # JSON处理状态
│   └── pageState.js          # 页面状态
├── views/                     # 页面组件
│   └── JsonToJsPage.vue      # 主页面
├── assets/                    # 静态资源
├── styles/                    # 样式文件
├── router/                    # 路由配置
├── App.vue
└── main.js
```

### 架构设计原则

#### 1. 功能模块化

- **按业务域组织**：JSON处理功能独立成模块
- **清晰的边界**：每个模块职责明确
- **便于扩展**：新功能可按相同模式组织

#### 2. 组件分层

- **基础组件**：可在任何地方复用的UI组件
- **布局组件**：专门处理布局逻辑的组件
- **业务组件**：特定功能域的组件

#### 3. 状态管理

- **集中式管理**：使用Pinia管理全局状态
- **Context模式**：功能模块内部使用Context Provider
- **响应式数据流**：Vue 3 Composition API确保数据响应性

## 🎨 界面设计

### 布局特点

- **三列布局**：JSON输入 → 代码编辑 → 结果展示
- **可调整尺寸**：支持动态调整各列宽度
- **桌面端优化**：专为桌面端开发环境设计
- **响应式设计**：适配不同屏幕尺寸

## 🛠️ 开发指南

### 环境要求

- Node.js 16+
- npm 8+ 或 yarn 1.22+

### 快速开始

```bash
# 克隆项目
git clone <repository-url>
cd jsonToJs

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 🔧 核心功能详解

### JSON转换工作流

1. **数据输入与预览**：第一列上部分实时显示解析后的JSON结构，下部分提供输入框
2. **代码编写**：第二列编写JavaScript转换逻辑
3. **结果查看**：第三列显示转换后的结果

### 代码执行机制

系统使用安全的代码执行环境：

```javascript
// 转换函数模板
function transform(json) {
  // 用户编写的转换代码
  return json.address // 示例：提取地址信息
}
```

支持的功能：

- **ES6+语法**：箭头函数、解构赋值、模板字符串等
- **JSONPath查询**：使用jsonpath库进行复杂数据查询
- **错误处理**：自动捕获和显示运行时错误
- **类型安全**：自动处理数据类型转换

### AI助手使用

配置API密钥后，可以用自然语言描述转换需求，AI会自动生成相应的JavaScript代码。

**示例描述**：

- "提取所有用户的姓名和邮箱"
- "筛选年龄大于25岁的用户"
- "将数组转换为以ID为键的对象"

## 📖 使用示例

### 基础数据转换

**输入JSON：**

```json
{
  "users": [
    { "id": 1, "name": "张三", "age": 25, "city": "北京" },
    { "id": 2, "name": "李四", "age": 30, "city": "上海" }
  ]
}
```

**转换代码：**

```javascript
// 提取用户姓名列表
return json.users.map((user) => user.name)
```

**输出结果：**

```json
["张三", "李四"]
```

## 🛠️ 开发和部署

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

---

**JsonToJs** - 让JSON数据转换变得简单而强大 🚀
