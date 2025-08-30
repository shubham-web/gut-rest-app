# Product Brief: Meal & Fasting Tracker App

Name: GutRest

### 1. **App Idea**

The GutRest app is designed to help users build healthier eating routines by **logging meal types and timings** in the simplest possible way.
Instead of calorie tracking or detailed food diaries, the app focuses on:

- Quickly recording what type of intake occurred (e.g., water, fruit, light meal, etc.).
- Highlighting **gaps between meals** and **fasting windows** (e.g., dinner → next breakfast).
- Providing **simple, meaningful insights** around intermittent fasting and eating habits.

This lightweight approach ensures long-term usability without overwhelming the user.

<p align="center">
    <img src="./gut-rest/assets/images/app-screenshots/1.png" alt="App Screenshot Main Screen" style="max-width:300px; display:inline-block; margin-right:10px;">
    <img src="./gut-rest/assets/images/app-screenshots/2.png" alt="App Screenshot Main Screen" style="max-width:300px; display:inline-block; margin-right:10px;">
    <img src="./gut-rest/assets/images/app-screenshots/3.png" alt="App Screenshot Main Screen" style="max-width:300px; display:inline-block;">
</p>

<p align="center">
    <video src="./gut-rest/assets/app-demo.mp4" controls style="max-width:400px; display:inline-block;">
        Your browser does not support the video tag.
    </video>
</p>

---

### 2. **Target User**

- Individuals interested in **intermittent fasting**.
- People who want to be mindful of their **meal timing** without calorie counting.
- Users seeking a **minimalist meal tracking tool**.

---

### 3. **Core Principles**

- **Simplicity over detail**: One-tap logging instead of complex food diaries.
- **Low effort**: Quick actions for busy users.
- **Meaningful insights only**: Show gaps, fasting windows, and patterns — no unnecessary data.

---

### 4. **MVP Scope**

#### **Must Have (V1.0)**

**Screens & Features**:

1. **Home (Timeline Screen)**

   - Vertical timeline of today’s intake.
   - Each entry shows: icon + category + time.
   - Gap between entries automatically displayed (e.g., “⏱ 3h 20m since last meal”).
   - Floating **+ button** to add new intake.

2. **Quick Add Modal**

   - Opens when user taps “+”.
   - Large tappable icons for meal categories:

     - 💧 Water
     - 🍎 Fruit
     - 🥗 Light Meal
     - 🍲 Medium Meal
     - 🍛 Heavy Meal
     - 🍔 Fast Food
     - ☕ Drink

   - Defaults to current time but user can adjust.
   - Save → adds to timeline.

3. **Stats (Insights Screen)**

   - **Meal Gap Summary**: shortest, longest, and average gaps between meals for the day.
   - **Fasting Tracker**:

     - Calculates gap between last intake of yesterday and first intake of today.
     - Highlights ✅ if ≥ 16 hours (intermittent fasting achieved).

---

#### **Nice to Have (V1.1)**

1. **Weekly Overview (Charts)**

   - Visualize fasting windows across last 7 days.
   - Simple bar or line chart.

2. **History View**

   - Calendar-style overview.
   - Daily fasting achievements marked with ✅.
   - Tap a date → view its timeline + stats.

---

### 5. **Success Metrics**

- **Ease of use**: Users can log an intake in ≤ 5 seconds.
- **Retention**: Users consistently log meals for at least 7 consecutive days.
- **Meaningful insights**: Users can easily tell if they achieved their fasting goal.

---

### 6. **Design Direction**

- Clean, minimal UI.
- Large, tappable icons for quick logging.
- Timeline with visual gaps (space or labels showing hours).
- Stats presented with clarity (no clutter, focus on fasting and gaps).
