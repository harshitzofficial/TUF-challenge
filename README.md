
# Annual Calendar Challenge
[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Project-blue?style=for-the-badge)](https://tuf-challenge.vercel.app/)

A highly polished, interactive React calendar component locked to the year 2026. Designed with a premium glassmorphism aesthetic, advanced state management, and seamless UX/UI micro-interactions.

This project was built to satisfy a strict frontend engineering challenge, focusing heavily on component architecture, CSS/styling implementation, and responsive design without the need for a backend.

## ✨ Key Features

* **Strict Annual Lock:** The calendar is hard-locked to 2026, with navigation gracefully disabling at the year's boundaries.
* **Smart Range Selection:** Users can select start and end dates. If a user clicks an end date *before* their start date, the logic intelligently swaps them rather than breaking or resetting the selection.
* **Persistent Local Storage:** The integrated notes section automatically saves and retrieves user notes based on the specific selected month using browser `localStorage`.
* **Dark / Light Mode & Theming:** Utilizes CSS Variables to seamlessly transition between a "Midnight" dark mode and a crisp light mode, dynamically updating accent colors and hover states.
* **Dynamic Grid Menu:** Replaced standard native HTML `<select>` dropdowns with a custom-built, animated glassmorphism grid for quick month navigation.

## 🛠️ Engineering & Design Choices

* **Component Architecture:** The UI is cleanly decoupled. While the final output can run in a single file for easy portability, the logic is separated into distinct, manageable areas (Hero, Notes, Calendar Grid, controls). 
* **State Management:** Handled entirely via React's `useState`, `useEffect`, and `useMemo`. The state is lifted to the parent component to allow the Hero section (month changing) and the Grid section (date rendering) to remain perfectly synchronized.
* **Styling Implementation:** * Moved away from heavy utility-class clutter in favor of a clean, dedicated `Calendar.css` file. 
  * Implemented **CSS Custom Properties (Variables)** to handle the complex dark/light mode toggles without needing to re-render React components just to change class names. 
  * Leveraged `backdrop-filter: blur()` and subtle CSS animations for a high-end, native-app feel.
* **Responsive Constraints:** Built mobile-first. The layout gracefully collapses from a side-by-side desktop view into a stacked mobile view, ensuring touch targets remain large (`min-height: 44px`) and usable on small screens.

## 🚀 How to Run Locally

This project is built using **Vite + React**. 


### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/harshitzofficial/TUF-challenge.git](https://github.com/harshitzofficial/TUF-challenge.git)
   cd TUF-challenge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **View in browser:**
   Open the local host link provided in your terminal (usually `http://localhost:5173/`).

## 📂 Project Structure

```text
TUF-challenge/
├── public/
├── src/
│   ├── components/                 
│   │   ├── CalendarChallenge.jsx  # Main React component & logic
│   │   └── Calendar.css           # Styling, Animations, and Theme Variables
│   ├── App.jsx                    # Root component mounting the calendar
│   └── main.jsx                   # Vite entry point
├── package.json
└── vite.config.js
```

---
*Built for the Frontend Engineering Challenge.*
