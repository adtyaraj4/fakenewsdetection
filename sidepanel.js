const chatArea = document.getElementById('chat-area');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');
const fileInput = document.getElementById('file-input');

const textOption = document.getElementById('text-option');
const imageOption = document.getElementById('image-option');
const captureOption = document.getElementById('capture-option');

const scanPageBtn = document.getElementById('scan-page-btn');
const manualInputBtn = document.getElementById('manual-input-btn');

let currentMode = 'text';
let currentImageData = null;

scanPageBtn?.addEventListener('click', scanCurrentPage);
manualInputBtn?.addEventListener('click', () => {
  removeWelcome();
  textInput.focus();
});

// Mode switching
textOption.addEventListener('click', () => {
  setMode('text');
  textInput.focus();
});

imageOption.addEventListener('click', () => {
  setMode('image');
  fileInput.click();
});

captureOption.addEventListener('click', () => {
  setMode('capture');
  scanCurrentPage();
});

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.input-option-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (mode === 'text') {
    textOption.classList.add('active');
    textInput.placeholder = 'Type or paste news text here...';
  } else if (mode === 'image') {
    imageOption.classList.add('active');
  } else if (mode === 'capture') {
    captureOption.classList.add('active');
  }
}

// Send message
sendBtn.addEventListener('click', handleSend);
textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

async function handleSend() {
  const text = textInput.value.trim();
  
  if (!text && !currentImageData) {
    return;
  }
  
  removeWelcome();
  
  if (currentImageData) {
    addMessage('', 'user', currentImageData);
    textInput.value = '';
    analyzeImageWithFreeOCR(currentImageData);
    currentImageData = null;
    return;
  }
  
  if (text) {
    addMessage(text, 'user');
    textInput.value = '';
    
    const typingId = addTypingIndicator();
    
    try {
      const result = await analyzeText(text);
      removeTypingIndicator(typingId);
      addResultMessage(result);
    } catch (error) {
      removeTypingIndicator(typingId);
      addMessage(`❌ Error: ${error.message}`, 'assistant');
    }
  }
}

// File upload
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageData = e.target.result;
      removeWelcome();
      addMessage('', 'user', currentImageData);
      analyzeImageWithFreeOCR(currentImageData);
    };
    reader.readAsDataURL(file);
  }
});

// Scan current page
async function scanCurrentPage() {
  removeWelcome();
  addMessage('📸 Scanning page...', 'assistant');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url.includes('twitter.com') || tab.url.includes('x.com')) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const tweet = document.querySelector('article [data-testid="tweetText"]');
          return tweet ? tweet.innerText : null;
        }
      });
      
      if (results && results[0] && results[0].result) {
        addMessage(results[0].result, 'user');
        
        const typingId = addTypingIndicator();
        const result = await analyzeText(results[0].result);
        removeTypingIndicator(typingId);
        addResultMessage(result);
      } else {
        addMessage('❌ No tweet found. Please open a tweet and try again.', 'assistant');
      }
    } else {
      // Inject content script for drag selection
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Show instructions
      addMessage('✅ Drag-select enabled!\n\nDrag your mouse to select the area with text you want to analyze.', 'assistant');
    }
  } catch (error) {
    addMessage(`❌ Error: ${error.message}`, 'assistant');
  }
}

// Listen for messages - FIXED to handle both message types
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Sidepanel received message:', msg.action);
  
  // Handle routed drag-select image from background
  if (msg.action === 'ocrImageReady' && msg.imageData) {
    console.log('Processing drag-selected image');
    removeWelcome();
    addMessage('', 'user', msg.imageData);
    analyzeImageWithFreeOCR(msg.imageData);
    sendResponse({ received: true });
    return true;
  }
  
  // Handle direct text analysis (Twitter)
  if (msg.action === 'analyzeText' && msg.text) {
    console.log('Processing text analysis');
    removeWelcome();
    addMessage(msg.text, 'user');
    
    const typingId = addTypingIndicator();
    analyzeText(msg.text).then(result => {
      removeTypingIndicator(typingId);
      addResultMessage(result);
      sendResponse({ received: true });
    }).catch(error => {
      removeTypingIndicator(typingId);
      addMessage(`❌ Error: ${error.message}`, 'assistant');
      sendResponse({ error: error.message });
    });
    return true;
  }
});

// Analyze image with FREE OCR
async function analyzeImageWithFreeOCR(imageData) {
  addMessage('🔍 Extracting text with FREE OCR...', 'assistant');
  const typingId = addTypingIndicator();
  
  try {
    const result = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'analyzeImage', imageData: imageData },
        (response) => {
          if (response && response.error) {
            reject(new Error(response.error));
          } else if (response) {
            resolve(response);
          } else {
            reject(new Error('No response from OCR service'));
          }
        }
      );
    });
    
    removeTypingIndicator(typingId);
    
    // Show extracted text
    if (result.extractedText) {
      const preview = result.extractedText.length > 200 
        ? result.extractedText.substring(0, 200) + '...' 
        : result.extractedText;
      addMessage(`📄 Extracted text:\n\n"${preview}"`, 'assistant');
    }
    
    // Show analysis result
    addResultMessage(result);
    
  } catch (error) {
    removeTypingIndicator(typingId);
    addMessage(`❌ ${error.message}`, 'assistant');
  }
}

// Analyze text via background script
function analyzeText(text) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'analyzeText', text: text },
      (response) => {
        if (response && response.error) {
          reject(new Error(response.error));
        } else if (response) {
          resolve(response);
        } else {
          reject(new Error('No response from analysis service'));
        }
      }
    );
  });
}

// UI Functions
function addMessage(text, sender, imageSrc = null) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  
  if (text) {
    bubble.style.whiteSpace = 'pre-wrap';
    bubble.textContent = text;
  }
  
  if (imageSrc) {
    const img = document.createElement('img');
    img.src = imageSrc;
    img.className = 'message-image';
    bubble.appendChild(img);
  }
  
  messageDiv.appendChild(bubble);
  chatArea.appendChild(messageDiv);
  scrollToBottom();
}

function addResultMessage(result) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message assistant';
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  
  const isReal = result.verdict === 'real';
  
  bubble.innerHTML = `
    <div class="result-card">
      <div class="verdict-header ${isReal ? 'real' : 'fake'}">
        <h3>${isReal ? 'REAL' : 'FAKE'}</h3>
        <span class="verdict-icon">${isReal ? '✅' : '❌'}</span>
      </div>
      
      <div class="progress-container">
        <div class="progress-bar ${isReal ? 'real' : 'fake'}" style="width: 0%"></div>
      </div>
      
      <p class="confidence-text">Confidence: ${result.confidence}%</p>
      
      <div class="analysis-box">
        <h4>Analysis</h4>
        <p>${result.analysis}</p>
      </div>
    </div>
  `;
  
  messageDiv.appendChild(bubble);
  chatArea.appendChild(messageDiv);
  scrollToBottom();
  
  setTimeout(() => {
    const progressBar = bubble.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.style.width = `${result.confidence}%`;
    }
  }, 100);
}

let typingCounter = 0;
function addTypingIndicator() {
  const id = `typing-${typingCounter++}`;
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message assistant';
  messageDiv.id = id;
  
  messageDiv.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  
  chatArea.appendChild(messageDiv);
  scrollToBottom();
  return id;
}

function removeTypingIndicator(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}

function removeWelcome() {
  const welcome = document.querySelector('.welcome-message');
  if (welcome) {
    welcome.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => welcome.remove(), 300);
  }
}

function scrollToBottom() {
  chatArea.scrollTop = chatArea.scrollHeight;
}