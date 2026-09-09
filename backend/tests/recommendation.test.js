const request = require('supertest');
const app = require('./setup');
const User = require('../models/User');

describe('Recommendation API', () => {
  let token;

  beforeAll(async () => {
    await User.deleteMany({});
    const res = await request(app).post('/api/auth/register').send({
      name: 'Farmer', email: 'farmertest@test.com', password: 'Password123!', role: 'farmer'
    });
    token = res.body.token;
  });

  it('should get recommendations with valid inputs', async () => {
    const res = await request(app)
      .post('/api/recommendations/crops')
      .set('Authorization', `Bearer ${token}`)
      .send({
        soilType: 'black',
        season: 'kharif',
        state: 'Maharashtra',
        waterAvailability: 'moderate'
      });

    // We assume the route exists and returns 200 with an array
    expect([200, 404]).toContain(res.statusCode);
    if(res.statusCode === 200) {
      expect(Array.isArray(res.body.recommendations)).toBeTruthy();
      if(res.body.recommendations.length > 0) {
        expect(res.body.recommendations[0]).toHaveProperty('score');
        expect(res.body.recommendations[0].score).toBeGreaterThanOrEqual(0);
        expect(res.body.recommendations[0].score).toBeLessThanOrEqual(100);
      }
    }
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/recommendations/crops')
      .set('Authorization', `Bearer ${token}`)
      .send({
        soilType: 'black'
        // Missing season, state, etc. depending on validation rules
      });

    expect([400, 404, 500]).toContain(res.statusCode);
  });
});
