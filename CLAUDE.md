# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome browser extension called "AI Typeset for Chinawebber" that provides AI-powered content typesetting for the 博大站群 (Chinawebber) content editor system. The extension adds a "一键排版" (One-click Typeset) button to the content editing page and provides a popup interface for manual content processing.

Key features include:
- One-click typesetting directly in the content editor
- Popup interface with Monaco Editor for content processing
- Integration with hiagent API for AI-powered formatting
- Configuration options for API parameters
- Visual feedback during processing

## Architecture

The extension follows a standard Chrome extension architecture with these core components:

### Main Files
- `manifest.json`: Extension configuration, permissions, and entry points
- `content.js`: Content script that runs on target pages to add UI elements
- `background.js`: Background service worker handling API communication
- `popup.html`/`popup.js`: Popup interface for manual content processing
- `options.html`/`options.js`: Configuration page for API settings
- `content.css`: Styles for content script elements

### Communication Flow
1. Content script injects UI elements into target pages
2. User interactions trigger messages to background script
3. Background script handles API communication with hiagent service
4. Results are sent back to content script or popup for display

### API Integration
The extension communicates with the hiagent API using two endpoints:
1. `create_conversation`: Creates a conversation session
2. `chat_query_v2`: Processes content with AI formatting (blocking mode)

## Development Commands

### Loading the Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the project directory

### Configuration
Before using the extension, configure these settings in the extension options:
- HiAgent Base URL: hiagent service base URL
- HiAgent App ID: Your application ID
- HiAgent App Key: Your application key (required)
- Chinawebber Base URL: 博大站群 system base URL
- User ID: Your user ID

## Key Implementation Details

### Content Script (`content.js`)
- Dynamically adds "一键排版" button to target pages
- Uses multiple selectors to find appropriate button placement
- Handles both main document and iframe-based editors
- Shows processing indicators during API requests
- Communicates with background script via chrome.runtime.sendMessage

### Background Script (`background.js`)
- Handles all API communication with hiagent service
- Manages conversation IDs for API requests
- Provides error handling and user notifications
- Uses chrome.storage.sync for configuration persistence
- Implements both one-click and manual typesetting workflows

### Popup Interface (`popup.html`/`popup.js`)
- Uses Monaco Editor for syntax-highlighted content editing
- Provides side-by-side comparison of original vs. formatted content
- Implements content flow between browser tab and popup editors
- Shows processing indicators during API requests
- Validates current page context before operations

### Options Page (`options.html`/`options.js`)
- Allows configuration of API parameters
- Uses chrome.storage.sync for persistent settings
- Provides form validation and user feedback

## Important URLs and Permissions

### Target Pages
- `https://sites.ynu.edu.cn/system/site/column/news/addnews.jsp*`

### API Endpoints
- `https://agent.ynu.edu.cn/api/proxy/api/v1/`

### External Resources
- `https://cdnjs.cloudflare.com/` (for Monaco Editor)

## Dependencies
- Monaco Editor (loaded from CDN)
- Chrome Extensions API
- HiAgent API service
- Web Notifications API

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
├── README.md              # Project documentation
└── QWEN.md                # Project context and development notes
```