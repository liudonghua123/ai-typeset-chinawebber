// content.js
(function() {
  'use strict';

  // Function to add the AI Typeset button
  function addTypesetButton() {
    // Check if we're on the correct page (allowing for query parameters)
    if (!window.location.href.startsWith('https://sites.ynu.edu.cn/system/site/column/news/addnews.jsp')) {
      console.log('Not on the correct page. Current URL:', window.location.href);
      return;
    }

    console.log('On the correct page. Adding AI Typeset button.');

    // Try multiple selectors to find the target element
    const selectors = [
      '#detailform > div.top > table > tbody > tr:nth-child(1) > td:nth-child(1)',
      '#detailform .top table td:first-child',
      '#detailform table td:first-child',
      '.top table td:first-child',
      'form[name="detailform"] .top table td:first-child'
    ];

    let targetElement = null;
    for (const selector of selectors) {
      targetElement = document.querySelector(selector);
      if (targetElement) {
        console.log('Found target element with selector:', selector);
        break;
      }
    }

    if (!targetElement) {
      console.error('Target element not found with any selector');
      // Log more information about the page structure
      const forms = document.querySelectorAll('form');
      console.log('Found', forms.length, 'forms on the page');
      forms.forEach((form, index) => {
        console.log('Form', index, 'id:', form.id, 'class:', form.className);
      });

      // Try one more approach - look for any table in the detail form
      const detailForm = document.querySelector('#detailform');
      if (detailForm) {
        const tables = detailForm.querySelectorAll('table');
        console.log('Found', tables.length, 'tables in detail form');
        if (tables.length > 0) {
          const firstTd = tables[0].querySelector('td');
          if (firstTd) {
            targetElement = firstTd;
            console.log('Using first table cell as target');
          }
        }
      }

      if (!targetElement) {
        return;
      }
    }

    // Create the button
    const typesetButton = document.createElement('input');
    typesetButton.id = 'ai-typeset-button';
    typesetButton.setAttribute("type", "button");
    typesetButton.setAttribute("class", "funButtonok");
    typesetButton.setAttribute("value", "一键排版");

    // Add click event listener
    typesetButton.addEventListener('click', async function() {
      // Show processing indicator
      showProcessingIndicator();

      try {
        // Get content from editor

        let editor;
        const iframe = document.querySelector('iframe[name="ueditor_subcontent"]');
        if (iframe && iframe.contentDocument) {
          editor = iframe.contentDocument.querySelector('#vsb_content_1');
        }
        const editorContent = editor.innerHTML || '';

        if (!editorContent || editorContent.trim() === '') {
          throw new Error('Editor content is empty or could not retrieve');
        }

        // Send message to background script for AI typesetting using callback approach
        try {
          const response = await new Promise((resolve, reject) => {
            const msgResponse = chrome.runtime.sendMessage({
              action: 'oneClickTypeset',
              content: editorContent
            }, (response) => {
              // Check if there was an error during message sending
              if (chrome.runtime.lastError) {
                reject(new Error('Communication error: ' + chrome.runtime.lastError.message));
                return;
              }
              resolve(response);
            });
            
            // Handle the case where sendMessage might fail synchronously
            if (msgResponse === undefined && !chrome.runtime.lastError) {
              // For Manifest V2, sendMessage may return undefined when using the callback approach
              // This is normal behavior, so we don't reject here
            }
          });

          // Check if response is valid
          if (!response) {
            throw new Error('后台服务无响应，请稍后重试');
          }

          if (response.success) {
            // Set the formatted content back to the editor
            document.querySelector('#vsb_content_1').innerHTML = response.formattedContent;
            showNotification('排版完成', '内容已成功排版并更新到编辑器中');
          } else {
            throw new Error(response.error || '排版失败');
          }
        } catch (sendError) {
          console.error('Error communicating with background script:', sendError);
          throw new Error(sendError.message || '无法连接到后台服务，请检查扩展是否正常运行');
        }
      } catch (error) {
        console.error('AI Typeset error:', error);
        showNotification('排版失败', error.message || '发生未知错误');
      } finally {
        hideProcessingIndicator();
      }
    });
    // Append container to target element
    targetElement.appendChild(typesetButton);
  }

  // Function to show processing indicator
  function showProcessingIndicator() {
    // Remove existing indicator if present
    const existingIndicator = document.getElementById('processing-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'processing-indicator';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalOverlay.style.zIndex = '10000';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';

    // Create indicator box
    const indicatorBox = document.createElement('div');
    indicatorBox.style.backgroundColor = 'white';
    indicatorBox.style.padding = '20px';
    indicatorBox.style.borderRadius = '8px';
    indicatorBox.style.textAlign = 'center';
    indicatorBox.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

    // Create spinner
    const spinner = document.createElement('div');
    spinner.style.border = '4px solid #f3f3f3';
    spinner.style.borderTop = '4px solid #4CAF50';
    spinner.style.borderRadius = '50%';
    spinner.style.width = '40px';
    spinner.style.height = '40px';
    spinner.style.animation = 'spin 1s linear infinite';
    spinner.style.margin = '0 auto 15px';

    // Add CSS for spinner animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    // Create text
    const text = document.createElement('p');
    text.textContent = '正在排版中...';
    text.style.margin = '0';
    text.style.fontWeight = 'bold';

    // Assemble elements
    indicatorBox.appendChild(spinner);
    indicatorBox.appendChild(text);
    modalOverlay.appendChild(indicatorBox);
    document.body.appendChild(modalOverlay);
  }

  // Function to hide processing indicator
  function hideProcessingIndicator() {
    const indicator = document.getElementById('processing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  // Function to show notification
  function showNotification(title, message, type = 'info') {
    // Use Chrome notifications API
    chrome.runtime.sendMessage({
      action: 'showNotification',
      title: title,
      message: message,
      type: type
    });
  }

  // Handle one-click typesetting
  async function handleOneClickTypeset() {
    // Show processing indicator
    showProcessingIndicator();

    try {
      // Get content from editor (check both main document and iframe)
      let editor = document.querySelector('#vsb_content_1');

      // If not found in main document, check iframe
      if (!editor) {
        const iframe = document.querySelector('iframe[name="ueditor_subcontent"]');
        if (iframe && iframe.contentDocument) {
          editor = iframe.contentDocument.querySelector('#vsb_content_1');
        }
      }

      if (!editor) {
        throw new Error('无法找到编辑器元素');
      }

      const editorContent = editor.innerHTML;

      if (!editorContent || editorContent.trim() === '') {
        throw new Error('Editor content is empty');
      }

      // Send message to background script for AI typesetting
      const response = await chrome.runtime.sendMessage({
        action: 'oneClickTypeset',
        content: editorContent
      });

      if (response.success) {
        // Set the formatted content back to the editor (check both main document and iframe)
        let editor = document.querySelector('#vsb_content_1');

        // If not found in main document, check iframe
        if (!editor) {
          const iframe = document.querySelector('iframe[name="ueditor_subcontent"]');
          if (iframe && iframe.contentDocument) {
            editor = iframe.contentDocument.querySelector('#vsb_content_1');
          }
        }

        if (editor) {
          editor.innerHTML = response.formattedContent;
        } else {
          throw new Error('无法找到编辑器元素来设置内容');
        }
        showNotification('排版完成', '内容已成功排版并更新到编辑器中', 'success');
      } else {
        throw new Error(response.error || '排版失败');
      }
    } catch (error) {
      console.error('AI Typeset error:', error);
      showNotification('排版失败', error.message || '发生未知错误', 'error');
    } finally {
      hideProcessingIndicator();
    }
  }

  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTypesetButton);
  } else {
    addTypesetButton();
  }
})();