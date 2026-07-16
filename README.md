# RagaChakra

> **An AI Ritual Companion for Indian Classical Music**

RagaChakra is not a streaming app or a recommendation engine. It is a guide. It takes the ancient science of Indian Classical Music—where specific scales (Ragas) are prescribed for specific times of day (Prahars) and emotions (Rasas)—and uses AI to translate that wisdom into a personal, emotional ritual.

## The Problem
Indian Classical Music is intimidating. New listeners don't know where to start, what to listen to, or how to listen to it. Most recommendation engines suggest music based on acoustic similarities or popularity. RagaChakra recommends music based on **circadian rhythm and emotional state**.

## Why AI?
A traditional rule engine can calculate the solar time (Prahar) and filter ragas based on time rules. However, music is emotional. 
RagaChakra uses a **Hybrid AI Pipeline**:
1. **Rule Engine (Deterministic):** Calculates exact solar time based on the user's geolocation and filters the database for ragas strictly permitted for this window.
2. **LLM (Gemini 2.5 Flash):** Analyzes the user's current emotional state (e.g. "Overwhelmed") and psychological profile (MBTI), selects the most healing raga from the deterministic shortlist, and generates a personalized, timed listening ritual.

This architecture ensures the music is always traditionally accurate (rule engine) while the narrative is always deeply personal and empathetic (LLM).

## Architecture
```text
User Opens App
       │
       ▼
[ Mood Check-in ] (Overwhelmed, Calm, Anxious, Focus...)
       │
       ▼
[ Hybrid Recommendation Engine ]
   ↳ Rule Engine: Filters by Prahar & Thaat
   ↳ Gemini: Selects #1 Raga + Generates "Why" + Designs Ritual
       │
       ▼
[ Recommendation Experience ] (Explainable AI)
       │
       ▼
[ Ritual View ] (Guided Timer)
  1. Close eyes (2 min)
  2. Listen (15 min)
  3. Reflect (5 min)
       │
       ▼
[ AI Memory ] (Gemini summarizes reflection for tomorrow)
```

## Setup Instructions

1. **Clone the repository**
2. **Environment Variables**
   Create a `.env` in the `/server` folder:
   ```env
   GEMINI_API_KEY=your_key_here
   PORT=5000
   NODE_ENV=development
   ```
3. **Install Dependencies**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
4. **Run the App**
   ```bash
   # Terminal 1
   cd server && npm run dev
   
   # Terminal 2
   cd client && npm run dev
   ```

## Presenter Mode (For Judges)
Press `Ctrl + Shift + D` or append `?judge=true` to the URL. This enables Judge Mode, which instantly bypasses onboarding and loads a pre-baked, flawless demonstration flow perfect for a 3-minute pitch.

## Future Roadmap
- Integration with Spotify/Apple Music APIs.
- Generative ambient tanpura drones using the Web Audio API.
- Sleep phase tracking for midnight/dawn raga transitions.
