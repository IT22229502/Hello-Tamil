# Visual Architecture & Flow Diagrams

## 1. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Mobile App (React Native)                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SpaceRaceTraining Component                               │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Canvas (react-native-signature-canvas)               │  │ │
│  │  │ User draws Tamil word                                │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                          │                                   │ │
│  │                          ▼                                   │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ onOK Callback                                         │  │ │
│  │  │ - Captures base64 PNG                                │  │ │
│  │  │ - Removes "data:image/png;base64," prefix            │  │ │
│  │  │ - Calls analyzeDrawing(base64Image)                  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     │ HTTP POST
                     │ Content-Type: application/json
                     │ { "drawing": "iVBORw0..." }
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend Server (Express.js, Node.js)                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ POST /writing/analyze-drawing                             │ │
│  │                                                             │ │
│  │ writing.controller.js                                      │ │
│  │ ├─ Receives base64 drawing data                           │ │
│  │ └─ Calls evaluateDrawing(base64)                          │ │
│  │                                                             │ │
│  │ writing.service.js                                         │ │
│  │ ├─ Creates temp/ directory if needed                       │ │
│  │ ├─ Removes "data:image/png;base64," prefix (if present)   │ │
│  │ ├─ Converts base64 → Buffer                              │ │
│  │ ├─ Writes PNG file: temp/drawing_12345.png                │ │
│  │ └─ Spawns Python process                                  │ │
│  │    $ python python/analyze_drawing.py temp/drawing_12345  │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     │ File Path
                     │ Temp PNG File
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│           Python Analysis Engine (OpenCV)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ analyze_drawing.py                                        │ │
│  │                                                             │ │
│  │ 1. Load Image                                              │ │
│  │    cv2.imread(sys.argv[1])                                │ │
│  │                                                             │ │
│  │ 2. Preprocessing                                           │ │
│  │    ├─ Grayscale: cv2.cvtColor(img, COLOR_BGR2GRAY)       │ │
│  │    └─ Threshold: cv2.threshold(gray, 150, 255, BINARY)   │ │
│  │                                                             │ │
│  │ 3. Feature Extraction                                      │ │
│  │    ├─ Vertical: np.sum(thresh, axis=0)                   │ │
│  │    ├─ Horizontal: np.sum(thresh, axis=1)                 │ │
│  │    └─ Edges: cv2.Canny(gray, 50, 150)                    │ │
│  │                                                             │ │
│  │ 4. Score Calculation                                       │ │
│  │    ├─ Spacing:      100 - (spacing_var / 20)            │ │
│  │    ├─ Baseline:     100 - (baseline_var / 20)           │ │
│  │    ├─ Consistency:  100 - abs(density - 0.05) * 800     │ │
│  │    └─ Overall:      average of three                      │ │
│  │                                                             │ │
│  │ 5. Feedback Generation                                     │ │
│  │    if spacing < 70:    "Spacing is uneven"               │ │
│  │    if baseline < 70:   "Alignment needs work"            │ │
│  │    if consistency < 70: "Pressure needs work"            │ │
│  │    if all >= 70:       "Great job!"                      │ │
│  │                                                             │ │
│  │ 6. Output JSON to stdout                                  │ │
│  │    {                                                        │ │
│  │      "spacingScore": 85,                                  │ │
│  │      "baselineScore": 92,                                 │ │
│  │      "consistencyScore": 88,                              │ │
│  │      "overallScore": 88,                                  │ │
│  │      "feedback": ["Great job!..."]                        │ │
│  │    }                                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     │ JSON stdout
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend Server (Parse Result)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ writing.service.js                                         │ │
│  │ ├─ Parse JSON from python stdout                          │ │
│  │ ├─ Delete temp PNG file                                   │ │
│  │ └─ Return result to controller                            │ │
│  │                                                             │ │
│  │ writing.controller.js                                      │ │
│  │ └─ Send HTTP 200 + JSON response                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     │ HTTP 200 OK
                     │ JSON Response
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Mobile App (Display Results)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ SpaceRaceTraining Component                               │ │
│  │                                                             │ │
│  │ Store Result                                               │ │
│  │ setCurrentResult(result)                                  │ │
│  │                                                             │ │
│  │ Display Scores                                             │ │
│  │ ├─ Progress Bar 1: Spacing (Green) - 85%                 │ │
│  │ ├─ Progress Bar 2: Baseline (Blue) - 92%                 │ │
│  │ └─ Progress Bar 3: Consistency (Orange) - 88%            │ │
│  │                                                             │ │
│  │ Show Feedback Box                                          │ │
│  │ "Great job! Your handwriting looks good."                │ │
│  │                                                             │ │
│  │ Button: Next Word                                          │ │
│  │ ├─ Push result to scores array                            │ │
│  │ ├─ Clear canvas                                           │ │
│  │ └─ Increment word index                                   │ │
│  │                                                             │ │
│  │ (Repeat for words 2 and 3)                               │ │
│  │                                                             │ │
│  │ Final Results Screen (After 3 words)                      │ │
│  │ ├─ Average Spacing: 86%                                   │ │
│  │ ├─ Average Baseline: 90%                                  │ │
│  │ ├─ Average Consistency: 88%                               │ │
│  │ ├─ Overall Score: 88%                                     │ │
│  │ └─ Aggregated Feedback from all 3 words                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

```
SpaceRaceTraining (Main Component)
│
├─ SafeAreaView
│  └─ ScrollView
│     │
│     ├─ Header Section
│     │  ├─ Back Button (← Back)
│     │  ├─ Title (Space Race)
│     │  └─ Progress (Word X of 3)
│     │
│     ├─ Word Practice Screen (if currentIndex < 3)
│     │  ├─ Word Display (Tamil text, fontSize 48)
│     │  ├─ Instruction Text
│     │  │
│     │  ├─ Canvas Container
│     │  │  └─ SignatureScreen (drawing area)
│     │  │     ref: signatureRef
│     │  │     onOK: handleOK
│     │  │
│     │  ├─ Button Container
│     │  │  ├─ Reset Button (Blue, #2196F3)
│     │  │  │  └─ onClick: clearSignature()
│     │  │  └─ Analyze Button (Green, #4CAF50)
│     │  │     └─ onClick: readSignature()
│     │  │
│     │  └─ Results Section (if currentResult)
│     │     ├─ Score Item 1
│     │     │  ├─ Label: "Spacing"
│     │     │  ├─ Value: "85%"
│     │     │  └─ Progress.Bar (Green)
│     │     │
│     │     ├─ Score Item 2
│     │     │  ├─ Label: "Baseline"
│     │     │  ├─ Value: "92%"
│     │     │  └─ Progress.Bar (Blue)
│     │     │
│     │     ├─ Score Item 3
│     │     │  ├─ Label: "Consistency"
│     │     │  ├─ Value: "88%"
│     │     │  └─ Progress.Bar (Orange)
│     │     │
│     │     ├─ Feedback Box
│     │     │  ├─ Title: "💡 Feedback:"
│     │     │  └─ Messages (• bullet points)
│     │     │
│     │     └─ Next Word Button
│     │        └─ onClick: handleNextWord()
│     │
│     └─ Final Results Screen (if currentIndex >= 3)
│        ├─ Completion Message (✓ All words completed!)
│        │
│        ├─ Average Score Item 1
│        │  ├─ Label: "Average Spacing"
│        │  ├─ Value: "86%"
│        │  └─ Progress.Bar (Green)
│        │
│        ├─ Average Score Item 2
│        │  ├─ Label: "Average Baseline"
│        │  ├─ Value: "90%"
│        │  └─ Progress.Bar (Blue)
│        │
│        ├─ Average Score Item 3
│        │  ├─ Label: "Average Consistency"
│        │  ├─ Value: "88%"
│        │  └─ Progress.Bar (Orange)
│        │
│        ├─ Overall Score Box
│        │  └─ Value: "88%" (Large, Centered)
│        │
│        ├─ Summary Feedback Box
│        │  ├─ Title: "📝 Summary Feedback:"
│        │  └─ All messages from 3 words
│        │
│        └─ Close Button
│           └─ onClick: router.back()
│
├─ State Variables
│  ├─ currentIndex: 0-3 (which word)
│  ├─ scores: [] (array of results)
│  ├─ currentResult: { spacingScore, baselineScore, ... } (latest)
│  ├─ loading: boolean (API in progress)
│  └─ finalResults: useMemo { averageSpacing, averageBaseline, ... }
│
├─ Refs
│  └─ signatureRef: Reference to SignatureScreen
│
└─ Callbacks
   ├─ handleOK(signature)
   │  └─ Removes prefix → calls analyzeDrawing() → stores result
   ├─ handleAnalyze()
   │  └─ Calls signatureRef.current.readSignature()
   ├─ handleReset()
   │  └─ Clears canvas and results
   └─ handleNextWord()
      └─ Saves score → clears → advances index
```

---

## 3. Score Calculation Flow

```
Input: PNG Image (from Canvas)
│
├─ LOAD & PREPROCESS
│  ├─ cv2.imread(path)
│  ├─ cv2.cvtColor(BGR → Gray)
│  └─ cv2.threshold(gray, 150, 255, BINARY_INV)
│
├─ VERTICAL PROJECTION (Spacing Analysis)
│  ├─ np.sum(thresh, axis=0)  ← Sum each column
│  ├─ Calculate std(vertical_sum)
│  ├─ spacingScore = 100 - (std / 20)
│  └─ Result: 0-100%
│
├─ HORIZONTAL PROJECTION (Baseline Analysis)
│  ├─ np.sum(thresh, axis=1)  ← Sum each row
│  ├─ Calculate std(horizontal_sum)
│  ├─ baselineScore = 100 - (std / 20)
│  └─ Result: 0-100%
│
├─ EDGE DETECTION (Consistency Analysis)
│  ├─ cv2.Canny(gray, 50, 150)
│  ├─ Count non-zero pixels
│  ├─ stroke_density = non_zero / total_pixels
│  ├─ consistencyScore = 100 - abs(density - 0.05) * 800
│  └─ Result: 0-100%
│
├─ OVERALL SCORE
│  └─ overallScore = (spacing + baseline + consistency) / 3
│
├─ FEEDBACK GENERATION
│  ├─ if spacing < 70:
│  │  └─ "Spacing between letters is uneven"
│  ├─ if baseline < 70:
│  │  └─ "Letters are not aligned on the baseline"
│  ├─ if consistency < 70:
│  │  └─ "Stroke consistency needs improvement"
│  └─ if all >= 70:
│     └─ "Great job! Your handwriting looks good."
│
└─ OUTPUT: JSON
   {
     "spacingScore": int,
     "baselineScore": int,
     "consistencyScore": int,
     "overallScore": int,
     "feedback": [string]
   }
```

---

## 4. UI Layout Tree

```
SafeAreaView (flex: 1, bg: #FFF9E6)
├─ ScrollView
│  └─ scrollContent
│     ├─ backButton (alignSelf: flex-start)
│     │  └─ Text: "← Back"
│     │
│     ├─ CONDITIONAL RENDER
│     │
│     ├─ IF !allDone (Word Practice)
│     │  │
│     │  ├─ title
│     │  │  └─ "Space Race" (fontSize: 36, weight: 800)
│     │  │
│     │  ├─ progressText
│     │  │  └─ "Word 1 of 3" (fontSize: 14)
│     │  │
│     │  ├─ wordDisplay
│     │  │  └─ "அம்மா" (fontSize: 48, weight: 800)
│     │  │
│     │  ├─ instruction
│     │  │  └─ "Practice writing..."
│     │  │
│     │  ├─ canvasWrapper (height: 300, rounded: 12)
│     │  │  └─ SignatureScreen
│     │  │
│     │  ├─ buttonContainer (flexDirection: row)
│     │  │  ├─ resetBtn
│     │  │  │  └─ "Reset"
│     │  │  └─ analyzeBtn
│     │  │     └─ "Analyze Writing"
│     │  │
│     │  └─ IF currentResult
│     │     │
│     │     └─ resultsSection
│     │        ├─ scoreItem (Spacing)
│     │        │  ├─ scoreLabel: "Spacing"
│     │        │  ├─ scoreValue: "85%"
│     │        │  └─ Progress.Bar (Green)
│     │        │
│     │        ├─ scoreItem (Baseline)
│     │        │  ├─ scoreLabel: "Baseline"
│     │        │  ├─ scoreValue: "92%"
│     │        │  └─ Progress.Bar (Blue)
│     │        │
│     │        ├─ scoreItem (Consistency)
│     │        │  ├─ scoreLabel: "Consistency"
│     │        │  ├─ scoreValue: "88%"
│     │        │  └─ Progress.Bar (Orange)
│     │        │
│     │        ├─ feedbackBox
│     │        │  ├─ feedbackTitle: "💡 Feedback:"
│     │        │  └─ feedbackMessage × N
│     │        │     └─ "• Message text"
│     │        │
│     │        └─ nextWordBtn
│     │           └─ "Next Word"
│     │
│     └─ ELSE (Final Results)
│        │
│        ├─ title
│        │  └─ "Space Race"
│        │
│        ├─ completionText
│        │  └─ "✓ All words completed!"
│        │
│        └─ IF finalResults
│           │
│           ├─ resultsSection
│           │  ├─ scoreItem (Avg Spacing)
│           │  │  ├─ "Average Spacing"
│           │  │  ├─ "86%"
│           │  │  └─ Progress.Bar (Green)
│           │  │
│           │  ├─ scoreItem (Avg Baseline)
│           │  │  ├─ "Average Baseline"
│           │  │  ├─ "90%"
│           │  │  └─ Progress.Bar (Blue)
│           │  │
│           │  ├─ scoreItem (Avg Consistency)
│           │  │  ├─ "Average Consistency"
│           │  │  ├─ "88%"
│           │  │  └─ Progress.Bar (Orange)
│           │  │
│           │  ├─ overallScoreBox
│           │  │  ├─ "Overall Score"
│           │  │  └─ "88%" (Large)
│           │  │
│           │  ├─ feedbackBox
│           │  │  ├─ "📝 Summary Feedback:"
│           │  │  └─ feedbackMessage × N
│           │  │
│           │  └─ finishBtn
│           │     └─ "Close"
```

---

## 5. State Flow Diagram

```
Initial State
│
├─ currentIndex: 0
├─ scores: []
├─ currentResult: null
├─ loading: false
│
▼
WORD 1: User starts
│
├─ wordDisplay = "அம்மா"
├─ progressText = "Word 1 of 3"
│
▼
DRAW → analyze → handleOK → setCurrentResult
│
├─ currentResult = {
│    spacingScore: 85,
│    baselineScore: 92,
│    consistencyScore: 88,
│    overallScore: 88,
│    feedback: ["..."]
│  }
│
▼
Display scores & feedback
│
▼
Click "Next Word"
│
├─ setScores([...scores, currentResult])
├─ setCurrentResult(null)
├─ setCurrentIndex(1)
│
▼
WORD 2: Repeat
│
├─ wordDisplay = "அப்பா"
├─ progressText = "Word 2 of 3"
│
▼
(Same flow: draw → analyze → display → next)
│
▼
WORD 3: Repeat
│
├─ wordDisplay = "தங்கை"
├─ progressText = "Word 3 of 3"
│
▼
(Same flow: draw → analyze → display → next)
│
▼
Click "Next Word" (on Word 3)
│
├─ setScores([word1, word2, word3])
├─ setCurrentIndex(3)
│
▼
allDone = true (currentIndex >= 3)
│
├─ Show final results screen
├─ finalResults = {
│    averageSpacing: 86,
│    averageBaseline: 90,
│    averageConsistency: 88,
│    overallScore: 88,
│    feedback: [all feedback]
│  }
│
▼
Display final results with averages
│
▼
Click "Close"
│
└─ router.back() → Return to previous screen
```

---

## 6. API Communication Sequence

```
┌─────────────────┐                          ┌─────────────────┐
│  React Native   │                          │  Express Server │
│     Frontend    │                          │   + Python      │
└────────┬────────┘                          └────────┬────────┘
         │                                            │
         │  User draws & clicks "Analyze"            │
         │                                            │
         ├─────────────────────────────────────────>  │
         │  POST /writing/analyze-drawing             │
         │  Content-Type: application/json            │
         │  {"drawing": "iVBORw0KGgo..."}            │
         │                                            │
         │                    Temp file: drawing.png  │
         │                    │                       │
         │                    ├─> Python subprocess  │
         │                    │    │                  │
         │                    │    ├─> Image load    │
         │                    │    ├─> Analysis      │
         │                    │    └─> JSON output   │
         │                    │                       │
         │                    ├─> Parse JSON        │
         │                    ├─> Delete temp file  │
         │                    └─> Prepare response  │
         │                                            │
         │  <─────────────────────────────────────────┤
         │  HTTP 200 OK                               │
         │  {"spacingScore": 85, ...}                 │
         │                                            │
         │  Store result in state                      │
         │  Display progress bars                      │
         │  Show feedback                              │
         │                                            │
```

---

This comprehensive visualization helps understand:
1. **Data Flow** - How information moves from canvas to analysis to display
2. **Component Structure** - How UI elements are nested
3. **Scoring Process** - How the algorithm calculates scores
4. **UI Layout** - The exact hierarchy of React Native components
5. **State Management** - How user progression through words works
6. **API Communication** - The sequence of HTTP requests and responses
