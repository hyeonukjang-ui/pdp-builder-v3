import { loadAllBlocks } from './lib/block-loader.js';
import { renderIntro, mountIntroPage } from '/engine/intro-engine.js';
import { getRegisteredBlocks, getBlock } from '/engine/block-registry.js';
import { getIntroRecipe, getIntroCategories } from '/recipes/intro-recipes.js';
import { INTRO_TOKENS } from '/intro-blocks/tokens.js';

// intro 블록 렌더러 등록
import '/intro-blocks/index.js';

// ─── Intro 블록 한글명 ──────────────────────────────────────
const INTRO_BLOCK_LABELS = {
  'intro-hook': '히어로',
  'intro-text': '텍스트',
  'intro-image': '이미지',
  'intro-highlights': '상품 카테고리 아이콘',
  'intro-experience': '여행 하이라이트',
  'intro-spot': '스팟/장소',
  'intro-cta': 'CTA',
  'intro-provider': '제공자 소개',
  'intro-safety': '안전/장비',
  'intro-accommodation': '숙소',
  'intro-howto': '이용 방법',
  'intro-comparison': '가격 비교',
  'intro-schedule': '일정',
  'intro-stat': '핵심 수치',
  'intro-divider': '구분선',
  'intro-program': '프로그램 상세',
  'intro-card-grid': '카드 그리드',
};

// ─── 상태 ────────────────────────────────────────────────────
const state = {
  rawData: null,
  introData: null,
  category: null,
  editMode: false,
  customRecipes: {},
};

const $ = (sel) => document.querySelector(sel);
const previewContainer = $('#previewContainer');
const statusEl = $('#status');

// ─── 초기화 ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllBlocks();
  console.log('[app] 등록된 블록:', getRegisteredBlocks());
  bindEvents();
});

function bindEvents() {
  // 뷰 토글
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const width = btn.dataset.width;
      previewContainer.style.width = width === '100%' ? '100%' : width + 'px';
    });
  });

  $('#btnExtract').addEventListener('click', handleExtract);
  $('#btnGenerateIntro').addEventListener('click', handleGenerateIntro);
  $('#btnEditMode').addEventListener('click', handleToggleEditMode);
  $('#btnLoadSnapshot').addEventListener('change', (e) => {
    if (e.target.files[0]) handleLoadSnapshot(e.target.files[0]);
    e.target.value = '';
  });
  $('#btnTemplateViewer').addEventListener('click', handleOpenTemplateViewer);

  // 저장 드롭다운
  const saveBtn = $('#btnSave');
  const saveMenu = $('#saveMenu');
  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    saveMenu.classList.toggle('open');
  });
  document.addEventListener('click', () => saveMenu.classList.remove('open'));
  saveMenu.addEventListener('click', (e) => {
    const item = e.target.closest('[data-action]');
    if (!item) return;
    saveMenu.classList.remove('open');
    const action = item.dataset.action;
    if (action === 'jpg-full') handleExportJpgFull();
    else if (action === 'jpg-split') handleExportJpgSplit();
    else if (action === 'json') handleSaveSnapshot();
    else if (action === 'html') handleExportHtml();
  });
}

// ─── 데이터 추출 ─────────────────────────────────────────────
async function handleExtract() {
  const url = $('#productUrl').value.trim();
  if (!url) return setStatus('URL을 입력하세요.', 'error');

  setStatus('<span class="spinner"></span>데이터 추출 중...', 'loading');
  $('#btnExtract').disabled = true;

  try {
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || '추출 실패');

    state.rawData = data.rawData;
    state.category = data.suggestedCategory;

    $('#categorySection').style.display = 'block';
    if (data.suggestedCategory) {
      $('#categoryOverride').value = data.suggestedCategory;
    }
    $('#btnGenerateIntro').style.display = 'block';

    setStatus(`✓ 추출 완료 (${data.extractMethod}). 카테고리: ${data.suggestedCategory}`, 'success');
    if (data.warnings?.length) {
      setStatus(statusEl.innerHTML + '<br>' + data.warnings.join('<br>'), 'success');
    }
  } catch (err) {
    setStatus(`✕ ${err.message}`, 'error');
  } finally {
    $('#btnExtract').disabled = false;
  }
}

// ─── 이미지 자동 배정 ────────────────────────────────────────
const IMAGE_BLOCK_PRIORITY = [
  'intro-hook',
  'intro-image',
  'intro-experience',
  'intro-spot',
  'intro-cta',
];

function assignImagesToIntroBlocks(introBlocks, images) {
  if (!images?.length || !introBlocks?.length) return;
  let imageIndex = 0;
  for (const targetType of IMAGE_BLOCK_PRIORITY) {
    if (imageIndex >= images.length) break;
    for (let i = 0; i < introBlocks.length; i++) {
      if (imageIndex >= images.length) break;
      if (introBlocks[i].blockType !== targetType) continue;
      if (introBlocks[i].data.image?.url) continue;
      introBlocks[i].data.image = {
        url: images[imageIndex].url,
        alt: images[imageIndex].alt || '',
      };
      imageIndex++;
    }
  }
}

// ─── 상품소개 생성 ───────────────────────────────────────────
async function handleGenerateIntro() {
  if (!state.rawData) return setStatus('먼저 URL에서 데이터를 추출하세요.', 'error');

  const category = $('#categoryOverride').value || state.category;
  if (!category) return setStatus('카테고리를 선택하세요.', 'error');

  // 편집 모드 해제
  if (state.editMode) toggleIntroEditMode(false);

  setStatus('<span class="spinner"></span>상품소개 생성 중... (15~30초 소요)', 'loading');
  $('#btnGenerateIntro').disabled = true;

  try {
    const customRecipe = state.customRecipes[category];
    const body = { rawData: state.rawData, category };
    if (customRecipe) body.recipe = customRecipe;

    const res = await fetch('/api/generate-intro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || '상품소개 생성 실패');

    state.introData = data.introData;

    // 포토갤러리 이미지 자동 배정
    const galleryImages = state.rawData?.images || [];
    if (galleryImages.length && state.introData?.introBlocks) {
      assignImagesToIntroBlocks(state.introData.introBlocks, galleryImages);
    }

    renderIntroPreview(state.introData);
    showIntroMeta(data);
    showIntroBlockPanel();
    setStatus(`✓ 상품소개 생성 완료 (${state.introData?.introBlocks?.length || 0}개 블록)`, 'success');
  } catch (err) {
    setStatus(`✕ ${err.message}`, 'error');
  } finally {
    $('#btnGenerateIntro').disabled = false;
  }
}

// ─── 프리뷰 렌더링 ──────────────────────────────────────────
function renderIntroPreview(introData) {
  const result = renderIntro(introData);
  previewContainer.innerHTML = result.html;

  requestAnimationFrame(() => {
    mountIntroPage();
    bindIntroImageClickEvents();
    bindModuleItemControls();
    // 편집 모드면 다시 활성화
    if (state.editMode) enableIntroEditing();
  });

  if (result.warnings?.length) {
    console.warn('[app] 상품소개 렌더링 경고:', result.warnings);
  }
}

function showIntroMeta(data) {
  const meta = $('#renderMeta');
  meta.style.display = 'block';

  const blockCount = state.introData?.introBlocks?.length || 0;
  let html = `<div class="meta-item">블록 수: <span class="meta-value">${blockCount}개</span></div>`;
  html += `<div class="meta-item">카테고리: <span class="meta-value">${data.category || state.category}</span></div>`;

  if (data.usage) {
    html += `<div class="meta-item">모델: <span class="meta-value">${data.usage.model}</span></div>`;
    html += `<div class="meta-item">토큰: <span class="meta-value">${data.usage.inputTokens} → ${data.usage.outputTokens}</span></div>`;
    html += `<div class="meta-item">비용: <span class="meta-value">~$${data.usage.estimatedCost}</span></div>`;
  }

  $('#metaContent').innerHTML = html;
}

// ─── 블록 순서 변경 (드래그앤드롭) ──────────────────────────
function showIntroBlockPanel() {
  if (!state.introData?.introBlocks?.length) return;

  let panel = $('#introBlockPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'introBlockPanel';
    panel.className = 'sidebar__section';
    const meta = $('#renderMeta');
    meta.parentNode.insertBefore(panel, meta.nextSibling);
  }

  const blocks = state.introData.introBlocks;
  const listHtml = blocks
    .map((item, index) => {
      const label = INTRO_BLOCK_LABELS[item.blockType] || item.blockType;
      return `
        <li class="block-list__item" draggable="true" data-intro-index="${index}">
          <span class="block-list__handle">&#10303;</span>
          <span class="block-list__name">${label}</span>
        </li>`;
    })
    .join('');

  panel.style.display = 'block';
  panel.innerHTML = `<h3 style="font-size:14px;font-weight:600;margin-bottom:8px;">블록 순서</h3><ul class="block-list">${listHtml}</ul>`;

  // 드래그앤드롭 이벤트
  let dragSrcIndex = null;

  panel.querySelectorAll('.block-list__item').forEach((li) => {
    li.addEventListener('dragstart', (e) => {
      dragSrcIndex = parseInt(li.dataset.introIndex, 10);
      li.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', li.dataset.introIndex);
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    li.addEventListener('dragenter', (e) => {
      e.preventDefault();
      li.classList.add('drag-over');
    });

    li.addEventListener('dragleave', () => {
      li.classList.remove('drag-over');
    });

    li.addEventListener('drop', (e) => {
      e.preventDefault();
      li.classList.remove('drag-over');
      const targetIndex = parseInt(li.dataset.introIndex, 10);
      if (dragSrcIndex !== null && dragSrcIndex !== targetIndex) {
        reorderIntroBlock(dragSrcIndex, targetIndex);
      }
    });

    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      panel.querySelectorAll('.block-list__item').forEach((el) => el.classList.remove('drag-over'));
    });
  });
}

function reorderIntroBlock(fromIndex, toIndex) {
  const blocks = state.introData?.introBlocks;
  if (!blocks) return;
  if (fromIndex < 0 || fromIndex >= blocks.length) return;
  if (toIndex < 0 || toIndex >= blocks.length) return;

  const [moved] = blocks.splice(fromIndex, 1);
  blocks.splice(toIndex, 0, moved);

  // DOM 이동
  const page = previewContainer.querySelector('.intro-page');
  if (page) {
    const sections = [...page.querySelectorAll('.intro-section')];
    const el = sections[fromIndex];
    if (el) {
      const currentSections = [...page.querySelectorAll('.intro-section')];
      if (toIndex >= currentSections.length) {
        page.appendChild(el);
      } else {
        page.insertBefore(el, currentSections[toIndex]);
      }
    }
  }

  showIntroBlockPanel();
}

// ─── 모듈 아이템 추가/삭제 ──────────────────────────────────
const ITEM_MANAGED_BLOCKS = ['intro-program', 'intro-card-grid'];

function bindModuleItemControls() {
  const page = previewContainer.querySelector('.intro-page');
  if (!page) return;

  page.querySelectorAll('.intro-section').forEach((section) => {
    const blockIndex = parseInt(section.dataset.blockIndex, 10);
    const block = state.introData?.introBlocks?.[blockIndex];
    if (!block || !ITEM_MANAGED_BLOCKS.includes(block.blockType)) return;

    const isProgram = block.blockType === 'intro-program';
    const itemSel = isProgram ? '.mod-program__item' : '.mod-card-grid__card';
    const containerSel = isProgram ? '.mod-program' : '.mod-card-grid';

    // 각 아이템에 삭제 버튼
    section.querySelectorAll(itemSel).forEach((itemEl) => {
      if (itemEl.querySelector('.module-item-delete')) return;
      const btn = document.createElement('button');
      btn.className = 'module-item-delete';
      btn.innerHTML = '×';
      btn.title = '항목 삭제';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(itemEl.dataset.itemIndex, 10);
        handleDeleteModuleItem(blockIndex, idx);
      });
      itemEl.appendChild(btn);
    });

    // 추가 버튼
    const container = section.querySelector(containerSel);
    if (container && !container.querySelector('.module-item-add')) {
      const addBtn = document.createElement('button');
      addBtn.className = 'module-item-add';
      addBtn.textContent = '+ 항목 추가';
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleAddModuleItem(blockIndex, block.blockType);
      });
      container.appendChild(addBtn);
    }
  });
}

function handleDeleteModuleItem(blockIndex, itemIndex) {
  const block = state.introData?.introBlocks?.[blockIndex];
  if (!block?.data?.items) return;
  if (block.data.items.length <= 1) return; // 최소 1개 유지
  block.data.items.splice(itemIndex, 1);
  renderIntroPreview(state.introData);
  showIntroBlockPanel();
}

function handleAddModuleItem(blockIndex, blockType) {
  const block = state.introData?.introBlocks?.[blockIndex];
  if (!block?.data?.items) return;

  if (blockType === 'intro-program') {
    block.data.items.push({
      label: '',
      title: '새 프로그램',
      duration: '',
      description: '설명을 입력해주세요',
      images: [],
    });
  } else if (blockType === 'intro-card-grid') {
    block.data.items.push({
      title: '새 카드',
      subtitle: '',
      tag: '',
      image: {},
    });
  }

  renderIntroPreview(state.introData);
  showIntroBlockPanel();
}

// ─── 편집 모드 ───────────────────────────────────────────────
function handleToggleEditMode() {
  // 프리뷰에 콘텐츠가 없으면 편집 불가
  if (!previewContainer.innerHTML || previewContainer.querySelector('.preview-empty')) {
    return setStatus('먼저 상품소개를 생성하세요.', 'error');
  }

  state.editMode = !state.editMode;
  const btn = $('#btnEditMode');
  btn.textContent = state.editMode ? '편집 종료' : '편집 모드';
  btn.classList.toggle('active', state.editMode);

  if (state.editMode) {
    enableIntroEditing();
    setStatus('편집 모드 — 텍스트 클릭하여 수정, 이미지 클릭하여 교체', 'success');
  } else {
    disableIntroEditing();
    setStatus('편집 모드 종료', 'success');
  }
}

function enableIntroEditing() {
  previewContainer.classList.add('edit-mode');

  previewContainer.querySelectorAll('[data-editable]').forEach((el) => {
    el.contentEditable = 'true';
    el.addEventListener('blur', handleIntroEditBlur);
    el.addEventListener('keydown', handleIntroEditKeydown);
  });

  bindSectionEditControls();
}

function disableIntroEditing() {
  previewContainer.classList.remove('edit-mode');

  previewContainer.querySelectorAll('[data-editable]').forEach((el) => {
    el.contentEditable = 'false';
    el.removeEventListener('blur', handleIntroEditBlur);
    el.removeEventListener('keydown', handleIntroEditKeydown);
  });

  // 편집 컨트롤 제거
  previewContainer.querySelectorAll('.section-delete-btn').forEach(el => el.remove());
  document.querySelectorAll('.module-add-fab').forEach(el => el.remove());
}

function handleIntroEditBlur(e) {
  const el = e.target;
  const field = el.dataset.editable;
  const section = el.closest('.intro-section');
  if (!section || !field) return;

  const blockIndex = parseInt(section.dataset.blockIndex, 10);
  if (isNaN(blockIndex)) return;

  const block = state.introData?.introBlocks?.[blockIndex];
  if (!block) return;

  // data 객체에 필드 반영
  block.data[field] = el.textContent.trim();
}

function handleIntroEditKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    e.target.blur();
  }
}

// ─── 섹션(블록) 삭제/추가 ──────────────────────────────────
function bindSectionEditControls() {
  const page = previewContainer.querySelector('.intro-page');
  if (!page) return;

  // 각 섹션에 삭제 버튼
  page.querySelectorAll('.intro-section').forEach((section) => {
    if (section.querySelector('.section-delete-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'section-delete-btn';
    btn.innerHTML = '×';
    btn.title = '이 섹션 삭제';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(section.dataset.blockIndex, 10);
      if (isNaN(idx)) return;
      handleDeleteSection(idx);
    });
    section.style.position = 'relative';
    section.appendChild(btn);
  });

  // 우측 하단 플로팅 FAB
  const frame = document.querySelector('#previewFrame');
  if (frame && !frame.querySelector('.module-add-fab')) {
    const fab = document.createElement('div');
    fab.className = 'module-add-fab';
    fab.innerHTML = `
      <div class="module-add-fab__menu" style="display:none;"></div>
      <button class="module-add-fab__btn" title="모듈 추가">+</button>`;
    frame.appendChild(fab);

    const menuBtn = fab.querySelector('.module-add-fab__btn');
    const menu = fab.querySelector('.module-add-fab__menu');

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.style.display !== 'none';
      if (isOpen) { menu.style.display = 'none'; return; }

      const moduleTypes = Object.keys(MODULE_SAMPLES);
      menu.innerHTML = moduleTypes.map(mod =>
        `<button class="module-add-fab__item" data-mod="${mod}">${INTRO_BLOCK_LABELS[mod] || mod}</button>`
      ).join('');
      menu.style.display = 'flex';

      menu.querySelectorAll('.module-add-fab__item').forEach(item => {
        item.addEventListener('click', (ev) => {
          ev.stopPropagation();
          handleAddSection(item.dataset.mod);
          menu.style.display = 'none';
        });
      });
    });

    document.addEventListener('click', () => { menu.style.display = 'none'; });
  }
}

function handleDeleteSection(blockIndex) {
  const blocks = state.introData?.introBlocks;
  if (!blocks || blocks.length <= 1) return;
  blocks.splice(blockIndex, 1);
  renderIntroPreview(state.introData);
  showIntroBlockPanel();
}

function handleAddSection(blockType) {
  if (!state.introData?.introBlocks) return;
  const sampleData = JSON.parse(JSON.stringify(MODULE_SAMPLES[blockType] || {}));
  state.introData.introBlocks.push({ blockType, data: sampleData });
  renderIntroPreview(state.introData);
  showIntroBlockPanel();
}

// ─── 이미지 교체 ─────────────────────────────────────────────
function bindIntroImageClickEvents() {
  const page = previewContainer.querySelector('.intro-page');
  if (!page) return;

  page.querySelectorAll('.intro-section img').forEach((img) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const section = img.closest('.intro-section');
      const blockIndex = parseInt(section?.dataset.blockIndex, 10);
      if (isNaN(blockIndex)) return;
      openIntroImageModal(blockIndex, img);
    });
  });

  page.querySelectorAll('.intro-section .mod-hero__placeholder, .intro-section .mod-full-image__placeholder, .intro-section .mod-program__placeholder, .intro-section .mod-card-grid__placeholder, .intro-section .mod-media-card__placeholder, .intro-section .mod-highlight__placeholder, .intro-section .mod-hotel__placeholder').forEach((ph) => {
    ph.style.cursor = 'pointer';
    ph.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const section = ph.closest('.intro-section');
      const blockIndex = parseInt(section?.dataset.blockIndex, 10);
      if (isNaN(blockIndex)) return;
      openIntroImageModal(blockIndex, null, ph);
    });
  });
}

function openIntroImageModal(blockIndex, imgElement, placeholderElement) {
  let modal = document.querySelector('.intro-image-modal');
  if (!modal) {
    modal = createIntroImageModal();
  }

  modal.querySelector('#introImageUrlInput').value = '';
  const fileInput = modal.querySelector('#introImageFileInput');
  if (fileInput) fileInput.value = '';

  const confirmBtn = modal.querySelector('#introImageModalConfirm');
  const newBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

  newBtn.addEventListener('click', () => {
    const activePanel = modal.querySelector('.image-modal__panel.active');
    const tabType = activePanel.dataset.panel;

    if (tabType === 'url') {
      const url = modal.querySelector('#introImageUrlInput').value.trim();
      if (url) {
        applyIntroImage(blockIndex, url, imgElement, placeholderElement);
        modal.classList.remove('active');
      }
    } else if (tabType === 'upload') {
      const file = modal.querySelector('#introImageFileInput').files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          applyIntroImage(blockIndex, ev.target.result, imgElement, placeholderElement);
          modal.classList.remove('active');
        };
        reader.readAsDataURL(file);
      }
    }
  });

  modal.classList.add('active');
}

function createIntroImageModal() {
  const modal = document.createElement('div');
  modal.className = 'intro-image-modal image-modal';
  modal.innerHTML = `
    <div class="image-modal__content">
      <h3 class="image-modal__title">이미지 교체</h3>
      <div class="image-modal__tabs">
        <button class="image-modal__tab active" data-tab="url">URL 입력</button>
        <button class="image-modal__tab" data-tab="upload">파일 업로드</button>
      </div>
      <div class="image-modal__panel active" data-panel="url">
        <input class="input-field" id="introImageUrlInput" type="url" placeholder="https://example.com/image.jpg" />
      </div>
      <div class="image-modal__panel" data-panel="upload">
        <input type="file" id="introImageFileInput" accept="image/*" />
      </div>
      <div class="image-modal__actions">
        <button class="btn btn--ghost" id="introImageModalCancel">취소</button>
        <button class="btn btn--primary" id="introImageModalConfirm">교체</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll('.image-modal__tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      modal.querySelectorAll('.image-modal__tab').forEach((t) => t.classList.remove('active'));
      modal.querySelectorAll('.image-modal__panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      modal.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
    });
  });

  modal.querySelector('#introImageModalCancel').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  return modal;
}

function applyIntroImage(blockIndex, newUrl, imgElement, placeholderElement) {
  const block = state.introData?.introBlocks?.[blockIndex];
  if (block) {
    block.data.image = {
      url: newUrl,
      alt: block.data.image?.alt || block.data.title || block.data.name || '',
    };
  }

  if (imgElement) {
    imgElement.src = newUrl;
  } else if (placeholderElement) {
    const img = document.createElement('img');
    img.src = newUrl;
    img.alt = block?.data.image?.alt || '';
    img.loading = 'lazy';

    if (placeholderElement.classList.contains('mod-hero__placeholder')) {
      img.className = 'mod-hero__img';
    } else if (placeholderElement.classList.contains('mod-full-image__placeholder')) {
      img.className = 'mod-full-image__img';
    }

    placeholderElement.parentNode.replaceChild(img, placeholderElement);

    img.style.cursor = 'pointer';
    img.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openIntroImageModal(blockIndex, img, null);
    });
  }
}

// ─── 이미지 프록시 변환 (html2canvas CORS 우회) ──────────────
async function convertImagesToDataUrls(container) {
  const imgs = container.querySelectorAll('img');
  const tasks = [];

  for (const img of imgs) {
    const src = img.src;
    if (!src || src.startsWith('data:')) continue;
    // 로컬 이미지는 스킵
    if (src.startsWith(location.origin)) continue;

    tasks.push(
      fetch(`/api/proxy-image?url=${encodeURIComponent(src)}`)
        .then(res => {
          if (!res.ok) throw new Error('proxy failed');
          return res.blob();
        })
        .then(blob => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => { img.src = reader.result; resolve(); };
          reader.readAsDataURL(blob);
        }))
        .catch(() => { /* 실패 시 원본 유지 */ })
    );
  }

  if (tasks.length > 0) await Promise.all(tasks);
}

// ─── JPG 내보내기 ────────────────────────────────────────────
async function handleExportJpgFull() {
  const page = previewContainer.querySelector('.intro-page');
  if (!page) return setStatus('내보낼 콘텐츠가 없습니다.', 'error');

  setStatus('<span class="spinner"></span>이미지 준비 중...', 'loading');
  try {
    await convertImagesToDataUrls(page);
    setStatus('<span class="spinner"></span>JPG 생성 중...', 'loading');
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: page.scrollWidth,
      height: page.scrollHeight,
    });
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `intro-${state.category || 'export'}-full-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('✓ JPG 전체 페이지 다운로드 완료', 'success');
    }, 'image/jpeg', 0.92);
  } catch (err) {
    setStatus(`✕ JPG 생성 실패: ${err.message}`, 'error');
  }
}

async function handleExportJpgSplit() {
  const page = previewContainer.querySelector('.intro-page');
  if (!page) return setStatus('내보낼 콘텐츠가 없습니다.', 'error');

  const sections = page.querySelectorAll('.intro-section');
  if (!sections.length) return setStatus('섹션이 없습니다.', 'error');

  setStatus('<span class="spinner"></span>이미지 준비 중...', 'loading');
  try {
    await convertImagesToDataUrls(page);
    setStatus(`<span class="spinner"></span>JPG 분할 생성 중... (${sections.length}개 섹션)`, 'loading');
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const blockType = section.dataset.blockType || `section-${i}`;
      const label = INTRO_BLOCK_LABELS[blockType] || blockType;

      const canvas = await html2canvas(section, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: section.scrollWidth,
        height: section.scrollHeight,
      });

      await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `intro-${state.category || 'export'}-${String(i + 1).padStart(2, '0')}-${blockType}-${Date.now()}.jpg`;
          a.click();
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/jpeg', 0.92);
      });
    }
    setStatus(`✓ ${sections.length}개 섹션 JPG 다운로드 완료`, 'success');
  } catch (err) {
    setStatus(`✕ JPG 분할 생성 실패: ${err.message}`, 'error');
  }
}

// ─── HTML 내보내기 ───────────────────────────────────────────
function handleExportHtml() {
  if (!previewContainer.innerHTML || previewContainer.querySelector('.preview-empty')) {
    return setStatus('내보낼 콘텐츠가 없습니다.', 'error');
  }

  const cleanHtml = getCleanPreviewHtml();

  const introStyles = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .filter(l => l.href.includes('intro'))
    .map(l => {
      try { return [...l.sheet.cssRules].map(r => r.cssText).join('\n'); }
      catch { return ''; }
    }).join('\n');

  const title = `상품소개 - ${state.category || 'Export'}`;
  const filename = `intro-${state.category || 'export'}-${Date.now()}.html`;

  const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css" rel="stylesheet">
<style>
body { font-family: 'Pretendard Variable', -apple-system, sans-serif; margin: 0; background: #F9FAFB; }
${introStyles}
</style>
</head>
<body>
<div style="max-width: 375px; margin: 0 auto; background: white; min-height: 100vh;">
${cleanHtml}
</div>
</body>
</html>`;

  downloadBlob(fullHtml, filename, 'text/html');
  setStatus('✓ 상품소개 HTML 다운로드 완료', 'success');
}

function getCleanPreviewHtml() {
  const clone = previewContainer.cloneNode(true);
  clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
  return clone.innerHTML;
}

// ─── 스냅샷 저장/불러오기 ────────────────────────────────────
function handleSaveSnapshot() {
  if (!state.introData) return setStatus('저장할 데이터가 없습니다.', 'error');

  const snapshot = {
    version: '2.0',
    savedAt: new Date().toISOString(),
    introData: state.introData,
    rawData: state.rawData,
    category: state.category,
  };

  downloadBlob(JSON.stringify(snapshot, null, 2), `intro-snapshot-${Date.now()}.json`, 'application/json');
  setStatus('✓ 스냅샷 저장 완료', 'success');
}

function handleLoadSnapshot(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const snapshot = JSON.parse(e.target.result);
      if (!snapshot.introData) throw new Error('유효하지 않은 스냅샷');

      state.rawData = snapshot.rawData || null;
      state.introData = snapshot.introData;
      state.category = snapshot.category || snapshot.introData?.category;

      if (state.editMode) toggleIntroEditMode(false);

      renderIntroPreview(state.introData);
      showIntroMeta(snapshot);
      showIntroBlockPanel();

      $('#categorySection').style.display = 'block';
      if (state.category) {
        $('#categoryOverride').value = state.category;
      }
      if (state.rawData) {
        $('#btnGenerateIntro').style.display = 'block';
      }

      setStatus(`✓ 스냅샷 불러오기 완료 (${snapshot.savedAt || ''})`, 'success');
    } catch (err) {
      setStatus(`✕ 스냅샷 로딩 실패: ${err.message}`, 'error');
    }
  };
  reader.readAsText(file);
}

// ─── 템플릿 모듈 뷰어 ──────────────────────────────────────
const CATEGORY_LABELS = {
  TOUR: '가이드 투어',
  TICKET_THEME: '티켓 - 테마파크',
  TICKET_TRANSPORT: '티켓 - 교통',
  TICKET_CITYPASS: '티켓 - 시티패스',
  TICKET_EXPERIENCE: '티켓 - 체험',
  ACTIVITY: '액티비티',
  SERVICE: '서비스',
  SEMI_PACKAGE: '세미패키지',
};

// 모듈별 샘플 데이터 (프리뷰 렌더링용)
const MODULE_SAMPLES = {
  'intro-hook': {
    headline: '파리의 숨겨진 맛을 찾아서',
    subHeadline: '현지 셰프와 함께하는 프렌치 쿠킹 클래스',
  },
  'intro-text': {
    title: '이 상품의 특별함',
    body: [
      '파리 현지에서 직접 장을 보고, 프랑스 가정식을 배우는 특별한 경험입니다. 현지인만 아는 숨겨진 맛집 골목도 함께 걸어봅니다.',
      '소규모 그룹(최대 8명)으로 진행되어 셰프와 밀착 소통이 가능합니다.',
    ],
  },
  'intro-image': {
    caption: '마르쉐 산책로에서 바라본 파리 전경',
  },
  'intro-highlights': {
    title: '핵심 포인트',
    items: [
      { icon: '👨‍🍳', label: '현지 셰프', description: '미슐랭 경력 셰프가 직접 진행' },
      { icon: '🥖', label: '시장 투어', description: '현지 재래시장에서 직접 장보기' },
      { icon: '🍷', label: '와인 페어링', description: '요리에 맞는 와인 시음 포함' },
      { icon: '📜', label: '레시피 제공', description: '집에서도 재현 가능한 레시피' },
    ],
  },
  'intro-experience': {
    tag: '하이라이트',
    title: '잊지 못할 쿠킹 체험',
    description: '파리 현지 주방에서 셰프의 지도 아래 프랑스 가정식 3코스를 직접 만들어봅니다.',
  },
  'intro-spot': {
    name: '르 마레 지구',
    title: '파리에서 가장 트렌디한 동네',
    description: '고풍스러운 건축물과 세련된 부티크가 공존하는 르 마레 지구에서 시작합니다.',
  },
  'intro-cta': {
    headline: '특별한 파리를 만나보세요',
    buttonText: '지금 예약하기',
    subtext: '매주 화·목·토 진행',
  },
  'intro-provider': {
    name: 'Pierre Laurent',
    role: '쿠킹 클래스 셰프',
    career: '15년 경력',
    bio: '파리 르 꼬르동 블루 출신, 현지에서 15년간 프랑스 가정식을 연구해온 셰프입니다.',
    badges: ['르 꼬르동 블루', '프랑스 가정식 전문', '한국어 가능'],
  },
  'intro-safety': {
    title: '안전 & 장비 안내',
    items: ['앞치마', '조리 도구', '위생 장갑'],
    description: '모든 조리 도구와 앞치마가 제공됩니다. 별도 준비물은 없습니다.',
  },
  'intro-accommodation': {
    name: 'Hotel Le Marais',
    nameEn: 'Hotel Le Marais Paris',
    grade: '4성급',
    highlights: [
      { icon: '🌍', text: '파리 3구, 르 마레 지구 도보 3분' },
      { icon: '🍳', text: '조식 뷔페 포함' },
      { icon: '📶', text: '전 객실 무료 Wi-Fi' },
    ],
    meta: [
      { icon: '📍', text: '파리 3구' },
      { icon: '⏱', text: '지하철 2분' },
    ],
    images: [],
  },
  'intro-howto': {
    title: '이용 방법',
    steps: [
      { title: '예약 확정', description: '예약 후 24시간 내 확정 메일을 보내드립니다.' },
      { title: '미팅 포인트', description: '당일 오전 10시, 지정된 카페 앞에서 만남.' },
      { title: '시장 투어', description: '함께 시장을 둘러보며 신선한 재료를 구매합니다.' },
      { title: '쿠킹 시작', description: '셰프의 주방에서 3코스 요리를 만들어봅니다.' },
    ],
  },
  'intro-schedule': {
    title: '일정 미리보기',
    totalDuration: '2박 3일',
    days: [
      { day: 1, title: '파리 도착 & 시내 투어', time: '09:00 ~ 18:00', summary: '공항 픽업, 에펠탑, 개선문 방문', type: 'guided' },
      { day: 2, title: '쿠킹 클래스 & 자유시간', time: '10:00 ~ 17:00', summary: '오전 쿠킹 클래스, 오후 자유 관광', type: 'free' },
      { day: 3, title: '귀국', time: '09:00 ~ 12:00', summary: '호텔 체크아웃, 공항 이동', type: 'travel' },
    ],
  },
  'intro-comparison': {
    title: '가격 비교',
    items: [
      { name: '쿠킹 클래스 (개별)', price: '₩120,000', included: true },
      { name: '시장 투어', price: '₩45,000', included: true },
      { name: '와인 시음', price: '₩35,000', included: true },
      { name: '레시피 북', price: '₩15,000', included: true },
    ],
    totalPrice: '₩159,000',
    savings: '₩56,000 절약',
  },
  'intro-stat': {
    profile: {
      title: '가이드 소개',
      image: {},
      name: 'Pierre Laurent',
      bio: '파리 르 꼬르동 블루 출신, 15년 경력의 프렌치 쿠킹 전문 셰프',
    },
    items: [
      { value: '4.9', unit: '점', label: '평균 평점', highlight: true },
      { value: '2,847', unit: '명', label: '누적 참여자' },
      { value: '98', unit: '%', label: '재구매율' },
    ],
  },
  'intro-divider': { type: 'line' },
  'intro-program': {
    title: '프로그램 상세',
    items: [
      {
        label: '오전 프로그램',
        title: '시장 투어 & 장보기',
        duration: '1시간 30분',
        description: '현지 재래시장에서 신선한 재료를 직접 고르며 프랑스 식문화를 체험합니다.',
        images: [],
      },
      {
        label: '오후 프로그램',
        title: '프렌치 쿠킹 클래스',
        duration: '2시간',
        description: '셰프의 주방에서 전통 프랑스 가정식 3코스를 직접 만들어봅니다.',
        images: [],
      },
    ],
  },
  'intro-card-grid': {
    title: '주요 스팟',
    cards: [
      { tag: '필수 방문', title: '에펠탑', subtitle: '파리의 상징' },
      { tag: '추천', title: '루브르 박물관', subtitle: '세계 3대 박물관' },
      { tag: '숨은 명소', title: '몽마르뜨', subtitle: '예술가의 언덕' },
      { tag: '미식', title: '르 마레 지구', subtitle: '트렌디한 맛집 거리' },
    ],
  },
};

// 모듈 설명 텍스트
const MODULE_DESCRIPTIONS = {
  'intro-hook': '상품의 첫인상. 풀폭 이미지 위에 핵심 카피를 오버레이.',
  'intro-text': '제목 + 본문으로 구성된 텍스트 섹션. 배경색 선택 가능.',
  'intro-image': '풀폭 독립 이미지. 캡션 선택 가능.',
  'intro-highlights': '상품 카테고리를 아이콘 + 라벨 그리드로 표현. 2열/4열.',
  'intro-experience': '여행 하이라이트. 다크 배경 위 태그+제목+설명+이미지.',
  'intro-spot': '장소/스팟 소개. 이미지 오버레이 + 위치 배지.',
  'intro-cta': '마무리 CTA. 감성 이미지 배경에 예약 유도 카피.',
  'intro-provider': '가이드/제공자 프로필 카드. 이미지 + 소개 + 배지.',
  'intro-safety': '안전/장비 정보 카드. 이미지 + 배지 목록.',
  'intro-accommodation': '숙소 소개. 등급+이름+영문명+하이라이트+메타+1+4 이미지.',
  'intro-howto': '이용 방법 스텝. 번호 + 제목 + 설명 (연결선).',
  'intro-schedule': '일정 미리보기. Day별 타임라인 + 시간 + 타입 뱃지.',
  'intro-comparison': '가격 비교 테이블. 항목별 가격 + 총액 + 절약액.',
  'intro-stat': '핵심 수치 + 프로필. 가이드/파트너 소개와 수치 그리드.',
  'intro-divider': '섹션 구분선 또는 여백.',
  'intro-program': '프로그램 상세. 라벨 + 제목 + 설명 + 이미지 그리드.',
  'intro-card-grid': '2열 카드 그리드. 이미지 + 태그 + 제목.',
};

let _tvModal = null;
let _tvCurrentTab = 'full';
let _tvSelectedModule = 'intro-hook';

function handleOpenTemplateViewer() {
  if (!_tvModal) _tvModal = createTemplateViewerModal();
  _tvCurrentTab = 'full';
  renderTV();
  _tvModal.classList.add('active');
}

function createTemplateViewerModal() {
  const modal = document.createElement('div');
  modal.className = 'template-viewer';
  modal.innerHTML = `
    <div class="template-viewer__dialog">
      <div class="template-viewer__header">
        <div class="template-viewer__tabs">
          <button class="template-viewer__tab active" data-tv-tab="full">전체 템플릿</button>
          <button class="template-viewer__tab" data-tv-tab="module">모듈 템플릿</button>
        </div>
        <button class="template-viewer__close" id="tvClose">×</button>
      </div>
      <div class="template-viewer__body" id="tvBody"></div>
    </div>`;
  document.body.appendChild(modal);

  // 닫기
  modal.querySelector('#tvClose').addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  // 탭 전환
  modal.querySelectorAll('.template-viewer__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      modal.querySelectorAll('.template-viewer__tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      _tvCurrentTab = tab.dataset.tvTab;
      renderTV();
    });
  });

  return modal;
}

function renderTV() {
  if (_tvCurrentTab === 'full') renderFullTemplatesTab();
  else renderModuleTemplatesTab();
}

// ── Tab 1: 전체 템플릿 ──
function renderFullTemplatesTab() {
  const body = _tvModal.querySelector('#tvBody');
  const categories = getIntroCategories();

  const cards = categories.map(cat => {
    const recipe = state.customRecipes[cat] || getIntroRecipe(cat);
    const tokens = INTRO_TOKENS[cat] || INTRO_TOKENS.TOUR;
    const label = CATEGORY_LABELS[cat] || cat;
    const previewHtml = buildCategoryPreviewHtml(cat, recipe, tokens);

    return `<div class="tv-full-card" data-cat="${cat}">
      <div class="tv-full-card__preview">
        <div class="tv-scale-wrap" style="transform:scale(0.55);width:390px;">${previewHtml}</div>
      </div>
      <div class="tv-full-card__info">
        <div style="display:flex;align-items:center;">
          <span class="tv-full-card__accent" style="background:${tokens.accent};"></span>
          <span class="tv-full-card__name">${label}</span>
        </div>
        <span class="tv-full-card__count">${recipe.length}개 블록</span>
      </div>
    </div>`;
  }).join('');

  body.innerHTML = `<div class="tv-full-grid">${cards}</div>`;

  // 호버 시 프리뷰 영역 자동 스크롤
  body.querySelectorAll('.tv-full-card').forEach(card => {
    const previewEl = card.querySelector('.tv-full-card__preview');
    const scaleWrap = card.querySelector('.tv-scale-wrap');
    if (!previewEl || !scaleWrap) return;

    let scrollAnim = null;
    card.addEventListener('mouseenter', () => {
      const contentH = scaleWrap.scrollHeight * 0.55; // scaled height
      const viewH = previewEl.clientHeight;
      if (contentH <= viewH) return;
      const scrollDist = contentH - viewH;
      const duration = scrollDist * 8; // 8ms per px
      previewEl.style.transition = `none`;
      scaleWrap.style.transition = `transform ${duration}ms linear`;
      scaleWrap.style.transform = `scale(0.55) translateY(-${scaleWrap.scrollHeight - viewH / 0.55}px)`;
    });
    card.addEventListener('mouseleave', () => {
      scaleWrap.style.transition = 'transform 300ms ease-out';
      scaleWrap.style.transform = 'scale(0.55)';
    });
  });
}

function buildCategoryPreviewHtml(category, recipe, tokens) {
  const tokenStyle = `--intro-accent:${tokens.accent};--intro-gradient:${tokens.gradient};`;
  const sections = [];

  for (let i = 0; i < recipe.length; i++) {
    const item = recipe[i];
    const sampleData = MODULE_SAMPLES[item.block];
    if (!sampleData) continue;

    const renderer = getBlock(item.block);
    if (!renderer) continue;

    try {
      if (typeof renderer.validate === 'function' && !renderer.validate(sampleData)) continue;
      const html = renderer.render(sampleData, { category, index: i, total: recipe.length });
      if (html) {
        sections.push(`<section class="intro-section" data-block-type="${item.block}">${html}</section>`);
      }
    } catch (e) { /* skip */ }
  }

  return `<div class="intro-page" style="${tokenStyle}">${sections.join('')}</div>`;
}

// ── Tab 2: 모듈 템플릿 ──
function renderModuleTemplatesTab() {
  const body = _tvModal.querySelector('#tvBody');
  const allModules = Object.keys(MODULE_SAMPLES);
  const categories = getIntroCategories();

  // 모듈 셀렉터 (pill)
  const pills = allModules.map(mod => {
    const label = INTRO_BLOCK_LABELS[mod] || mod;
    const isActive = mod === _tvSelectedModule;
    return `<button class="tv-module-pill ${isActive ? 'active' : ''}" data-mod="${mod}">${label}</button>`;
  }).join('');

  // 모듈 프리뷰 렌더링
  const moduleHtml = buildSingleModulePreview(_tvSelectedModule);
  const moduleLabel = INTRO_BLOCK_LABELS[_tvSelectedModule] || _tvSelectedModule;
  const moduleDesc = MODULE_DESCRIPTIONS[_tvSelectedModule] || '';

  // 사용처 (어떤 카테고리에서 사용?)
  const usedInCats = categories.filter(cat => {
    const recipe = getIntroRecipe(cat);
    return recipe.some(r => r.block === _tvSelectedModule);
  });
  const usedInHtml = usedInCats.map(cat =>
    `<span class="tv-module-info__cat-tag">${CATEGORY_LABELS[cat] || cat}</span>`
  ).join('');

  body.innerHTML = `
    <div class="tv-module-selector">${pills}</div>
    <div class="tv-module-preview-area">
      <div class="tv-module-preview">
        <div class="tv-module-frame">${moduleHtml}</div>
      </div>
      <div class="tv-module-info">
        <div class="tv-module-info__title">${moduleLabel}</div>
        <div class="tv-module-info__desc">${moduleDesc}</div>
        <div class="tv-module-info__meta">
          <div class="tv-module-info__meta-item"><strong>블록 ID:</strong> ${_tvSelectedModule}</div>
          <div class="tv-module-info__meta-item"><strong>사용 카테고리:</strong></div>
          <div class="tv-module-info__used-in">${usedInHtml || '<span style="color:#D1D5DB;">사용되지 않음</span>'}</div>
        </div>
      </div>
    </div>`;

  // pill 이벤트
  body.querySelectorAll('.tv-module-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      _tvSelectedModule = pill.dataset.mod;
      renderModuleTemplatesTab();
    });
  });
}

function buildSingleModulePreview(blockType) {
  const data = MODULE_SAMPLES[blockType];
  if (!data) return '<div style="padding:40px;color:#9CA3AF;text-align:center;">프리뷰 없음</div>';

  const renderer = getBlock(blockType);
  if (!renderer) return '<div style="padding:40px;color:#9CA3AF;text-align:center;">렌더러 없음</div>';

  try {
    const html = renderer.render(data, { category: 'TOUR', index: 0, total: 1 });
    const tokens = INTRO_TOKENS.TOUR;
    return `<div class="intro-page" style="--intro-accent:${tokens.accent};--intro-gradient:${tokens.gradient};">
      <section class="intro-section">${html}</section>
    </div>`;
  } catch (e) {
    return `<div style="padding:40px;color:#EF4444;text-align:center;">렌더 오류: ${e.message}</div>`;
  }
}

// 레시피 커스텀 관리 (생성 시 사용)
function ensureCustomRecipe(category) {
  if (!state.customRecipes[category]) {
    state.customRecipes[category] = JSON.parse(JSON.stringify(getIntroRecipe(category)));
  }
  return state.customRecipes[category];
}

// ─── 유틸 ────────────────────────────────────────────────────
function toggleIntroEditMode(active) {
  state.editMode = active;
  const btn = $('#btnEditMode');
  btn.textContent = active ? '편집 종료' : '편집 모드';
  btn.classList.toggle('active', active);
  if (active) {
    enableIntroEditing();
  } else {
    disableIntroEditing();
  }
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function setStatus(html, type = '') {
  statusEl.innerHTML = html;
  statusEl.className = `sidebar__status ${type}`;
}
