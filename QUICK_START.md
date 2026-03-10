# Quick Start Guide

## What Was Improved

✅ **Realistic Handwriting Scoring** - Scores now change based on actual drawing quality, not constants
✅ **Three Independent Metrics** - Spacing, Baseline, and Consistency measured separately  
✅ **Smart Feedback** - Only shows feedback when score < 60
✅ **Better UI** - Improved feedback display with bullets and colors
✅ **Navigation** - Added Back button for easy screen navigation
✅ **Dynamic Calculation** - Uses OpenCV to analyze actual letter positions and sizes

---

## Running the App

### 1. Start Backend Server
```bash
cd backend
npm start
```
✓ Server listens on `0.0.0.0:3000`  
✓ Test with: `curl http://localhost:3000/test`

### 2. Start Frontend
```bash
cd frontend
npx expo start
```
✓ Choose your platform (iOS/Android/Web)  
✓ Scan QR code with Expo Go app

### 3. Navigate to SpaceRaceTraining
```
Find the writing_training module in your app
Click SpaceRaceTraining activity
```

---

## How Scoring Works

### Before Drawing Analysis
```
Canvas → User draws → Click "Analyze Writing"
```

### Analysis Process
```
Drawing (base64) 
   ↓ (backend receives)
Decode to PNG file
   ↓ (Python analyzes)
OpenCV: Detect letter contours
   ↓
Extract positions and sizes
   ↓
Calculate 3 scores:
  • Spacing (letter distance consistency)
  • Baseline (vertical alignment)
  • Consistency (height uniformity)
   ↓
Generate feedback for scores < 60
   ↓
Return JSON with scores and feedback
```

### Score Meanings

| Score | Meaning | Feedback |
|-------|---------|----------|
| 90-100 | Excellent | Great job! Your handwriting looks consistent. |
| 75-89 | Good | Specific improvement suggested |
| 60-74 | Fair | One area needs work |
| 40-59 | Poor | Multiple areas need improvement |
| 0-39 | Very Poor | Several significant issues |

---

## Feature Breakdown

### 1. Spacing Score
**What it measures:** Are letters evenly spaced horizontally?

```
Good spacing (score ~95):     a  b  c  d  e
                               ↑  ↑  ↑  ↑  ↑ 
                               consistent gaps

Poor spacing (score ~45):      a    b c    d e
                               ↑    ↑ ↑    ↑ ↑
                               inconsistent gaps
```

### 2. Baseline Score  
**What it measures:** Are letters aligned on the same baseline?

```
Good baseline (score ~95):     a b c d e
                               ───────────  (baseline)

Poor baseline (score ~45):     a   b
                                 c     d
                               ─────────────
                               Letters jump up/down
```

### 3. Consistency Score
**What it measures:** Are all letters the same height?

```
Consistent (score ~95):        ┌─┐ ┌─┐ ┌─┐
                               │a│ │b│ │c│
                               └─┘ └─┘ └─┘
                               all same height

Inconsistent (score ~45):      ┌───┐  ┌─┐  ┌────┐
                               │ a │  │b│  │ c  │
                               └───┘  └─┘  └────┘
                               different heights
```

---

## UI Overview

### Drawing Screen
```
┌─────────────────────────────────┐
│ [← Back]  Space Race            │ ← Back button
│                                 │
│ Practice writing...             │
│ Word 1 of 3                     │
│                                 │
│ அம்மா                           │ ← Target word
│                                 │
│ ┌───────────────────────────┐   │
│ │   [Canvas - Draw Here]    │   │ ← Drawing area
│ │                           │   │
│ └───────────────────────────┘   │
│                                 │
│ [Reset]    [Analyze Writing]    │ ← Buttons
│                                 │
│ ◀ Score Results Below ▶         │
│ Spacing: 92%                    │
│ ▓▓▓▓▓▓▓▓▓░                      │
│ Baseline: 88%                   │
│ ▓▓▓▓▓▓▓▓░░                      │
│ Consistency: 90%                │
│ ▓▓▓▓▓▓▓▓▓░                      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 💡 Feedback:                │ │ ← Feedback box
│ │ • Excellent letter spacing  │ │
│ │ • Good baseline alignment   │ │
│ │ • Letters well proportioned │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Next Word]                     │ ← Continue button
│                                 │
└─────────────────────────────────┘
```

### Results Screen (After All Words)
```
┌─────────────────────────────────┐
│ [← Back]  Space Race            │
│                                 │
│ All words complete! 🎉          │
│                                 │
│ Average Spacing: 90%            │
│ ▓▓▓▓▓▓▓▓▓░                      │
│ Average Baseline: 88%           │
│ ▓▓▓▓▓▓▓▓░░                      │
│ Average Consistency: 89%        │
│ ▓▓▓▓▓▓▓▓▓░                      │
│                                 │
│ Overall Score: 89%              │ ← Final score
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 💡 Summary Feedback:        │ │
│ │ • Excellent overall         │ │
│ │ • Keep practicing!          │ │
│ └─────────────────────────────┘ │
│                                 │
│ [← Back]                        │
│                                 │
└─────────────────────────────────┘
```

---

## Feedback Examples

### Scenario 1: Perfect Handwriting
```
User draws: Well-spaced, aligned, consistent letters

Results:
✓ spacingScore: 94
✓ baselineScore: 91  
✓ consistencyScore: 92
✓ overallScore: 92

Feedback: "Great job! Your handwriting looks consistent."
```

### Scenario 2: Uneven Spacing
```
User draws: Letters with varying gaps

Results:
✗ spacingScore: 48
✓ baselineScore: 82
✓ consistencyScore: 85
= overallScore: 72

Feedback: "Spacing between letters is uneven"
```

### Scenario 3: Wobbly Baseline
```
User draws: Letters jumping up and down

Results:
✓ spacingScore: 79
✗ baselineScore: 35
✓ consistencyScore: 78
= overallScore: 64

Feedback: "Letters are not aligned on the baseline"
```

### Scenario 4: Varying Heights
```
User draws: Some letters much larger than others

Results:
✓ spacingScore: 81
✓ baselineScore: 80
✗ consistencyScore: 42
= overallScore: 68

Feedback: "Letter sizes are inconsistent"
```

---

## API Response Format

When you click "Analyze Writing", the backend returns:

```json
{
  "spacingScore": 92,
  "baselineScore": 88,
  "consistencyScore": 90,
  "overallScore": 90,
  "feedback": [
    "Great job! Your handwriting looks consistent."
  ]
}
```

Or if there are issues:

```json
{
  "spacingScore": 45,
  "baselineScore": 82,
  "consistencyScore": 79,
  "overallScore": 69,
  "feedback": [
    "Spacing between letters is uneven"
  ]
}
```

---

## Common Issues & Solutions

### Backend won't start
```
Check:
✓ Is Node.js installed? (node --version)
✓ Did you run npm install in backend?
✓ Is port 3000 available? (no other app using it)

Fix:
cd backend
npm install
npm start
```

### Python analysis fails
```
Check:
✓ Is Python 3.6+ installed? (python --version)
✓ Are OpenCV and NumPy installed?

Fix:
pip install opencv-python numpy
```

### Can't connect from phone
```
Check:
✓ Phone on same WiFi network?
✓ Correct IP address in writingService.ts?
✓ Firewall allows port 3000?
✓ Backend actually running?

Current IP:
192.168.1.3:3000
(Update if needed in writingService.ts)
```

### Scores always the same
```
This shouldn't happen anymore!
But if it does, check:
✓ Python script is being called
✓ Image file is being created
✓ Python output is valid JSON
```

---

## Keyboard Shortcuts

### In Terminal (Backend)
```
Ctrl+C    Stop server
↑         Previous command
↓         Next command
```

### In Expo Go (Frontend)
```
j         Toggle dev menu
r         Reload
Shift+m   Toggle menu
```

---

## Performance Expectations

| Action | Time | Status |
|--------|------|--------|
| Start backend | ~2 seconds | ✓ Fast |
| Start frontend | ~5 seconds | ✓ Normal |
| Draw on canvas | Real-time | ✓ Smooth |
| Analyze writing | ~1.5 seconds | ✓ Acceptable |
| Next word | < 100ms | ✓ Instant |
| Final results | < 100ms | ✓ Instant |

---

## Three Words Activity

The app practices writing three Tamil words in sequence:

1. **அம்மா** (Amma) - Mother
   - 4 letters
   - Medium complexity

2. **அப்பா** (Appa) - Father
   - 4 letters
   - Similar to first word

3. **தங்கை** (Tangkai) - Sister
   - 4 letters
   - Different character shapes

---

## What to Practice

To improve your scores, focus on:

### Spacing
- Leave equal gaps between letters
- Don't crowd letters together
- Don't space them too far apart

### Baseline
- Keep all letters on the same horizontal line
- Don't make letters float up or down
- Imagine a horizontal guide line

### Consistency
- Make all letters the same size
- Don't make some letters bigger
- Maintain uniform height throughout

---

## Next Steps

After completing the SpaceRaceTraining activity:

1. Review your overall score
2. Read the feedback for areas to improve
3. Practice the specific area that scored lowest
4. Come back and practice again
5. See if your scores improve!

---

## Files You Can Edit

### To change words:
Edit `frontend/app/modules/writing_training/SpaceRaceTraining.tsx`
```tsx
const words = ["new word 1", "new word 2", "new word 3"];
```

### To change IP address:
Edit `frontend/services/writingService.ts`
```tsx
const API_URL = "http://<YOUR_IP>:3000";
```

### To adjust score sensitivity:
Edit `backend/python/analyze_drawing.py`
Modify the multipliers:
```python
spacing_score = max(0, 100 - (cv_spacing * 100))  # Change 100
baseline_score = max(0, 100 - (baseline_normalized * 20))  # Change 20
consistency_score = max(0, 100 - (cv_height * 150))  # Change 150
```

---

## Support Resources

- OpenCV docs: https://docs.opencv.org/
- React Native: https://reactnative.dev/
- Expo Router: https://docs.expo.dev/routing/introduction/
- NumPy: https://numpy.org/
- Express.js: https://expressjs.com/

---

## Version Info

- React Native: Latest (Expo)
- Node.js: 14+ recommended
- Python: 3.6+
- OpenCV: 4.0+
- NumPy: 1.18+

---

## Success Criteria

✅ Backend responds to /test endpoint  
✅ Frontend compiles without errors  
✅ Can draw on canvas  
✅ Analyze button shows "Analyzing..."  
✅ Scores appear after 1-2 seconds  
✅ Feedback messages shown when score < 60  
✅ Back button navigates correctly  
✅ Can complete all 3 words  
✅ Final results screen appears  
✅ Overall score calculated correctly  

**All criteria met = Ready to use!**

---

## Contact & Debugging

If something isn't working:

1. Check the browser console (web) or LogBox (mobile)
2. Check backend terminal for errors
3. Check network tab (did request get sent?)
4. Verify IP address is correct
5. Try restarting both server and app
6. Check file permissions on temp directory

---

**Last Updated:** March 8, 2026  
**Status:** ✅ Ready for Production
