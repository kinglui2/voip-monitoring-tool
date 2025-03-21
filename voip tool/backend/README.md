# VoIP Monitoring Tool - Backend

## Overview
This is the backend for the VoIP Monitoring Tool, built with Node.js and Express.

## Setup Instructions

1. **Install Dependencies:**
   Navigate to the backend directory and run:
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the backend directory and set the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. **Run the Server:**
   Start the server with:
   ```bash
   npm run dev
   ```

4. **Access the API:**
   The API will be accessible at `http://localhost:5000/`.

## Project Structure
- `controllers/`: Contains the logic for handling requests.
- `models/`: Contains Mongoose models for MongoDB.
- `routes/`: Contains API route definitions.
- `config/`: Contains configuration files (e.g., database connection).
