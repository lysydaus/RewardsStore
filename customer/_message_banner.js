/**
 * 站内短信走马灯组件
 * 在header下方显示最新的会员提醒消息
 */

function renderMessageBanner() {
  const user = DB.getCurrentUser();
  if (!user) return;
  
  // 检查并生成提醒
  DB.checkAndCreateTrialReminders(user.id);
  
  // 获取所有消息（不管是否已读）
  const notifications = DB.getNotifications(user.id);
  
  // 筛选出T+1、T+2、T+3的提醒消息
  const trialReminders = notifications.filter(n => 
    n.type === 'trial_reminder_3days' || 
    n.type === 'trial_reminder_1day' || 
    n.type === 'trial_reminder_today'
  );
  
  if (!trialReminders.length) return;
  
  // 获取最新的一条提醒消息
  const latestMessage = trialReminders[0];
  
  // 创建走马灯HTML - 使用原生marquee标签
  const bannerHTML = `
    <div id="message-banner" class="text-white py-2.5 px-4 shadow-sm relative" style="background: linear-gradient(90deg, #ff6b00 0%, #ff8533 100%);">
      <div class="flex items-center justify-between max-w-screen-lg mx-auto">
        <div class="flex items-center gap-2 flex-1 overflow-hidden">
          <span class="material-symbols-outlined text-white text-base flex-shrink-0" style="font-variation-settings:'FILL' 0">mail</span>
          <span class="text-sm font-medium flex-shrink-0">站内短信：</span>
          <marquee class="flex-1 text-sm" behavior="scroll" direction="left" scrollamount="3">
            ${latestMessage.content}
          </marquee>
        </div>
        <div class="flex items-center gap-2 ml-4 flex-shrink-0">
          <button onclick="openMembershipPage()" class="text-sm font-medium bg-white text-orange-600 hover:bg-orange-50 px-4 py-1 rounded-full transition-colors">
            开通会员
          </button>
          <button onclick="viewMessageBanner()" class="text-sm font-medium bg-white/20 hover:bg-white/30 text-white px-4 py-1 rounded-full transition-colors">
            查看
          </button>
          <button onclick="closeMessageBanner()" class="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
            <span class="material-symbols-outlined text-white text-lg">close</span>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // 查找header元素
  const header = document.querySelector('header');
  if (!header) return;
  
  // 插入到header的下一个兄弟元素之前
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = bannerHTML;
  const bannerElement = tempDiv.firstElementChild;
  
  // 插入到header后面
  if (header.nextSibling) {
    header.parentNode.insertBefore(bannerElement, header.nextSibling);
  } else {
    header.parentNode.appendChild(bannerElement);
  }
  
  // 保存消息ID到banner
  bannerElement.dataset.messageId = latestMessage.id;
}

// 开通会员
window.openMembershipPage = function() {
  window.location.href = 'membership.html';
};

// 查看消息
window.viewMessageBanner = function() {
  const banner = document.getElementById('message-banner');
  if (banner) {
    const messageId = parseInt(banner.dataset.messageId);
    DB.markNotificationAsRead(messageId);
    window.location.href = 'messages.html';
  }
};

// 关闭走马灯
window.closeMessageBanner = function() {
  const banner = document.getElementById('message-banner');
  if (banner) {
    banner.style.transition = 'all 0.3s ease';
    banner.style.transform = 'translateY(-100%)';
    banner.style.opacity = '0';
    setTimeout(() => banner.remove(), 300);
  }
};

// 页面加载完成后渲染走马灯
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderMessageBanner);
} else {
  renderMessageBanner();
}
