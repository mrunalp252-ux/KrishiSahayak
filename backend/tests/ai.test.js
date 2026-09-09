const request = require('supertest');
const app = require('./setup');
const aiService = require('../services/aiService');
const User = require('../models/User');

describe('AI Assistant Configuration & Endpoints', () => {
  let farmerToken;

  beforeAll(async () => {
    // Create a test user for AI chat
    await User.deleteMany({ email: 'aitest@test.com' });
    const userRes = await request(app).post('/api/auth/register').send({
      name: 'AI Farmer',
      email: 'aitest@test.com',
      password: 'Password@123',
      phone: '9876543210',
      role: 'farmer'
    });
    farmerToken = userRes.body.token;
  });

  describe('AI Provider Abstraction', () => {
    it('should detect Gemini as default provider', () => {
      expect(aiService.getProvider()).toBe('gemini');
    });

    it('should detect default Gemini model', () => {
      expect(aiService.getModel()).toBe(process.env.GEMINI_MODEL || 'gemini-3.7-flash');
    });

    it('should construct correct Gemini API endpoint', () => {
      const endpoint = aiService.getApiEndpoint();
      expect(endpoint).toContain('generativelanguage.googleapis.com');
      expect(endpoint).toContain('generateContent');
    });

    it('should report unconfigured when AI_API_KEY is not set', () => {
      delete process.env.AI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      expect(aiService.isConfigured()).toBe(false);
    });

    it('should format language instructions for English, Hindi, and Marathi', () => {
      expect(aiService._getLanguageInstruction('en')).toBe('');
      expect(aiService._getLanguageInstruction('hi')).toContain('Hindi');
      expect(aiService._getLanguageInstruction('mr')).toContain('Marathi');
    });

    it('should sanitize and redact API key from error strings', () => {
      const fakeKey = 'TestApiKeySecret999888';
      process.env.AI_API_KEY = fakeKey;
      const sanitized = aiService._sanitize(`Error occurred with key ${fakeKey}`);
      expect(sanitized).not.toContain(fakeKey);
      expect(sanitized).toContain('[REDACTED_SECRET]');
      delete process.env.AI_API_KEY;
    });
  });

  describe('AI API Routes & Security', () => {
    it('should require authentication for AI chat (401 without token)', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({ message: 'What crop should I grow?' });
      expect(res.statusCode).toBe(401);
    });

    it('should require a non-empty message (400 for empty message)', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ message: '   ' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 503 when AI service is not configured', async () => {
      delete process.env.AI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ message: 'How do I control cotton bollworm?' });
      expect(res.statusCode).toBe(503);
      expect(res.body.message).toContain('AI service is not configured. Please set AI_API_KEY in environment variables.');
    });

    it('should handle Hindi language chat queries', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ message: 'कपास के लिए सबसे अच्छी खाद कौन सी है?', language: 'hi' });
      expect(res.statusCode).toBe(503);
      expect(res.body.message).toContain('AI service is not configured');
    });

    it('should handle Marathi language chat queries', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ message: 'कापूस पिकासाठी योग्य खत कोणते?', language: 'mr' });
      expect(res.statusCode).toBe(503);
      expect(res.body.message).toContain('AI service is not configured');
    });

    it('should require image file for crop analysis (400 for missing file)', async () => {
      const res = await request(app)
        .post('/api/ai/analyze-crop')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(res.statusCode).toBe(400);
    });

    it('should never leak secret credentials or internal keys in response payload', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ message: 'Security probe test' });
      const rawBody = JSON.stringify(res.body);
      expect(rawBody).not.toContain('AIza');
      expect(rawBody).not.toContain('sk-');
      expect(rawBody).not.toContain('Bearer');
    });
  });
});
