# Chrome扩展构建指南

## 🚀 快速开始

### 构建扩展

```bash
# 构建Chrome扩展
npm run build:extension
```

这个命令会：

1. 使用扩展模式构建项目 (`vite build --mode extension`)
2. 运行构建脚本 (`node scripts/build-extension.js`)
3. 在 `dist-extension` 目录中生成完整的扩展包

### 安装扩展

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录下的 `dist-extension` 文件夹
6. 扩展安装完成！

## 📁 文件结构

构建完成后，`dist-extension` 目录包含：

```
dist-extension/
├── manifest.json          # 扩展清单文件
├── background.js          # 后台脚本
├── index.html            # 主页面
├── assets/               # 构建后的资源文件
│   ├── *.js             # JavaScript文件
│   ├── *.css            # 样式文件
│   └── *.woff2          # 字体文件
└── public/              # 图标等静态资源
    ├── favicon.ico
    └── favicon-s.ico
```

## ⚙️ 扩展配置

### manifest.json 配置说明

- **manifest_version**: 3 (使用最新的Manifest V3)
- **permissions**:
  - `storage`: 用于本地数据存储
  - `activeTab`: 访问当前标签页
- **action**: 配置扩展图标和弹窗
- **background**: 后台脚本配置
- **content_security_policy**: 安全策略，允许WASM执行

### 扩展特性

1. **新标签页界面**: 点击扩展图标在新标签页中打开JsonToJs工具
2. **完整页面体验**: 以完整页面形式运行，不受弹窗尺寸限制
3. **本地存储**: 支持保存用户设置和数据
4. **离线使用**: 完全本地运行，无需网络连接
5. **安全沙箱**: 在Chrome扩展安全环境中运行

## 🔧 开发模式

### 扩展开发调试

1. 在Chrome扩展管理页面找到JsonToJs扩展
2. 点击"详细信息"
3. 开启"允许访问文件网址"（如果需要）
4. 点击扩展图标打开新标签页，然后使用F12打开开发者工具进行调试

### 热重载

修改代码后需要：

1. 重新运行 `npm run build:extension`
2. 在扩展管理页面点击刷新按钮
3. 重新点击扩展图标打开新标签页

## 🎯 使用场景

### 适用场景

- 快速JSON数据处理
- 开发过程中的数据转换
- API响应数据分析
- 配置文件格式转换

### 扩展优势

- **便捷访问**: 浏览器工具栏一键打开
- **独立运行**: 不依赖外部网站
- **数据安全**: 所有处理都在本地进行
- **跨平台**: 支持所有Chrome内核浏览器

## 🛠️ 自定义配置

### 修改页面样式

由于扩展现在以新标签页形式运行，你可以直接修改 `index.html` 和相关的Vue组件样式来调整界面。扩展会以完整页面的形式显示，不再受弹窗尺寸限制。

### 添加新权限

在 `manifest.json` 中添加所需权限：

```json
{
  "permissions": [
    "storage",
    "activeTab",
    "tabs" // 新增权限
  ]
}
```

## 📦 发布准备

### 打包发布版本

1. 确保所有功能正常工作
2. 运行 `npm run build:extension`
3. 将 `dist-extension` 目录打包为zip文件
4. 上传到Chrome Web Store

### 版本管理

更新 `manifest.json` 中的版本号：

```json
{
  "version": "1.1.0"
}
```

## 🔍 故障排除

### 常见问题

1. **扩展无法加载**

   - 检查manifest.json语法
   - 确保所有文件路径正确

2. **功能异常**

   - 查看扩展控制台错误信息
   - 检查CSP策略是否正确

3. **样式问题**
   - 确认CSS文件正确加载
   - 检查扩展环境下的样式兼容性

### 调试技巧

- 使用Chrome DevTools调试扩展
- 查看background.js的控制台输出
- 检查storage API的使用情况

## 📚 相关资源

- [Chrome扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3指南](https://developer.chrome.com/docs/extensions/mv3/)
- [扩展API参考](https://developer.chrome.com/docs/extensions/reference/)
