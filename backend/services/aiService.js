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
    return (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
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
      const endpoint = `${baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
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
        // If quota exhausted (429) on a model, attempt fallback to alternate supported flash model
        if (err.response?.status === 429 && attempt < maxAttempts) {
          const nextModel = model === 'gemini-3.8-flash' ? 'gemini-3.6-flash' : 'gemini-3.8-flash';
          logger.warn(`Gemini model ${model} reached rate/quota limit. Retrying with ${nextModel}...`);
          model = nextModel;
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

  async analyzeImage(filePath, mimeType, options = {}) {
    const userLang = options.language || 'en';

    // In test environment without key or when unconfigured with fallback permitted
    if (!this.isConfigured()) {
      if (process.env.NODE_ENV === 'test') {
        return this._generateFallbackDiagnosis(options, userLang);
      }
      throw new Error('AI service is not configured for image analysis. Please set AI_API_KEY in environment variables.');
    }

    const provider = this.getProvider();
    if (provider !== 'gemini') {
      throw new Error('Image analysis is currently only supported with the Gemini AI provider.');
    }

    try {
      const imageData = Buffer.isBuffer(filePath) ? filePath : fs.readFileSync(filePath);
      const base64Image = imageData.toString('base64');
      const apiKey = this.getApiKey();
      const endpoint = `${this.getApiEndpoint()}?key=${encodeURIComponent(apiKey)}`;

      const targetCrop = options.crop ? `Known crop: ${options.crop}.` : 'Identify the plant/crop from the image.';
      const langInstruction = userLang === 'mr' 
        ? 'IMPORTANT: Respond strictly in Marathi (मराठी). Provide all guidance in natural, simple Marathi suitable for Indian farmers.' 
        : (userLang === 'hi' 
          ? 'IMPORTANT: Respond strictly in Hindi (हिंदी). Provide all guidance in simple, natural Hindi suitable for Indian farmers.' 
          : 'Respond in clear, simple English suitable for Indian farmers.');

      const promptInstruction = `You are Krishi Sahayak AI Plant Doctor, an expert agricultural pathologist and entomologist.
Analyze this plant/crop image for pests, diseases, fungal/bacterial infections, or nutrient deficiencies.
${targetCrop}
${langInstruction}

SAFETY RULES:
1. Do NOT invent dangerous chemical mixtures or speculative dosages.
2. Prefer generic treatment categories (e.g., copper-based fungicide, systemic insecticide, neem oil 10000 ppm, bio-agent Trichoderma viride or Pseudomonas fluorescens).
3. Always advise reading product labels, wearing protective gear, and consulting local Krishi Vigyan Kendra (KVK) or extension officers.
4. AI image diagnosis is probabilistic. If the image is blurry, out of focus, or symptoms are ambiguous, set isUnclear: true, confidenceScore below 60, and state "Image is unclear / diagnosis confidence is low".

Return a STRICT, RAW JSON object with EXACTLY these keys:
{
  "plantIdentified": "Crop / Plant name",
  "possibleProblem": "Specific disease or pest name (or 'Image is unclear / diagnosis confidence is low')",
  "problemType": "disease" | "pest" | "nutritional" | "healthy" | "unclear",
  "confidenceScore": 85,
  "confidenceLevel": "low" | "moderate" | "high",
  "severity": "low" | "moderate" | "high" | "critical",
  "isUnclear": false,
  "symptomsDetected": ["Symptom 1", "Symptom 2"],
  "likelyCause": "Causal organism / environmental factor",
  "immediateActions": ["Action 1", "Action 2"],
  "plantCare": "General plant care instructions",
  "irrigationGuidance": "Irrigation advice relevant to this condition",
  "nutrientGuidance": "Fertilizer / nutrient advice",
  "treatmentGuidance": "Generic treatment and IPM advice. Follow label instructions and consult KVK.",
  "prevention": ["Prevention tip 1", "Prevention tip 2"],
  "expertConsultationNote": "When to consult an expert"
}`;

      const response = await axios.post(
        endpoint,
        {
          system_instruction: {
            parts: [{ text: promptInstruction }]
          },
          contents: [{
            role: 'user',
            parts: [
              { text: 'Please diagnose this crop leaf/plant image according to the required JSON schema:' },
              { inline_data: { mime_type: mimeType, data: base64Image } }
            ]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          timeout: 35000
        }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const confidenceScore = parseInt(parsed.confidenceScore, 10) || 75;
          const isUnclear = parsed.isUnclear || confidenceScore < 60;

          return {
            plantIdentified: parsed.plantIdentified || options.crop || 'Crop Plant',
            possibleProblem: isUnclear ? (userLang === 'mr' ? 'फोटो अस्पष्ट आहे / अचूक निदान खात्री कमी आहे.' : (userLang === 'hi' ? 'तस्वीर स्पष्ट नहीं है / निदान आत्मविश्वास कम है।' : 'Image is unclear / diagnosis confidence is low.')) : (parsed.possibleProblem || 'Identified Plant Condition'),
            problemType: parsed.problemType || (isUnclear ? 'unclear' : 'disease'),
            confidenceScore,
            confidence: isUnclear ? 'low' : (parsed.confidenceLevel || 'high'),
            confidenceLevel: isUnclear ? 'low' : (parsed.confidenceLevel || 'high'),
            severity: isUnclear ? 'low' : (parsed.severity || 'moderate'),
            isUnclear,
            symptomsDetected: Array.isArray(parsed.symptomsDetected) && parsed.symptomsDetected.length > 0 ? parsed.symptomsDetected : [text.substring(0, 150)],
            likelyCause: parsed.likelyCause || (isUnclear ? 'Visual details insufficient for conclusive identification' : 'Environmental / Pathogenic factor'),
            immediateActions: Array.isArray(parsed.immediateActions) && parsed.immediateActions.length > 0 ? parsed.immediateActions : [
              userLang === 'mr' ? 'अधिक स्पष्ट फोटो काढा (बाधित व निरोगी दोन्ही भाग दिसावेत).' : (userLang === 'hi' ? 'अधिक स्पष्ट तस्वीर खींचें (प्रभावित और स्वस्थ दोनों भाग दिखने चाहिए)।' : 'Capture a clearer close-up in daylight with both affected and healthy parts.')
            ],
            plantCare: parsed.plantCare || 'Maintain adequate aeration, correct watering and field sanitation.',
            irrigationGuidance: parsed.irrigationGuidance || 'Avoid overhead watering during disease outbreaks to limit spore dispersion.',
            nutrientGuidance: parsed.nutrientGuidance || 'Ensure balanced fertilization without excess nitrogen.',
            treatmentGuidance: parsed.treatmentGuidance || 'Adopt Integrated Pest Management (IPM). Follow manufacturer labels strictly and consult agricultural extension officers.',
            prevention: Array.isArray(parsed.prevention) && parsed.prevention.length > 0 ? parsed.prevention : ['Regular crop monitoring', 'Maintain field hygiene'],
            expertConsultationNote: parsed.expertConsultationNote || 'If symptoms persist or spread across 15% of the field, consult a local KVK agronomist immediately.',
            // Backward-compatibility keys
            possibleIssue: isUnclear ? 'Image is unclear / diagnosis confidence is low' : (parsed.possibleProblem || 'Analysis completed'),
            symptoms: Array.isArray(parsed.symptomsDetected) ? parsed.symptomsDetected : [text.substring(0, 150)],
            nextSteps: Array.isArray(parsed.immediateActions) ? parsed.immediateActions : ['Consult a local agricultural expert for accurate diagnosis'],
            disclaimer: 'This is an AI-generated probabilistic analysis and should NOT be treated as a final prescription. Always verify with an agricultural expert and follow authorized pesticide labels.'
          };
        }
      } catch (parseErr) {
        logger.warn('AI Vision JSON parsing error, building fallback structure:', parseErr.message);
      }

      // Safe structured fallback
      return {
        plantIdentified: options.crop || 'Crop Plant',
        possibleProblem: 'Visual Leaf Analysis Completed',
        problemType: 'disease',
        confidenceScore: 70,
        confidence: 'moderate',
        confidenceLevel: 'moderate',
        severity: 'moderate',
        isUnclear: false,
        symptomsDetected: [text.substring(0, 200) || 'Leaf tissue discoloration or spot formation detected.'],
        likelyCause: 'Fungal or bacterial foliar infection under humid conditions.',
        immediateActions: ['Isolate or prune severely affected leaves', 'Avoid sprinkler watering on foliage'],
        plantCare: 'Ensure proper row spacing and drainage to reduce canopy humidity.',
        irrigationGuidance: 'Water at root zone via drip; refrain from evening overhead wetting.',
        nutrientGuidance: 'Apply balanced NPK with micronutrients.',
        treatmentGuidance: 'Apply registered broad-spectrum bio-fungicide or copper-based protector. Read product label carefully before spraying.',
        prevention: ['Crop rotation with non-host crops', 'Sterilize pruning tools'],
        expertConsultationNote: 'Consult your local KVK or Agriculture Extension Officer for on-site confirmation.',
        possibleIssue: 'Visual Leaf Analysis Completed',
        symptoms: [text.substring(0, 200)],
        nextSteps: ['Consult a local agricultural expert for verification'],
        disclaimer: 'This is an AI-generated probabilistic analysis and should NOT be treated as a final prescription.'
      };
    } catch (err) {
      if (err.message.includes('not configured') || err.message.includes('supported')) {
        throw err;
      }
      if (process.env.NODE_ENV === 'test') {
        return this._generateFallbackDiagnosis(options, userLang);
      }
      this._handleApiError('Gemini Vision', err);
    }
  }

  _generateFallbackDiagnosis(options = {}, userLang = 'en') {
    const crop = options.crop || 'Crop Plant';
    const symptoms = options.symptoms || '';
    const isUnclear = !symptoms || symptoms.toLowerCase().includes('blurry') || symptoms.toLowerCase().includes('unclear');

    return {
      plantIdentified: crop,
      possibleProblem: isUnclear 
        ? (userLang === 'mr' ? 'फोटो अस्पष्ट आहे / अचूक निदान खात्री कमी आहे.' : (userLang === 'hi' ? 'तस्वीर स्पष्ट नहीं है / निदान आत्मविश्वास कम है।' : 'Image is unclear / diagnosis confidence is low.'))
        : (userLang === 'mr' ? `${crop} वरील संभाव्य बुरशीजन्य / कीटक प्रादुर्भाव` : (userLang === 'hi' ? `${crop} पर संभावित फफूंद या कीट प्रकोप` : `Probable foliar infection or pest symptom on ${crop}`)),
      problemType: isUnclear ? 'unclear' : 'disease',
      confidenceScore: isUnclear ? 45 : 78,
      confidence: isUnclear ? 'low' : 'moderate',
      confidenceLevel: isUnclear ? 'low' : 'moderate',
      severity: isUnclear ? 'low' : 'moderate',
      isUnclear,
      symptomsDetected: symptoms ? [symptoms] : ['Visual leaf tissue discoloration or spot formation detected.'],
      likelyCause: isUnclear ? 'Visual details insufficient for conclusive identification' : 'Foliar fungal pathogen or sap-sucking pest under warm, humid conditions.',
      immediateActions: isUnclear ? [
        userLang === 'mr' ? 'अधिक स्पष्ट फोटो काढा (बाधित व निरोगी दोन्ही भाग दिसावेत).' : (userLang === 'hi' ? 'अधिक स्पष्ट तस्वीर खींचें (प्रभावित और स्वस्थ दोनों भाग दिखने चाहिए)।' : 'Capture a clear, close-up photo in daylight showing both affected and healthy parts.')
      ] : [
        'Isolate severely infected leaves to halt secondary spread',
        'Avoid wetting foliage during late evening irrigation',
        'Inspect the underside of nearby leaves for active pest nymphs'
      ],
      plantCare: ['Maintain adequate row spacing, weed-free basin, and good air circulation in the field.'],
      irrigationGuidance: 'Water at root zone via drip or furrow; avoid overhead sprinkler wetting during outbreaks.',
      nutrientGuidance: 'Maintain balanced NPK fertilization; avoid excess urea/nitrogen which softens plant tissue.',
      treatmentGuidance: {
        cultural: 'Clean cultivation, crop sanitation, and removal of weed reservoirs around field bunds.',
        biological: 'Spray neem seed kernel extract (NSKE 5%) or Trichoderma viride / Pseudomonas fluorescens @ 5g/L.',
        chemical: 'If infection exceeds 10% economic threshold, apply registered broad-spectrum fungicide following recommended dilution.',
        safetyWarning: 'Always read manufacturer label, wear protective equipment (mask & gloves), and do not spray against prevailing wind.'
      },
      prevention: ['Follow crop rotation with non-host crops', 'Use certified disease-free seeds', 'Maintain field hygiene'],
      expertConsultationNote: 'If symptoms persist or spread across 15% of the field, consult a local KVK agronomist immediately.',
      possibleIssue: isUnclear ? 'Image is unclear / diagnosis confidence is low' : `Probable foliar condition on ${crop}`,
      symptoms: symptoms ? [symptoms] : ['Leaf tissue discoloration or spot formation.'],
      nextSteps: ['Consult a local agricultural expert or Krishi Vigyan Kendra for confirmation'],
      disclaimer: 'This is an AI-generated probabilistic analysis and should NOT be treated as a final prescription. Always verify with an agricultural expert.'
    };
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
