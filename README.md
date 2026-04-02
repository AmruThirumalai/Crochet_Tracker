# Crochet Temperature Blanket Tracker

A beautiful, intuitive web application to help crocheters track their temperature blanket progress throughout 2025. Each day corresponds to a crocheted row, with yarn color determined by the day's high temperature.

## Overview

This app provides a clear, visual, low-friction way to monitor your temperature blanket progress and reference color assignments throughout the year.


## Implemented Features

### Core Functionality
- Year View (2025) - All 365 days displayed in a clean, scrollable list
- Daily Tracking - Each day shows date, temperature, and assigned yarn color
- Completion Tracking - Mark each day's row as "Done" when you finish crocheting
- Progress Bar - Visual indicator showing completion percentage (X of 365 rows)
- Month Grouping - Days organized by month with clear headers

### Weather Data Integration
- Backend API - Express server with REST endpoint (`/api/weather/2025`)
- Weather Fetch Script - Node.js script to fetch historical temperature data from Open-Meteo API
- Louisville, KY Location - Coordinates: 38.2673, -85.4709
- Auto-loading - Weather data persists in localStorage, loads automatically on return visits
- Manual Refresh - Option to re-fetch weather data if needed

### Temperature-to-Color System
Nine temperature ranges mapped to specific yarn colors:
- Gray - < 20°F
- Royal Blue - 20-29°F
- Skylight - 30-39°F
- Sage - 40-49°F
- Butter - 50-59°F
- Gold - 60-69°F
- Pumpkin - 70-79°F
- Clay - 80-89°F
- Red - 90°F+

### User Interface Features
- Color Legend - Collapsible reference card showing all temperature ranges and yarn colors
- Filter by Completion - Three filter options:
  - All (365 days)
  - To Do (incomplete rows)
  - Done (completed rows)
- Day Detail Modal - Click any day to see:
  - Full date
  - Temperature
  - Yarn color with large swatch
  - Mark as Done toggle
- Month Dividers - Optional white separator rows between months (11 total)
  - Can be toggled on/off in Settings
  - Dividers can be marked as complete
  - Helps visually separate months in the blanket

### Settings & Customization
- Settings Panel - Collapsible section with:
  - Dark Mode toggle
  - Print View button
  - Month Dividers toggle
- Dark Mode - Beautiful dark theme for nighttime crocheting
  - Saves preference to localStorage
  - Smooth transitions between themes
- Print View - Print-friendly layout
  - Hides interactive elements (buttons, filters)
  - Clean output for reference sheets

### Data Persistence
- localStorage Integration - Saves:
  - Weather data (`blanket-weather-2025`)
  - Completion status (`blanket-completion-2025`)
  - Month divider completion (`blanket-dividers-2025`)
  - Dark mode preference (`blanket-dark-mode`)
  - Month dividers setting (`blanket-month-dividers`)
- Auto-save - All changes saved immediately
- No account required - All data stored locally in browser

### Technical Stack
Frontend:
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)

Backend:
- Node.js + Express
- Open-Meteo API (weather data)
- CORS enabled
- JSON file storage


## Future Enhancements

### High Priority (Most Useful)
1. Today Highlight - Auto-scroll to today's date or highlight it
2. Notes per Day - Add personal notes like "started new yarn ball" or "fixed mistake"
3. Monthly Summary - Stats like "most common color this month"
4. Temperature Visibility Toggle - Hide/show temperatures if you just want to see colors
5. Edit Day - Manually adjust temperature if API data seems wrong
6. Undo Completion - Easier way to bulk un-mark days

### Medium Priority
7. Calendar View - Alternative layout as a monthly calendar grid
8. Multiple Years - Support for 2026, 2027, etc.
9. Multiple Locations - Track blankets for different cities
10. Celsius Support - Toggle between °F and °C
11. Custom Color Schemes - Let users define their own temperature ranges/colors
12. Search - Find specific dates quickly
13. Bulk Actions - Mark multiple days as complete at once

### Lower Priority (Nice to Have)
14. Export Options - CSV, PDF, or image export of the year
15. Social Sharing - Share your progress or completed blanket
16. Multiple Users - Account system for multiple blankets
17. Pattern Notes - Store stitch patterns or special techniques used
18. Yarn Inventory - Track yarn usage and shopping list
19. Photos - Upload photos of completed rows or sections
20. Statistics - Detailed analytics (days per color, longest streaks, etc.)


## Project Structure

```
crochet-temperature-blanket/
├── backend/
│   ├── scripts/
│   │   └── fetchWeather2025.js    # Fetches weather data from API
│   ├── data/
│   │   └── weather2025.json       # Generated weather data
│   ├── server.js                  # Express API server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── CrochetTempTracker.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env                       # API URL configuration
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## Design Principles

- Soft, Friendly, Calm - Non-distracting interface
- Clarity over Automation - Users prefer to see what's happening
- Low Friction - Easy daily tracking ritual
- Trust & Reliability - Consistent color assignments
- Mobile Responsive - Works on desktop and mobile devices


## Contributing

This is a personal project, but suggestions and feedback are welcome!


## License

MIT License - feel free to use and modify for your own temperature blanket projects!


## 💡 Inspiration

Based on the traditional temperature blanket craft project, where crocheters create a year-long blanket with each row representing a day's temperature through color.
