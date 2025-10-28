// popup.js
document.addEventListener('DOMContentLoaded', async function() {
  // Translate page elements
  translatePage();
  // Elements
  const getContentBtn = document.getElementById('getContentBtn');
  const aiTypesetBtn = document.getElementById('aiTypesetBtn');
  const copyBtn = document.getElementById('copyBtn');
  const sourceEditorElement = document.getElementById('sourceEditor');
  const formattedEditorElement = document.getElementById('formattedEditor');
  const notification = document.getElementById('notification');
  const processingOverlay = document.getElementById('processingOverlay');

  // State
  let sourceContent = '';
  let formattedContent = '';
  let sourceEditor = null;
  let formattedEditor = null;
  let executionStartTime = null;

  // Check if we're on the correct page
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (chrome.runtime.lastError) {
      console.error('Error querying tabs:', chrome.runtime.lastError);
      return;
    }
    
    const currentTab = tabs[0];
    const isValidPage = currentTab.url && currentTab.url.startsWith('https://sites.ynu.edu.cn/system/site/column/news/addnews.jsp');

    // Enable/disable get content button based on current page
    getContentBtn.disabled = !isValidPage;

    if (!isValidPage) {
      showNotification(chrome.i18n.getMessage('error_not_on_page'), '', 'error');
    }
  });

  // Initialize Monaco Editor
  await initializeEditors();

  // Get content button event
  getContentBtn.addEventListener('click', async function() {
    try {
      showProcessing(true);

      // Get content from the active tab
      const tabs = await new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(tabs);
        });
      });
      const tab = tabs[0];

      // Execute script to get editor content using V3 API
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const iframe = document.querySelector('iframe[name="ueditor_subcontent"]');
          if (iframe && iframe.contentDocument) {
            const editor = iframe.contentDocument.querySelector('#vsb_content_1');
            return editor ? editor.innerHTML : null;
          }
          return null;
        }
      });

      // Extract the result values
      const result = results && results[0] ? results[0].result : null;

      if (result !== null && result !== undefined) {
        sourceContent = result;
        if (sourceEditor) {
          sourceEditor.setValue(result);
        }
        aiTypesetBtn.disabled = false;
        showNotification(chrome.i18n.getMessage('success_content_fetched'), '', 'success');
      } else {
        throw new Error('无法从编辑器获取内容');
      }
    } catch (error) {
      console.error('Error getting content:', error);
      showNotification(chrome.i18n.getMessage('error_title'), error.message || chrome.i18n.getMessage('error_content_fetch'), 'error');
    } finally {
      showProcessing(false);
    }
  });

  // AI Typeset button event
  aiTypesetBtn.addEventListener('click', async function() {
    const currentContent = sourceEditor ? sourceEditor.getValue() : sourceContent;

    if (!currentContent) {
      showNotification(chrome.i18n.getMessage('error_title'), chrome.i18n.getMessage('error_content_empty'), 'error');
      return;
    }

    // Record start time
    executionStartTime = new Date();

    try {
      showProcessing(true);

      // Send message to background script for AI typesetting using Promise approach (Manifest V3 compatible)
      const response = await chrome.runtime.sendMessage({
        action: 'aiTypeset',
        content: currentContent
      });

      if (response && response.success) {
        formattedContent = response.formattedContent;
        if (formattedEditor) {
          formattedEditor.setValue(formattedContent);
        }
        copyBtn.disabled = false;
        
        // Calculate execution time
        const executionTime = new Date() - executionStartTime;
        
        // Display the execution time
        updateExecutionTimeLabel(executionTime);
        
        showNotification(chrome.i18n.getMessage('success_typeset_complete'), '', 'success');
      } else {
        throw new Error(response ? (response.error || '排版失败') : '排版服务无响应');
      }
    } catch (error) {
      console.error('Error during AI typesetting:', error);
      showNotification(chrome.i18n.getMessage('error_typeset_failed'), error.message || chrome.i18n.getMessage('error_typeset_failed'), 'error');
    } finally {
      showProcessing(false);
    }
  });

  // Copy button event
  copyBtn.addEventListener('click', async function() {
    const contentToCopy = formattedEditor ? formattedEditor.getValue() : formattedContent;

    if (!contentToCopy) {
      showNotification(chrome.i18n.getMessage('error_content_empty'), '', 'error');
      return;
    }

    try {
      showProcessing(true);

      // Check if we're on the correct page
      const tabs = await new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(tabs);
        });
      });
      const tab = tabs[0];
      const isValidPage = tab.url && tab.url.startsWith('https://sites.ynu.edu.cn/system/site/column/news/addnews.jsp');

      if (!isValidPage) {
        throw new Error('只能在博大站群内容编辑页面复制内容');
      }

      // Execute script to set editor content using V3 API
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (content) => {
          // First try to find the editor in the main document
          let editor = document.querySelector('#vsb_content_1');

          // If not found, try to find it in the iframe
          if (!editor) {
            const iframe = document.querySelector('iframe[name="ueditor_subcontent"]');
            if (iframe && iframe.contentDocument) {
              editor = iframe.contentDocument.querySelector('#vsb_content_1');
            }
          }

          if (editor) {
            editor.innerHTML = content;
            return true;
          }
          return false;
        },
        args: [contentToCopy]
      });

      const success = results && results[0] ? results[0].result : false;

      if (success) {
        showNotification(chrome.i18n.getMessage('success_content_copied'), '', 'success');
      } else {
        throw new Error('无法将内容复制到编辑器');
      }
    } catch (error) {
      console.error('Error copying content:', error);
      showNotification(chrome.i18n.getMessage('error_copy_failed'), error.message || chrome.i18n.getMessage('error_copy_failed'), 'error');
    } finally {
      showProcessing(false);
    }
  });

  // Initialize Monaco Editors
  async function initializeEditors() {
    try {
      // Load Monaco Editor
      await loadMonaco();

      // Initialize source editor
      sourceEditor = monaco.editor.create(sourceEditorElement, {
        value: sourceContent || '',
        language: 'html',
        theme: 'vs-light',
        automaticLayout: true,
        minimap: {
          enabled: true
        },
        fontSize: 14,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        readOnly: false,
        formatOnType: true,
        formatOnPaste: true
      });

      // Initialize formatted editor
      formattedEditor = monaco.editor.create(formattedEditorElement, {
        value: formattedContent || '',
        language: 'html',
        theme: 'vs-light',
        automaticLayout: true,
        minimap: {
          enabled: true
        },
        fontSize: 14,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        readOnly: false,
        formatOnType: true,
        formatOnPaste: true
      });

      // Add change listeners
      sourceEditor.onDidChangeModelContent(() => {
        sourceContent = sourceEditor.getValue();
        aiTypesetBtn.disabled = !sourceContent;
      });

      formattedEditor.onDidChangeModelContent(() => {
        formattedContent = formattedEditor.getValue();
        const isValidPage = checkCurrentPage();
        copyBtn.disabled = !formattedContent || !isValidPage;
      });
      
      // Add format button event listeners
      document.getElementById('formatSourceBtn').addEventListener('click', async () => {
        if (sourceEditor) {
          try {
            sourceEditor.getAction('editor.action.formatDocument').run();
          } catch (error) {
            console.error('Error formatting source editor:', error);
            // Fallback: trigger the format action using the editor instance
            sourceEditor.trigger('any', 'editor.action.formatDocument', null);
          }
        }
      });
      
      document.getElementById('formatTargetBtn').addEventListener('click', async () => {
        if (formattedEditor) {
          try {
            formattedEditor.getAction('editor.action.formatDocument').run();
          } catch (error) {
            console.error('Error formatting formatted editor:', error);
            // Fallback: trigger the format action using the editor instance
            formattedEditor.trigger('any', 'editor.action.formatDocument', null);
          }
        }
      });
      
      // Add copy button event listeners
      document.getElementById('copySourceBtn').addEventListener('click', async () => {
        if (sourceEditor) {
          const content = sourceEditor.getValue();
          try {
            await navigator.clipboard.writeText(content);
            showNotification(chrome.i18n.getMessage('success_title'), chrome.i18n.getMessage('success_content_copied_clipboard'), 'success');
          } catch (error) {
            console.error('Error copying source content:', error);
            showNotification(chrome.i18n.getMessage('error_title'), chrome.i18n.getMessage('error_copy_failed'), 'error');
          }
        }
      });
      
      document.getElementById('copyTargetBtn').addEventListener('click', async () => {
        if (formattedEditor) {
          const content = formattedEditor.getValue();
          try {
            await navigator.clipboard.writeText(content);
            showNotification(chrome.i18n.getMessage('success_title'), chrome.i18n.getMessage('success_content_copied_clipboard'), 'success');
          } catch (error) {
            console.error('Error copying target content:', error);
            showNotification(chrome.i18n.getMessage('error_title'), chrome.i18n.getMessage('error_copy_failed'), 'error');
          }
        }
      });

    } catch (error) {
      console.error('Error initializing Monaco Editor:', error);
      showNotification(chrome.i18n.getMessage('error_title'), chrome.i18n.getMessage('error_editor_init_failed') + ': ' + error.message, 'error');

      // Fallback to simple divs
      sourceEditorElement.innerHTML = '<div class="editor-placeholder">' + chrome.i18n.getMessage('error_editor_load_failed') + '</div>';
      formattedEditorElement.innerHTML = '<div class="editor-placeholder">' + chrome.i18n.getMessage('error_editor_load_failed') + '</div>';
    }
  }

  // Load Monaco Editor
  async function loadMonaco() {
    return new Promise((resolve, reject) => {
      if (window.monaco) {
        resolve();
        return;
      }
      self.MonacoEnvironment = {
        getWorkerUrl: function (moduleId, label) {
          return chrome.runtime.getURL('monaco-editor/0.52.2/min/vs/base/worker/workerMain.js');
        }
      };


      // Create a more secure way to load Monaco
      const script = document.createElement('script');
      // Use relative path to local Monaco Editor
      script.src = 'monaco-editor/0.52.2/min/vs/loader.min.js';
      script.onload = () => {
        // Use a more secure configuration
        if (typeof require !== 'undefined') {
          require.config({
            paths: {
              'vs': 'monaco-editor/0.52.2/min/vs'
            },
            'vs/nls': {
              availableLanguages: {
                '*': 'zh-cn' // Set to Chinese if needed
              }
            }
          });

          // Load the main editor module
          require(['vs/editor/editor.main'], () => {
            resolve();
          }, (err) => {
            console.error('Monaco editor failed to load:', err);
            reject(new Error('Monaco editor failed to load'));
          });
        } else {
          reject(new Error('RequireJS not available'));
        }
      };
      script.onerror = (err) => {
        console.error('Failed to load Monaco loader:', err);
        reject(new Error('Failed to load Monaco editor'));
      };

      document.head.appendChild(script);
    });
  }

  // Check current page
  function checkCurrentPage() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        const currentTab = tabs[0];
        const isValidPage = currentTab.url && currentTab.url.startsWith('https://sites.ynu.edu.cn/system/site/column/news/addnews.jsp');
        resolve(isValidPage);
      });
    });
  }

  // Show/hide processing overlay
  function showProcessing(show) {
    processingOverlay.style.display = show ? 'flex' : 'none';
  }

  // Show notification
  function showNotification(title, message, type) {
    notification.textContent = `${title}: ${message}`;
    notification.className = 'notification ' + type;
    notification.style.display = 'block';

    // Also send to background for system notification
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        action: 'showNotification',
        title: title,
        message: message,
        type: type
      }, (response) => {
        // Check for communication errors but don't do anything since this is optional
        if (chrome.runtime.lastError) {
          console.warn('Notification sending error:', chrome.runtime.lastError.message);
        }
      });
    }

    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
  
  // Update the execution time label
  function updateExecutionTimeLabel(executionTimeMs) {
    const executionTimeLabel = document.getElementById('executionTimeLabel');
    const executionTimeText = document.getElementById('executionTimeText');
    
    // Convert milliseconds to seconds
    const executionTimeSec = executionTimeMs / 1000;
    
    // Format the time display (e.g. "2.5s" or "1250ms" if < 1s)
    let timeDisplay;
    if (executionTimeSec >= 1) {
      timeDisplay = `${executionTimeSec.toFixed(1)}s`;
    } else {
      timeDisplay = `${executionTimeMs}ms`;
    }
    
    executionTimeText.textContent = chrome.i18n.getMessage('execution_time_label', [timeDisplay]);
    executionTimeLabel.style.display = 'flex'; // Show the label
    
    // Store the execution time in case we need to reference it later
    executionStartTime = null;
  }
});

// Translate page elements
function translatePage() {
  // Translate header
  const title = chrome.i18n.getMessage('popup_title');
  if (title) {
    document.querySelector('.header h1').innerHTML = document.querySelector('.header h1').innerHTML.replace(
      '__MSG_popup_title__',
      title
    );
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
          // Extract message key (e.g., __MSG_popup_title__ -> popup_title)
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

  // Specifically update the processing text
  const processingText = document.querySelector('.processing-text');
  if (processingText) {
    const processingMsg = chrome.i18n.getMessage('processing_text');
    if (processingMsg) {
      processingText.textContent = processingMsg;
    }
  }
}