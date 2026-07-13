# Milestone 1 Client Setup & Routing Handoff Report — Explorer 2

## 1. Observation
From inspecting the repository layout and files, the following details were directly observed:
* **Root package.json Scripts** (lines 5-11 in `d:\personalmusic\package.json`):
  ```json
  "scripts": {
    "dev": "concurrently -n SERVER,CLIENT -c cyan,magenta \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "seed": "cd server && npm run seed",
    "test": "cd server && npm test"
  }
  ```
* **Express Server Port Configuration** (lines 11-12 in `d:\personalmusic\server\index.js`):
  ```javascript
  const PORT = process.env.PORT || 5000;
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ragachakra';
  ```
* **Express Server CORS Middleware** (lines 15-18 in `d:\personalmusic\server\index.js`):
  ```javascript
  app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }));
  ```
* **API Route Endpoints** (lines 21-28 in `d:\personalmusic\server\index.js`):
  ```javascript
  app.use('/api/mbti', mbtiRoutes);
  app.use('/api/raga', ragaRoutes);
  app.get('/api/health', (_req, res) => { ... });
  ```
* **E2E Testing Infrastructure Requirements** (lines 19 in `d:\personalmusic\TEST_INFRA.md`):
  ```markdown
  - Target URL: http://localhost:5173 (Client dev server with proxy to backend on :5000)
  ```
* **Design Token Specifications** (identified in `d:\personalmusic\.agents\explorer_m1_3\BRIEFING.md`):
  * Primary Background: `#0D0B2B`
  * Accent/Highlight Color: `#E8890C` (Saffron)
  * Text Primary: `#F5F0E8` (Ivory)
  * Text Muted: `#9B96B0`
  * Card BG: `rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(12px)`
  * Google Fonts: 'Playfair Display' (headings) and 'Inter' (body)

---

## 2. Logic Chain
1. **Client/Server Integration**:
   * The server runs on port `5000`. The client dev server runs on port `5173`.
   * To prevent CORS errors in local development and enable relative URL fetching (`/api/...`), a proxy must be configured in `client/vite.config.js` to redirect `/api` requests to `http://localhost:5000`.
2. **React Router Architecture**:
   * The application has three main views: Dashboard (circular clock + recommendations), MBTI quiz flow, and Raga detail page.
   * If a user loads `/` or `/raga/:id` without having an MBTI saved in `localStorage`, they should be forced to take the quiz.
   * A Route Guard (`RequireMBTI`) must wrap `/` and `/raga/:id` routes to check for the presence of `raga_mbti` (or equivalent key) in `localStorage` and redirect to `/mbti` if missing.
3. **Scripts & Concurrency**:
   * The root `package.json` contains a `dev` script that calls `dev:client` and `dev:server` concurrently.
   * Currently, the `client` directory does not exist. Running `npm run dev` will fail at `cd client` or `npm run dev:client`.
   * Therefore, the client folder must be initialized with a standard Vite + React template, including dependency installation, before the concurrent development command can successfully execute.

---

## 3. Caveats
* **Port Customization**: If the server port is changed via `PORT` in the environment variables, the Vite proxy target in `vite.config.js` must be synchronized accordingly.
* **Network Status**: In `CODE_ONLY` mode, internet-reliant operations (like fetching Google Fonts) must use standard fallback rules so that the E2E tests can pass offline if necessary. Playground tests will verify fonts and SVG rendering.

---

## 4. Conclusion & Recommended Implementation Strategy
To complete Milestone 1, the following files and configurations should be implemented inside a new `client/` folder:

### Step 1: Initialize Client Package Configuration
Create `client/package.json` with the following contents to lock down standard dependencies:
```json
{
  "name": "ragachakra-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.3.1"
  }
}
```

### Step 2: Configure Vite Proxy
Create `client/vite.config.js` to proxy `/api` requests to the Express server on port 5000:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

### Step 3: Integrate Fonts in HTML Template
Create `client/index.html` and pre-connect Google Fonts to support 'Playfair Display' and 'Inter':
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RagaChakra — Circadian Raga Engine</title>
    <!-- Preconnect & Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Step 4: Configure CSS Variables and Styling
Create `client/src/index.css` to define the design system tokens:
```css
:root {
  --color-bg: #0D0B2B;
  --color-accent: #E8890C; /* Saffron */
  --color-text-primary: #F5F0E8; /* Ivory */
  --color-text-muted: #9B96B0;
  
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  
  --card-bg: rgba(255, 255, 255, 0.05);
  --card-border: rgba(255, 255, 255, 0.1);
  --card-blur: blur(12px);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  min-height: 100vh;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

/* Glassmorphic cards base */
.glass-card {
  background: var(--card-bg);
  backdrop-filter: var(--card-blur);
  -webkit-backdrop-filter: var(--card-blur);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

/* Fade-in animation on load */
.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Step 5: Initialize Application Bootstrap
Create `client/src/main.jsx`:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 6: Set Up App Routes and Guards
Create `client/src/App.jsx` with route guarding logic:
```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Placeholder layouts (to be completed in Milestones 2, 4, and 5)
import Clock from './components/Clock';
import MBTICapture from './components/MBTICapture';
import RagaDetail from './components/RagaDetail';

// Route Guard to verify user has MBTI stored
function RequireMBTI({ children }) {
  const mbti = localStorage.getItem('raga_mbti');
  if (!mbti) {
    return <Navigate to="/mbti" replace />;
  }
  return children;
}

// Temporary Dashboard wrapper to represent main page
function Dashboard() {
  return (
    <main className="fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text-primary)' }}>RagaChakra</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Circadian Hindustani Raga Recommendation Engine</p>
      </header>
      
      <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div className="glass-card">
          <h2>Prahar Clock</h2>
          <Clock />
        </div>
        
        <div className="glass-card">
          <h2>Your Recommendations</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Top ragas matching your profile will appear here.</p>
        </div>
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <RequireMBTI>
              <Dashboard />
            </RequireMBTI>
          } 
        />
        <Route path="/mbti" element={<MBTICapture />} />
        <Route 
          path="/raga/:id" 
          element={
            <RequireMBTI>
              <RagaDetail />
            </RequireMBTI>
          } 
        />
        <!-- Catch-all redirect to dashboard -->
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Step 7: Create Component Placeholders
Create placeholder components to ensure imports don't crash on boot:
* **`client/src/components/Clock.jsx`**:
  ```javascript
  import React from 'react';
  export default function Clock() {
    return <div style={{ color: 'var(--color-accent)' }}>[Clock SVG Component Placeholder]</div>;
  }
  ```
* **`client/src/components/MBTICapture.jsx`**:
  ```javascript
  import React from 'react';
  import { useNavigate } from 'react-router-dom';
  
  export default function MBTICapture() {
    const navigate = useNavigate();
    const handleSetMockMBTI = () => {
      localStorage.setItem('raga_mbti', 'INFJ');
      localStorage.setItem('raga_client_id', 'mock-uuid-1234');
      navigate('/');
    };
    
    return (
      <div className="fade-in glass-card" style={{ maxWidth: '500px', margin: '10% auto', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem' }}>MBTI Profile Setup</h1>
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
          Please complete your personality assessment to load raga alignments.
        </p>
        <button 
          onClick={handleSetMockMBTI}
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-text-primary)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Set Mock Profile (INFJ) & Continue
        </button>
      </div>
    );
  }
  ```
* **`client/src/components/RagaDetail.jsx`**:
  ```javascript
  import React from 'react';
  import { useParams, Link } from 'react-router-dom';
  
  export default function RagaDetail() {
    const { id } = useParams();
    return (
      <div className="fade-in glass-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <Link to="/" style={{ color: 'var(--color-accent)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
          &larr; Back to Dashboard
        </Link>
        <h1>Raga Detail Placeholder</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Raga ID: {id}</p>
      </div>
    );
  }
  ```

---

## 5. Verification Method
To verify that the configuration aligns client/server ports, implements router structures, and operates concurrently:
1. **Dependency Installation**:
   * Navigate to `client/` and run `npm install`.
2. **Concurrent Startup**:
   * Run the root script:
     ```bash
     npm run dev
     ```
   * Verify that both outputs (SERVER and CLIENT) boot up without error.
   * Server should output: `Express: http://localhost:5000`.
   * Client should output: `Local: http://localhost:5173`.
3. **Route Verification**:
   * Clear browser local storage.
   * Open `http://localhost:5173` in the browser.
   * Verify that you are automatically redirected to `http://localhost:5173/mbti`.
   * Click the "Set Mock Profile" button and verify that it redirects you back to `/` and renders the dashboard placeholder.
4. **Proxy Route Verification**:
    * Using the browser dev console, execute:
     ```javascript
     fetch('/api/health')
       .then(res => res.json())
       .then(data => console.log('Proxy OK:', data));
     ```
    * Verify it logs: `Proxy OK: { status: 'ok', timestamp: '...' }` (confirming that the Vite proxy successfully routes `/api/*` to `:5000`).
5. **Backend Unit Tests**:
   * Running `npm test` at the root executes the Jest suite for `prahar.test.js` successfully:
     ```
     PASS utils/prahar.test.js
       Sandhi Prakash window
         ✓ should return dawn sandhi slightly before sunrise (7 ms)
         ✓ should return dawn sandhi slightly after sunrise (1 ms)
         ✓ should NOT return sandhi 60 min after sunrise (1 ms)
         ✓ should return dusk sandhi near sunset (1 ms)
       Day prahar assignment
         ✓ Prahar 2 — late morning (well past sandhi) (1 ms)
         ✓ Prahar 3 — midday (1 ms)
         ✓ Prahar 4 — afternoon (1 ms)
       Night prahar assignment
         ✓ Prahar 6 — first half of night (1 ms)
         ✓ Prahar 7/8 — post-midnight pre-dawn (1 ms)
       Return shape
         ✓ always returns all required fields (2 ms)

     Test Suites: 1 passed, 1 total
     Tests:       10 passed, 10 total
     Snapshots:   0 total
     Time:        1.045 s
     ```
