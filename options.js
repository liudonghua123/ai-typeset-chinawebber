// options.js
document.addEventListener('DOMContentLoaded', function() {
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
});

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get([
    'hiagent_baseurl',
    'hiagent_appid',
    'hiagent_appkey',
    'chinawebber_baseurl',
    'user_id'
  ], function(items) {
    document.getElementById('hiagent_baseurl').value = items.hiagent_baseurl || 'https://agent.ynu.edu.cn/api/proxy/api/v1';
    document.getElementById('hiagent_appid').value = items.hiagent_appid || '';
    document.getElementById('hiagent_appkey').value = items.hiagent_appkey || '';
    document.getElementById('chinawebber_baseurl').value = items.chinawebber_baseurl || 'https://sites.ynu.edu.cn';
    document.getElementById('user_id').value = items.user_id || '';
  });
}

// Save settings to storage
function saveSettings() {
  const settings = {
    hiagent_baseurl: document.getElementById('hiagent_baseurl').value,
    hiagent_appid: document.getElementById('hiagent_appid').value,
    hiagent_appkey: document.getElementById('hiagent_appkey').value,
    chinawebber_baseurl: document.getElementById('chinawebber_baseurl').value,
    user_id: document.getElementById('user_id').value
  };

  chrome.storage.sync.set(settings, function() {
    showNotification('设置已保存', 'success');
  });
}

// Reset settings to defaults
function resetSettings() {
  document.getElementById('hiagent_baseurl').value = 'https://agent.ynu.edu.cn/api/proxy/api/v1';
  document.getElementById('hiagent_appid').value = '';
  document.getElementById('hiagent_appkey').value = '';
  document.getElementById('chinawebber_baseurl').value = 'https://sites.ynu.edu.cn';
  document.getElementById('user_id').value = '';

  showNotification('已重置为默认值', 'warning');
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