# 🕵️‍♂️ Fake News Detection System (Work in Progress)

## 📌 Project Status

🚧 **This project is currently under development.**
Core components are implemented and tested individually, but **full end-to-end integration with the Instagram-like UI is still in progress**.

The project demonstrates the **foundation** for an image-based fake news detection system and outlines a clear path toward future deployment as a browser extension.

---

## 🎯 Project Idea

The aim of this project is to **detect fake or misleading news shared as images on social media** by:

* Extracting text from images (OCR)
* Analyzing the extracted text for credibility
* Providing a verdict with confidence and explanation

---

## 🎨 User Interface (UI)

* The UI file is **`file (4).html`**
* It is a **replica of Instagram’s interface**
* Users can:

  * View posts
  * Like posts
  * Upload images (UI-level)

⚠️ **Important clarification**
At the current stage:

* The UI **does NOT yet automatically verify posts**
* The UI is a **visual prototype** to show where and how the system will be integrated
* Fake news detection is currently tested **separately**, not directly inside the UI

---

## 🧠 Current Functionality (What Works Now)

### ✅ Implemented

* OCR-based text extraction from images
* AI-based credibility analysis of extracted text
* Confidence score and explanation generation
* Backend API using Flask
* Standalone image verification via terminal

### ❌ Not Yet Implemented

* Automatic verification of posts inside the Instagram replica
* Real-time UI overlays for verdicts
* Browser extension functionality
* Live integration with real social media platforms

---

## 📂 Project Structure

```
.
├── app.py              # Flask backend API (OCR + AI)
├── brain.py            # Credibility analysis logic
├── ocr1.py             # OCR text extraction
├── imagecheck.py       # Standalone image verification script
├── file (4).html       # Instagram-like UI prototype
├── new.png             # Sample image for testing
├── .env                # OpenAI API key
└── README.md
```

---

## 🧪 Testing Image Verification (Current Working Feature)

To test fake news detection **without the UI**:

### Steps:

1. Replace **`new.png`** with the image you want to analyze
   (image should contain readable text)
2. Open terminal in the project folder
3. Run:

```bash
python imagecheck.py
```

### Output:

* Extracted text
* Verdict (Real / Fake)
* Confidence score
* Short explanation

This is the **primary working verification method at present**.

---

## 🌐 Running the Backend (For Development)

```bash
python app.py
```

Runs the Flask backend on:

```
http://127.0.0.1:5000
```

This backend is intended to be connected to the UI and future extensions.

---

## 📦 Libraries & Dependencies

### Python

Install using pip:

```bash
pip install flask flask-cors pillow pytesseract python-dotenv openai
```

### System Requirement

* **Tesseract OCR** (must be installed separately)

Download:
[https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)

---

## 🔑 Environment Setup

Create a `.env` file:

```
OPENAI_API_KEY=your_api_key_here
```

---

## 🚀 Future Scope & Roadmap

The **long-term goal** of this project is to evolve it into a **browser extension** that can:

* Work on platforms like:

  * Instagram
  * Twitter (X)
  * Facebook
* Analyze posts **before or during viewing**
* Warn users about potentially fake news
* Provide explainable AI feedback instead of simple labels

Planned future steps:

* Integrate detection directly into the UI
* Enable automatic scanning of feed images
* Convert the project into a Chrome/Firefox extension
* Optimize OCR and credibility scoring

---
Got it 👍
Here is a **README-ready description section** you can paste **directly** into your `README.md`.
It’s concise, honest, and properly credits everyone.

---

## 👥 Credits

* **Shivika Chaubey** — Project Lead & Concept Development
* **Aditya Raj** — UI Design & Core Development
* **Gaurvi Garg** — Research & Ideation

---

## 🏁 Final Note

This project represents a **prototype and research foundation**, not a finished product.
The focus is on:

* Ethical AI usage
* Explainability
* Preventing misinformation spread

---
