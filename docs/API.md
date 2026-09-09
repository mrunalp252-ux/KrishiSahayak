# Krishi Sahayak API Documentation

Base URL: `http://localhost:5000/api`

## Authentication (`/api/auth`)

### 1. Register User
- **Method:** `POST`
- **Path:** `/auth/register`
- **Auth:** Public
- **Description:** Register a new farmer account.
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "state": "Maharashtra",
    "district": "Pune"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "farmer"
    }
  }
  ```
- **Error Responses:** 400 (Validation Error), 409 (Email Exists)

### 2. Login
- **Method:** `POST`
- **Path:** `/auth/login`
- **Auth:** Public
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "Password123"
  }
  ```
- **Success Response (200):** Same as Register.
- **Error Responses:** 401 (Invalid Credentials)

### 3. Get Current User
- **Method:** `GET`
- **Path:** `/auth/me`
- **Auth:** Required (Any)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200):** User object.

### 4. Logout
- **Method:** `POST`
- **Path:** `/auth/logout`
- **Auth:** Required (Any)
- **Success Response (200):** `{ "message": "Logged out successfully" }`

### 5. Forgot Password
- **Method:** `POST`
- **Path:** `/auth/forgot-password`
- **Auth:** Public
- **Body:** `{ "email": "john@example.com" }`
- **Success Response (200):** `{ "message": "Reset link sent" }`

## Farms (`/api/farms`)

### 6. Create Farm
- **Method:** `POST`
- **Path:** `/farms`
- **Auth:** Required (Farmer)
- **Body:**
  ```json
  {
    "name": "North Field",
    "size": 5,
    "unit": "acres",
    "soilType": "black",
    "location": {
      "state": "Maharashtra",
      "district": "Pune"
    }
  }
  ```
- **Success (201):** Farm object.

### 7. Get All Farms
- **Method:** `GET`
- **Path:** `/farms`
- **Auth:** Required (Farmer)
- **Success (200):**
  ```json
  {
    "farms": [
      { "id": "1", "name": "North Field", "size": 5 }
    ]
  }
  ```

### 8. Get Farm by ID
- **Method:** `GET`
- **Path:** `/farms/:id`
- **Auth:** Required (Farmer)
- **Success (200):** Farm object.
- **Error:** 404 (Not Found), 403 (Unauthorized Access)

### 9. Update Farm
- **Method:** `PUT`
- **Path:** `/farms/:id`
- **Auth:** Required (Farmer)
- **Body:** Partial Farm object
- **Success (200):** Updated Farm object.

### 10. Delete Farm
- **Method:** `DELETE`
- **Path:** `/farms/:id`
- **Auth:** Required (Farmer)
- **Success (200):** `{ "message": "Farm deleted" }`

## Crops (`/api/crops`)

### 11. Get All Crops
- **Method:** `GET`
- **Path:** `/crops`
- **Auth:** Required (Any)
- **Query Params:** `page`, `limit`, `category`, `season`
- **Success (200):** List of crops with pagination metadata.

### 12. Get Crop by ID
- **Method:** `GET`
- **Path:** `/crops/:id`
- **Auth:** Required (Any)
- **Success (200):** Detailed Crop object.

### 13. Create Crop
- **Method:** `POST`
- **Path:** `/crops`
- **Auth:** Required (Admin)
- **Body:** Full Crop schema details.
- **Success (201):** Created Crop object.

### 14. Update Crop
- **Method:** `PUT`
- **Path:** `/crops/:id`
- **Auth:** Required (Admin)
- **Success (200):** Updated Crop object.

### 15. Delete Crop
- **Method:** `DELETE`
- **Path:** `/crops/:id`
- **Auth:** Required (Admin)
- **Success (200):** `{ "message": "Crop deleted" }`

## Pests & Diseases (`/api/pests`, `/api/diseases`)

### 16. Get All Pests
- **Method:** `GET`
- **Path:** `/pests`
- **Auth:** Required (Any)
- **Query Params:** `cropId`
- **Success (200):** List of pests.

### 17. Get Pest by ID
- **Method:** `GET`
- **Path:** `/pests/:id`
- **Auth:** Required (Any)
- **Success (200):** Pest object.

### 18. Create Pest
- **Method:** `POST`
- **Path:** `/pests`
- **Auth:** Required (Admin/Expert)
- **Success (201):** Created Pest.

### 19. Update Pest
- **Method:** `PUT`
- **Path:** `/pests/:id`
- **Auth:** Required (Admin/Expert)
- **Success (200):** Updated Pest.

### 20. Delete Pest
- **Method:** `DELETE`
- **Path:** `/pests/:id`
- **Auth:** Required (Admin)

### 21. Get All Diseases
- **Method:** `GET`
- **Path:** `/diseases`
- **Auth:** Required (Any)
- **Query Params:** `cropId`
- **Success (200):** List of diseases.

### 22. Get Disease by ID
- **Method:** `GET`
- **Path:** `/diseases/:id`
- **Auth:** Required (Any)

### 23. Create Disease
- **Method:** `POST`
- **Path:** `/diseases`
- **Auth:** Required (Admin/Expert)

### 24. Update Disease
- **Method:** `PUT`
- **Path:** `/diseases/:id`
- **Auth:** Required (Admin/Expert)

### 25. Delete Disease
- **Method:** `DELETE`
- **Path:** `/diseases/:id`
- **Auth:** Required (Admin)

## Expert Consultations (`/api/consultations`)

### 26. Create Consultation Ticket
- **Method:** `POST`
- **Path:** `/consultations`
- **Auth:** Required (Farmer)
- **Body:** `{ "subject": "Yellowing leaves", "description": "...", "images": ["url"] }`
- **Success (201):** Ticket object.

### 27. Get Farmer Tickets
- **Method:** `GET`
- **Path:** `/consultations/my-tickets`
- **Auth:** Required (Farmer)
- **Success (200):** List of tickets.

### 28. Get All Open Tickets
- **Method:** `GET`
- **Path:** `/consultations`
- **Auth:** Required (Expert/Admin)
- **Query:** `status=open`
- **Success (200):** List of tickets.

### 29. Reply to Ticket
- **Method:** `POST`
- **Path:** `/consultations/:id/reply`
- **Auth:** Required (Any involved)
- **Body:** `{ "message": "Have you checked for pests?" }`
- **Success (200):** Updated Ticket.

### 30. Close Ticket
- **Method:** `PUT`
- **Path:** `/consultations/:id/close`
- **Auth:** Required (Expert/Admin)
- **Success (200):** Ticket closed.

## Recommendations (`/api/recommendations`)

### 31. Get Crop Recommendations
- **Method:** `POST`
- **Path:** `/recommendations/crops`
- **Auth:** Required (Farmer)
- **Body:** `{ "soilType": "black", "season": "kharif", "state": "Maharashtra" }`
- **Success (200):** 
  ```json
  {
    "recommendations": [
      { "crop": { "name": "Cotton" }, "score": 95, "reason": "Ideal soil match" }
    ]
  }
  ```

### 32. Get Fertilizer Schedule
- **Method:** `GET`
- **Path:** `/recommendations/fertilizers/:cropId`
- **Auth:** Required (Any)
- **Success (200):** List of fertilizer schedules.

## Weather (`/api/weather`)

### 33. Get Current Weather
- **Method:** `GET`
- **Path:** `/weather/current`
- **Auth:** Required (Any)
- **Query:** `lat`, `lon`
- **Success (200):** Weather object.

### 34. Get Weather Forecast
- **Method:** `GET`
- **Path:** `/weather/forecast`
- **Auth:** Required (Any)
- **Query:** `lat`, `lon`, `days`
- **Success (200):** Array of daily forecasts.

## Market Prices (`/api/market`)

### 35. Get Prices by Commodity
- **Method:** `GET`
- **Path:** `/market/prices`
- **Auth:** Required (Any)
- **Query:** `commodity`, `state`
- **Success (200):** List of mandi prices.

*(... and 25+ more standard CRUD endpoints for Inventory, Tasks, Notifications, etc.)*
