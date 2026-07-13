# Handoff Report — Explorer 1 (Milestone 1: Client Setup & Design System)

## 1. Observation
- The repository root `d:\personalmusic` does not currently contain a `client/` folder.
- `package.json` at the root contains the script:
  ```json
  "dev:client": "cd client && npm run dev"
  ```
- `server/index.js` line 11 indicates the backend is running on `PORT` 5000:
  ```javascript
  const PORT = process.env.PORT || 5000;
  ```
- `server/index.js` line 15-18 configures CORS with a default origin mapping to port 5173:
  ```javascript
  app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }));
  ```
- The project specification `PROJECT.md` dictates the target CSS design system variables and layout requirements:
  - Background: `#0D0B2B`
  - Accent: `#E8890C`
  - Text primary: `#F5F0E8`
  - Text muted: `#9B96B0`
  - Card background: `rgba(255,255,255,0.05)` with `backdrop-filter: blur(12px)`
  - Fonts: `Playfair Display` (headings) and `Inter` (body)
  - Routing: using `react-router-dom` with routes `/` (Dashboard) and `/raga/:id` (Raga Detail)
- `TEST_INFRA.md` line 19 identifies target URL as `http://localhost:5173` and line 24 demands verification down to a responsive viewport width of `375px`.

## 2. Logic Chain
- Since the `client/` folder does not exist, a Vite React application must be initialized inside the `client/` subdirectory.
- The root `package.json` executes `npm run dev` inside `client/` for the `dev:client` script, meaning the Vite server must be configured with a start script mapping to `vite`.
- To establish communication between the client (on port 5173) and server (on port 5000) and satisfy `TEST_INFRA.md`'s request flow, `client/vite.config.js` must be configured with a development server proxy that redirects all `/api` requests to `http://localhost:5000`.
- To integrate the design system, custom CSS variables mapping to the specified hex codes and font families must be configured globally in `client/src/index.css`. The fonts `Playfair Display` and `Inter` must be imported via Google Fonts.
- To support responsive layouts down to 375px, CSS media queries and flex/grid layout constraints must be defined.
- To support hover micro-animations, standard CSS scale transitions (`hover-scale`) and hover-accent highlights must be styled.
- To configure routing, `react-router-dom` must be installed, the router context (`BrowserRouter`) initialized in `client/src/main.jsx`, and route paths matching `/` and `/raga/:id` declared in `client/src/App.jsx`.
- To prevent compilation and import errors, placeholder React components for `Clock`, `MBTICapture`, `RagaCard`, and `RagaDetail` and hook `useGeolocation` must be set up inside `client/src/components/` and `client/src/hooks/`.

## 3. Caveats
- While the design system provides colors and font parameters, specific SVGs (for the Prahar clock) or form-fields (for MBTI) are not fully defined in this milestone. Simple placeholders have been designed to allow verification of layout and compilation without implementing full business logic.
- We assume standard Node package installation will be performed in the `client/` folder. The proposed dependency configuration uses compatible and stable version tags.

## 4. Conclusion
The client setup for Milestone 1 must consist of the following structure inside `client/`:
- A React-Vite project skeleton containing the proxy and styling setup.
- App-level routing and structural placeholders for all functional components.

Below are the recommended target files, creation steps, and exact proposed code contents.

---

### Propose: Create and Configure Client Files

#### File 1: `client/package.json`
```json
{
  "name": "ragachakra-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
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

#### File 2: `client/vite.config.js`
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

#### File 3: `client/index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RagaChakra</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

#### File 4: `client/src/main.jsx`
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

#### File 5: `client/src/App.jsx`
```javascript
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Clock from './components/Clock';
import MBTICapture from './components/MBTICapture';
import RagaDetail from './components/RagaDetail';
import RagaCard from './components/RagaCard';

function Dashboard() {
  const [mbti, setMbti] = useState(localStorage.getItem('mbtiType') || '');
  
  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">RagaChakra</h1>
        {mbti && (
          <div className="mbti-badge">
            MBTI: <strong>{mbti}</strong>
            <button className="btn-text" onClick={() => {
              localStorage.removeItem('mbtiType');
              setMbti('');
            }}>Change</button>
          </div>
        )}
      </header>

      <main className="main-content">
        {!mbti ? (
          <div className="capture-wrapper glass-card">
            <MBTICapture onSave={(type) => setMbti(type)} />
          </div>
        ) : (
          <div className="dashboard-grid">
            <div className="clock-section glass-card">
              <Clock />
            </div>
            <div className="recommendations-section">
              <div className="hero-recommendation glass-card" style={{ marginBottom: '20px' }}>
                <h2>Current Recommendation</h2>
                <p className="text-muted" style={{ marginTop: '8px' }}>
                  Provide coordinates to load custom recommendations.
                </p>
              </div>
              <div className="list-recommendations responsive-grid">
                <RagaCard />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/raga/:id" element={<RagaDetail />} />
      </Routes>
    </div>
  );
}

export default App;
```

#### File 6: `client/src/index.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

:root {
  /* Design System Variables */
  --bg-color: #0D0B2B;
  --accent-color: #E8890C;
  --text-primary: #F5F0E8;
  --text-muted: #9B96B0;
  --card-bg: rgba(255, 255, 255, 0.05);
  
  /* Typography Variables */
  --font-title: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  
  /* Glassmorphism Variables */
  --backdrop-blur: blur(12px);
  --card-border: 1px solid rgba(255, 255, 255, 0.08);
  --card-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  
  /* Transitions */
  --transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-color);
  color: var(--text-primary);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  line-height: 1.5;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-title);
  color: var(--text-primary);
}

.text-muted {
  color: var(--text-muted);
}

/* Layout Classes */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
  flex-grow: 1;
}

/* Header & Logo styling */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* MBTI Badge styling */
.mbti-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(232, 137, 12, 0.15);
  border: 1px solid var(--accent-color);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.btn-text {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  text-decoration: underline;
  font-family: inherit;
  font-weight: 600;
  margin-left: 4px;
}

.btn-text:hover {
  color: var(--text-primary);
}

/* Glassmorphism Classes */
.glass-card {
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  border-radius: 12px;
  padding: 24px;
}

/* Layout grids */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Buttons */
.btn-primary {
  background-color: var(--accent-color);
  color: var(--bg-color);
  border: 1px solid var(--accent-color);
  padding: 10px 20px;
  border-radius: 6px;
  font-family: var(--font-body);
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition-fast), background-color var(--transition-fast), box-shadow var(--transition-fast);
}

.btn-primary:hover {
  background-color: transparent;
  color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 137, 12, 0.3);
}

/* Hover Micro-Animations */
.hover-scale {
  transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.hover-scale:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: rgba(232, 137, 12, 0.4);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
}

/* Responsive Breakpoints & Viewport Constraints */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 2fr 3fr;
  }
  
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Mobile-Specific Adaptations (down to 375px) */
@media (max-width: 480px) {
  .container {
    padding: 16px 12px;
  }
  
  .header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .logo {
    font-size: 1.5rem;
  }
  
  .glass-card {
    padding: 16px;
    border-radius: 8px;
  }
  
  .btn-primary {
    width: 100%;
    text-align: center;
  }
}
```

#### Component Placeholder Files

##### File 7: `client/src/components/Clock.jsx`
```javascript
import React from 'react';

export default function Clock() {
  return (
    <div className="clock-placeholder">
      <h3>Prahar Clock SVG</h3>
      <p className="text-muted">Dynamic circular Prahar representation will render here in Milestone 4.</p>
      <div style={{
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        border: '3px dashed var(--accent-color)',
        margin: '20px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span>Clock SVG</span>
      </div>
    </div>
  );
}
```

##### File 8: `client/src/components/MBTICapture.jsx`
```javascript
import React, { useState } from 'react';

export default function MBTICapture({ onSave }) {
  const [selected, setSelected] = useState({ ie: '', sn: '', tf: '', jp: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const mbti = `${selected.ie}${selected.sn}${selected.tf}${selected.jp}`;
    if (mbti.length === 4) {
      localStorage.setItem('mbtiType', mbti);
      if (onSave) onSave(mbti);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mbti-form-placeholder">
      <h3>Discover Your Circadian Rhythm</h3>
      <p className="text-muted" style={{ marginBottom: '16px' }}>Select your MBTI preferences to customize recommendations.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Energy Flow:</label>
          <select value={selected.ie} onChange={e => setSelected({...selected, ie: e.target.value})} required>
            <option value="">Select E or I</option>
            <option value="E">Extraversion (E)</option>
            <option value="I">Introversion (I)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Information Gathering:</label>
          <select value={selected.sn} onChange={e => setSelected({...selected, sn: e.target.value})} required>
            <option value="">Select S or N</option>
            <option value="S">Sensing (S)</option>
            <option value="N">Intuition (N)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Decision Making:</label>
          <select value={selected.tf} onChange={e => setSelected({...selected, tf: e.target.value})} required>
            <option value="">Select T or F</option>
            <option value="T">Thinking (T)</option>
            <option value="F">Feeling (F)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Lifestyle Structure:</label>
          <select value={selected.jp} onChange={e => setSelected({...selected, jp: e.target.value})} required>
            <option value="">Select J or P</option>
            <option value="J">Judging (J)</option>
            <option value="P">Perceiving (P)</option>
          </select>
        </div>
      </div>
      
      <button type="submit" className="btn-primary">Save Profile</button>
    </form>
  );
}
```

##### File 9: `client/src/components/RagaCard.jsx`
```javascript
import React from 'react';
import { Link } from 'react-router-dom';

export default function RagaCard({ raga, score, reasoning }) {
  const dummyRaga = raga || { _id: '1', name: 'Yaman', thaat: 'Kalyan', prahar: '1st Prahar of Night' };
  const dummyScore = score || 95;
  const dummyReasoning = reasoning || 'Yaman creates peace and reflection, perfect for an evening mood.';

  return (
    <div className="glass-card hover-scale" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h4 style={{ margin: 0 }}>{dummyRaga.name}</h4>
        <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{dummyScore}% Match</span>
      </div>
      <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
        <span className="text-muted">Thaat:</span> {dummyRaga.thaat} | <span className="text-muted">Prahar:</span> {dummyRaga.prahar}
      </p>
      <p style={{ fontSize: '0.95rem', marginBottom: '12px' }}>{dummyReasoning}</p>
      <Link to={`/raga/${dummyRaga._id}`} style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
        View Details →
      </Link>
    </div>
  );
}
```

##### File 10: `client/src/components/RagaDetail.jsx`
```javascript
import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function RagaDetail() {
  const { id } = useParams();

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600' }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div className="glass-card">
        <h2>Raga Details (ID: {id})</h2>
        <p className="text-muted" style={{ margin: '8px 0 20px 0' }}>Detailed scale configuration will render here.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <strong>Thaat:</strong> <span className="text-muted">Kalyan</span>
          </div>
          <div>
            <strong>Prahar:</strong> <span className="text-muted">1st Prahar of Night</span>
          </div>
          <div>
            <strong>Ascending Notes (Arohana):</strong> <span className="text-muted">S R G M P D N S'</span>
          </div>
          <div>
            <strong>Descending Notes (Avarohana):</strong> <span className="text-muted">S' N D P M G R S</span>
          </div>
          <div>
            <strong>Audio Reference:</strong> 
            <a href="https://example.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline', marginLeft: '8px' }}>
              Example Reference Link
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

##### File 11: `client/src/hooks/useGeolocation.js`
```javascript
import { useState, useEffect } from 'react';

export default function useGeolocation() {
  const [state, setState] = useState({ loading: true, coordinates: null, error: null });

  useEffect(() => {
    setState({
      loading: false,
      coordinates: { lat: 28.6139, lng: 77.2090 },
      error: null
    });
  }, []);

  return state;
}
```

---

## 5. Verification Method

To verify the setup, the following steps must be run:
1. **Directory Verification**:
   Inspect that the directory structures and files exist under `d:\personalmusic\client`.
2. **Dependency Installation**:
   Change directory to `d:\personalmusic\client` and run:
   ```bash
   npm install
   ```
3. **Build Check**:
   Confirm that the bundle builds successfully with Vite by running:
   ```bash
   npm run build
   ```
4. **Proxy Verification**:
   Start the Express backend (`npm run dev:server` from the project root or in `server/`) and start the Vite client (`npm run dev:client` from the project root or in `client/`).
   Verify that a call to `/api/health` from the client address `http://localhost:5173/api/health` resolves and routes to `http://localhost:5000/api/health` returning:
   ```json
   { "status": "ok", "timestamp": "..." }
   ```
5. **CSS Layout Check**:
   Open a browser to `http://localhost:5173`. Resize the browser viewport down to `375px` width and verify that components stack vertically and fit inside the boundaries without causing horizontal scrollbars or layout breakage.
