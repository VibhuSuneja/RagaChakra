# RagaChakra

Circadian Hindustani raga recommendation engine.

## Overview
RagaChakra is a modern web application that recommends Hindustani ragas based on the current time of day (Prahar) and the user's Myers-Briggs Type Indicator (MBTI). The application uses the user's geolocation and local time to suggest the most appropriate raga for their current setting, enhancing the listening experience by aligning the music with the natural circadian rhythms.

## Architecture
- **Frontend**: React application built with Vite, utilizing React Router for navigation.
- **Styling**: Custom dark-mode design system featuring glassmorphic cards, and beautiful typography (Playfair Display and Inter).
- **Backend**: Express.js server providing a robust API for raga recommendations.
- **State Management**: MBTI types are persisted via `localStorage`, while geolocation is fetched dynamically with fallbacks.

## Features
- **MBTI Capture**: Captures the user's MBTI type to personalize recommendations.
- **Geolocation Integration**: Automatically detects the user's timezone and coordinates (with an `ipapi.co` fallback) to accurately determine the current Prahar (time of day).
- **Interactive Prahar Clock**: A visual circular clock displaying the current time and raga period.
- **Raga Detail View**: Displays detailed information about ragas, including notes, thaat, rasa, and audio references.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

1. Install all dependencies for both the client and server:
   ```bash
   npm run install:all
   ```

2. Start the development environment (runs both client and server concurrently):
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev`: Starts both the client and server concurrently.
- `npm start`: Starts the Express backend server.
- `npm run build`: Builds the React frontend for production.
- `npm run seed`: Seeds the database/backend with initial raga data.
- `npm test`: Runs the backend test suite.
