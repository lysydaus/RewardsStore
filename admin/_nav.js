// 运维端公共导航组件
function checkAdminAuth() {
  if (!sessionStorage.getItem('admin_logged_in')) {
    window.location.href = 'login.html';
  }
}

function renderAdminNav(activePage) {
  const pages = [
    { key:'users',  icon:'group',        zh:'用户列表', en:'Users',  href:'users.html' },
    { key:'stores', icon:'storefront',   zh:'商铺管理', en:'Stores', href:'stores.html' },
    { key:'config', icon:'settings',     zh:'系统配置', en:'Config', href:'config.html' },
  ];

  const nav = document.getElementById('admin-bottom-nav');
  if (nav) {
    nav.innerHTML = pages.map(p => `
      <a href="${p.href}" class="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all
        ${activePage === p.key ? 'text-primary-container font-bold' : 'text-secondary'}">
        <span class="material-symbols-outlined text-2xl" style="${activePage===p.key?"font-variation-settings:'FILL' 1,'wght' 600":''}">${p.icon}</span>
        <span class="text-[10px] font-semibold mt-0.5">${p.zh}</span>
      </a>`).join('');
  }
}

function logout() {
  if (confirm('确定要退出登录吗？')) {
    sessionStorage.removeItem('admin_logged_in');
    window.location.href = 'login.html';
  }
}
