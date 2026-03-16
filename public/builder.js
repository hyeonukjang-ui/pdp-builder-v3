/**
 * 빌더(편집) 모듈
 *
 * 기능:
 *   - 블록 on/off 토글
 *   - 블록 순서 변경 (위/아래)
 *   - 인라인 텍스트 편집 (contenteditable)
 *   - 이미지 클릭 시 교체 모달
 */

// ─── 블록 한글명 ────────────────────────────────────────────

const BLOCK_LABELS = {
  hero: '히어로',
  trustBadges: '신뢰 배지',
  highlights: '핵심 매력',
  overview: '상품 소개',
  itinerary: '일정',
  imageGrid: '포토 갤러리',
  inclusions: '포함/불포함',
  optionTable: '옵션 선택',
  usageGuide: '이용 방법',
  faq: 'FAQ',
  recommendFor: '추천 대상',
  guideProfile: '가이드 프로필',
  comparison: '가격 비교',
  notice: '안내사항',
  meetingPoint: '만나는 장소',
  reviews: '후기',
  socialProof: '소셜 인증',
  relatedProducts: '관련 상품',
  cta: 'CTA',
  hotelInfo: '숙소 안내',
};

// ─── 상태 ───────────────────────────────────────────────────

let editMode = false;
let blockVisibility = {};
let blockOrder = [];
let editedBlocks = {};
let onRerenderCallback = null;
let imageModalCallback = null;

// ─── 초기화 ─────────────────────────────────────────────────

export function initBuilder({ onRerender }) {
  onRerenderCallback = onRerender;
  setupImageModal();
}

export function isEditMode() {
  return editMode;
}

export function getEditState() {
  return { editMode, blockVisibility, blockOrder, editedBlocks };
}

// ─── 편집 모드 토글 ─────────────────────────────────────────

export function toggleEditMode() {
  editMode = !editMode;
  const container = document.querySelector('.preview-container');
  if (container) {
    container.classList.toggle('edit-mode', editMode);
  }

  if (editMode) {
    injectBlockControls();
    enableInlineEditing();
    enableImageClickToReplace();
  } else {
    removeBlockControls();
    disableInlineEditing();
  }

  return editMode;
}

// ─── 블록 리스트 렌더링 (사이드바용) ────────────────────────

export function renderBlockList(renderedBlocks) {
  if (!blockOrder.length) {
    blockOrder = [...renderedBlocks];
  }

  // 모든 블록에 대해 visibility 기본값 설정
  for (const type of blockOrder) {
    if (blockVisibility[type] === undefined) {
      blockVisibility[type] = true;
    }
  }

  const html = blockOrder
    .map((type, index) => {
      const label = BLOCK_LABELS[type] || type;
      const isOn = blockVisibility[type] !== false;
      return `
        <li class="block-list__item" data-block-list-type="${type}">
          <button class="block-list__toggle ${isOn ? 'on' : ''}" data-toggle-block="${type}"></button>
          <span class="block-list__name">${label}</span>
          <div class="block-list__arrows">
            <button class="block-list__arrow" data-move-block="${type}" data-direction="up" ${index === 0 ? 'disabled' : ''}>&#9650;</button>
            <button class="block-list__arrow" data-move-block="${type}" data-direction="down" ${index === blockOrder.length - 1 ? 'disabled' : ''}>&#9660;</button>
          </div>
        </li>`;
    })
    .join('');

  return `<ul class="block-list">${html}</ul>`;
}

// ─── 블록 리스트 이벤트 바인딩 ──────────────────────────────

export function bindBlockListEvents(containerEl) {
  // 토글
  containerEl.querySelectorAll('[data-toggle-block]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.toggleBlock;
      blockVisibility[type] = !blockVisibility[type];
      btn.classList.toggle('on', blockVisibility[type]);
      applyBlockVisibility();
    });
  });

  // 순서 변경
  containerEl.querySelectorAll('[data-move-block]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.moveBlock;
      const direction = btn.dataset.direction;
      moveBlock(type, direction);
    });
  });
}

// ─── 블록 토글 적용 ─────────────────────────────────────────

function applyBlockVisibility() {
  document.querySelectorAll('[data-block-type]').forEach((el) => {
    const type = el.dataset.blockType;
    const visible = blockVisibility[type] !== false;
    el.classList.toggle('block--hidden', !visible);
    el.style.display = visible ? '' : 'none';
  });
}

// ─── 블록 순서 변경 ─────────────────────────────────────────

function moveBlock(type, direction) {
  const index = blockOrder.indexOf(type);
  if (index === -1) return;

  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= blockOrder.length) return;

  // 배열에서 위치 교환
  [blockOrder[index], blockOrder[newIndex]] = [blockOrder[newIndex], blockOrder[index]];

  // DOM에서도 순서 변경
  const container = document.querySelector('.pdp-container');
  if (!container) return;

  const blocks = [...container.querySelectorAll('[data-block-type]')];
  const blockEl = blocks.find((el) => el.dataset.blockType === type);
  const targetEl = blocks.find((el) => el.dataset.blockType === blockOrder[index]);

  if (blockEl && targetEl) {
    if (direction === 'up') {
      container.insertBefore(blockEl, targetEl);
    } else {
      container.insertBefore(targetEl, blockEl);
    }
  }

  // 사이드바 블록 리스트 갱신
  if (onRerenderCallback) {
    onRerenderCallback('blockListOnly');
  }
}

// ─── 블록 컨트롤 바 주입 ────────────────────────────────────

function injectBlockControls() {
  document.querySelectorAll('[data-block-type]').forEach((el) => {
    if (el.querySelector('.block-controls')) return;

    const type = el.dataset.blockType;
    const label = BLOCK_LABELS[type] || type;

    const controls = document.createElement('div');
    controls.className = 'block-controls';
    controls.innerHTML = `
      <span class="block-controls__label">${label}</span>
      <button class="block-controls__btn" data-ctrl-move="up" title="위로">&#9650;</button>
      <button class="block-controls__btn" data-ctrl-move="down" title="아래로">&#9660;</button>
      <button class="block-controls__btn block-controls__btn--danger" data-ctrl-hide title="숨기기">&#10005;</button>
    `;

    // 이벤트
    controls.querySelector('[data-ctrl-move="up"]').addEventListener('click', (e) => {
      e.stopPropagation();
      moveBlock(type, 'up');
    });
    controls.querySelector('[data-ctrl-move="down"]').addEventListener('click', (e) => {
      e.stopPropagation();
      moveBlock(type, 'down');
    });
    controls.querySelector('[data-ctrl-hide]').addEventListener('click', (e) => {
      e.stopPropagation();
      blockVisibility[type] = false;
      applyBlockVisibility();
      if (onRerenderCallback) onRerenderCallback('blockListOnly');
    });

    el.prepend(controls);
  });
}

function removeBlockControls() {
  document.querySelectorAll('.block-controls').forEach((el) => el.remove());
}

// ─── 인라인 텍스트 편집 ─────────────────────────────────────

function enableInlineEditing() {
  document.querySelectorAll('[data-editable]').forEach((el) => {
    el.contentEditable = 'true';
    el.addEventListener('blur', handleEditBlur);
    el.addEventListener('keydown', handleEditKeydown);
  });
}

function disableInlineEditing() {
  document.querySelectorAll('[data-editable]').forEach((el) => {
    el.contentEditable = 'false';
    el.removeEventListener('blur', handleEditBlur);
    el.removeEventListener('keydown', handleEditKeydown);
  });
}

function handleEditBlur(e) {
  const el = e.target;
  const field = el.dataset.editable;
  const blockEl = el.closest('[data-block-type]');
  if (!blockEl || !field) return;

  const blockType = blockEl.dataset.blockType;
  if (!editedBlocks[blockType]) editedBlocks[blockType] = {};
  editedBlocks[blockType][field] = el.textContent.trim();
}

function handleEditKeydown(e) {
  // Enter로 줄바꿈 방지 (단일 필드)
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    e.target.blur();
  }
}

// ─── 이미지 클릭 교체 ──────────────────────────────────────

function enableImageClickToReplace() {
  document.querySelectorAll('.edit-mode [data-block-type] img').forEach((img) => {
    img.addEventListener('click', handleImageClick);
  });
}

function handleImageClick(e) {
  if (!editMode) return;
  e.preventDefault();
  e.stopPropagation();

  const img = e.target;
  showImageModal(img);
}

// ─── 이미지 교체 모달 ──────────────────────────────────────

function setupImageModal() {
  // 모달이 이미 있으면 스킵
  if (document.querySelector('.image-modal')) return;

  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <div class="image-modal__content">
      <h3 class="image-modal__title">이미지 교체</h3>
      <div class="image-modal__tabs">
        <button class="image-modal__tab active" data-tab="url">URL 입력</button>
        <button class="image-modal__tab" data-tab="upload">파일 업로드</button>
      </div>
      <div class="image-modal__panel active" data-panel="url">
        <input class="input-field" id="imageUrlInput" type="url" placeholder="https://example.com/image.jpg" />
      </div>
      <div class="image-modal__panel" data-panel="upload">
        <input type="file" id="imageFileInput" accept="image/*" />
      </div>
      <div class="image-modal__actions">
        <button class="btn btn--ghost" id="imageModalCancel">취소</button>
        <button class="btn btn--primary" id="imageModalConfirm">교체</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // 탭 전환
  modal.querySelectorAll('.image-modal__tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      modal.querySelectorAll('.image-modal__tab').forEach((t) => t.classList.remove('active'));
      modal.querySelectorAll('.image-modal__panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      modal.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
    });
  });

  // 취소
  modal.querySelector('#imageModalCancel').addEventListener('click', () => {
    modal.classList.remove('active');
    imageModalCallback = null;
  });

  // 배경 클릭 닫기
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      imageModalCallback = null;
    }
  });

  // 확인
  modal.querySelector('#imageModalConfirm').addEventListener('click', () => {
    const activePanel = modal.querySelector('.image-modal__panel.active');
    const tabType = activePanel.dataset.panel;

    if (tabType === 'url') {
      const url = modal.querySelector('#imageUrlInput').value.trim();
      if (url && imageModalCallback) {
        imageModalCallback(url);
      }
    } else if (tabType === 'upload') {
      const file = modal.querySelector('#imageFileInput').files[0];
      if (file && imageModalCallback) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          imageModalCallback(ev.target.result);
        };
        reader.readAsDataURL(file);
        return; // async — 모달은 reader.onload에서 닫힘
      }
    }

    modal.classList.remove('active');
    imageModalCallback = null;
  });
}

function showImageModal(imgElement) {
  const modal = document.querySelector('.image-modal');
  if (!modal) return;

  // 입력 초기화
  modal.querySelector('#imageUrlInput').value = '';
  modal.querySelector('#imageFileInput').value = '';

  imageModalCallback = (newUrl) => {
    imgElement.src = newUrl;

    // editedBlocks에도 반영
    const blockEl = imgElement.closest('[data-block-type]');
    if (blockEl) {
      const blockType = blockEl.dataset.blockType;
      if (!editedBlocks[blockType]) editedBlocks[blockType] = {};
      if (!editedBlocks[blockType]._images) editedBlocks[blockType]._images = [];
      editedBlocks[blockType]._images.push({ originalSrc: imgElement.dataset.originalSrc || '', newSrc: newUrl });
    }

    modal.classList.remove('active');
  };

  // 원본 src 저장
  if (!imgElement.dataset.originalSrc) {
    imgElement.dataset.originalSrc = imgElement.src;
  }

  modal.classList.add('active');
}

// ─── 편집 상태를 productData에 병합 ─────────────────────────

export function applyEditsToProductData(productData) {
  if (!productData?.blocks) return productData;

  const merged = JSON.parse(JSON.stringify(productData));

  for (const [blockType, edits] of Object.entries(editedBlocks)) {
    if (!merged.blocks[blockType]) continue;

    for (const [field, value] of Object.entries(edits)) {
      if (field === '_images') continue; // 이미지는 별도 처리
      setByPath(merged.blocks[blockType], field, value);
    }
  }

  // 블록 순서 반영
  if (blockOrder.length) {
    merged._blockOrder = [...blockOrder];
  }

  // 블록 가시성 반영
  merged._blockVisibility = { ...blockVisibility };

  return merged;
}

// ─── dotpath 유틸리티 ───────────────────────────────────────

function setByPath(obj, path, value) {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = isNaN(parts[i]) ? parts[i] : parseInt(parts[i]);
    if (current[key] === undefined) return;
    current = current[key];
  }

  const lastKey = isNaN(parts[parts.length - 1])
    ? parts[parts.length - 1]
    : parseInt(parts[parts.length - 1]);
  current[lastKey] = value;
}

// ─── 상태 리셋 ─────────────────────────────────────────────

export function resetBuilderState() {
  editMode = false;
  blockVisibility = {};
  blockOrder = [];
  editedBlocks = {};

  const container = document.querySelector('.preview-container');
  if (container) container.classList.remove('edit-mode');
}
