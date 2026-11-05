document.addEventListener('DOMContentLoaded', () => {
  const mediaList = document.getElementById('media-list');
  const emptyMsg = document.getElementById('empty-msg');
  const refreshBtn = document.getElementById('refresh-btn');
  const clearBtn = document.getElementById('clear-btn');
  const statusText = document.getElementById('status-text');

  function renderMedia(media) {
    mediaList.innerHTML = '';
    if (!media || media.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    }
    emptyMsg.style.display = 'none';

    media.forEach((url) => {
      const row = document.createElement('tr');
      
      const nameCell = document.createElement('td');
      const fileName = url.split('/').pop().split('?')[0] || url;
      nameCell.textContent = fileName;
      nameCell.title = url;

      const actionCell = document.createElement('td');
      const btn = document.createElement('button');
      btn.className = 'download-btn';
      btn.textContent = 'Download';
      btn.onclick = () => {
        chrome.runtime.sendMessage({ type: "START_DOWNLOAD", url: url }, (response) => {
          if (response && response.success) {
            statusText.textContent = "Download started...";
          } else {
            statusText.textContent = "Download failed.";
          }
        });
      };
      
      actionCell.appendChild(btn);
      row.appendChild(nameCell);
      row.appendChild(actionCell);
      mediaList.appendChild(row);
    });
  }

  function fetchMedia() {
    statusText.textContent = "Scanning...";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "GET_MEDIA" }, (response) => {
          if (chrome.runtime.lastError) {
            // Fallback to storage if content script not ready
            chrome.storage.local.get(['capturedMedia'], (result) => {
              renderMedia(result.capturedMedia || []);
              statusText.textContent = "Loaded from storage";
            });
          } else if (response && response.media) {
            renderMedia(response.media);
            statusText.textContent = `Found ${response.media.length} items`;
          }
        });
      }
    });
  }

  refreshBtn.addEventListener('click', fetchMedia);

  clearBtn.addEventListener('click', () => {
    chrome.storage.local.set({ capturedMedia: [] }, () => {
      renderMedia([]);
      statusText.textContent = "Cleared";
    });
  });

  // Initial load
  fetchMedia();
});
