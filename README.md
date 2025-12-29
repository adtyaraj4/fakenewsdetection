# 🔍 TruthLens – AI-Powered Misinformation Detector (Chrome Extension)

TruthLens is a **fully functional prototype Chrome/Edge extension** that helps users verify the credibility of news, posts, and images across the web.
It combines **OCR (Optical Character Recognition)** with **AI-based analysis** to detect misinformation in real time.

---

## ✅ Project Status

**✔ Prototype Complete**

* Core features implemented
* OCR + AI pipeline working
* Twitter (X) auto-detection working
* Image & manual text analysis supported

Future improvements may include deeper platform integration and mobile support.

---

## ✨ Key Features

### 🐦 Twitter / X Compatibility

* Open any **tweet**
* Click **“Scan Current Page”**
* TruthLens automatically extracts the tweet text
* AI analyzes it instantly — no manual copy needed

---

### ✍️ Manual Text Check

* Paste or type **any news or claim**
* Get:

  * **Verdict** (Real / Fake)
  * **Confidence Score (0–100%)**
  * **AI explanation**

---

### 🖼️ Image-Based Misinformation Detection

* Upload **any image** containing text
* Built-in OCR extracts the text automatically
* Extracted text is analyzed for credibility

---

### 📸 Drag & Select (Any Website)

* On **any non-Twitter page**:

  * Click **Scan Current Page**
  * Drag-select the image or text area
* The selected content is captured, OCR-processed, and analyzed

---

### 📊 Confidence Score

* Each result includes a **confidence percentage**
* Helps users understand **how certain the AI is**

---

### 🎨 Clean Side Panel UI

* Modern chat-style interface
* Visual indicators for:

  * REAL ✅
  * FAKE ❌
* Smooth animations and progress bars

---

## 🧠 How It Works (Pipeline)

1. User selects text / image / tweet
2. Image → OCR (OCR.space API)
3. Extracted text → OpenAI API
4. AI evaluates credibility
5. Result displayed with:

   * Verdict
   * Confidence score
   * Explanation

---

## 🗂️ Project Structure

```
TruthLens/
│
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # OCR + AI logic
├── content.js             # Drag-select & page capture
│
├── sidepanel.html         # UI layout
├── sidepanel.css          # UI styling
├── sidepanel.js           # UI logic
│
├── true.html              # Result page (REAL)
├── false.html             # Result page (FAKE)
├── result.js              # Result rendering logic
├── styles.css             # Result page styles
│
└── README.md
```

---

## 🛠️ Technologies Used

### Frontend

* HTML
* CSS
* JavaScript (Vanilla)

### APIs & Services

* **OCR.space API** (already integrated, no setup needed)
* **OpenAI API** (user must add their own key)

### Browser APIs

* Chrome Extensions API (Manifest V3)
* Side Panel API
* Content Scripts
* Storage API

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/adtyaraj4/fakenewsdetection.git
cd fakenewsdetection
```

---

### 2️⃣ Add Your OpenAI API Key

Open **`background.js`** and replace on line 116:

```js
const apiKey = "YOUR_OPENAI_API_KEY";
```

with your own **OpenAI API key**.

⚠️ **Important**

* Do NOT commit your API key to GitHub
* The OCR API is already included and working

---

### 3️⃣ Load Extension in Chrome / Edge

1. Open browser
2. Go to `chrome://extensions` or `edge://extensions`
3. Enable **Developer Mode**
4. Click **Load Unpacked**
5. Select the `TruthLens` folder

---

## 🧪 How to Use

### 🔹 Twitter (X)

1. Open a tweet
2. Click the TruthLens extension
3. Click **Scan Current Page**
4. Tweet is analyzed automatically

---

### 🔹 Any Other Website

1. Open the page
2. Click **Scan Current Page**
3. Drag-select text or image
4. Release to analyze

---

### 🔹 Manual Input

* Paste or type text directly
* Or upload an image from your device

---

## 🚀 Limitations

* Instagram **auto post detection** is not fully implemented yet
* Mobile browser support is not available (Chrome extensions limitation)

---

## 👥 Credits

* **Aditya Raj**
* **Shivika Chaubey**
* **Gaurvi Garg**

---

## 📌 Disclaimer

TruthLens is an **assistive tool**, not a final authority.
Always verify critical information from **trusted sources**.
