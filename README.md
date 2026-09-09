# Krishi Sahayak

Krishi Sahayak is a comprehensive digital agriculture platform designed to empower farmers with localized crop guidance, real-time weather, market insights, and direct expert consultation.

## Features
- **Farm Management**: Track multiple farms, soil types, and crop cycles.
- **Smart Recommendations**: Get personalized crop and fertilizer suggestions based on soil, region, and season.
- **Pest & Disease ID**: Detailed catalogs and integrated management practices for crop protection.
- **Weather Integration**: Localized weather forecasts and agromet advisories.
- **Market Intelligence**: Real-time mandi prices.
- **Expert Connect**: Ticket-based consultation system with agricultural experts.
- **Multi-lingual Support**: Content served in local languages (Hindi, Marathi, English).

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT
- **Testing**: Jest, Supertest
- **Documentation**: Markdown

## Project Structure
```
Krishi Sahayak/
├── backend/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── seed/
│   ├── tests/
│   ├── server.js
│   └── package.json
├── frontend/
├── docs/
└── README.md
```

## Prerequisites
- Node.js 18+
- MongoDB (running locally or Atlas)

## Local Setup Instructions

1. **Clone repository**
   ```bash
   git clone https://github.com/mrunalp252-ux/KrishiSahayak.git
   cd "Krishi Sahayak"
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env and configure variables
   ```

3. **Start MongoDB**
   Ensure MongoDB service is running locally on port 27017 or provide a valid URI in `.env`.

4. **Seed Database**
   Populate the database with rich, real-world agricultural data:
   ```bash
   npm run seed
   ```

5. **Start Backend**
   ```bash
   npm run dev
   ```

6. **Frontend Setup**
   Open `frontend/index.html` in your browser or serve it using any static file server like Live Server.

## Default Accounts
The database seed script creates the following default accounts:
- **Admin**: `admin@krishisahayak.com` / `Admin@123456`
- **Expert**: `expert@krishisahayak.com` / `Expert@123456`

## Environment Variables (.env)
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/krishi-sahayak
TEST_MONGODB_URI=mongodb://localhost:27017/krishi-sahayak-test
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
AI_PROVIDER=gemini
AI_API_KEY=your_gemini_api_key_from_google_ai_studio
GEMINI_MODEL=gemini-3.7-flash
WEATHER_API_KEY=your_openweather_api_key
FRONTEND_URL=http://localhost:3000
```

## API Documentation
Refer to [docs/API.md](./docs/API.md) for complete endpoint references.

## Testing
Run the Jest test suite:
```bash
cd backend
npm test
```

## Deployment Instructions

### Backend (Node.js/Express)
1. Deploy to platforms like **Render, Railway, or AWS EC2**.
2. Set up environment variables securely in the host panel.
3. Ensure the start command is `npm start` (pointing to `node server.js`).

### Database
1. Use **MongoDB Atlas** for production.
2. Update the `MONGODB_URI` environment variable on the backend host.
3. Whitelist the backend host's IP address in Atlas Network Access.

### Frontend
1. Deploy static files to **Vercel, Netlify, or GitHub Pages**.
2. Ensure the API base URL in the frontend code points to your production backend URL.
3. Update `FRONTEND_URL` and CORS settings in the backend to allow requests from the new frontend domain.

## External Services Setup
- **OpenWeatherMap**: Register and get an API key for weather data.
- **SMTP**: Use services like SendGrid or AWS SES for transactional emails.
- **AWS S3 / Cloudinary** (Optional): For image uploads in expert consultations.

## Contributing Guidelines
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License
Distributed under the MIT License. See `LICENSE` for more information.
