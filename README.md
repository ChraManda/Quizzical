# Quizzical 🧠

Quizzical is a dynamic, modern React quiz application powered by the Open Trivia Database (OpenTDB) API. It features live category fetching, customizable difficulty levels, and session-token-based question pooling to ensure no repeated questions across replays. Built with React 19, vanilla CSS Modules, and fluid responsive design.

![Quizzical Preview](./images/quizzical-preview.png)
*<!-- Drop your preview screenshot at ./images/quizzical-preview.png -->*

---

## 🔗 Live Demo

Experience the live application here: **[https://quizzical1947.netlify.app/](https://quizzical1947.netlify.app/)**

---

## ✨ Features

- **Dynamic Category Fetching**: Live category list retrieved directly from OpenTDB (`api_category.php`) on mount, never hardcoded.
- **Customizable Quiz Config**: Choose your Category, Difficulty (`Easy`, `Medium`, `Hard`, `Any`), and Question Amount (`5`, `10`, `15`, default `5`).
- **Session-Token No-Repeat Guarantee**: Manages OpenTDB session tokens stored in `sessionStorage` to prevent duplicate questions across consecutive "Play Again" rounds.
- **Automatic Token Recovery**: Robust handling for API response codes:
  - `Code 3` (Token Not Found) → Silently requests a fresh token and retries fetch.
  - `Code 4` (Token Empty) → Automatically resets pool history (`command=reset`) and retries.
  - `Code 5` (Rate Limit) → Performs automatic backoff waiting before retrying.
- **State-Machine Architecture**: Explicit state flow (`setup → loading → quiz → results`) preventing blank screens or invalid transitions.
- **Responsive & Accessible Design**: Custom select dropdowns with 50vh max-height and text-overflow ellipsis, 44px+ touch targets, colorblind check/cross icons (`✓ Correct` / `✕ Incorrect`), and fluid `clamp()` typography.
- **Interactive Review & Filtering**: Collapsible per-question review list with `"All"`, `"Correct"`, and `"Incorrect"` filter chips.

---

## 🛠️ Tech Stack & Dependencies

- **Core**: [React 19](https://react.dev/) (`19.2.5`), [React DOM](https://react.dev/) (`19.2.5`)
- **Build Tool**: [Vite](https://vitejs.dev/) (`v8.0.10`)
- **Styling**: Vanilla CSS Modules (`*.module.css`), Google Fonts (`Outfit` & `Karla`). *Zero Tailwind or external UI frameworks.*
- **Utilities**:
  - `html-entities` (`2.6.0`) — HTML entity decoding (`&quot;`, `&#039;`)
  - `nanoid` (`5.1.9`) — Unique question identifier generation
  - `clsx` (`2.1.1`) — Conditional class concatenation
  - `react-loader-spinner` (`8.0.2`) — ThreeDots loading animation
- **API**: [Open Trivia Database (OpenTDB)](https://opentdb.com/)

---

## ⚙️ How It Works

### App State Flow
```
 ┌───────────────┐        ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
 │  SETUP STATE  │ ─────► │ LOADING STATE │ ─────► │  QUIZ STATE   │ ─────► │ RESULTS STATE │
 └───────────────┘        └───────────────┘        └───────────────┘        └───────────────┘
   Category/Diff            Spinner &                Step-by-Step             SVG Score Ring,
   useActionState           Shimmer Skeleton         Answer Cards             Review & Actions
```

1. **Setup**: Users select category, difficulty, and question count. Submission uses React 19 `useActionState` to manage pending state and disable form triggers while requests are in flight.
2. **Loading**: Renders animated `ThreeDots` spinner and shimmer skeleton cards.
3. **Quiz**: Question-by-question view with a slim progress bar (`"Question X of Y"`), full-width answer cards with immediate selection feedback, HTML entity decoding, and client-side answer shuffling.
4. **Results**: Visual SVG score ring displaying percentage and correct ratio, immediate top navigation actions (`Play Again`, `Change Settings`, `Home`), and a collapsible per-question review section.

### Session Token Flow
To avoid showing duplicate questions on consecutive runs, Quizzical requests a session token from `https://opentdb.com/api_token.php?command=request` and persists it in `sessionStorage`. Every quiz fetch appends `&token={token}`.
- If OpenTDB returns `response_code: 3` (Token Not Found), the app silently clears the expired token, requests a new one, and retries.
- If OpenTDB returns `response_code: 4` (Token Empty), all questions in that category/difficulty combo have been seen. The app triggers `https://opentdb.com/api_token.php?command=reset&token={token}` to reset history, displays a status message ("Refreshing question pool..."), and retries the fetch.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation & Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/chramanda/quizzical.git
   cd quizzical
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   *or using the start alias:*
   ```bash
   npm start
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build locally**:
   ```bash
   npm run preview
   ```

> [!NOTE]
> OpenTDB is a public API — no API key is required. However, OpenTDB enforces a rate limit of **1 request per 5 seconds per IP**.

---

## 📁 Project Structure

```
Quizzical/
├── components/
│   ├── SetupScreen.jsx          # Category, difficulty & amount selection form
│   ├── SetupScreen.module.css   # Custom select dropdown & responsive form styling
│   ├── LoadingScreen.jsx        # ThreeDots spinner & skeleton shimmer cards
│   ├── LoadingScreen.module.css # Shimmer animation styles
│   ├── QuizScreen.jsx           # Step-by-step question view & progress bar
│   ├── QuizScreen.module.css    # Answer cards & responsive grid layout
│   ├── ResultsScreen.jsx        # SVG score ring, review list & action buttons
│   └── ResultsScreen.module.css # Score ring & filter chip styles
├── images/
│   ├── blobs.svg                # Background blob graphic top-right
│   └── blobs2.svg               # Background blob graphic bottom-left
├── App.jsx                      # Top-level state machine, session token & API routing
├── index.html                   # HTML entry point, SEO meta tags, Google Fonts
├── index.jsx                    # React 19 root render
├── package.json                 # Project dependencies & npm scripts
├── style.css                    # Global CSS variables, reset, & fluid typography
└── vite.config.js               # Vite plugin configuration
```

---

## ⚠️ Known Limitations & Future Improvements

- **No Persistent Database / Leaderboard**: Quiz scores exist purely in component state during the active session.
- **Session Token Scope**: Session tokens are stored in `sessionStorage` (they survive page refreshes, but reset on tab close and do not sync across devices).
- **No Offline Support**: Active internet connection required to fetch questions from OpenTDB.
- **Future Improvements**:
  - Optional timer countdown per question.
  - Sound effects for correct/wrong answers.
  - Multi-category hybrid quiz modes.

---

## 📜 Credits

- Question data provided by the **[Open Trivia Database (OpenTDB)](https://opentdb.com/)**.
- Designed & Developed by **Chra Manda** — **[Portfolio](https://chramanda.vercel.app/)**
