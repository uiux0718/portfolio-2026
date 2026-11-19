const dialog = document.querySelector('#guestbook');
const trigger = document.querySelector('.menu a[href="#guestbook"]');
const closeButton = dialog.querySelector('[data-close-guestbook]');
const form = dialog.querySelector('#guestbook-form');
const entries = document.querySelector('#guestbook-entries');
const status = document.querySelector('#guestbook-status');
const more = document.querySelector('#guestbook-more');
const submit = form.querySelector('button');
let before = null;
let revision = 0;

async function loadEntries(append = false, success = '') {
  const currentRevision = ++revision;
  more.disabled = true;
  try {
    const query = append && before ? '?before=' + before : '';
    const response = await fetch('/api/guestbook' + query);
    if (!response.ok) throw new Error('방명록을 불러오지 못했습니다.');
    const data = await response.json();
    if (currentRevision !== revision) return;

    const items = data.entries.map(entry => {
      const item = document.createElement('li');
      const name = document.createElement('strong');
      name.textContent = entry.nickname;
      const message = document.createElement('p');
      message.textContent = entry.message;
      item.append(name, message);
      return item;
    });
    if (append) entries.append(...items);
    else entries.replaceChildren(...items);
    before = data.next;
    more.hidden = !before;
    status.textContent = success || (entries.children.length ? '' : '아직 남겨진 글이 없습니다.');
  } catch {
    if (currentRevision === revision) status.textContent = (success ? success + ' ' : '') + '방명록을 불러오지 못했습니다.';
  } finally {
    if (currentRevision === revision) more.disabled = false;
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submit.disabled) return;
  const nickname = form.elements.nickname.value.trim();
  const message = form.elements.message.value.trim();
  if (!nickname || !message || [...nickname].length > 10 || [...message].length > 200) {
    status.textContent = '닉네임은 10자, 글은 200자 이내로 입력해 주세요.';
    return;
  }

  submit.disabled = true;
  status.textContent = '글을 저장하고 있습니다.';
  try {
    const response = await fetch('/api/guestbook', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({nickname, message}),
    });
    if (!response.ok) {
      const data = await response.json();
      status.textContent = data.error || '글을 저장하지 못했습니다.';
      return;
    }
    form.reset();
    await loadEntries(false, '글을 남겼습니다.');
  } catch {
    status.textContent = '글을 저장하지 못했습니다.';
  } finally {
    submit.disabled = false;
  }
});

more.addEventListener('click', () => loadEntries(true));

function openGuestbook() {
  if (location.hostname === 'uiux0718.github.io') {
    location.assign('https://yeji-studio.myselfopenthedoor.chatgpt.site/#guestbook');
    return;
  }
  if (dialog.open) return;
  dialog.showModal();
  dialog.scrollTop = 0;
  if (!submit.disabled) {
    status.textContent = '방명록을 불러오고 있습니다.';
    loadEntries();
  }
}

trigger.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  openGuestbook();
});
closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  if (location.hash === '#guestbook') {
    history.replaceState(history.state, '', location.pathname + location.search);
  }
  trigger.focus({preventScroll: true});
});

function openFromHash() {
  if (location.hash === '#guestbook') openGuestbook();
}

window.addEventListener('hashchange', openFromHash);
openFromHash();
