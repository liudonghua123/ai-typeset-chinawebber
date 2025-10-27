// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Typeset extension installed');

  // Create notification icon
  if (chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'AI Typeset 已安装',
      message: 'AI Typeset 扩展已成功安装并准备就绪'
    });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Validate request
  if (!request || !request.action) {
    sendResponse({ success: false, error: 'Invalid request' });
    return false;
  }

  if (request.action === 'oneClickTypeset') {
    // Handle one-click typesetting
    handleAiTypeset(request.content)
      .then(result => {
        if (result.success) {
          showNotification(chrome.i18n.getMessage('success_typeset_complete'), chrome.i18n.getMessage('success_content_copied'), 'success');
        } else {
          showNotification('排版失败', result.error, 'error');
        }
        sendResponse(result);
      })
      .catch(error => {
        console.error('One-click typeset error:', error);
        showNotification('排版失败', error.message, 'error');
        sendResponse({ success: false, error: error.message || 'One-click typeset process failed' });
      });
    return true; // Keep message channel open for async response
  } else if (request.action === 'aiTypeset') {
    // Handle AI typesetting
    handleAiTypeset(request.content)
      .then(result => {
        if (result.success) {
          showNotification('排版完成', '内容已成功排版', 'success');
        } else {
          showNotification('排版失败', result.error, 'error');
        }
        sendResponse(result);
      })
      .catch(error => {
        console.error('AI typeset error:', error);
        showNotification('排版失败', error.message, 'error');
        sendResponse({ success: false, error: error.message || 'AI typeset process failed' });
      });
    return true; // Keep message channel open for async response
  } else if (request.action === 'showNotification') {
    // Show notification
    showNotification(request.title, request.message, request.type || 'info');
    sendResponse({ success: true });
    return false;
  } else {
    // Unknown action
    sendResponse({ success: false, error: 'Unknown action' });
    return false;
  }
});

// Show notification function
function showNotification(title, message, type) {
  // Check if notifications API is available
  if (!chrome.notifications) {
    console.warn('Notifications API not available');
    return;
  }

  // Map types to icon colors
  const icons = {
    success: 'icon.png',
    error: 'icon.png',
    info: 'icon.png'
  };

  chrome.notifications.create({
    type: 'basic',
    iconUrl: icons[type] || icons.info,
    title: title,
    message: message
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error('Notification error:', chrome.runtime.lastError);
    }
  });
}

// Handle AI typesetting
async function handleAiTypeset(content) {
  // Validate content
  if (!content || typeof content !== 'string') {
    return { success: false, error: 'Invalid content provided' };
  }

  try {
    // Get settings
    const settings = await getSettings();

    // Check AI method selection
    if (settings.ai_method === 'hiagent') {
      // Use hiagent API
      // Validate required settings
      if (!settings.hiagent_appkey) {
        throw new Error('HiAgent App Key 未配置，请在扩展设置中配置');
      }

      // Create conversation
      const appConversationID = await createConversation(settings);

      // Get formatted content
      const formattedContent = await chatQuery(settings, appConversationID, `<div>${content}</div>`);

      return { success: true, formattedContent: formattedContent };
    } else {
      // Use OpenAI API as default
      // Validate required settings
      if (!settings.openai_apikey) {
        throw new Error('OpenAI API Key 未配置，请在扩展设置中配置');
      }

      // Format content with OpenAI
      const formattedContent = await formatContentWithOpenAI(settings, content);
      return { success: true, formattedContent: formattedContent };
    }
  } catch (error) {
    console.error('AI typeset error:', error);
    return { success: false, error: error.message || '排版过程中发生未知错误' };
  }
}

// Get settings from storage
function getSettings() {
  return new Promise((resolve, reject) => {
    try {
      // Check if storage API is available
      if (!chrome.storage || !chrome.storage.sync) {
        reject(new Error('Storage API not available'));
        return;
      }

      chrome.storage.sync.get([
        'ai_method',
        'hiagent_baseurl',
        'hiagent_appid',
        'hiagent_appkey',
        'hiagent_user_id',
        'openai_baseurl',
        'openai_apikey',
        'model',
        'prompt_system',
        'chinawebber_baseurl',
        'preferred_language'
      ], function(items) {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Failed to get settings'));
          return;
        }

        try {
          // Set default values from config.js if not configured
          const settings = {
            ai_method: items.ai_method || getDefaultValue('ai_method'),
            hiagent_baseurl: items.hiagent_baseurl || getDefaultValue('hiagent_baseurl'),
            hiagent_appid: items.hiagent_appid || getDefaultValue('hiagent_appid'),
            hiagent_appkey: items.hiagent_appkey || getDefaultValue('hiagent_appkey'),
            hiagent_user_id: items.hiagent_user_id || getDefaultValue('hiagent_user_id'),
            openai_baseurl: items.openai_baseurl || getDefaultValue('openai_baseurl'),
            openai_apikey: items.openai_apikey || getDefaultValue('openai_apikey'),
            model: items.model || getDefaultValue('model'),
            prompt_system: items.prompt_system || getDefaultValue('prompt_system'),
            chinawebber_baseurl: items.chinawebber_baseurl || getDefaultValue('chinawebber_baseurl'),
            preferred_language: items.preferred_language || getDefaultValue('preferred_language')
          };

          resolve(settings);
        } catch (error) {
          console.error('Error processing settings:', error);
          reject(new Error('Error processing settings: ' + error.message));
        }
      });
    } catch (error) {
      console.error('Error getting settings:', error);
      reject(new Error('Error getting settings: ' + error.message));
    }
  });
}

// Get default value from config.js
function getDefaultValue(key) {
  // Since we can't directly import config.js in background.js, 
  // we'll define the defaults here based on config.js values
  const DEFAULT_CONFIG = {
    ai_method: 'openai',
    hiagent_baseurl: 'https://agent.ynu.edu.cn/api/proxy/api/v1',
    hiagent_appid: '',
    hiagent_appkey: '',
    hiagent_user_id: '123',
    openai_baseurl: 'https://api.openai.com/v1',
    openai_apikey: '',
    model: 'gpt-3.5-turbo',
    prompt_system: 'You are a content formatter. Format the following HTML content properly.',
    chinawebber_baseurl: 'https://sites.ynu.edu.cn',
    preferred_language: navigator.language || 'en'
  };
  
  return DEFAULT_CONFIG[key];
}

// Format content with OpenAI API
async function formatContentWithOpenAI(settings, content) {
  try {
    // Validate settings
    if (!settings.openai_baseurl || !settings.openai_apikey || !settings.model) {
      throw new Error('Missing required settings for OpenAI API');
    }

    const apiUrl = `${settings.openai_baseurl}/chat/completions`;
    const apiKey = settings.openai_apikey;
    const model = settings.model;
    const systemPrompt = settings.prompt_system || 'You are a content formatter. Format the following HTML content properly.';

    // Prepare the messages
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: content }
    ];

    // Make the API call
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: HTTP ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API request failed: ${error.message}`);
  }
}

// Create conversation with hiagent
async function createConversation(settings) {
  try {
    // Validate settings
    if (!settings.hiagent_baseurl || !settings.hiagent_appkey) {
      throw new Error('Missing required settings for HiAgent API');
    }

    const createConversationUrl = `${settings.hiagent_baseurl}/create_conversation`;
    const createConversationOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Apikey': settings.hiagent_appkey
      },
      body: JSON.stringify({
        "UserID": settings.hiagent_user_id,
        "Inputs": {
          "var": "variable"
        }
      })
    };

    const response = await fetch(createConversationUrl, createConversationOptions);

    if (!response.ok) {
      throw new Error(`创建会话失败: HTTP ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.Conversation || !data.Conversation.AppConversationID) {
      throw new Error('Invalid response from create conversation API');
    }

    return data.Conversation.AppConversationID;
  } catch (error) {
    console.error('Create conversation error:', error);
    throw new Error(`创建会话失败: ${error.message}`);
  }
}

// Query hiagent for content formatting
async function chatQuery(settings, appConversationID, content) {
  try {
    // Validate parameters
    if (!settings.hiagent_baseurl || !settings.hiagent_appkey) {
      throw new Error('Missing required settings for HiAgent API');
    }

    if (!appConversationID) {
      throw new Error('Invalid conversation ID');
    }

    if (!content) {
      throw new Error('Content is required');
    }

    const chatQueryUrl = `${settings.hiagent_baseurl}/chat_query_v2`;
    const chatQueryOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Apikey': settings.hiagent_appkey
      },
      body: JSON.stringify({
        "UserID": settings.hiagent_user_id,
        "AppConversationID": appConversationID,
        "Query": content,
        "ResponseMode": "blocking"
      })
    };

    const response = await fetch(chatQueryUrl, chatQueryOptions);

    if (!response.ok) {
      throw new Error(`内容排版失败: HTTP ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.answer) {
      throw new Error('Invalid response from chat query API');
    }

    return data.answer;
  } catch (error) {
    console.error('Chat query error:', error);
    throw new Error(`内容排版失败: ${error.message}`);
  }
}