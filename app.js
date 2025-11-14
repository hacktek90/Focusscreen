// app.js

const form = document.getElementById('shorten-form');
const longUrlInput = document.getElementById('long-url');
const errorMessage = document.getElementById('error-message');

const resultContainer = document.getElementById('result');
const shortUrlInput = document.getElementById('short-url');
const copyBtn = document.getElementById('copy-btn');

const historyContainer = document.getElementById('history');
const historyList = document.getElementById('history-list');

const history = []; // session history only

function isLikelyUrl(value) {
  return /^https?:\/\/.+/i.test(value.trim());
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorMessage.textContent = '';

  const longUrl = longUrlInput.value.trim();

  if (!longUrl) {
    errorMessage.textContent = 'Please enter a URL.';
    return;
  }

  if (!isLikelyUrl(longUrl)) {
    errorMessage.textContent = 'URL must start with http:// or https://';
    return;
  }

  try {
    // CleanURI API: POST https://cleanuri.com/api/v1/shorten with form data "url"
    // Docs: https://cleanuri.com/api/v1/shorten
    const response = await fetch('https://cleanuri.com/api/v1/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: 'url=' + encodeURIComponent(longUrl)
    });

    const data = await response.json();

    if (data.error) {
      errorMessage.textContent = data.error;
      return;
    }

    const shortUrl = data.result_url;

    // Show result
    shortUrlInput.value = shortUrl;
    resultContainer.hidden = false;

    // Save in history
    history.unshift({
      shortUrl,
      originalUrl: longUrl
    });

    renderHistory();
  } catch (err) {
    console.error(err);
    errorMessage.textContent = 'Network error. Please try again.';
  }
});

copyBtn.addEventListener('click', async () => {
  const value = shortUrlInput.value.trim();
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 1200);
  } catch (err) {
    console.error(err);
    alert('Unable to copy. Please copy manually.');
  }
});

function renderHistory() {
  if (history.length === 0) {
    historyContainer.hidden = true;
    historyList.innerHTML = '';
    return;
  }

  historyContainer.hidden = false;
  historyList.innerHTML = '';

  history.forEach((item) => {
    const li = document.createElement('li');

    const shortSpan = document.createElement('span');
    shortSpan.className = 'short';
    shortSpan.textContent = item.shortUrl;

    const longSpan = document.createElement('span');
    longSpan.className = 'long';
    longSpan.textContent = item.originalUrl;

    li.appendChild(shortSpan);
    li.appendChild(longSpan);
    historyList.appendChild(li);
  });
}
