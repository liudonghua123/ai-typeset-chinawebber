# AI Typeset for Chinawebber

AI Typeset for Chinawebber is a Chrome browser extension designed for the Chinawebber (博大站群) content editor system, specifically for Yunnan University's site system. The extension provides AI-powered one-click content typesetting, enhancing the content editing experience and improving formatting quality.

## 📋 Table of Contents

- [Description](#description)
- [Purpose](#purpose)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Interfaces](#api-interfaces)
- [File Structure](#file-structure)
- [Development](#development)
- [Contribution](#contribution)
- [License](#license)
- [Support](#support)

## Description

An AI-powered content typesetting Chrome extension for the Chinawebber (博大站群) content editor system at Yunnan University. The extension provides both a one-click formatting button directly on the content editing page and a comprehensive popup interface for manual content processing through AI formatting services.

## Purpose

The primary purpose of this extension is to streamline the content editing process within the Chinawebber system by integrating AI-powered typesetting capabilities. The extension addresses the need for improved content formatting and consistency, especially for documents that require standardized formatting with proper Chinese typography, such as academic articles, news posts, and official communications.

## Features

- **One-click Typesetting**: Adds a "一键排版" button directly to the Chinawebber content editor page
- **Popup Interface**: Provides a comprehensive popup window with source and formatted content editors
- **API Integration**: Connects to the hiagent API service for AI-powered content processing
- **Configuration**: Allows users to configure API parameters through extension options
- **Visual Feedback**: Includes processing indicators and notification system
- **Monaco Editor**: Uses Monaco Editor for syntax-highlighted content editing
- **Content Security**: Handles sensitive information like API keys securely
- **Import/Export**: Supports configuration import/export functionality
- **Multi-AI Support**: Supports various AI service providers including OpenAI, Anthropic, Google, and domestic providers

## Installation

### English Installation

1. Clone or download this project to a local directory
2. Open Chrome browser and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the project directory
5. Configure the extension with your API credentials via the options page
6. The extension is now ready to use on Chinawebber pages

## Usage

### English Usage

#### One-click Typesetting
1. Navigate to a Chinawebber content editing page
2. Click the "一键排版" button that appears on the page
3. Wait for processing to complete (processing indicator will show)
4. The formatted content will be automatically updated in the editor

#### Manual Processing via Popup
1. Click the extension icon in the browser toolbar
2. Click "获取内容" (Get Content) to retrieve content from the current editor
3. Click "AI排版" to process the content with AI formatting
4. Review the formatted content in the second editor
5. Click "复制" (Copy) to update the editor with formatted content

## Configuration

### English Configuration

The extension needs to be configured with API credentials before use:

1. Click the extension icon in the toolbar
2. Select "Options" or go to `chrome://extensions/` and click "Options" under the extension
3. Configure the following settings:

- **AI Method**: Choose between OpenAI Completions or HiAgent
- **HiAgent Base URL**: HiAgent service base URL (default: https://agent.ynu.edu.cn/api/proxy/api/v1)
- **HiAgent App ID**: Your application ID
- **HiAgent App Key**: Your application key (required for API access)
- **HiAgent User ID**: Your user ID
- **OpenAI Base URL**: OpenAI API base URL (with dropdown for popular providers)
- **OpenAI API Key**: Your OpenAI API key (required for API access)
- **Model**: AI model to use (default: gpt-3.5-turbo)
- **System Prompt**: Custom system prompt for AI formatting (multiline editor)
- **Chinawebber Base URL**: Chinawebber system base URL (default: https://sites.ynu.edu.cn)

## API Interfaces

The extension communicates with the hiagent API using two endpoints:
1. `create_conversation` - Creates a conversation session
2. `chat_query_v2` - Processes content with AI formatting (response mode: blocking)

For OpenAI-compatible services, it uses the standard OpenAI API format.

## File Structure

```
ai-typeset-chinawebber/
├── manifest.json          # Extension configuration file
├── background.js          # Background service worker
├── content.js             # Content script logic
├── content.css            # Content script styling
├── popup.html             # Popup window interface
├── popup.js               # Popup window logic
├── options.html           # Configuration page
├── options.js             # Configuration page logic
├── icon.svg               # Extension icon
├── icon.png               # Extension icon (alternative format)
├── modified_openeditor.js # Modified openeditor function for iframe handling
├── _locales/              # Localization files
│   ├── en/
│   │   └── messages.json
│   └── zh/
│       └── messages.json
├── README.md              # Project documentation
└── package.json           # Package dependencies (if any)
```

## Development

### English Development

To contribute to the development:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Make sure to follow the existing code style and include tests if applicable.

## Contribution

### English Contribution

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or suggesting improvements, your help is appreciated.

Ways to contribute:
- Report bugs and issues
- Suggest new features
- Improve documentation
- Submit pull requests
- Translate the extension to other languages
- Provide feedback on usability

When contributing code, please:
- Follow the existing code style
- Write clear commit messages
- Include tests when adding new functionality
- Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

### English Support

If you encounter issues or have questions:

1. Check the existing [Issues](https://github.com/liudonghua123/ai-typeset-chinawebber/issues) to see if your problem has already been reported
2. If not, create a new issue with detailed information about your problem
3. Provide steps to reproduce the issue
4. Include your browser version and extension version
5. For urgent support, contact the maintainers directly

## Architecture Notes

### English Architecture Notes

The extension uses manifest V2 with the following components:

- Uses `chrome.tabs.executeScript` for content injection
- Callback-based approach for `chrome.tabs.query` instead of Promise-based
- Content script handles UI injection and user interaction
- Background script handles API communication
- Popup window provides manual content processing
- Options page for configuration management