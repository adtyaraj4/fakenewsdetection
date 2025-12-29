// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Handle messages from content script and side panel
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "capture") {
    chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" }, (dataUrl) => {
      sendResponse(dataUrl);
    });
    return true;
  }

  if (msg.action === "analyzeText") {
    analyzeText(msg.text).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  }

  if (msg.action === "analyzeImage") {
    analyzeImageWithFreeOCR(msg.imageData).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  }
  
  // Route drag-select OCR image from content script to sidepanel
  if (msg.action === "ocrImage" && msg.imageData) {
    // Get the sidepanel and forward the message
    chrome.runtime.sendMessage({
      action: "ocrImageReady",
      imageData: msg.imageData
    });
    sendResponse({ received: true });
    return true;
  }
});

// FREE OCR using OCR.space API (no credit card, 25,000 requests/month free)
async function extractTextFromImage(imageData) {
  const FREE_OCR_API_KEY = 'K87899142388957'; // Free tier, no credit card needed
  
  try {
    console.log('🔍 Using FREE OCR.space API...');
    
    const formData = new FormData();
    formData.append('base64Image', imageData);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Engine 2 is better for most cases
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': FREE_OCR_API_KEY
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('OCR API request failed');
    }
    
    const data = await response.json();
    
    if (data.IsErroredOnProcessing) {
      throw new Error(data.ErrorMessage || 'OCR processing failed');
    }
    
    const text = data.ParsedResults && data.ParsedResults[0] 
      ? data.ParsedResults[0].ParsedText 
      : '';
    
    if (!text || text.trim().length < 3) {
      throw new Error('No text found in image. Try a clearer image with better contrast.');
    }
    
    console.log('✅ OCR completed:', text.substring(0, 100));
    return text.trim();
    
  } catch (error) {
    console.error('OCR error:', error);
    throw error;
  }
}

async function analyzeImageWithFreeOCR(imageData) {
  try {
    // Extract text using FREE OCR
    const extractedText = await extractTextFromImage(imageData);
    
    // Analyze the extracted text
    const analysis = await analyzeText(extractedText);
    
    return {
      extractedText: extractedText,
      verdict: analysis.verdict,
      confidence: analysis.confidence,
      analysis: analysis.analysis
    };
    
  } catch (error) {
    throw error;
  }
}

async function analyzeText(text) {
  const apiKey = "YOUR_OPENAI_API_KEY";

  const prompt = `You are TruthLens AI.

Analyze the following text for misinformation using credible sources.

Return the response EXACTLY in this format:
1. VERDICT: (Real/Fake)
2. CONFIDENCE SCORE: (0-100%)
3. ANALYSIS: (2-3 sentences explaining why)

Text:
${text}`;

  if (!text || text.trim() === '') {
    throw new Error("No text provided for analysis");
  }

  try {
    console.log('Calling OpenAI API...');
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are TruthLens AI, a misinformation detection expert. Analyze text and provide verdicts in the exact format requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || 'Unknown error';
      console.error('API Error:', response.status, errorMessage);
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (response.status === 500) {
        throw new Error('OpenAI server error. Please try again later.');
      } else {
        throw new Error(`API request failed: ${response.status} - ${errorMessage}`);
      }
    }

    const data = await response.json();
    
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('Invalid API response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }
    
    const choice = data.choices[0];
    if (!choice || !choice.message || !choice.message.content) {
      console.error('Invalid choice structure:', choice);
      throw new Error('Invalid response format from OpenAI API');
    }
    
    const textOutput = choice.message.content;
    console.log('API Response:', textOutput);

    const verdictMatch = textOutput.match(/VERDICT:\s*(Real|Fake)/i);
    const confidenceMatch = textOutput.match(/CONFIDENCE SCORE:\s*(\d+)/);
    const analysisMatch = textOutput.match(/ANALYSIS:\s*(.*)/s);

    const verdict = verdictMatch && verdictMatch[1] ? verdictMatch[1].toLowerCase() : "unknown";
    const confidence = confidenceMatch && confidenceMatch[1] ? Number(confidenceMatch[1]) : 50;
    const analysis = analysisMatch && analysisMatch[1] ? analysisMatch[1].trim() : textOutput;

    return {
      verdict: verdict,
      confidence: Math.min(Math.max(confidence, 0), 100),
      analysis: analysis || "Analysis completed but format was unexpected."
    };
    
  } catch (error) {
    console.error('analyzeText error:', error);
    
    if (error.message && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
}