// config.js - Default configuration values
const DEFAULT_CONFIG = {
  // AI Method selection
  ai_method: 'openai', // 'openai' or 'hiagent'

  // HiAgent settings
  hiagent_baseurl: 'https://agent.ynu.edu.cn/api/proxy/api/v1',
  hiagent_appid: '',
  hiagent_appkey: '',
  hiagent_user_id: '123',

  // OpenAI settings
  openai_baseurl: 'https://api.openai.com/v1',
  openai_apikey: '',
  model: 'gpt-3.5-turbo',
  prompt_system: 'You are a content formatter. Format the following HTML content properly.',

  // General settings
  chinawebber_baseurl: 'https://sites.ynu.edu.cn',

  // Language settings
  preferred_language: navigator.language || 'en'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_CONFIG };
}