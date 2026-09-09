const request = require('supertest');
const app = require('./setup');
const User = require('../models/User');
const Crop = require('../models/Crop');

describe('Crop API', () => {
  let adminToken;
  let farmerToken;

  const cropData = {
    name: 'Test Crop',
    scientificName: 'Testus cropus',
    category: 'cereal',
    suitableSoils: ['loamy'],
    seasons: ['kharif'],
    temperature: { min: 20, max: 30 },
    waterRequirement: 'moderate',
    durationDays: { min: 90, max: 120 }
  };

  beforeAll(async () => {
    await User.deleteMany({});
    await Crop.deleteMany({});

    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Admin', email: 'admin@test.com', password: 'Password123!', role: 'admin'
    });
    // In a real scenario, role might need to be set directly via DB if API prevents it
    await User.updateOne({ email: 'admin@test.com' }, { role: 'admin' });
    
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com', password: 'Password123!'
    });
    adminToken = loginRes.body.token;

    const farmerRes = await request(app).post('/api/auth/register').send({
      name: 'Farmer', email: 'farmer@test.com', password: 'Password123!', role: 'farmer'
    });
    farmerToken = farmerRes.body.token;
  });

  afterEach(async () => {
    await Crop.deleteMany({});
  });

  it('should allow admin to create crop', async () => {
    const res = await request(app)
      .post('/api/crops')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(cropData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.crop).toHaveProperty('name', cropData.name);
  });

  it('should not allow non-admin to create crop', async () => {
    const res = await request(app)
      .post('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send(cropData);

    expect(res.statusCode).toEqual(403);
  });

  it('should get all crops (public/authenticated)', async () => {
    await request(app).post('/api/crops').set('Authorization', `Bearer ${adminToken}`).send(cropData);
    
    const res = await request(app)
      .get('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.crops)).toBeTruthy();
  });

  it('should get a single crop', async () => {
    const createRes = await request(app).post('/api/crops').set('Authorization', `Bearer ${adminToken}`).send(cropData);
    const cropId = createRes.body.crop._id;

    const res = await request(app)
      .get(`/api/crops/${cropId}`)
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.crop._id).toEqual(cropId);
  });

  it('should allow admin to update crop', async () => {
    const createRes = await request(app).post('/api/crops').set('Authorization', `Bearer ${adminToken}`).send(cropData);
    const cropId = createRes.body.crop._id;

    const res = await request(app)
      .put(`/api/crops/${cropId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ waterRequirement: 'high' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.crop.waterRequirement).toEqual('high');
  });
});
