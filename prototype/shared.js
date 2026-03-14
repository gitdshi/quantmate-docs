/* ============================================================
   QuantMate Prototype — Shared JavaScript
   Sidebar, Tabs, Modals, Dark Mode, Mock Data
   ============================================================ */

// ── Dark Mode ──
function initDarkMode() {
  const saved = localStorage.getItem('tm-dark');
  if (saved === '1' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}
function toggleDark() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('tm-dark', document.documentElement.classList.contains('dark') ? '1' : '0');
}
initDarkMode();

// ── Sidebar ──
const CURRENT_PAGE = location.pathname.split('/').pop()?.replace('.html', '') || 'dashboard';

function buildSidebar() {
  const nav = [
    { section: '概览' },
    { name: 'Dashboard', href: 'dashboard.html', icon: 'layout-dashboard', id: 'dashboard' },
    { section: '研究 & 数据' },
    { name: '策略研究', href: 'strategies.html', icon: 'file-code', id: 'strategies' },
    { name: '回测评估', href: 'backtest.html', icon: 'trending-up', id: 'backtest' },
    { name: '行情数据', href: 'market-data.html', icon: 'database', id: 'market-data' },
    { name: '因子研究', href: 'factor-lab.html', icon: 'flask-conical', id: 'factor-lab' },
    { section: '交易 & 组合' },
    { name: '组合管理', href: 'portfolio.html', icon: 'briefcase', id: 'portfolio' },
    { name: '交易执行', href: 'trading.html', icon: 'arrow-left-right', id: 'trading' },
    { name: '分析中心', href: 'analytics.html', icon: 'bar-chart-3', id: 'analytics' },
    { section: '运维 & 通知' },
    { name: '监控告警', href: 'alerts.html', icon: 'bell', id: 'alerts', badge: '3' },
    { name: '报告复盘', href: 'reports.html', icon: 'file-text', id: 'reports' },
    { section: 'AI & 社区' },
    { name: 'AI 助手', href: 'ai.html', icon: 'sparkles', id: 'ai' },
    { name: '模板市场', href: 'marketplace.html', icon: 'store', id: 'marketplace' },
    { name: '策略分享', href: 'sharing.html', icon: 'share-2', id: 'sharing' },
    { name: '团队空间', href: 'workspaces.html', icon: 'users', id: 'workspaces' },
    { section: '系统' },
    { name: '系统设置', href: 'settings.html', icon: 'settings', id: 'settings' },
    { name: '账户安全', href: 'account.html', icon: 'shield', id: 'account' },
  ];

  let html = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
        QuantMate
      </div>
      <button class="btn btn-ghost btn-icon" onclick="toggleSidebar()" title="收起侧边栏">
        ${icon('panel-left-close')}
      </button>
    </div>
    <nav class="sidebar-nav">`;

  nav.forEach(item => {
    if (item.section) {
      html += `<div class="sidebar-section-label">${item.section}</div>`;
    } else {
      const active = item.id === CURRENT_PAGE ? ' active' : '';
      const badge = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
      html += `<a href="${item.href}" class="sidebar-link${active}">${icon(item.icon)} ${item.name}${badge}</a>`;
    }
  });

  html += `</nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-user-name">demo_user</div>
        <div class="sidebar-user-email">demo@quantmate.io</div>
      </div>
      <button class="btn btn-ghost btn-icon" onclick="toggleDark()" title="切换主题">${icon('moon')}</button>
      <a href="login.html" class="btn btn-ghost btn-icon" title="退出登录">${icon('log-out')}</a>
    </div>`;

  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.innerHTML = html;
}

function toggleSidebar() {
  const s = document.getElementById('sidebar');
  if (s) s.classList.toggle('collapsed');
}

// ── Tabs ──
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabBar => {
    tabBar.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = tabBar.dataset.group || 'default';
        tabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.tab;
        document.querySelectorAll(`.tab-panel[data-group="${group}"]`).forEach(p => {
          p.classList.toggle('active', p.dataset.panel === target);
        });
      });
    });
  });
}

// ── Modals ──
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
// Close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('open')) {
    e.target.classList.remove('open');
  }
});

// ── Lucide Icon Helper ──
// Uses inline SVG paths for common icons (no CDN dependency)
const ICONS = {
  'layout-dashboard': '<path d="M3 3h7v9H3z"/><path d="M14 3h7v5h-7z"/><path d="M14 12h7v9h-7z"/><path d="M3 16h7v5H3z"/>',
  'file-code': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/>',
  'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  'briefcase': '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  'bar-chart-3': '<path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>',
  'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
  'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'sparkles': '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  'store': '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>',
  'share-2': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'arrow-left-right': '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
  'flask-conical': '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/>',
  'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  'panel-left-close': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>',
  'plus': '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  'search': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  'x': '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  'check': '<polyline points="20 6 9 17 4 12"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  'activity': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  'filter': '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  'edit': '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  'trash': '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  'copy': '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  'play': '<polygon points="5 3 19 12 5 21 5 3"/>',
  'pause': '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  'stop-circle': '<circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6"/>',
  'refresh-cw': '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  'external-link': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  'send': '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  'calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'key': '<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
  'globe': '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  'info': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
  'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
  'menu': '<line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/>',
  'mail': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  'smartphone': '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  'message-circle': '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  'image': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  'link': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  'cpu': '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
  'wallet': '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
  'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
  'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
};

function icon(name, cls = '') {
  const paths = ICONS[name] || ICONS['info'];
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">${paths}</svg>`;
}

// ── Page Shell ──
function pageShell(title, subtitle) {
  return `<div class="page-header">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="page-title">${title}</h1>
        ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}
      </div>
      <button class="btn btn-ghost btn-icon" style="display:none" id="mobile-menu" onclick="toggleSidebar()">${icon('menu')}</button>
    </div>
  </div>`;
}

// ── Mock Data ──
const MOCK = {
  stocks: [
    { code: '600519.SH', name: '贵州茅台', price: 1856.00, change: +2.35, industry: '白酒' },
    { code: '000001.SZ', name: '平安银行', price: 12.48, change: -0.64, industry: '银行' },
    { code: '601318.SH', name: '中国平安', price: 48.92, change: +1.12, industry: '保险' },
    { code: '000858.SZ', name: '五粮液', price: 156.30, change: +1.85, industry: '白酒' },
    { code: '600036.SH', name: '招商银行', price: 35.67, change: -0.32, industry: '银行' },
    { code: '002415.SZ', name: '海康威视', price: 34.21, change: +3.12, industry: '安防' },
    { code: '600900.SH', name: '长江电力', price: 28.45, change: +0.56, industry: '电力' },
    { code: '601012.SH', name: '隆基绿能', price: 22.18, change: -2.41, industry: '光伏' },
  ],
  strategies: [
    { id: 1, name: 'DualMA_Cross', type: 'CTA', status: 'active', version: 3, builtin: true, desc: '双均线交叉策略' },
    { id: 2, name: 'RSI_Reversal', type: 'CTA', status: 'active', version: 2, builtin: true, desc: 'RSI 反转策略' },
    { id: 3, name: 'BollingerBand', type: 'CTA', status: 'active', version: 1, builtin: true, desc: '布林带突破策略' },
    { id: 4, name: 'MACD_Trend', type: 'CTA', status: 'active', version: 1, builtin: true, desc: 'MACD 趋势跟踪' },
    { id: 5, name: 'MyAlpha01', type: 'Custom', status: 'active', version: 5, builtin: false, desc: '多因子选股 + 动量' },
    { id: 6, name: 'MeanRevert_v2', type: 'Custom', status: 'draft', version: 2, builtin: false, desc: '均值回归测试' },
  ],
  backtests: [
    { id: 'BT-001', strategy: 'DualMA_Cross', symbol: '600519.SH', status: 'completed', return: 23.5, sharpe: 1.42, maxDD: -12.3, date: '2026-03-13' },
    { id: 'BT-002', strategy: 'RSI_Reversal', symbol: '000858.SZ', status: 'completed', return: 15.2, sharpe: 1.18, maxDD: -8.7, date: '2026-03-13' },
    { id: 'BT-003', strategy: 'MyAlpha01', symbol: '601318.SH', status: 'running', return: null, sharpe: null, maxDD: null, date: '2026-03-14' },
    { id: 'BT-004', strategy: 'BollingerBand', symbol: '600036.SH', status: 'failed', return: null, sharpe: null, maxDD: null, date: '2026-03-14' },
    { id: 'BT-005', strategy: 'DualMA_Cross', symbol: '000001.SZ', status: 'queued', return: null, sharpe: null, maxDD: null, date: '2026-03-14' },
  ],
  positions: [
    { symbol: '600519.SH', name: '贵州茅台', strategy: 'DualMA_Cross', dir: '多', qty: 100, entry: 1820.00, current: 1856.00, pnl: 3600, pnlPct: 1.98 },
    { symbol: '000858.SZ', name: '五粮液', strategy: 'RSI_Reversal', dir: '多', qty: 500, entry: 148.50, current: 156.30, pnl: 3900, pnlPct: 5.25 },
    { symbol: '601012.SH', name: '隆基绿能', strategy: 'MyAlpha01', dir: '多', qty: 1000, entry: 24.60, current: 22.18, pnl: -2420, pnlPct: -9.84 },
  ],
  orders: [
    { id: 'ORD-001', time: '09:31:02', symbol: '600519.SH', dir: '买入', type: '限价', price: 1820.00, qty: 100, filled: 100, status: '已成交' },
    { id: 'ORD-002', time: '09:35:15', symbol: '000858.SZ', dir: '买入', type: '市价', price: 148.50, qty: 500, filled: 500, status: '已成交' },
    { id: 'ORD-003', time: '10:02:30', symbol: '601012.SH', dir: '买入', type: '限价', price: 24.60, qty: 1000, filled: 1000, status: '已成交' },
    { id: 'ORD-004', time: '14:25:00', symbol: '002415.SZ', dir: '卖出', type: '限价', price: 35.00, qty: 200, filled: 0, status: '待成交' },
    { id: 'ORD-005', time: '14:30:00', symbol: '600036.SH', dir: '买入', type: '止损', price: 34.50, qty: 300, filled: 0, status: '已撤单' },
  ],
  alerts: [
    { id: 1, time: '14:32:00', type: '价格异动', level: '警告', symbol: '601012.SH', msg: '隆基绿能 跌幅超过 5%', status: '未处理' },
    { id: 2, time: '13:15:00', type: '系统异常', level: '严重', symbol: '', msg: 'Worker 进程异常退出', status: '已确认' },
    { id: 3, time: '10:05:00', type: '数据延迟', level: '信息', symbol: '', msg: 'Tushare 数据延迟 > 5分钟', status: '已解决' },
  ],
  factors: [
    { name: 'momentum_20d', ic: 0.052, ir: 1.23, ret: 8.5, desc: '20日动量因子' },
    { name: 'value_pe', ic: 0.038, ir: 0.95, ret: 6.2, desc: 'PE估值因子' },
    { name: 'quality_roe', ic: 0.045, ir: 1.10, ret: 7.8, desc: 'ROE质量因子' },
    { name: 'size_ln_mv', ic: -0.031, ir: -0.78, ret: -3.1, desc: '市值规模因子' },
    { name: 'volatility_60d', ic: -0.028, ir: -0.65, ret: -2.5, desc: '60日波动率因子' },
    { name: 'turnover_20d', ic: 0.022, ir: 0.55, ret: 4.1, desc: '20日换手率因子' },
  ],
};

// ── Utility ──
function pnlColor(val) { return val >= 0 ? 'text-success' : 'text-destructive'; }
function pnlSign(val) { return val >= 0 ? '+' : ''; }
function statusBadge(status) {
  const map = {
    'completed': 'badge-success', '已成交': 'badge-success', 'active': 'badge-success', 'online': 'badge-success', '已解决': 'badge-success',
    'running': 'badge-primary', '执行中': 'badge-primary', '运行中': 'badge-primary',
    'queued': 'badge-warning', '待成交': 'badge-warning', 'pending': 'badge-warning', '未处理': 'badge-warning',
    'failed': 'badge-destructive', '已撤单': 'badge-muted', 'draft': 'badge-muted', '已确认': 'badge-primary',
    '信息': 'badge-primary', '警告': 'badge-warning', '严重': 'badge-destructive',
  };
  return `<span class="badge ${map[status] || 'badge-muted'}">${status}</span>`;
}

// ── Init on DOM ready ──
document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  initTabs();
});

// ── Toast Notifications ──
function showToast(msg, type) {
  type = type || 'info';
  var container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  var t = document.createElement('div');
  t.className = 'toast toast-' + type;
  var icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  t.innerHTML = '<span>' + (icons[type] || 'ℹ') + '</span> ' + msg;
  container.appendChild(t);
  setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3000);
}

// ── Confirm Dialog ──
function showConfirm(msg, onYes) {
  var overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = '<div class="confirm-box"><h4>确认操作</h4><p>' + msg + '</p><div class="confirm-actions"><button class="btn btn-secondary btn-sm" id="cfmNo">取消</button><button class="btn btn-primary btn-sm" id="cfmYes">确认</button></div></div>';
  document.body.appendChild(overlay);
  overlay.querySelector('#cfmNo').onclick = function () { document.body.removeChild(overlay); };
  overlay.querySelector('#cfmYes').onclick = function () { document.body.removeChild(overlay); if (onYes) onYes(); };
  overlay.addEventListener('click', function (e) { if (e.target === overlay) document.body.removeChild(overlay); });
}

// ── Helper: close modal + toast ──
function submitModal(id, msg, type) {
  closeModal(id);
  showToast(msg, type || 'success');
}

// ── Helper: activate a tab programmatically ──
function activateTab(group, tabName) {
  var bar = document.querySelector('.tabs[data-group="' + group + '"]');
  if (!bar) return;
  bar.querySelectorAll('.tab-btn').forEach(function (b) {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-panel[data-group="' + group + '"]').forEach(function (p) {
    p.classList.toggle('active', p.dataset.panel === tabName);
  });
}
