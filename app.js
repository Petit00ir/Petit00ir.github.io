const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbw-K0EzIxiStt34alC2oGzdsdXOVsbEHgMPADZSR8lnbHl42mrrx3JcoTrMCKSSSn4I/exec';

document.querySelectorAll('.nav button').forEach(button => {
  button.addEventListener('click', () => {
    showPage(button.dataset.page);
  });
});

function showPage(page) {
  document.querySelectorAll('.page').forEach(el => {
    el.classList.remove('active');
  });

  const target = document.getElementById('page-' + page) || document.getElementById('page-home');
  target.classList.add('active');

  document.querySelectorAll('.nav button').forEach(button => {
    button.classList.toggle('active', button.dataset.page === page);
  });
}

function callPotalApi(action, params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName =
      'potalCallback_' + Date.now() + '_' + Math.floor(Math.random() * 100000);

    const query = new URLSearchParams({
      api: '1',
      action,
      callback: callbackName,
      ...params
    });

    const script = document.createElement('script');
    script.src = GAS_API_URL + '?' + query.toString();

    window[callbackName] = function(data) {
      delete window[callbackName];
      script.remove();
      resolve(data);
    };

    script.onerror = function() {
      delete window[callbackName];
      script.remove();
      reject(new Error('API読み込みに失敗しました'));
    };

    document.body.appendChild(script);
  });
}

function esc(value) {
  return String(value || '').replace(/[&<>'"]/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[s]));
}
