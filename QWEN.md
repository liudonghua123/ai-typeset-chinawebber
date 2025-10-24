# AI Typeset for Chinawebber - Project Context

## Project Overview

This is a Chrome browser extension called "AI Typeset for Chinawebber" that provides AI-powered content typesetting for the 博大站群 (Chinawebber) content editor system, specifically for Yunnan University's site system. The extension adds a "一键排版" (One-click Typeset) button to the content editing page and provides a popup interface for manual content processing.

## Key Features

- **One-click Typesetting**: Adds a "一键排版" button directly to the Chinawebber content editor page
- **Popup Interface**: Provides a comprehensive popup window with source and formatted content editors
- **API Integration**: Connects to the hiagent API service for AI-powered content processing
- **Configuration**: Allows users to configure API parameters through extension options
- **Visual Feedback**: Includes processing indicators and notification system
- **Monaco Editor**: Uses Monaco Editor for syntax-highlighted content editing

## Architecture

The extension is built with the following components:

### Core Files
- `manifest.json`: Extension configuration and permissions
- `content.js`: Content script that runs on Chinawebber pages to add UI elements
- `background.js`: Background service worker handling API communication
- `popup.html`/`popup.js`: Popup interface for manual content processing
- `options.html`/`options.js`: Configuration page for API settings
- `content.css`: Styles for the content script elements

### API Integration
The extension communicates with the hiagent API using two endpoints:
1. `create_conversation`: Creates a conversation session
2. `chat_query_v2`: Processes content with AI formatting (response mode: blocking)

### Architecture Notes for Manifest V2
- Uses `chrome.tabs.executeScript` instead of `chrome.scripting.executeScript`
- Uses callback-based approach for `chrome.tabs.query` instead of Promise-based
- Manifest V2 has different permission structure than V3

### Permissions and Security
- `storage`: For saving user configurations
- `notifications`: For user feedback
- `activeTab`: For accessing current tab content
- Host permissions for Chinawebber and hiagent API domains
- Content Security Policy allowing loading from cdnjs.cloudflare.com

## Building and Running

### Installation
1. Clone or download this project to a local directory
2. Open Chrome browser and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the project directory

### Configuration
Before using the extension, configure the following settings in the extension options:
- **HiAgent Base URL**: hiagent service base URL (default: https://agent.ynu.edu.cn/api/proxy/api/v1)
- **HiAgent App ID**: Your application ID
- **HiAgent App Key**: Your application key (required for API access)
- **Chinawebber Base URL**:博大站群 system base URL (default: https://sites.ynu.edu.cn)
- **User ID**: Your user ID

## Usage Methods

### One-click Typesetting
1. Navigate to a Chinawebber content editing page
2. Click the "一键排版" button that appears on the page
3. Wait for processing to complete (processing indicator will show)
4. The formatted content will be automatically updated in the editor

### Manual Processing via Popup
1. Click the extension icon in the browser toolbar
2. Click "获取内容" (Get Content) to retrieve content from the current editor
3. Click "AI排版" to process the content with AI formatting
4. Review the formatted content in the second editor
5. Click "复制" (Copy) to update the editor with formatted content

## Development Notes

### Content Script Logic
- Dynamically adds a "一键排版" button to target pages
- Implements multiple selectors to find the appropriate location for the button
- Handles both main document and iframe-based editors
- Shows processing overlay during API requests

### Background Service
- Handles all API communication with the hiagent service
- Manages conversation IDs for API requests
- Provides error handling and notifications
- Uses chrome.storage.sync for configuration persistence

### Popup Interface
- Implements Monaco Editor for both source and formatted content
- Provides visual comparison of original vs. formatted content
- Shows processing indicators during API requests
- Enables content flow between browser tab and popup editors

### Error Handling
- Comprehensive error handling for API failures
- Validation of required configuration parameters
- User notifications for success and failure states
- Graceful fallback mechanisms

## File Structure
```
ai-typeset-chinawebber/
├── manifest.json          # Extension configuration file
├── content.js             # Content script logic
├── content.css            # Content script styling
├── popup.html             # Popup window interface
├── popup.js               # Popup window logic
├── options.html           # Configuration page
├── options.js             # Configuration page logic
├── background.js          # Background service worker
├── icon.svg               # Extension icon
├── icon.png               # Extension icon (alternative format)
└── README.md              # Project documentation
```

## Important URLs
- **Target Pages**: `https://sites.ynu.edu.cn/system/site/column/news/addnews.jsp*`
- **API Endpoint**: `https://agent.ynu.edu.cn/api/proxy/api/v1/`
- **External Resources**: `https://cdnjs.cloudflare.com/` (for Monaco Editor)

## Key Dependencies
- Monaco Editor (loaded from CDN)
- Chrome Extensions API
- HiAgent API service
- Web Notifications API