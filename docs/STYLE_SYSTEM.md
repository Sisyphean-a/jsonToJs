# 设计系统使用指南

## 概述

本项目采用了统一的设计系统，包含设计令牌（Design Tokens）、公共组件样式和动画效果库。这个系统帮助保持整个应用的视觉一致性，减少重复代码，并提高开发效率。

## 文件结构

```
src/assets/
├── design-tokens.css    # 设计令牌 - 颜色、间距、字体等变量
├── components.css       # 公共组件样式 - 按钮、表单、卡片等
├── animations.css       # 动画效果库 - 统一的动画管理
├── base.css            # 基础样式重置
└── main.css            # 主样式文件，引入所有其他样式
```

## 设计令牌 (Design Tokens)

### 颜色系统

#### 主色调

```css
--color-primary-50 到 --color-primary-900  /* 蓝色主色系 */
```

#### 灰色系统

```css
--color-gray-50 到 --color-gray-900       /* 中性色系 */
```

#### 语义化颜色

```css
--color-success       /* 成功色 #10b981 */
--color-warning       /* 警告色 #f59e0b */
--color-error         /* 错误色 #ef4444 */
--color-info          /* 信息色 #3b82f6 */
```

#### 背景和文本颜色

```css
--bg-primary          /* 主背景色 */
--bg-secondary        /* 次背景色 */
--bg-tertiary         /* 第三背景色 */
--text-primary        /* 主文本色 */
--text-secondary      /* 次文本色 */
--text-tertiary       /* 第三文本色 */
--text-inverse        /* 反色文本 */
```

### 间距系统

```css
--spacing-xs          /* 4px */
--spacing-sm          /* 8px */
--spacing-md          /* 12px */
--spacing-lg          /* 16px */
--spacing-xl          /* 20px */
--spacing-2xl         /* 24px */
--spacing-3xl         /* 32px */
--spacing-4xl         /* 40px */
--spacing-5xl         /* 48px */
```

### 字体系统

```css
--font-family-base    /* 基础字体 */
--font-family-mono    /* 等宽字体 */
--font-size-xs        /* 11px */
--font-size-sm        /* 12px */
--font-size-base      /* 13px */
--font-size-md        /* 14px */
--font-size-lg        /* 15px */
--font-size-xl        /* 16px */
--font-size-2xl       /* 18px */
--font-size-3xl       /* 20px */
```

### 阴影和过渡

```css
--shadow-xs           /* 轻微阴影 */
--shadow-sm           /* 小阴影 */
--shadow-md           /* 中等阴影 */
--shadow-lg           /* 大阴影 */
--shadow-xl           /* 超大阴影 */
--transition-fast     /* 0.2s 快速过渡 */
--transition-normal   /* 0.3s 正常过渡 */
--transition-slow     /* 0.4s 慢速过渡 */
```

## 公共组件样式

### 按钮系统

#### 基础用法

```html
<button class="btn btn--primary">主要按钮</button>
<button class="btn btn--secondary">次要按钮</button>
<button class="btn btn--tertiary">第三按钮</button>
<button class="btn btn--ghost">幽灵按钮</button>
<button class="btn btn--danger">危险按钮</button>
<button class="btn btn--success">成功按钮</button>
```

#### 尺寸变体

```html
<button class="btn btn--primary btn--sm">小按钮</button>
<button class="btn btn--primary">默认按钮</button>
<button class="btn btn--primary btn--lg">大按钮</button>
<button class="btn btn--primary btn--xl">超大按钮</button>
```

#### 状态

```html
<button
  class="btn btn--primary"
  disabled
>
  禁用按钮
</button>
<button class="btn btn--primary loading">加载中按钮</button>
```

### 表单元素

```html
<input
  type="text"
  class="form-input"
  placeholder="输入内容"
/>
<textarea
  class="form-textarea"
  placeholder="多行输入"
></textarea>
```

### 卡片组件

```html
<div class="card">
  <div class="card-header">
    <h3>标题</h3>
  </div>
  <div class="card-content">内容区域</div>
  <div class="card-footer">底部操作区域</div>
</div>
```

## 工具类

### 间距工具类

```html
<div class="p-md">内边距中等</div>
<div class="m-lg">外边距大</div>
<div class="p-xs p-sm p-md p-lg p-xl p-2xl">各种内边距尺寸</div>
```

### 文本工具类

```html
<span class="text-primary">主要文本色</span>
<span class="text-secondary">次要文本色</span>
<span class="font-medium">中等字重</span>
<span class="font-mono">等宽字体</span>
<span class="text-lg">大字号</span>
```

### 布局工具类

```html
<div class="flex items-center justify-between gap-md">弹性布局，垂直居中，两端对齐，中等间距</div>
```

### 圆角和阴影

```html
<div class="rounded-lg shadow-md">圆角大，中等阴影</div>
```

## 动画系统

### 基础动画类

```html
<div class="animate-spin">旋转动画</div>
<div class="animate-pulse">脉冲动画</div>
<div class="animate-bounce">弹跳动画</div>
<div class="animate-fade-in">淡入动画</div>
```

### 悬停效果

```html
<div class="hover-lift">悬停抬起</div>
<div class="hover-scale">悬停缩放</div>
<div class="hover-rotate">悬停旋转</div>
```

### 动画修饰符

```html
<div class="animate-fade-in animate-delay-200 animate-duration-slow">延迟200ms，慢速淡入</div>
```

### 加载状态

```html
<div class="skeleton">骨架屏效果</div>
<div class="loading-dots">加载点动画</div>
```

## 响应式设计

## 暗色主题支持

系统自动支持暗色主题，会根据用户的系统偏好自动切换颜色：

```css
@media (prefers-color-scheme: dark) {
  /* 自动应用暗色主题变量 */
}
```

## 可访问性

### 减少动画运动

```css
@media (prefers-reduced-motion: reduce) {
  /* 为有运动敏感的用户减少动画 */
}
```

### 高对比度支持

```css
@media (prefers-contrast: high) {
  /* 为需要高对比度的用户增强边框 */
}
```

## 使用建议

### 1. 优先使用设计令牌

```css
/* ✅ 推荐 */
.my-component {
  color: var(--text-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
}

/* ❌ 不推荐 */
.my-component {
  color: #1e293b;
  padding: 12px;
  border-radius: 6px;
}
```

### 2. 优先使用公共组件样式

```html
<!-- ✅ 推荐 -->
<button class="btn btn--primary">点击我</button>

<!-- ❌ 不推荐 -->
<button style="background: blue; color: white; padding: 8px 16px;">点击我</button>
```

### 3. 使用工具类快速布局

```html
<!-- ✅ 推荐 -->
<div class="flex items-center gap-md p-lg">
  <span class="text-secondary">标签</span>
  <button class="btn btn--sm btn--secondary">操作</button>
</div>
```

### 4. 保持一致性

- 使用统一的间距系统
- 遵循设计令牌的颜色规范
- 使用预定义的动画效果
- 保持组件的样式一致性

## 扩展指南

如需添加新的设计令牌或组件样式：

1. **添加设计令牌**：在 `design-tokens.css` 中添加新的 CSS 变量
2. **添加组件样式**：在 `components.css` 中添加新的组件类
3. **添加动画**：在 `animations.css` 中添加新的动画关键帧和工具类
4. **更新文档**：在本文档中说明新增的内容

## 迁移现有组件

将现有组件迁移到新的设计系统：

1. 替换硬编码的颜色值为设计令牌变量
2. 使用统一的间距系统
3. 应用公共的按钮和表单样式
4. 使用统一的动画和过渡效果
5. 移除重复的样式定义

这样可以显著减少 CSS 代码量，提高维护性和一致性。
