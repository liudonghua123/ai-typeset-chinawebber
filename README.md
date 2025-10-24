# AI Typeset for Chinawebber

一个针对博大站群内容编辑器的Chrome浏览器扩展，提供一键AI排版功能。

## 功能特性

- 在博大站群内容编辑页面添加"一键排版"按钮
- 提供弹出窗口界面，包含内容获取、AI排版和复制功能
- 支持配置hiagent API参数
- 提供处理状态指示器和通知提醒

## 安装说明

1. 下载或克隆本项目到本地目录
2. 打开Chrome浏览器，进入 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本项目目录进行加载

## 使用方法

### 一键排版
1. 访问博大站群内容编辑页面 (支持带参数的URL): `https://sites.ynu.edu.cn/system/site/column/news/addnews.jsp?wbnewsid=1759&newsposition=news`
2. 在编辑器页面找到并点击"一键排版"按钮
3. 等待处理完成，排版后的内容将自动更新到编辑器中

### 手动排版
1. 点击浏览器工具栏中的扩展图标打开弹出窗口
2. 点击"获取内容"按钮从当前编辑器获取内容
3. 点击"AI排版"按钮对内容进行排版处理
4. 点击"复制"按钮将排版后的内容复制回编辑器

## 配置说明

点击扩展图标，选择"选项"或"管理扩展程序"中的"扩展选项"进行配置：

- **HiAgent Base URL**: hiagent服务基础URL
- **HiAgent App ID**: 应用ID
- **HiAgent App Key**: 应用密钥
- **Chinawebber Base URL**: 博大站群基础URL
- **User ID**: 用户ID

## API接口

扩展使用以下hiagent API接口进行内容排版：

1. `create_conversation` - 创建对话会话
2. `chat_query_v2` - 发送内容并获取排版结果

## 文件结构

```
ai-typeset-chinawebber/
├── manifest.json          # 扩展配置文件
├── content.js             # 内容脚本
├── content.css            # 内容样式
├── popup.html             # 弹出窗口界面
├── popup.js               # 弹出窗口逻辑
├── options.html           # 配置页面
├── options.js             # 配置页面逻辑
├── background.js          # 后台服务
├── icon.svg               # 扩展图标
└── README.md              # 说明文档
```

## 注意事项

- 仅在指定的博大站群页面生效
- 需要正确配置hiagent API参数才能正常使用
- 确保网络连接正常以访问API服务