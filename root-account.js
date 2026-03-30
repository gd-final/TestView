'use strict';

const MAX_SLOTS = 5;

/* ── 역할별 기본 권한 ── */
const ROLE_DEFAULTS = {
  seller: {
    label: '판매자',
    perms: { '상품 조회': true, '상품 등록': true, '상품 수정': true, '상품 삭제': false,
             '주문 조회': true, '주문 확정': true, '배송 조회': true, '배송 수정': false,
             '정산 조회': true, '정산 요청': true, '회원 조회': false, '회원 관리': false },
  },
  buyer: {
    label: '구매자',
    perms: { '상품 조회': true, '상품 등록': false, '상품 수정': false, '상품 삭제': false,
             '주문 조회': true, '주문 확정': false, '배송 조회': true, '배송 수정': false,
             '정산 조회': false, '정산 요청': false, '회원 조회': false, '회원 관리': false },
  },
  admin: {
    label: '관리자',
    perms: { '상품 조회': true, '상품 등록': true, '상품 수정': true, '상품 삭제': true,
             '주문 조회': true, '주문 확정': true, '배송 조회': true, '배송 수정': true,
             '정산 조회': true, '정산 요청': true, '회원 조회': true, '회원 관리': true },
  },
};

const PERM_SECTIONS = [
  { title: '상품', keys: ['상품 조회', '상품 등록', '상품 수정', '상품 삭제'] },
  { title: '주문·배송', keys: ['주문 조회', '주문 확정', '배송 조회', '배송 수정'] },
  { title: '정산·회원', keys: ['정산 조회', '정산 요청', '회원 조회', '회원 관리'] },
];

/* ── 더미 데이터 ── */
const accounts = [
  { id: 'C001', name: '이서진', email: 'sjlee@goodee.co.kr',  role: 'seller', status: 'active',
    created: '2025-01-10', lastLogin: '2025-03-21 08:55', phone: '010-1111-2222',
    sellerApproval: 'approved',
    perms: { ...ROLE_DEFAULTS.seller.perms } },
  { id: 'C002', name: '박준혁', email: 'jh.park@goodee.co.kr', role: 'buyer', status: 'active',
    created: '2025-02-03', lastLogin: '2025-03-20 14:30', phone: '010-3333-4444',
    perms: { ...ROLE_DEFAULTS.buyer.perms } },
  { id: 'C003', name: '김하은', email: 'haeun@goodee.co.kr',  role: 'admin', status: 'suspended',
    created: '2025-03-01', lastLogin: '2025-03-15 11:20', phone: '010-5555-6666',
    perms: { ...ROLE_DEFAULTS.admin.perms } },
  { id: 'C004', name: '최민우', email: 'mw.choi@goodee.co.kr', role: 'seller', status: 'active',
    created: '2025-03-18', lastLogin: '-', phone: '010-7777-8888',
    sellerApproval: 'pending',
    perms: { ...ROLE_DEFAULTS.seller.perms } },
];

const logs = [
  { dt:'2025-03-21 09:10', action:'계정 생성', target:'이서진 (C001)', detail:'역할: 판매자', by:'root' },
  { dt:'2025-03-20 16:44', action:'역할 변경', target:'박준혁 (C002)', detail:'관리자 → 구매자', by:'root' },
  { dt:'2025-03-15 11:30', action:'계정 정지', target:'김하은 (C003)', detail:'보안 위협', by:'root' },
  { dt:'2025-02-03 10:00', action:'계정 생성', target:'박준혁 (C002)', detail:'역할: 구매자', by:'root' },
  { dt:'2025-01-10 09:00', action:'계정 생성', target:'이서진 (C001)', detail:'역할: 판매자', by:'root' },
];

let _editTargetId    = null;
let _suspendTargetId = null;
let _deleteTargetId  = null;

/* ── 슬롯 그리드 렌더 ── */
function renderSlots() {
  const grid = document.getElementById('slotGrid');
  let html = '';

  accounts.forEach((acc, i) => {
    const roleInfo   = ROLE_DEFAULTS[acc.role];
    const initial    = acc.name.charAt(0);
    const isSuspend  = acc.status === 'suspended';
    const activePerms = Object.entries(acc.perms).filter(([, v]) => v).map(([k]) => k);
    const tagHtml = activePerms.slice(0, 4).map(k =>
      `<span class="ra-perm-tag ra-perm-tag--on"><i class="fas fa-check"></i>${k}</span>`
    ).join('') + (activePerms.length > 4 ? `<span class="ra-perm-tag">+${activePerms.length - 4}</span>` : '');

    const roleBadge = acc.role === 'seller' ? 'badge--green'
                    : acc.role === 'buyer'  ? 'badge--blue'
                    : 'badge--purple';

    html += `
    <div class="ra-slot-card${isSuspend ? ' ra-slot-card--suspended' : ''}" data-id="${acc.id}" onclick="goToDetail('${acc.id}')">
      <span class="ra-slot-card__num">${i + 1} / ${MAX_SLOTS}</span>
      <div class="ra-card-top">
        <div class="ra-card-avatar ra-card-avatar--${acc.role}">${initial}</div>
        <div class="ra-card-info">
          <p class="ra-card-name">${acc.name}</p>
          <p class="ra-card-email">${acc.email}</p>
        </div>
        <span class="ra-card-detail-hint"><i class="fas fa-chevron-right"></i></span>
      </div>
      <div class="ra-card-status">
        <span class="ra-status-dot ra-status-dot--${acc.status}"></span>
        <span class="ra-status-text">${isSuspend ? '정지됨' : '활성'}</span>
        <span class="badge ${roleBadge}">${roleInfo.label}</span>
        ${acc.role === 'seller' && acc.sellerApproval
          ? `<span class="ra-seller-approval ra-seller-approval--${acc.sellerApproval}">${
              acc.sellerApproval === 'approved' ? '판매자 승인' :
              acc.sellerApproval === 'pending'  ? '승인 대기중' : '승인 반려'
            }</span>`
          : ''}
      </div>
      <div class="ra-card-perms">${tagHtml || '<span class="ra-perm-tag">권한 없음</span>'}</div>
      <div class="ra-card-meta">
        <span>생성일: ${acc.created}</span>
        <span>최근접속: ${acc.lastLogin}</span>
      </div>
      <div class="ra-card-actions" onclick="event.stopPropagation()">
        <button class="btn-ghost btn-sm" onclick="openEditModal('${acc.id}')"><i class="fas fa-edit"></i> 역할·권한</button>
        ${isSuspend
          ? `<button class="btn-ghost btn-sm" onclick="liftSuspend('${acc.id}')"><i class="fas fa-unlock"></i> 해제</button>`
          : `<button class="btn-ghost btn-sm" style="color:#e65100;border-color:#e65100;" onclick="openSuspendModal('${acc.id}')"><i class="fas fa-ban"></i> 정지</button>`
        }
        <button class="btn-danger btn-sm" onclick="openDeleteModal('${acc.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  });

  /* 빈 슬롯 */
  for (let e = 0; e < MAX_SLOTS - accounts.length; e++) {
    const slotNum = accounts.length + e + 1;
    html += `
    <div class="ra-slot-card ra-slot-card--empty" onclick="openCreateModal()">
      <div class="ra-slot-empty-inner">
        <i class="fas fa-plus-circle"></i>
        <span>계정 추가</span>
        <small>슬롯 ${slotNum} / ${MAX_SLOTS}</small>
      </div>
    </div>`;
  }

  grid.innerHTML = html;
  updateSlotInfo();
}

function updateSlotInfo() {
  const used = accounts.length;
  document.getElementById('slotUsed').textContent = used;
  document.getElementById('slotGaugeBar').style.width = `${(used / MAX_SLOTS) * 100}%`;
  document.getElementById('remainSlotCount').textContent = MAX_SLOTS - used;
  const btn = document.getElementById('openCreateBtn');
  if (btn) {
    btn.disabled = used >= MAX_SLOTS;
    btn.title    = used >= MAX_SLOTS ? '최대 5개까지 생성 가능합니다.' : '';
  }
}

/* ── 권한 체크 그리드 렌더 ── */
function renderPermGrid(containerId, perms) {
  const el = document.getElementById(containerId);
  let html = '';
  PERM_SECTIONS.forEach(sec => {
    html += `<span class="ra-perm-section-title">${sec.title}</span>`;
    sec.keys.forEach(k => {
      html += `<label class="ra-perm-check">
        <input type="checkbox" value="${k}" ${perms[k] ? 'checked' : ''}/>${k}
      </label>`;
    });
  });
  el.innerHTML = html;
}

function collectPerms(containerId) {
  const perms = {};
  document.querySelectorAll(`#${containerId} input[type="checkbox"]`).forEach(cb => {
    perms[cb.value] = cb.checked;
  });
  return perms;
}

/* ── 역할 선택 → 권한 자동 갱신 ── */
function bindRoleSelector(selectorId, permGridId) {
  document.querySelectorAll(`#${selectorId} input[type="radio"]`).forEach(radio => {
    radio.addEventListener('change', () => {
      if (ROLE_DEFAULTS[radio.value]) renderPermGrid(permGridId, { ...ROLE_DEFAULTS[radio.value].perms });
    });
  });
}

/* ── 모달: 계정 생성 ── */
function openCreateModal() {
  if (accounts.length >= MAX_SLOTS) { showToast('자식 계정은 최대 5개까지 생성 가능합니다.', 'warn'); return; }
  ['newName','newEmail','newPw','newPhone'].forEach(id => { document.getElementById(id).value = ''; });
  document.querySelectorAll('input[name="newRole"]').forEach(r => r.checked = false);
  renderPermGrid('createPermGrid', Object.fromEntries(Object.keys(ROLE_DEFAULTS.buyer.perms).map(k => [k, false])));
  openModal('modalCreate');
}

/* ── 모달: 역할·권한 편집 ── */
function openEditModal(id) {
  const acc = accounts.find(a => a.id === id);
  if (!acc) return;
  _editTargetId = id;

  document.getElementById('editTargetInfo').innerHTML = `
    <div class="ra-edit-target-avatar ra-card-avatar--${acc.role}">${acc.name.charAt(0)}</div>
    <div>
      <p class="ra-edit-target-name">${acc.name}</p>
      <p class="ra-edit-target-email">${acc.email}</p>
    </div>`;

  document.querySelectorAll('input[name="editRole"]').forEach(r => { r.checked = r.value === acc.role; });
  renderPermGrid('editPermGrid', { ...acc.perms });
  openModal('modalEdit');
}

/* ── 모달: 정지 ── */
function openSuspendModal(id) {
  const acc = accounts.find(a => a.id === id);
  if (!acc) return;
  _suspendTargetId = id;
  document.getElementById('suspendTargetName').textContent = `${acc.name} (${acc.email})`;
  document.getElementById('suspendReason').value = '';
  document.getElementById('suspendDetail').value = '';
  openModal('modalSuspend');
}

/* ── 정지 해제 ── */
function liftSuspend(id) {
  const acc = accounts.find(a => a.id === id);
  if (!acc) return;
  acc.status = 'active';
  addLog('정지 해제', acc, '상태: 활성으로 변경');
  renderSlots(); renderLogTable();
  showToast(`${acc.name} 계정의 정지가 해제되었습니다.`, 'success');
}

/* ── 모달: 삭제 ── */
function openDeleteModal(id) {
  const acc = accounts.find(a => a.id === id);
  if (!acc) return;
  _deleteTargetId = id;
  document.getElementById('deleteTargetName').textContent = acc.name;
  document.getElementById('deleteConfirmInput').value = '';
  openModal('modalDelete');
}

/* ── 판매자 등록 현황 ── */
const SELLER_APPROVAL_LABEL = { approved: '승인 완료', pending: '승인 대기중', rejected: '승인 반려' };
const SELLER_APPROVAL_ICON  = { approved: 'fa-check-circle', pending: 'fa-clock', rejected: 'fa-times-circle' };

function renderSellerStatus() {
  const panel = document.getElementById('sellerStatusPanel');
  const sellers = accounts.filter(a => a.role === 'seller');

  if (!sellers.length) {
    panel.innerHTML = `
      <div class="ra-seller-empty">
        <i class="fas fa-store-slash"></i>
        <p>판매자 역할이 부여된 자식 계정이 없습니다.</p>
        <a href="seller-register.html" class="btn-primary btn-sm" style="margin-top:8px;">판매자 등록하기</a>
      </div>`;
    return;
  }

  /* KPI 카운트 */
  const cnt = { approved: 0, pending: 0, rejected: 0, none: 0 };
  sellers.forEach(s => {
    if (s.sellerApproval) cnt[s.sellerApproval] = (cnt[s.sellerApproval] || 0) + 1;
    else cnt.none++;
  });

  const kpiHtml = `
    <div class="ra-seller-kpi">
      <div class="ra-seller-kpi-card ra-seller-kpi-card--green">
        <i class="fas fa-check-circle"></i>
        <div><p class="ra-seller-kpi-label">승인 완료</p><p class="ra-seller-kpi-value">${cnt.approved}</p></div>
      </div>
      <div class="ra-seller-kpi-card ra-seller-kpi-card--orange">
        <i class="fas fa-clock"></i>
        <div><p class="ra-seller-kpi-label">승인 대기중</p><p class="ra-seller-kpi-value">${cnt.pending}</p></div>
      </div>
      <div class="ra-seller-kpi-card ra-seller-kpi-card--red">
        <i class="fas fa-times-circle"></i>
        <div><p class="ra-seller-kpi-label">승인 반려</p><p class="ra-seller-kpi-value">${cnt.rejected}</p></div>
      </div>
      <div class="ra-seller-kpi-card ra-seller-kpi-card--gray">
        <i class="fas fa-user-slash"></i>
        <div><p class="ra-seller-kpi-label">미등록</p><p class="ra-seller-kpi-value">${cnt.none}</p></div>
      </div>
    </div>`;

  const rowsHtml = sellers.map(s => {
    const ap = s.sellerApproval || 'none';
    const label = ap === 'none' ? '미등록' : SELLER_APPROVAL_LABEL[ap];
    const icon  = ap === 'none' ? 'fa-minus-circle' : SELLER_APPROVAL_ICON[ap];
    const isSuspend = s.status === 'suspended';
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="ra-card-avatar ra-card-avatar--seller" style="width:32px;height:32px;font-size:13px;">${s.name.charAt(0)}</div>
            <div>
              <p style="font-weight:700;font-size:14px;color:var(--p-ink);">${s.name}</p>
              <p style="font-size:12px;color:var(--p-sub);">${s.email}</p>
            </div>
          </div>
        </td>
        <td><span class="ra-status-dot ra-status-dot--${s.status}" style="display:inline-block;"></span> ${isSuspend ? '정지됨' : '활성'}</td>
        <td>
          <span class="ra-seller-approval ra-seller-approval--${ap === 'none' ? 'none' : ap}">
            <i class="fas ${icon}"></i> ${label}
          </span>
        </td>
        <td style="font-size:12px;color:var(--p-muted);">${s.created}</td>
        <td>
          ${ap === 'none' || ap === 'rejected'
            ? `<a href="seller-register.html" class="btn-primary btn-sm"><i class="fas fa-store"></i> 등록하기</a>`
            : `<a href="seller-register.html" class="btn-ghost btn-sm"><i class="fas fa-eye"></i> 상세보기</a>`}
        </td>
      </tr>`;
  }).join('');

  panel.innerHTML = kpiHtml + `
    <div class="data-table-wrap" style="margin-top:12px;">
      <table class="data-table">
        <thead><tr><th>계정</th><th>계정 상태</th><th>판매자 등록 상태</th><th>등록일</th><th>관리</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

/* ── 이력 ── */
function addLog(action, acc, detail) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  logs.unshift({ dt: now, action, target: `${acc.name} (${acc.id})`, detail, by: 'root' });
}

const ACTION_BADGE = { '계정 생성':'badge--green', '역할 변경':'badge--blue', '계정 정지':'badge--red',
                       '정지 해제':'badge--teal', '계정 삭제':'badge--gray', '권한 변경':'badge--purple' };
function logRow(l) {
  return `<tr>
    <td style="font-size:12px;color:var(--p-muted);">${l.dt}</td>
    <td><span class="badge ${ACTION_BADGE[l.action] || 'badge--gray'}">${l.action}</span></td>
    <td style="font-size:13px;">${l.target}</td>
    <td style="font-size:13px;color:var(--p-sub);">${l.detail}</td>
    <td style="font-size:12px;color:var(--p-muted);">${l.by}</td>
  </tr>`;
}

function renderLogTable() {
  const tbody = document.getElementById('logTbody');
  tbody.innerHTML = logs.slice(0, 5).map(logRow).join('') ||
    `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--p-muted);">이력이 없습니다.</td></tr>`;
  const allTbody = document.getElementById('logAllTbody');
  if (allTbody) allTbody.innerHTML = logs.map(logRow).join('');
}

/* ── 이벤트 ── */
function bindEvents() {
  bindRoleSelector('createRoleSelector', 'createPermGrid');
  bindRoleSelector('editRoleSelector',   'editPermGrid');

  /* 계정 생성 */
  document.getElementById('createSubmitBtn').addEventListener('click', () => {
    const name  = document.getElementById('newName').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    const pw    = document.getElementById('newPw').value;
    const role  = document.querySelector('input[name="newRole"]:checked')?.value;
    if (!name || !email || !pw || !role) { showToast('이름, 이메일, 비밀번호, 역할을 모두 입력하세요.', 'warn'); return; }
    if (accounts.length >= MAX_SLOTS) { showToast('최대 5개까지 생성 가능합니다.', 'warn'); return; }

    const newAcc = {
      id: `C00${accounts.length + 1}`, name, email, role, status: 'active',
      phone: document.getElementById('newPhone').value.trim() || '-',
      created: new Date().toISOString().slice(0, 10),
      lastLogin: '-',
      perms: collectPerms('createPermGrid'),
    };
    accounts.push(newAcc);
    addLog('계정 생성', newAcc, `역할: ${ROLE_DEFAULTS[role].label}`);
    closeModal('modalCreate');
    renderSlots(); renderSellerStatus(); renderLogTable();
    showToast(`${name} 계정이 생성되었습니다.`, 'success');
  });

  /* 역할·권한 저장 */
  document.getElementById('editSaveBtn').addEventListener('click', () => {
    const acc  = accounts.find(a => a.id === _editTargetId);
    if (!acc) return;
    const role = document.querySelector('input[name="editRole"]:checked')?.value;
    if (!role) { showToast('역할을 선택하세요.', 'warn'); return; }
    const prevRole = acc.role;
    acc.role  = role;
    acc.perms = collectPerms('editPermGrid');
    const detail = prevRole !== role
      ? `${ROLE_DEFAULTS[prevRole].label} → ${ROLE_DEFAULTS[role].label}`
      : '권한 세부 조정';
    addLog(prevRole !== role ? '역할 변경' : '권한 변경', acc, detail);
    closeModal('modalEdit');
    renderSlots(); renderSellerStatus(); renderLogTable();
    showToast('역할·권한이 저장되었습니다.', 'success');
  });

  /* 정지 확인 */
  document.getElementById('confirmSuspendBtn').addEventListener('click', () => {
    if (!document.getElementById('suspendReason').value) { showToast('정지 사유를 선택하세요.', 'warn'); return; }
    const acc = accounts.find(a => a.id === _suspendTargetId);
    if (!acc) return;
    acc.status = 'suspended';
    addLog('계정 정지', acc, document.getElementById('suspendReason').value);
    closeModal('modalSuspend');
    renderSlots(); renderLogTable();
    showToast(`${acc.name} 계정이 정지되었습니다.`, 'warn');
  });

  /* 삭제 확인 */
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    const acc = accounts.find(a => a.id === _deleteTargetId);
    if (!acc) return;
    if (document.getElementById('deleteConfirmInput').value.trim() !== acc.name) {
      showToast('계정명이 일치하지 않습니다.', 'warn'); return;
    }
    accounts.splice(accounts.indexOf(acc), 1);
    addLog('계정 삭제', acc, '영구 삭제');
    closeModal('modalDelete');
    renderSlots(); renderSellerStatus(); renderLogTable();
    showToast(`${acc.name} 계정이 삭제되었습니다.`, 'warn');
  });
}

function goToDetail(id) {
  location.href = `root-account-detail.html?id=${id}`;
}

function init() {
  initCommon();
  renderSlots();
  renderSellerStatus();
  renderLogTable();
  bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
