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
- **快捷键支持**：
  - `Ctrl + Enter`：格式化并执行代码
  - `Ctrl + S`：格式化代码
  - `Ctrl + /`：注释/取消注释

### 🤖 AI智能助手

- **自然语言转换**：用中文描述转换需求，AI自动生成代码
- **JSON结构分析**：智能分析JSON数据结构和字段关系
- **代码自动生成**：支持复杂的数据转换逻辑生成
- **集成Deepseek API**：提供高质量的代码生成服务

### 📚 常用代码库

- **预置转换模板**：常见的JSON处理场景代码模板
- **一键应用**：快速插入常用的转换代码片段
- **可扩展设计**：支持自定义代码模板

## 🏗️ 系统架构

### 技术栈

- **前端框架**：Vue 3 + Composition API
- **构建工具**：Vite 6.x
- **UI组件库**：Vuetify 3.x
- **状态管理**：Pinia
- **路由管理**：Vue Router 4
- **代码编辑器**：CodeMirror 6
- **代码解析**：Babel Parser + AST
- **样式预处理**：Sass
- **AI集成**：OpenAI API

### 核心模块

#### 1. 布局系统 (`ResizableLayout`)

- **响应式三列布局**：支持动态调整列宽
- **上下分割组件**：第一列支持上下分割，可调整输入区域高度
- **移动端适配**：自动适应不同屏幕尺寸
- **状态持久化**：记住用户的布局偏好

#### 2. JSON处理模块

- **JsonDisplayWithInput**：集成JSON展示和输入的上下分割组件
- **JsonView**：JSON数据可视化展示组件
- **实时验证**：输入时即时验证JSON格式
- **可调整布局**：支持动态调整输入区域高度

#### 3. 代码转换引擎 (`JsTransformer`)

- **安全执行环境**：使用Function构造器创建沙箱环境
- **错误处理机制**：完善的异常捕获和错误提示
- **JSONPath支持**：内置jsonpath库支持复杂查询

#### 4. AI助手系统 (`AIAssistantDialog`)

- **智能提示词生成**：根据JSON结构生成优化的提示词
- **代码生成优化**：生成符合项目规范的JavaScript代码
- **API密钥管理**：本地安全存储，不上传服务器

### 设计模式

#### 组件化架构

```
App.vue
├── ResizableLayout.vue
│   ├── JsonDisplayWithInput.vue
│   │   └── JsonView.vue
│   ├── JsTransformer.vue
│   │   ├── CodeEditor.vue
│   │   ├── CommonCodeDialog.vue
│   │   └── AIAssistantDialog.vue
│   └── JsonView.vue (结果展示)
```

#### 状态管理模式

- **集中式状态管理**：使用Pinia管理全局状态
- **响应式数据流**：Vue 3 Composition API确保数据响应性
- **状态持久化**：关键状态本地存储

#### 事件驱动架构

- **组件间通信**：使用emit/props模式
- **数据流向**：单向数据流，确保数据一致性
- **异步处理**：Promise-based的异步操作处理

## 🎨 设计系统

### 设计令牌 (Design Tokens)

- **颜色系统**：统一的主题色彩规范
- **间距系统**：8px基准的间距体系
- **字体系统**：层次化的字体大小和字重
- **阴影系统**：一致的阴影效果规范

### 组件库

- **按钮系统**：多种样式和尺寸的按钮组件
- **表单元素**：统一的输入框和表单控件
- **卡片组件**：标准化的内容容器
- **工具类**：快速布局和样式的工具类

### 响应式设计

- **移动优先**：从小屏幕开始设计
- **断点系统**：480px/768px/1024px/1280px
- **自适应布局**：根据屏幕尺寸自动调整

## ⚡ 性能优化

### 构建优化

- **代码分割**：按需加载，减少初始包大小
- **Tree Shaking**：移除未使用的代码
- **资源压缩**：Terser压缩JavaScript，移除console.log
- **CSS优化**：CSS代码分割和压缩

### 运行时优化

- **组件懒加载**：路由级别的组件懒加载
- **虚拟滚动**：大数据列表的性能优化
- **缓存策略**：智能的组件和数据缓存

### 包大小优化

- **图标优化**：移除1.3MB的MDI字体，使用SVG图标
- **依赖优化**：按需导入第三方库
- **分包策略**：将大型库分离成独立chunks

优化效果：

- JavaScript主包：2,590KB → 1,055KB (-59%)
- 首次加载时间：约4MB → 约1.5MB (-62%)

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

### 开发工具配置

#### 推荐IDE设置

- **VSCode** + **Volar** 扩展 (禁用Vetur)
- **Vue Language Features (Volar)**
- **TypeScript Vue Plugin (Volar)**

#### 代码格式化

```bash
# 格式化代码
npm run format
```

### 项目结构

```
jsonToJs/
├── src/
│   ├── components/          # 公共组件
│   │   ├── CodeEditor.vue   # 代码编辑器
│   │   ├── AIAssistantDialog.vue  # AI助手
│   │   └── ResizableLayout.vue    # 可调整布局
│   ├── views/               # 页面组件
│   │   └── jsonToJs/        # JSON转换页面
│   ├── stores/              # Pinia状态管理
│   ├── utils/               # 工具函数
│   ├── assets/              # 静态资源
│   └── styles/              # 样式文件
├── docs/                    # 项目文档
├── public/                  # 公共资源
└── dist/                    # 构建输出
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

### AI助手使用指南

#### 1. 配置API密钥

```bash
# 获取Deepseek API密钥
# 1. 访问 https://platform.deepseek.com/
# 2. 注册账号并获取API密钥
# 3. 在应用中配置密钥（仅本地存储）
```

#### 2. 自然语言描述示例

- "提取所有用户的姓名和邮箱"
- "筛选年龄大于25岁的用户"
- "将数组转换为以ID为键的对象"
- "计算所有商品的总价"
- "获取嵌套对象中的特定字段"

#### 3. 生成的代码特点

- **可读性强**：包含详细注释
- **错误处理**：内置异常处理逻辑
- **性能优化**：使用高效的数据处理方法
- **兼容性好**：支持各种JSON结构

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

### 复杂数据处理

**输入JSON：**

```json
{
  "orders": [
    {
      "id": "001",
      "customer": { "name": "张三", "vip": true },
      "items": [
        { "name": "商品A", "price": 100, "qty": 2 },
        { "name": "商品B", "price": 50, "qty": 1 }
      ]
    }
  ]
}
```

**转换代码：**

```javascript
// 计算VIP客户的订单总额
return json.orders
  .filter((order) => order.customer.vip)
  .map((order) => ({
    orderId: order.id,
    customerName: order.customer.name,
    totalAmount: order.items.reduce((sum, item) => sum + item.price * item.qty, 0),
  }))
```

### JSONPath高级查询

```javascript
// 使用JSONPath查询所有价格大于80的商品
const expensiveItems = jsonpath.query(json, '$..items[?(@.price > 80)]')
return expensiveItems
```

## 🎯 设计理念

### 用户体验优先

- **直观的界面**：三列布局清晰展示数据流转过程，第一列上下分割优化空间利用
- **实时反馈**：所有操作都有即时的视觉反馈
- **错误友好**：详细的错误信息和修复建议

### 开发者友好

- **现代化工具链**：使用最新的前端技术栈
- **组件化设计**：高度可复用的组件架构
- **类型安全**：完善的类型检查和错误处理

### 性能优先

- **按需加载**：只加载当前需要的代码和资源
- **智能缓存**：合理的缓存策略提升用户体验
- **优化构建**：生产环境的极致优化

### 可扩展性

- **插件化架构**：支持功能扩展和定制
- **主题系统**：支持自定义主题和样式
- **API开放**：提供丰富的扩展接口

## 🔒 安全性

### 代码执行安全

- **沙箱环境**：使用Function构造器创建隔离环境
- **权限限制**：限制对敏感API的访问
- **输入验证**：严格验证用户输入的代码

### 数据安全

- **本地处理**：所有数据处理都在浏览器本地进行
- **隐私保护**：不上传用户数据到服务器
- **API密钥安全**：密钥仅存储在本地浏览器中

## 🚀 部署指南

### 静态部署

```bash
# 构建生产版本
npm run build

# 部署到静态服务器
# 将dist目录内容上传到服务器
```

### Docker部署

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### CDN优化

- 启用Gzip/Brotli压缩
- 设置合适的缓存头
- 使用CDN加速静态资源

## 📚 相关文档

- [AI集成说明](./docs/AI_INTEGRATION_README.md) - AI助手功能详细说明
- [性能优化指南](./docs/PERFORMANCE_OPTIMIZATION.md) - 系统性能优化策略
- [设计系统指南](./docs/STYLE_SYSTEM.md) - 设计系统使用说明

## 🤝 贡献指南

### 开发流程

1. Fork项目到个人仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建Pull Request

### 代码规范

- 使用Prettier进行代码格式化
- 遵循Vue 3 Composition API最佳实践
- 编写清晰的组件文档和注释
- 确保所有功能都有对应的测试

### 问题反馈

- 使用GitHub Issues报告bug
- 提供详细的复现步骤
- 包含环境信息和错误日志

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢以下开源项目的支持：

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [CodeMirror](https://codemirror.net/) - 代码编辑器组件
- [Vuetify](https://vuetifyjs.com/) - Vue.js UI组件库
- [Pinia](https://pinia.vuejs.org/) - Vue状态管理库

---

**JsonToJs** - 让JSON数据转换变得简单而强大 🚀
