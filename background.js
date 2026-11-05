// Background script for IDM Style Downloader

chrome.runtime.onInstalled.addListener(() => {
  console.log("IDM Style Downloader installed.");
  
  // Create context menu for links
  chrome.contextMenus.create({
    id: "downloadWithIDM",
    title: "Download with IDM Style",
    contexts: ["link", "image", "video", "audio"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "downloadWithIDM") {
    const url = info.srcUrl || info.linkUrl;
    if (url) {
      chrome.downloads.download({ url: url });
    }
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_DOWNLOAD") {
    chrome.downloads.download({ url: message.url }, (downloadId) => {
      sendResponse({ success: !!downloadId, downloadId });
    });
    return true; // Keep channel open for async sendResponse
  }
});
