# Quizzical

A quiz app I built with React 19 and Vite. It pulls questions from the [Open Trivia Database (OpenTDB)](https://opentdb.com/) API based on your chosen category, difficulty, and question count.

Live demo: [https://quizzical1947.netlify.app/](https://quizzical1947.netlify.app/)

![Quizzical Preview](./images/quizzical-preview.png)

## How it works

Before fetching questions, the app grabs a session token from OpenTDB and saves it in `sessionStorage`. This keeps OpenTDB from sending duplicate questions when you start a new round.

If OpenTDB returns a response code saying the token expired (code 3) or ran out of unplayed questions (code 4), the app automatically resets the token history or grabs a new one and retries the request.

Answers are shuffled on the client, and questions are decoded using `html-entities` to handle symbols like `&quot;` and `&#039;`. When you finish, there's a score screen with an SVG progress ring and a breakdown to review correct and incorrect answers.

## Tech stack

- React 19 + Vite
- CSS Modules (no external UI libraries)
- `html-entities` for string decoding
- `nanoid` for question keying
- `react-loader-spinner` for loading state

## Running locally

```bash
git clone https://github.com/ChraManda/quizzical.git
cd quizzical
npm install
npm run dev
```

Note: OpenTDB limits requests to once every 5 seconds per IP. If you spam setting changes or restarts quickly, you might hit a rate limit pause.

## Quirks & limitations

- No backend or persistent database — scores reset when you leave the page.
- Session tokens are stored in `sessionStorage`, so opening the app in a new tab starts a fresh pool.
- Certain niche categories in OpenTDB don't have enough questions for harder difficulties, which might cause OpenTDB to reset the pool earlier than expected.

