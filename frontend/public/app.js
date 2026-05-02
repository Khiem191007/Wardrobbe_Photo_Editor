// public/app.js
// Lumen — frontend logic

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ---- State -------------------------------------------------------------
const state = {
  originalFile: null,
  originalUrl: null,
  currentBlob: null,
  objectAction: 'add',
  busy: false,
};

const dropzone   = $('#dropzone');
const fileInput  = $('#file-input');
const canvas     = $('#canvas');
const imageWrap  = $('#image-wrap');
const preview    = $('#preview');
const overlay    = $('#overlay');
const loaderText = $('#loader-text');
const toolbar    = $('#canvas-toolbar');
const controls   = $('#controls');
const errorEl    = $('#error');

$$('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    $$('.tab').forEach((t) => t.classList.remove('active'));
    $$('.panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    $(`.panel[data-panel="${tab.dataset.tab}"]`).classList.add('active');
    clearError();
  });
});

$$('.seg-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.seg-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.objectAction = btn.dataset.action;
    $('#object-label').textContent =
      state.objectAction === 'add' ? 'What should we add?' : 'What should we remove?';
    const ta = $('textarea[data-input="object"]');
    ta.placeholder = state.objectAction === 'add'
      ? 'e.g. a pair of black sunglasses'
      : 'e.g. the person in the background on the left';
  });
});

$$('.sugg').forEach((btn) => {
  btn.addEventListener('click', () => {
    const ta = $(`textarea[data-input="${btn.dataset.target}"]`);
    ta.value = btn.dataset.text;
    ta.focus();
  });
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) loadImage(file);
});

['dragenter', 'dragover'].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add('drag');
  })
);
['dragleave', 'drop'].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag');
  })
);
dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (file) loadImage(file);
});

function loadImage(file) {
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
    showError('Please choose a PNG, JPG, or WebP image.');
    return;
  }
  if (file.size > 12 * 1024 * 1024) {
    showError('That image is larger than 12 MB. Try a smaller one.');
    return;
  }
  clearError();

  if (state.originalUrl) URL.revokeObjectURL(state.originalUrl);

  state.originalFile = file;
  state.originalUrl  = URL.createObjectURL(file);
  state.currentBlob  = file;

  preview.src = state.originalUrl;
  canvas.dataset.state = 'image';
  dropzone.hidden = true;
  imageWrap.hidden = false;
  toolbar.hidden = false;
  controls.setAttribute('aria-disabled', 'false');
}

$('#reset-btn').addEventListener('click', () => {
  if (!state.originalUrl) return;
  preview.src = state.originalUrl;
  state.currentBlob = state.originalFile;
  clearError();
});

$('#new-btn').addEventListener('click', () => {
  fileInput.value = '';
  if (state.originalUrl) URL.revokeObjectURL(state.originalUrl);
  state.originalFile = null;
  state.originalUrl  = null;
  state.currentBlob  = null;
  preview.src = '';
  canvas.dataset.state = 'empty';
  dropzone.hidden = false;
  imageWrap.hidden = true;
  toolbar.hidden = true;
  controls.setAttribute('aria-disabled', 'true');
  clearError();
});

$('#download-btn').addEventListener('click', () => {
  if (!preview.src) return;
  const a = document.createElement('a');
  a.href = preview.src;
  a.download = `lumen-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
});

$$('.filter-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    runEdit('filter', { filter: chip.dataset.filter }, 'Applying filter…');
  });
});

$$('[data-run]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const op = btn.dataset.run;
    if (op === 'clothes') {
      const desc = $('textarea[data-input="clothes"]').value.trim();
      if (!desc) return showError('Describe the new outfit first.');
      runEdit('clothes', { description: desc }, 'Changing outfit…');
    } else if (op === 'background') {
      const desc = $('textarea[data-input="background"]').value.trim();
      if (!desc) return showError('Describe the new background first.');
      runEdit('background', { description: desc }, 'Replacing background…');
    } else if (op === 'object') {
      const desc = $('textarea[data-input="object"]').value.trim();
      if (!desc) return showError(`Describe what to ${state.objectAction}.`);
      const verb = state.objectAction === 'add' ? 'Adding' : 'Removing';
      runEdit('object', { description: desc, action: state.objectAction }, `${verb}…`);
    }
  });
});

async function runEdit(operation, params, loadingMessage) {
  if (!state.currentBlob) return showError('Upload a photo first.');
  if (state.busy) return;

  state.busy = true;
  setBusy(true, loadingMessage);
  clearError();

  try {
    const fd = new FormData();
    const blob = state.currentBlob;
    const filename = blob.name || 'image.png';
    fd.append('image', blob, filename);
    fd.append('operation', operation);
    fd.append('params', JSON.stringify(params));

    const res = await fetch('/api/edit', { method: 'POST', body: fd });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.error || `Request failed (${res.status})`);
    }

    preview.src = data.image;
    state.currentBlob = await dataUrlToBlob(data.image);
  } catch (err) {
    console.error(err);
    showError(err.message || 'Something went wrong. Try again.');
  } finally {
    state.busy = false;
    setBusy(false);
  }
}

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  // Give it a name so multer treats it as a file
  return new File([blob], 'edit.png', { type: blob.type });
}

function setBusy(busy, msg = 'Working…') {
  loaderText.textContent = msg;
  overlay.classList.toggle('active', busy);
  $$('.primary, .filter-chip, .sugg').forEach((b) => (b.disabled = busy));
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}
function clearError() {
  errorEl.hidden = true;
  errorEl.textContent = '';
}
