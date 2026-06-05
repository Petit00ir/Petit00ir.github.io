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

function formatShortDate(value) {
  if (!value) return '';

  const text = String(value);
  const m = text.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);

  if (m) {
    return String(m[1]).slice(-2) + '/' +
      String(m[2]).padStart(2, '0') + '/' +
      String(m[3]).padStart(2, '0');
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return text;

  return String(date.getFullYear()).slice(-2) + '/' +
    String(date.getMonth() + 1).padStart(2, '0') + '/' +
    String(date.getDate()).padStart(2, '0');
}

function renderGenshinRows(rows) {
  const el = document.getElementById('genshinList');

  if (!rows || !rows.length) {
    el.textContent = '保存データがありません。';
    return;
  }

  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>キャラ</th>
          <th>武器</th>
          <th>聖遺物</th>
          <th>ステータス</th>
          <th>メモ</th>
          <th>最終更新</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>
              <strong>${esc(r.characterJaName || r.characterName)}</strong><br>
              ${esc(r.characterName)}
            </td>
            <td>
              ${esc(r.weapon)}<br>
              Lv${esc(r.weaponLevel)} / R${esc(r.refinement)}
            </td>
            <td>
              ${esc([
                r.artifactScoreFlower,
                r.artifactScorePlume,
                r.artifactScoreSands,
                r.artifactScoreGoblet,
                r.artifactScoreCirclet
              ].filter(Boolean).join('／'))}
            </td>
            <td>
              元素：${esc(r.elementType)}<br>
              防御${esc(r.def)}／率${esc(r.critRate)}／ダメ${esc(r.critDmg)}／元チャ${esc(r.er)}
            </td>
            <td>${esc(r.memo)}</td>
            <td>${esc(formatShortDate(r.updatedAt))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

document.getElementById('pingButton').addEventListener('click', async () => {
  const result = document.getElementById('apiResult');
  result.textContent = '接続中...';

  try {
    const data = await callPotalApi('ping');
    result.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    result.textContent = err.message;
  }
});

document.getElementById('loadGenshinButton').addEventListener('click', async () => {
  const result = document.getElementById('apiResult');
  const list = document.getElementById('genshinList');

  result.textContent = '原神データ取得中...';
  list.textContent = '取得中...';

  try {
    const data = await callPotalApi('getGenshinCurrent');

    result.textContent = JSON.stringify(data, null, 2);

    if (!data.ok) {
      list.textContent = data.error || '取得に失敗しました。';
      return;
    }

    renderGenshinRows(data.rows || []);
  } catch (err) {
    result.textContent = err.message;
    list.textContent = err.message;
  }
});



