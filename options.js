// options.js
document.addEventListener('DOMContentLoaded', function() {
  // Translate page elements
  translatePage();

  // Load saved settings
  loadSettings();

  // Handle form submission
  document.getElementById('settingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveSettings();
  });

  // Handle reset button
  document.getElementById('resetBtn').addEventListener('click', function() {
    resetSettings();
  });

  // Handle export button
  document.getElementById('exportBtn').addEventListener('click', function() {
    exportSettings();
  });

  // Handle import button
  document.getElementById('importBtn').addEventListener('click', function() {
    document.getElementById('importFile').click();
  });

  // Handle file import
  document.getElementById('importFile').addEventListener('change', function(e) {
    importSettings(e.target.files[0]);
  });

  // Handle AI method change to show/hide relevant fields
  document.getElementById('ai_method').addEventListener('change', function() {
    toggleAIFields();
  });
});

// Translate page elements
function translatePage() {
  // Translate header
  const title = chrome.i18n.getMessage('settings_title');
  if (title) {
    document.querySelector('h1').innerHTML = document.querySelector('h1').innerHTML.replace(
      '__MSG_settings_title__',
      title
    );
  }

  const subtitle = chrome.i18n.getMessage('settings_subtitle');
  if (subtitle) {
    document.querySelector('.subtitle').textContent = subtitle;
  }

  // Translate all __MSG_*__ placeholders in the document
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }

  textNodes.forEach(textNode => {
    const text = textNode.textContent;
    if (text && text.includes('__MSG_')) {
      // Find all message keys in the text (e.g., __MSG_key1__ and __MSG_key2__)
      const matches = text.match(/__MSG_([a-zA-Z0-9_]+)__/g);
      if (matches) {
        let updatedText = text;
        matches.forEach(match => {
          // Extract message key (e.g., __MSG_hiagent_baseurl_label__ -> hiagent_baseurl_label)
          const keyMatch = match.match(/__MSG_([a-zA-Z0-9_]+)__/);
          if (keyMatch) {
            const messageKey = keyMatch[1];
            const translated = chrome.i18n.getMessage(messageKey);
            if (translated) {
              updatedText = updatedText.replace(match, translated);
            }
          }
        });
        textNode.textContent = updatedText;
      }
    }
  });

  // Translate select options specifically
  const aiMethodSelect = document.getElementById('ai_method');
  if (aiMethodSelect) {
    // Update the options with translated text
    const openaiOption = aiMethodSelect.querySelector('option[value="openai"]');
    const hiagentOption = aiMethodSelect.querySelector('option[value="hiagent"]');
    
    if (openaiOption) {
      const openaiText = chrome.i18n.getMessage('ai_method_openai') || 'OpenAI Completions';
      openaiOption.textContent = openaiText;
    }
    
    if (hiagentOption) {
      const hiagentText = chrome.i18n.getMessage('ai_method_hiagent') || 'HiAgent';
      hiagentOption.textContent = hiagentText;
    }
  }

  const languageSelect = document.getElementById('preferred_language');
  if (languageSelect) {
    // Update the options with translated text
    const enOption = languageSelect.querySelector('option[value="en"]');
    const zhOption = languageSelect.querySelector('option[value="zh"]');
    
    if (enOption) {
      const enText = chrome.i18n.getMessage('language_english') || 'English';
      enOption.textContent = enText;
    }
    
    if (zhOption) {
      const zhText = chrome.i18n.getMessage('language_chinese') || '中文';
      zhOption.textContent = zhText;
    }
  }
}

// Load settings from storage
function loadSettings() {
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
    document.getElementById('chinawebber_baseurl').value = items.chinawebber_baseurl || 'https://sites.ynu.edu.cn';
    document.getElementById('preferred_language').value = items.preferred_language || navigator.language.split('-')[0] || 'en';
    document.getElementById('ai_method').value = items.ai_method || 'openai';
    document.getElementById('hiagent_baseurl').value = items.hiagent_baseurl || 'https://agent.ynu.edu.cn/api/proxy/api/v1';
    document.getElementById('hiagent_appid').value = items.hiagent_appid || '';
    document.getElementById('hiagent_appkey').value = items.hiagent_appkey || '';
    document.getElementById('hiagent_user_id').value = items.hiagent_user_id || '123';
    document.getElementById('openai_baseurl').value = items.openai_baseurl || 'https://api.openai.com/v1';
    document.getElementById('openai_apikey').value = items.openai_apikey || '';
    document.getElementById('model').value = items.model || 'gpt-3.5-turbo';
    document.getElementById('prompt_system').value = items.prompt_system || 'You are a content formatter. Format the following HTML content properly.';
    
    // Toggle fields based on AI method
    toggleAIFields();
  });
}

// Save settings to storage
function saveSettings() {
  const settings = {
    ai_method: document.getElementById('ai_method').value,
    hiagent_baseurl: document.getElementById('hiagent_baseurl').value,
    hiagent_appid: document.getElementById('hiagent_appid').value,
    hiagent_appkey: document.getElementById('hiagent_appkey').value,
    openai_baseurl: document.getElementById('openai_baseurl').value,
    openai_apikey: document.getElementById('openai_apikey').value,
    model: document.getElementById('model').value,
    prompt_system: document.getElementById('prompt_system').value,
    chinawebber_baseurl: document.getElementById('chinawebber_baseurl').value,
    hiagent_user_id: document.getElementById('hiagent_user_id').value,
    preferred_language: document.getElementById('preferred_language').value
  };

  chrome.storage.sync.set(settings, function() {
    showNotification(chrome.i18n.getMessage('notification_success'), '', 'success');
  });
}

// Reset settings to defaults
function resetSettings() {
  document.getElementById('ai_method').value = 'openai';
  document.getElementById('hiagent_baseurl').value = 'https://agent.ynu.edu.cn/api/proxy/api/v1';
  document.getElementById('hiagent_appid').value = '';
  document.getElementById('hiagent_appkey').value = '';
  document.getElementById('openai_baseurl').value = 'https://api.openai.com/v1';
  document.getElementById('openai_apikey').value = '';
  document.getElementById('model').value = 'gpt-3.5-turbo';
  document.getElementById('prompt_system').value = 'You are a content formatter. Format the following HTML content properly.';
  document.getElementById('chinawebber_baseurl').value = 'https://sites.ynu.edu.cn';
  document.getElementById('hiagent_user_id').value = '123';
  document.getElementById('preferred_language').value = navigator.language.split('-')[0] || 'en';

  showNotification(chrome.i18n.getMessage('notification_warning'), '', 'warning');

  // Toggle fields based on AI method
  toggleAIFields();
}

// Show notification
function showNotification(message, type) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = 'notification ' + type;
  notification.style.display = 'block';

  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Toggle AI fields based on selected method
function toggleAIFields() {
  const aiMethod = document.getElementById('ai_method').value;
  console.info(`toggleAIFields: ${aiMethod}`)
  const hiagentFields = document.querySelectorAll('[id^="hiagent_"]');
  const openaiFields = document.querySelectorAll('[id^="openai_"], #model, #prompt_system');

  if (aiMethod === 'hiagent') {
    // Show HiAgent fields, hide OpenAI fields
    hiagentFields.forEach(field => {
      field.closest('.form-group').style.display = 'block';
    });
    openaiFields.forEach(field => {
      field.closest('.form-group').style.display = 'none';
    });
  } else {
    // Show OpenAI fields, hide HiAgent fields
    openaiFields.forEach(field => {
      field.closest('.form-group').style.display = 'block';
    });
    hiagentFields.forEach(field => {
      field.closest('.form-group').style.display = 'none';
    });
  }
}

// Export settings to JSON file
function exportSettings() {
  chrome.storage.sync.get(null, function(items) {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'ai-typeset-config.json';
    link.click();

    showNotification('Configuration exported successfully', 'success');
  });
}

// Import settings from JSON file
function importSettings(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const settings = JSON.parse(e.target.result);

      // Validate settings structure
      if (typeof settings === 'object' && settings !== null) {
        chrome.storage.sync.set(settings, function() {
          loadSettings(); // Reload settings to update UI
          showNotification('Configuration imported successfully', 'success');
        });
      } else {
        throw new Error('Invalid configuration file format');
      }
    } catch (error) {
      console.error('Error importing settings:', error);
      showNotification('Error importing configuration: ' + error.message, 'error');
    }
  };
  reader.readAsText(file);
}