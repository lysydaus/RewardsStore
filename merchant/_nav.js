// 商家端公共导航组件
function renderMerchantNav(activePage) {
  const lang = I18N.lang;
  const pages = [
    { key:'orders',     icon:'receipt_long',        zh:'订单', en:'Orders',     href:'orders.html' },
    { key:'verify',     icon:'qr_code_scanner',     zh:'核销', en:'Verify',     href:'verify.html' },
    { key:'settlement', icon:'account_balance_wallet', zh:'结算', en:'Settlement', href:'settlement.html' },
    { key:'products',   icon:'inventory_2',         zh:'商品', en:'Products',   href:'products.html' },
    { key:'store',      icon:'storefront',          zh:'店铺', en:'Store',      href:'store.html' },
  ];

  // 侧边栏内容
  const m = DB.getCurrentMerchant();
  const asideContent = `
    <div class="flex items-center gap-3 mb-6 p-2">
      <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
        <span class="material-symbols-outlined text-primary-container text-2xl" style="font-variation-settings:'FILL' 1,'wght' 500">store</span>
      </div>
      <div>
        <p class="font-bold text-sm text-on-surface">${m ? m.name : 'Merchant'}</p>
        <p class="text-xs text-secondary">${m ? m.store_name : ''}</p>
      </div>
    </div>
    <nav class="flex flex-col gap-1">
      ${pages.map(p => `
        <a href="${p.href}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
          ${activePage === p.key ? 'bg-orange-100 text-primary-container' : 'text-on-surface-variant hover:bg-gray-100'}">
          <span class="material-symbols-outlined" style="${activePage===p.key?"font-variation-settings:'FILL' 1,'wght' 500":''}">${p.icon}</span>
          ${lang === 'zh' ? p.zh : p.en}
        </a>`).join('')}
    </nav>`;

  // 侧边栏 (桌面)
  const aside = document.getElementById('merchant-aside');
  if (aside) {
    aside.innerHTML = asideContent;
  }

  // 侧边栏 (移动端抽屉)
  const asideMobile = document.getElementById('merchant-aside-mobile');
  if (asideMobile) {
    asideMobile.innerHTML = asideContent;
  }

  // 底部导航 (移动端)
  const bottomNav = document.getElementById('merchant-bottom-nav');
  if (bottomNav) {
    bottomNav.innerHTML = pages.map(p => `
      <a href="${p.href}" class="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all
        ${activePage === p.key ? 'bg-orange-100 text-primary-container' : 'text-on-surface-variant'}">
        <span class="material-symbols-outlined text-2xl" style="${activePage===p.key?"font-variation-settings:'FILL' 1,'wght' 500":''}">${p.icon}</span>
        <span class="text-[10px] font-semibold mt-0.5">${lang === 'zh' ? p.zh : p.en}</span>
      </a>`).join('');
  }

  // Header 商家名
  const headerName = document.getElementById('merchant-header-name');
  if (headerName) {
    const m = DB.getCurrentMerchant();
    headerName.textContent = m ? m.store_name : 'Merchant Hub';
  }
}

function checkMerchantAuth() {
  if (!DB.getCurrentMerchant()) {
    window.location.href = 'login.html';
  }
}
