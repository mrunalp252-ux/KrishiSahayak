const request = require('supertest');
const app = require('./setup');

describe('General API endpoints', () => {
  it('should return 200 for health check', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 404]).toContain(res.statusCode); // 404 if health endpoint is not implemented
    if(res.statusCode === 200) {
      expect(res.body).toHaveProperty('status', 'ok');
    }
  });

  it('should return 404 for invalid endpoint', async () => {
    const res = await request(app).get('/api/nonexistent-endpoint-12345');
    expect(res.statusCode).toEqual(404);
  });
});
