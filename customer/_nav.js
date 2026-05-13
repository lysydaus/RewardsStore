// 客户端公共导航
function checkAuth() {
  const user = DB.getCurrentUser();
  console.log('检查认证状态:', user); // 调试信息
  if (!user) {
    console.log('用户未登录，跳转到登录页');
    window.location.href = 'login.html';
    return false;
  }
  console.log('用户已登录:', user.phone);
  return true;
}

function renderCustomerNav(activePage) {
  const lang = I18N.lang;
  const pages = [
    { key:'home',       icon:'home',      zh:'首页',   en:'Home',       href:'home.html' },
    { key:'categories', icon:'category',  zh:'分类',   en:'Categories', href:'categories.html' },
    { key:'stores',     icon:'storefront',zh:'周边',   en:'Life Circle',href:'stores.html' },
    { key:'profile',    icon:'person',    zh:'我的',   en:'Profile',    href:'profile.html' },
  ];

  const nav = document.getElementById('customer-bottom-nav');
  if (nav) {
    nav.innerHTML = pages.map(p => `
      <a href="${p.href}" class="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all
        ${activePage === p.key ? 'text-primary-container font-bold' : 'text-secondary'}">
        <span class="material-symbols-outlined text-2xl" style="${activePage===p.key?"font-variation-settings:'FILL' 1,'wght' 600":''}">${p.icon}</span>
        <span class="text-[10px] font-semibold mt-0.5">${lang === 'zh' ? p.zh : p.en}</span>
      </a>`).join('');
  }
}

function getCartBadge() {
  const u = DB.getCurrentUser();
  if (!u) return 0;
  return DB.getCartCount(u.id);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = getCartBadge();
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
}

function logout() {
  if (confirm(I18N.t('确定要退出登录吗？', 'Are you sure you want to logout?'))) {
    DB.logoutUser();
    window.location.href = '../index.html';
  }
}

// 菜单控制
function toggleMenu() {
  const menu = document.getElementById('dropdown-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

// 初始化菜单功能
function initMenu() {
  // 点击页面其他地方关闭菜单
  document.addEventListener('click', function(e) {
    const menu = document.getElementById('dropdown-menu');
    if (!menu) return;
    
    const menuBtn = e.target.closest('button[onclick*="toggleMenu"]');
    if (!menuBtn && !menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });
}

// 页面加载时初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMenu);
} else {
  initMenu();
}
