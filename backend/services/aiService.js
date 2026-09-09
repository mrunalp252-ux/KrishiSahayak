const axios = require('axios');
const fs = require('fs');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.systemInstruction = `You are Krishi Sahayak, an expert AI agricultural assistant dedicated to empowering Indian farmers.
Provide accurate, farmer-friendly, practical, and sustainable agricultural guidance. Respond in the user's preferred language when specified.

CRITICAL AGRICULTURAL SAFETY & CHEMICAL DIRECTIVES:
1. Prioritize Integrated Pest Management (IPM), cultural practices, and biological/organic remedies as the primary recommendation.
2. NEVER prescribe dangerous chemical concoctions, off-label pesticide mixtures, or speculative chemical dosages.
3. If synthetic chemical pesticides, insecticides, or fungicides are mentioned, you MUST explicitly advise:
   - Reading and strictly adhering to the official manufacturer label and local CIBRC guidelines.
   - Wearing personal protective equipment (PPE: gloves, mask, eye protection) during mixing and application.
   - Consulting a local Agricultural Extension Officer, KVK (Krishi Vigyan Kendra) scientist, or licensed agronomist before spraying.
4. When uncertain or when symptoms could indicate multiple distinct plant diseases, state your uncertainty clearly and advise on-site physical leaf/soil testing.`;
  }

  getProvider() {
    return (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();
  }

  getApiKey() {
    const directKey = (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
    if (directKey) return directKey;

    // Safety fallback: If Gemini API key was inadvertently placed in WEATHER_API_KEY
    const weatherKey = (process.env.WEATHER_API_KEY || '').trim();
    if (weatherKey) {
      logger.warn('Gemini API credential was detected in WEATHER_API_KEY environment variable. Using credential for AI Service. Please update environment variables to use AI_API_KEY.');
      return weatherKey;
    }
    return '';
  }

  isConfigured() {
    return !!this.getApiKey();
  }

  getModel() {
    const provider = this.getProvider();
    if (provider === 'gemini') {
      return process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    } else if (provider === 'openai') {
      return process.env.OPENAI_MODEL || 'gpt-4o-mini';
    }
    return 'default';
  }

  getApiEndpoint() {
    const provider = this.getProvider();
    if (provider === 'gemini') {
      const baseUrl = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';
      return `${baseUrl.replace(/\/+$/, '')}/models/${this.getModel()}:generateContent`;
    } else if (provider === 'openai') {
      return 'https://api.openai.com/v1/chat/completions';
    }
    return '';
  }

  async chat(messages, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('AI service is not configured. Please set AI_API_KEY in environment variables.');
    }

    const provider = this.getProvider();
    if (provider === 'gemini') {
      return this._chatGemini(messages, options);
    } else if (provider === 'openai') {
      return this._chatOpenAI(messages, options);
    }
    throw new Error(`Unsupported AI provider: ${provider}. Supported providers are 'gemini' and 'openai'.`);
  }

  _getLanguageInstruction(lang) {
    if (!lang || lang === 'en') return '';
    if (lang === 'hi') return '\n\nIMPORTANT: Please respond completely in Hindi (हिंदी).';
    if (lang === 'mr') return '\n\nIMPORTANT: Please respond completely in Marathi (मराठी).';
    return `\n\nIMPORTANT: Please respond completely in ${lang}.`;
  }

  async _chatGemini(messages, options = {}) {
    const apiKey = this.getApiKey();
    const languageNote = this._getLanguageInstruction(options.language);
    let model = this.getModel();
    const baseUrl = (process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/+$/, '');
    
    const formattedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const payload = {
      system_instruction: { parts: [{ text: this.systemInstruction + languageNote }] },
      contents: formattedMessages,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7
      }
    };

    const headers = {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    };

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const endpoint = `${baseUrl}/models/${model}:generateContent`;
      try {
        const response = await axios.post(endpoint, payload, { headers, timeout: 60000 });
        
        const parts = response.data?.candidates?.[0]?.content?.parts || [];
        const textParts = parts.filter(p => p.text && !p.thought).map(p => p.text);
        if (textParts.length > 0) {
          return textParts.join('\n').trim();
        }
        if (parts[0]?.text) {
          return parts[0].text.trim();
        }
        throw new Error('Invalid response structure from Gemini API');
      } catch (err) {
        // If quota exhausted (429) on an alternate model, attempt fallback to gemini-3.8-flash
        if (err.response?.status === 429 && model !== 'gemini-3.8-flash' && attempt < maxAttempts) {
          logger.warn(`Gemini model ${model} reached quota limit. Retrying with gemini-3.8-flash...`);
          model = 'gemini-3.8-flash';
          continue;
        }

        const isTransient = err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.response?.status === 503;
        if (isTransient && attempt < maxAttempts) {
          const delayMs = 2000 * attempt;
          logger.warn(`Gemini transient issue (${err.message || err.code}), retrying attempt ${attempt + 1} in ${delayMs}ms...`);
          await new Promise(r => setTimeout(r, delayMs));
          continue;
        }
        this._handleApiError('Gemini', err);
      }
    }
  }

  async _chatOpenAI(messages, options = {}) {
    const apiKey = this.getApiKey();
    const languageNote = this._getLanguageInstruction(options.language);
    const endpoint = this.getApiEndpoint();
    const model = this.getModel();

    try {
      const response = await axios.post(
        endpoint,
        {
          model,
          messages: [
            { role: 'system', content: this.systemInstruction + languageNote },
            ...messages.map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content
            }))
          ],
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content.trim();
      }
      throw new Error('Invalid response structure from OpenAI API');
    } catch (err) {
      this._handleApiError('OpenAI', err);
    }
  }

  async analyzeImage(filePath, mimeType) {
    if (!this.isConfigured()) {
      throw new Error('AI service is not configured for image analysis. Please set AI_API_KEY in environment variables.');
    }

    const provider = this.getProvider();
    if (provider !== 'gemini') {
      throw new Error('Image analysis is currently only supported with the Gemini AI provider.');
    }

    try {
      const imageData = fs.readFileSync(filePath);
      const base64Image = imageData.toString('base64');
      const apiKey = this.getApiKey();
      const endpoint = this.getApiEndpoint();

      const response = await axios.post(
        endpoint,
        {
          system_instruction: {
            parts: [{ text: `You are an agricultural image analyst. Analyze crop images for diseases, pests, or nutrient deficiencies. 
Return a JSON object with: possibleIssue (string), symptoms (array of strings), confidence (string: low/medium/high), 
nextSteps (array of strings), prevention (array of strings).
IMPORTANT: Never represent this as a definitive diagnosis. Always recommend consulting an agricultural expert.
Do not give specific pesticide dosage instructions.` }]
          },
          contents: [{
            role: 'user',
            parts: [
              { text: 'Analyze this crop image for any diseases, pests, or issues:' },
              { inline_data: { mime_type: mimeType, data: base64Image } }
            ]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          timeout: 30000
        }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            ...parsed,
            disclaimer: 'This is an AI-generated analysis and should NOT be treated as a definitive diagnosis. Please consult a qualified agricultural expert for accurate identification and treatment recommendations.'
          };
        }
      } catch (parseErr) {
        // Fall back to structured response
      }

      return {
        possibleIssue: 'Analysis completed - see details',
        symptoms: [text.substring(0, 200)],
        confidence: 'medium',
        nextSteps: ['Consult a local agricultural expert for accurate diagnosis'],
        prevention: ['Regular crop monitoring', 'Maintain field hygiene'],
        disclaimer: 'This is an AI-generated analysis and should NOT be treated as a definitive diagnosis. Please consult a qualified agricultural expert for accurate identification and treatment recommendations.'
      };
    } catch (err) {
      if (err.message.includes('not configured') || err.message.includes('supported')) {
        throw err;
      }
      this._handleApiError('Gemini Vision', err);
    }
  }

  _sanitize(text) {
    if (!text) return '';
    let sanitized = typeof text === 'string' ? text : JSON.stringify(text);
    const key = this.getApiKey();
    if (key && key.length > 4) {
      sanitized = sanitized.split(key).join('[REDACTED_SECRET]');
    }
    return sanitized;
  }

  _handleApiError(provider, err) {
    const rawError = err.response?.data?.error?.message || err.response?.data || err.message || '';
    const safeError = this._sanitize(rawError);
    logger.error(`${provider} API error: ${safeError}`);

    if (err.code === 'ECONNABORTED' || (err.message && err.message.includes('timeout'))) {
      throw new Error('AI service request timed out. Please try again.');
    }
    if (err.response?.status === 429) {
      throw new Error('AI service quota limit reached or rate limited. Please try again in a moment.');
    }
    if (err.response?.status === 503) {
      throw new Error('AI service is temporarily busy due to high demand. Please try again in a moment.');
    }
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error('AI service authentication failed. Please verify the configured API key.');
    }
    throw new Error('AI service temporarily unavailable. Please try again later.');
  }
}

module.exports = new AIService();
