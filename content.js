// Content script to detect downloadable media
console.log("IDM Content Script Loaded");

function detectMedia() {
  const mediaElements = document.querySelectorAll('video, audio, source');
  const links = document.querySelectorAll('a[href$=".mp4"], a[href$=".mp3"], a[href$=".zip"], a[href$=".pdf"]');
  
  const foundMedia = [];
  
  mediaElements.forEach(el => {
    const src = el.src || el.currentSrc;
    if (src && !foundMedia.includes(src)) {
      foundMedia.push(src);
    }
  });

  links.forEach(link => {
    if (!foundMedia.includes(link.href)) {
      foundMedia.push(link.href);
    }
  });

  if (foundMedia.length > 0) {
    chrome.storage.local.set({ capturedMedia: foundMedia });
  }
}

// Simple polling or event-based detection
setInterval(detectMedia, 5000);
detectMedia();

// Listen for requests from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_MEDIA") {
    detectMedia();
    chrome.storage.local.get(['capturedMedia'], (result) => {
      sendResponse({ media: result.capturedMedia || [] });
    });
    return true;
  }
});
