(() => {
  if (window.__TRUTHLENS_ACTIVE__) return;
  window.__TRUTHLENS_ACTIVE__ = true;

  const hostname = window.location.hostname;

  // Platform router
  if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
    handleTwitter();
  } else {
    handleOCR();
  }

  // Twitter/X text extraction
  function handleTwitter() {
    const tweet = document.querySelector('article [data-testid="tweetText"]');

    if (tweet && tweet.innerText.trim()) {
      chrome.runtime.sendMessage({
        action: "analyzeText",
        text: tweet.innerText
      });
      window.__TRUTHLENS_ACTIVE__ = false;
      return;
    }

    alert("No tweet text found. Please drag-select the area you want to analyze.");
    handleOCR();
  }

  // OCR capture with drag selection
  function handleOCR() {
    if (hostname.includes("instagram.com")) {
      alert("Drag-select the image area containing text");
    } else {
      alert("Drag-select the area you want to analyze");
    }

    let startX, startY, selectionBox;

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      cursor: crosshair;
      z-index: 999999;
      background: rgba(0,0,0,0.05);
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener("mousedown", (e) => {
      startX = e.clientX;
      startY = e.clientY;

      selectionBox = document.createElement("div");
      selectionBox.style.cssText = `
        position: fixed;
        border: 2px dashed #667eea;
        background: rgba(102, 126, 234, 0.15);
        left: ${startX}px;
        top: ${startY}px;
      `;
      overlay.appendChild(selectionBox);

      overlay.addEventListener("mousemove", onMouseMove);
    });

    overlay.addEventListener("mouseup", () => {
      overlay.removeEventListener("mousemove", onMouseMove);
      
      if (!selectionBox) {
        cleanup();
        return;
      }
      
      const rect = selectionBox.getBoundingClientRect();
      overlay.style.display = "none";
    
      // FIX: Add error handling for the capture message
      chrome.runtime.sendMessage({ action: "capture" }, (dataUrl) => {
        // Check for runtime errors
        if (chrome.runtime.lastError) {
          console.error('Capture error:', chrome.runtime.lastError);
          cleanup();
          return;
        }
        
        if (!dataUrl) {
          cleanup();
          return;
        }
    
        const img = new Image();
        img.src = dataUrl;
    
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = rect.width;
          canvas.height = rect.height;
    
          const ctx = canvas.getContext("2d");
          const scale = window.devicePixelRatio || 1;
    
          ctx.drawImage(
            img,
            rect.left * scale,
            rect.top * scale,
            rect.width * scale,
            rect.height * scale,
            0,
            0,
            rect.width,
            rect.height
          );
    
          const croppedImage = canvas.toDataURL("image/png");
          
          // Send to sidepanel for processing
          chrome.runtime.sendMessage({
            action: "ocrImage",
            imageData: croppedImage
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('OCR message error:', chrome.runtime.lastError);
            }
          });
          
          cleanup();
        };
        
        img.onerror = () => {
          console.error('Image load error');
          cleanup();
        };
      });
    });

    function onMouseMove(e) {
      selectionBox.style.width = Math.abs(e.clientX - startX) + "px";
      selectionBox.style.height = Math.abs(e.clientY - startY) + "px";
      selectionBox.style.left = Math.min(e.clientX, startX) + "px";
      selectionBox.style.top = Math.min(e.clientY, startY) + "px";
    }

    function cleanup() {
      overlay.remove();
      window.__TRUTHLENS_ACTIVE__ = false;
    }
  }
})();
