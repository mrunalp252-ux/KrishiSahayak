const request = require('supertest');
const app = require('./setup');
const User = require('../models/User');
const Farm = require('../models/Farm');

describe('Farm API', () => {
  let userToken;
  let user2Token;
  let userId;

  const farmData = {
    name: 'My Primary Farm',
    size: 5,
    unit: 'acres',
    soilType: 'black',
    location: {
      state: 'Maharashtra',
      district: 'Pune',
      village: 'Khed'
    }
  };

  beforeAll(async () => {
    await User.deleteMany({});
    await Farm.deleteMany({});

    // User 1
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'Farmer 1', email: 'f1@test.com', password: 'Password123!', role: 'farmer'
    });
    userToken = res1.body.token;
    userId = res1.body.user._id;

    // User 2
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Farmer 2', email: 'f2@test.com', password: 'Password123!', role: 'farmer'
    });
    user2Token = res2.body.token;
  });

  afterEach(async () => {
    await Farm.deleteMany({});
  });

  it('should create a farm', async () => {
    const res = await request(app)
      .post('/api/farms')
      .set('Authorization', `Bearer ${userToken}`)
      .send(farmData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.farm).toHaveProperty('name', farmData.name);
  });

  it('should get all farms for user', async () => {
    await request(app).post('/api/farms').set('Authorization', `Bearer ${userToken}`).send(farmData);
    
    const res = await request(app)
      .get('/api/farms')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.farms)).toBeTruthy();
    expect(res.body.farms.length).toBe(1);
  });

  it('should get a single farm', async () => {
    const createRes = await request(app).post('/api/farms').set('Authorization', `Bearer ${userToken}`).send(farmData);
    const farmId = createRes.body.farm._id;

    const res = await request(app)
      .get(`/api/farms/${farmId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.farm._id).toEqual(farmId);
  });

  it('should update a farm', async () => {
    const createRes = await request(app).post('/api/farms').set('Authorization', `Bearer ${userToken}`).send(farmData);
    const farmId = createRes.body.farm._id;

    const res = await request(app)
      .put(`/api/farms/${farmId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ size: 10 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.farm.size).toEqual(10);
  });

  it('should delete a farm', async () => {
    const createRes = await request(app).post('/api/farms').set('Authorization', `Bearer ${userToken}`).send(farmData);
    const farmId = createRes.body.farm._id;

    const res = await request(app)
      .delete(`/api/farms/${farmId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
  });

  it('should restrict access to another users farm', async () => {
    const createRes = await request(app).post('/api/farms').set('Authorization', `Bearer ${userToken}`).send(farmData);
    const farmId = createRes.body.farm._id;

    const res = await request(app)
      .get(`/api/farms/${farmId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect([403, 404]).toContain(res.statusCode);
  });
});
