/**
 * db.js - 数据库抽象层
 * 当前: localStorage (本地, 无需服务器)
 * 切换: 将 DB_ADAPTER 改为 'api' 并配置 API_BASE_URL 即可对接后端
 */

const DB_ADAPTER = 'local'; // 'local' | 'api'
const API_BASE_URL = '/api'; // 切换到后端时修改此处

const DB = {
  // ── 内部工具 ──────────────────────────────────────────────
  _get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  },
  _set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },
  _nextId(arr) {
    return arr.length ? Math.max(...arr.map(r => r.id)) + 1 : 1;
  },

  // ── 初始化种子数据 ─────────────────────────────────────────
  init() {
    // 如果已经初始化过，只更新用户006的时间
    if (localStorage.getItem('_db_initialized')) {
      this.updateUser006TrialTime();
      return;
    }
    
    // 首次初始化：创建所有数据
    this.initSystemConfig();

    this._set('categories', [
      { id:1, name_zh:'食品', name_en:'Foods', icon:'restaurant' },
      { id:2, name_zh:'电子', name_en:'Electronics', icon:'devices' },
      { id:3, name_zh:'服装', name_en:'Fashion', icon:'checkroom' },
      { id:4, name_zh:'家居', name_en:'Home', icon:'home' },
      { id:5, name_zh:'美妆', name_en:'Beauty', icon:'face_retouching_natural' },
      { id:6, name_zh:'运动', name_en:'Sports', icon:'sports_soccer' },
    ]);

    this._set('merchants', [{
      id:1, name:'商家管理员', phone:'13800000001',
      password:'demo123', store_name:'Amber Roast Coffee', store_id:1,
      store_no:'VS-102', address:'示例街道 128号',
      balance:42850, frozen:12500
    }]);

    const now = new Date();
    const trialExpireAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const trial3DaysExpireAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 还剩3天
    const trial4DaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000); // 4天前注册
    
    this._set('users', [
      {
        id:1, phone:'13800000002', password:'user123', nickname:'测试用户',
        level:'gold', points:1280, avatar:'', member_status:'trial',
        is_trial_member: true, trial_expire_at: trialExpireAt.toISOString(), trial_claimed: true,
        trial_claimed_at: now.toISOString(),
        is_formal_member: false, member_expire_at: null,
        created_at: now.toISOString(),
        limited_offer_used: false
      },
      {
        id:2, phone:'13800000003', password:'user123', nickname:'潜在客户',
        level:'bronze', points:0, avatar:'', member_status:'potential',
        is_trial_member: false, trial_expire_at: null, trial_claimed: false,
        is_formal_member: false, member_expire_at: null,
        created_at: '2024-03-15T10:30:00',
        limited_offer_used: false
      },
      {
        id:3, phone:'13800000004', password:'user123', nickname:'流失用户',
        level:'silver', points:500, avatar:'', member_status:'recall',
        is_trial_member: false, trial_expire_at: null, trial_claimed: false,
        is_formal_member: false, member_expire_at: '2024-06-01T23:59:59', // 已过期
        created_at: '2023-08-20T14:20:00',
        limited_offer_used: false
      },
      {
        id:4, phone:'13800000005', password:'user123', nickname:'正式会员',
        level:'platinum', points:2500, avatar:'', member_status:'formal',
        is_trial_member: false, trial_expire_at: null, trial_claimed: true,
        is_formal_member: true, member_expire_at: '2026-12-31T23:59:59',
        created_at: '2024-01-10T09:00:00',
        limited_offer_used: true
      },
      {
        id:5, phone:'13800000006', password:'user123', nickname:'T-3天用户',
        level:'bronze', points:150, avatar:'', member_status:'trial',
        is_trial_member: true, trial_expire_at: trial3DaysExpireAt.toISOString(), trial_claimed: true,
        trial_claimed_at: trial4DaysAgo.toISOString(),
        is_formal_member: false, member_expire_at: null,
        created_at: trial4DaysAgo.toISOString(),
        limited_offer_used: false
      }
    ]);

    this._set('products', [
      // Amber Roast Coffee (店铺1) - 咖啡相关商品
      { id:1, merchant_id:1, store_id:1, category_id:1, name_zh:'精选手冲咖啡', name_en:'Premium Pour-Over Coffee',
        price:28, original_price:35, stock:50, status:'on_sale', points_reward:3, points_redeem:10,
        sku:'COFFEE-001', 
        description_zh:'选用产自埃塞俄比亚高海拔地区的单源咖啡豆，采用日晒处理法，保留了咖啡原始的莓果酸质与浓郁的花香。每一粒咖啡豆都经过严格的二次手工挑选，确保风味的一致性与纯净度。',
        description_en:'Selected single-origin coffee beans from high-altitude regions of Ethiopia, sun-processed to preserve the original berry acidity and rich floral aroma.',
        image:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400' },
      { id:2, merchant_id:1, store_id:1, category_id:1, name_zh:'手工拿铁咖啡', name_en:'Handcrafted Latte',
        price:38, original_price:45, stock:50, status:'on_sale', points_reward:4, points_redeem:10,
        sku:'COFFEE-002', 
        description_zh:'采用意式浓缩咖啡与新鲜牛奶完美融合，由资深咖啡师手工制作，奶泡细腻绵密，口感顺滑。',
        description_en:'Perfect blend of espresso and fresh milk, handcrafted by experienced baristas with silky smooth texture.',
        image:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
      { id:3, merchant_id:1, store_id:1, category_id:1, name_zh:'美式咖啡', name_en:'Americano',
        price:25, original_price:30, stock:50, status:'on_sale', points_reward:3, points_redeem:8,
        sku:'COFFEE-003', 
        description_zh:'经典美式咖啡，浓郁醇厚，适合喜欢纯粹咖啡风味的您。',
        description_en:'Classic Americano, rich and bold, perfect for pure coffee lovers.',
        image:'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400' },
      { id:4, merchant_id:1, store_id:1, category_id:1, name_zh:'卡布奇诺', name_en:'Cappuccino',
        price:35, original_price:42, stock:50, status:'on_sale', points_reward:4, points_redeem:10,
        sku:'COFFEE-004', 
        description_zh:'意式经典咖啡，浓缩咖啡、蒸奶和奶泡的完美比例，口感丰富层次分明。',
        description_en:'Italian classic with perfect ratio of espresso, steamed milk and foam, rich and layered.',
        image:'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400' },
      
      // Golden Crust Bakery (店铺2) - 烘焙商品
      { id:5, merchant_id:1, store_id:2, category_id:1, name_zh:'手工可颂面包', name_en:'Artisan Croissant',
        price:18, original_price:25, stock:30, status:'on_sale', points_reward:2, points_redeem:5,
        sku:'BAKERY-001', sub_category:'烘焙',
        description_zh:'采用法国传统工艺，层层酥脆，黄油香气浓郁，每日新鲜出炉。',
        description_en:'Made with traditional French techniques, crispy layers with rich butter aroma, freshly baked daily.',
        image:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
      { id:6, merchant_id:1, store_id:2, category_id:1, name_zh:'巧克力蛋糕', name_en:'Chocolate Cake',
        price:58, original_price:68, stock:20, status:'on_sale', points_reward:6, points_redeem:15,
        sku:'BAKERY-002', sub_category:'烘焙',
        description_zh:'比利时进口巧克力制作，口感细腻丝滑，甜而不腻。',
        description_en:'Made with imported Belgian chocolate, smooth and silky texture, perfectly balanced sweetness.',
        image:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
      { id:7, merchant_id:1, store_id:2, category_id:1, name_zh:'法式长棍面包', name_en:'French Baguette',
        price:12, original_price:15, stock:40, status:'on_sale', points_reward:1, points_redeem:3,
        sku:'BAKERY-003', sub_category:'烘焙',
        description_zh:'外脆内软，麦香浓郁，法式经典面包。',
        description_en:'Crispy outside, soft inside, classic French bread with rich wheat aroma.',
        image:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
      
      // Green Leaf Market (店铺3) - 超市商品
      { id:8, merchant_id:1, store_id:3, category_id:1, name_zh:'有机蔬菜礼盒', name_en:'Organic Vegetable Box',
        price:88, original_price:120, stock:25, status:'on_sale', points_reward:9, points_redeem:20,
        sku:'MARKET-001', sub_category:'新鲜果蔬',
        description_zh:'精选有机蔬菜，无农药残留，健康安全，新鲜配送。',
        description_en:'Selected organic vegetables, pesticide-free, healthy and safe, freshly delivered.',
        image:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400' },
      { id:9, merchant_id:1, store_id:3, category_id:1, name_zh:'新鲜水果拼盘', name_en:'Fresh Fruit Platter',
        price:68, original_price:85, stock:30, status:'on_sale', points_reward:7, points_redeem:15,
        sku:'MARKET-002', sub_category:'新鲜果蔬',
        description_zh:'当季新鲜水果，营养丰富，口感鲜甜。',
        description_en:'Seasonal fresh fruits, nutritious and deliciously sweet.',
        image:'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400' },
      { id:10, merchant_id:1, store_id:3, category_id:1, name_zh:'进口零食大礼包', name_en:'Imported Snack Gift Box',
        price:128, original_price:158, stock:15, status:'on_sale', points_reward:13, points_redeem:30,
        sku:'MARKET-003', sub_category:'手工制造',
        description_zh:'精选进口零食，品种丰富，适合送礼或自用。',
        description_en:'Selected imported snacks, variety of choices, perfect for gifts or personal enjoyment.',
        image:'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400' },
      
      // Tech Hub Store (店铺4) - 电子产品
      { id:11, merchant_id:1, store_id:4, category_id:2, name_zh:'无线降噪耳机', name_en:'Wireless Noise Cancelling Headphones',
        price:899, original_price:1299, stock:20, status:'on_sale', points_reward:90, points_redeem:100,
        sku:'TECH-001', 
        description_zh:'采用主动降噪技术，沉浸式听觉体验。40小时超长续航，蓝牙5.0快速连接，舒适佩戴设计，适合长时间使用。支持有线无线双模式。',
        description_en:'Active noise cancellation technology for immersive audio experience. 40-hour battery life, Bluetooth 5.0, comfortable design for extended wear.',
        image:'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400' },
      { id:12, merchant_id:1, store_id:4, category_id:2, name_zh:'智能健康手表', name_en:'Smart Health Watch',
        price:1299, original_price:1699, stock:15, status:'on_sale', points_reward:130, points_redeem:150,
        sku:'TECH-002', 
        description_zh:'全天候健康监测，心率、血氧、睡眠追踪。50米防水，支持多种运动模式。高清AMOLED屏幕，7天长续航。',
        description_en:'24/7 health monitoring with heart rate, blood oxygen, and sleep tracking. 50m waterproof, multiple sport modes, 7-day battery life.',
        image:'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400' },
      { id:13, merchant_id:1, store_id:4, category_id:2, name_zh:'无线充电宝', name_en:'Wireless Power Bank',
        price:199, original_price:299, stock:50, status:'on_sale', points_reward:20, points_redeem:30,
        sku:'TECH-003', 
        description_zh:'20000mAh大容量，支持无线充电和快充。双USB输出，可同时为3台设备充电。轻薄便携，LED电量显示。',
        description_en:'20000mAh capacity with wireless charging and fast charge support. Dual USB output, charges 3 devices simultaneously.',
        image:'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400' },
      { id:14, merchant_id:1, store_id:4, category_id:2, name_zh:'蓝牙音箱', name_en:'Bluetooth Speaker',
        price:399, original_price:599, stock:30, status:'on_sale', points_reward:40, points_redeem:50,
        sku:'TECH-004', 
        description_zh:'360度环绕立体声，IPX7防水等级。12小时续航，支持TWS双机互联。低音增强技术，音质出色。',
        description_en:'360-degree surround sound, IPX7 waterproof. 12-hour battery, TWS pairing support, enhanced bass technology.',
        image:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400' },
      
      // Fashion Avenue (店铺5) - 服装鞋帽
      { id:15, merchant_id:1, store_id:5, category_id:3, name_zh:'专业跑步鞋', name_en:'Elite Runner Pro',
        price:499, original_price:699, stock:40, status:'on_sale', points_reward:50, points_redeem:60,
        sku:'FASHION-001', 
        description_zh:'专为竞速而打造，采用轻量化透气鞋面，提供卓越的透气性能与舒适度。让每一次奔跑都更加轻盈流畅。',
        description_en:'Built for speed with lightweight breathable upper, providing excellent ventilation and comfort for every run.',
        image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        variants: {
          colors: [
            { name_zh:'橙黑', name_en:'Orange/Black', value:'#ff6b00' },
            { name_zh:'全黑', name_en:'All Black', value:'#1a1c1c' },
            { name_zh:'红色', name_en:'Red', value:'#ba1a1a' },
            { name_zh:'灰白', name_en:'Grey/White', value:'#8e7164' }
          ],
          sizes: ['39', '40', '41', '42', '43']
        }
      },
      { id:16, merchant_id:1, store_id:5, category_id:3, name_zh:'运动休闲T恤', name_en:'Sport Casual T-Shirt',
        price:129, original_price:199, stock:60, status:'on_sale', points_reward:13, points_redeem:20,
        sku:'FASHION-002', 
        description_zh:'采用速干面料，吸湿排汗，舒适透气。简约设计，适合运动和日常穿着。',
        description_en:'Quick-dry fabric with moisture-wicking technology. Simple design suitable for sports and daily wear.',
        image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        variants: {
          colors: [
            { name_zh:'黑色', name_en:'Black', value:'#1a1c1c' },
            { name_zh:'白色', name_en:'White', value:'#ffffff' },
            { name_zh:'灰色', name_en:'Grey', value:'#8e7164' }
          ],
          sizes: ['S', 'M', 'L', 'XL', 'XXL']
        }
      },
      { id:17, merchant_id:1, store_id:5, category_id:3, name_zh:'运动裤', name_en:'Sport Pants',
        price:199, original_price:299, stock:50, status:'on_sale', points_reward:20, points_redeem:30,
        sku:'FASHION-003', 
        description_zh:'弹力面料，活动自如。多口袋设计，实用便捷。适合跑步、健身等多种运动场景。',
        description_en:'Elastic fabric for free movement. Multiple pockets design. Perfect for running, fitness and various sports.',
        image:'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400',
        variants: {
          colors: [
            { name_zh:'黑色', name_en:'Black', value:'#1a1c1c' },
            { name_zh:'深灰', name_en:'Dark Grey', value:'#5f5e5e' },
            { name_zh:'藏青', name_en:'Navy', value:'#2f3131' }
          ],
          sizes: ['S', 'M', 'L', 'XL', 'XXL']
        }
      },
      { id:18, merchant_id:1, store_id:5, category_id:3, name_zh:'运动背包', name_en:'Sport Backpack',
        price:299, original_price:399, stock:35, status:'on_sale', points_reward:30, points_redeem:40,
        sku:'FASHION-004', 
        description_zh:'大容量设计，多隔层分区。防水面料，耐磨耐用。人体工学背负系统，舒适减压。',
        description_en:'Large capacity with multiple compartments. Waterproof and durable fabric. Ergonomic carrying system.',
        image:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
      
      // Beauty & Spa Center (店铺6) - 美容护理
      { id:19, merchant_id:1, store_id:6, category_id:5, name_zh:'全天面部护理SPA', name_en:'Full Day Facial SPA',
        price:688, original_price:888, stock:10, status:'on_sale', points_reward:69, points_redeem:100,
        sku:'BEAUTY-001', 
        description_zh:'专业面部深层清洁护理，包含深层清洁、去角质、面部按摩、补水面膜等多个步骤。由资深美容师一对一服务，使用进口护肤品，让肌肤焕发光彩。',
        description_en:'Professional deep facial cleansing treatment including deep cleansing, exfoliation, facial massage, and hydrating mask. One-on-one service by experienced beauticians.',
        image:'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400' },
      { id:20, merchant_id:1, store_id:6, category_id:5, name_zh:'精油按摩护理', name_en:'Essential Oil Massage',
        price:498, original_price:698, stock:15, status:'on_sale', points_reward:50, points_redeem:80,
        sku:'BEAUTY-002', 
        description_zh:'采用天然植物精油，配合专业按摩手法，舒缓压力，放松身心。60分钟全身按摩，改善血液循环。',
        description_en:'Natural plant essential oils with professional massage techniques. 60-minute full body massage to relieve stress and improve circulation.',
        image:'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400' },
      { id:21, merchant_id:1, store_id:6, category_id:5, name_zh:'美甲套餐', name_en:'Manicure Package',
        price:188, original_price:268, stock:20, status:'on_sale', points_reward:19, points_redeem:30,
        sku:'BEAUTY-003', 
        description_zh:'专业美甲服务，包含手部护理、指甲修型、涂甲油胶等。多种款式可选，持久不掉色。',
        description_en:'Professional manicure service including hand care, nail shaping, and gel polish application. Various styles available.',
        image:'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400' },
      { id:22, merchant_id:1, store_id:6, category_id:5, name_zh:'眼部护理套餐', name_en:'Eye Care Package',
        price:298, original_price:398, stock:12, status:'on_sale', points_reward:30, points_redeem:50,
        sku:'BEAUTY-004', 
        description_zh:'针对眼部肌肤的专业护理，淡化黑眼圈、细纹。包含眼部清洁、眼膜、眼部按摩等步骤。',
        description_en:'Professional eye care treatment to reduce dark circles and fine lines. Includes eye cleansing, eye mask, and massage.',
        image:'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400' },
      
      // 匠心食坊 ShopSmart (店铺7) - 精品食材
      { id:23, merchant_id:1, store_id:7, category_id:1, name_zh:'有机番茄', name_en:'Organic Tomatoes',
        price:4.50, original_price:6.00, stock:500, status:'on_sale', points_reward:1, points_redeem:2,
        sku:'SHOP-001', sub_category:'新鲜果蔬',
        description_zh:'农场直采新鲜番茄，口感丰富，是制作沙拉的完美选择。',
        description_en:'Farm-fresh tomatoes with rich flavor, perfect for salads.',
        image:'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400' },
      { id:24, merchant_id:1, store_id:7, category_id:1, name_zh:'手工面包卷', name_en:'Artisan Bread Roll',
        price:6.25, original_price:8.00, stock:80, status:'on_sale', points_reward:1, points_redeem:3,
        sku:'SHOP-002', sub_category:'烘焙',
        description_zh:'每日新鲜烘焙，外层酥脆，内里松软，适合早餐或下午茶。',
        description_en:'Freshly baked daily, crispy outside and soft inside, perfect for breakfast or afternoon tea.',
        image:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
      { id:25, merchant_id:1, store_id:7, category_id:1, name_zh:'陈年古法芝士', name_en:'Aged Artisan Cheese',
        price:12.00, original_price:15.00, stock:30, status:'on_sale', points_reward:2, points_redeem:5,
        sku:'SHOP-003', sub_category:'手工制造',
        description_zh:'采用传统工艺，历经岁月沉淀，呈现浓郁芝香，搭配红酒更佳。',
        description_en:'Made with traditional methods, aged to perfection with rich flavor, pairs perfectly with wine.',
        image:'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400' },
      { id:26, merchant_id:1, store_id:7, category_id:1, name_zh:'预制菜盒', name_en:'Ready Meal Box',
        price:10.75, original_price:14.00, stock:100, status:'on_sale', points_reward:2, points_redeem:5,
        sku:'SHOP-004', sub_category:'手工制造',
        description_zh:'精选一流食材在家即可享受五星级美味，加热即食，方便快捷。',
        description_en:'Premium ingredients for five-star dining at home, just heat and enjoy.',
        image:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400' },
    ]);

    this._set('stores', [
      { id:1, merchant_id:1, name_zh:'Amber Roast Coffee', name_en:'Amber Roast Coffee',
        address:'市中心区 450m', rating:4.8, review_count:800, category:'Coffee',
        open_hours:'08:00 - 22:00', image:'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400' },
      { id:2, merchant_id:1, name_zh:'Golden Crust Bakery', name_en:'Golden Crust Bakery',
        address:'西区 1.2km', rating:4.9, review_count:1200, category:'Bakery',
        open_hours:'07:00 - 21:00', image:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
      { id:3, merchant_id:1, name_zh:'Green Leaf Market', name_en:'Green Leaf Market',
        address:'广场 2.4km', rating:4.7, review_count:3000, category:'Supermarket',
        open_hours:'09:00 - 23:00', image:'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' },
      { id:4, merchant_id:1, name_zh:'Tech Hub 数码港', name_en:'Tech Hub Store',
        address:'科技园区 1.8km', rating:4.9, review_count:2500, category:'Electronics',
        open_hours:'10:00 - 22:00', image:'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
      { id:5, merchant_id:1, name_zh:'Fashion Avenue 时尚大道', name_en:'Fashion Avenue',
        address:'购物中心 1.5km', rating:4.8, review_count:1800, category:'Fashion',
        open_hours:'10:00 - 21:30', image:'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400' },
      { id:6, merchant_id:1, name_zh:'Glow Beauty & Spa 焕颜美容中心', name_en:'Glow Beauty & Spa',
        address:'商业街 900m', rating:4.9, review_count:1500, category:'Beauty',
        open_hours:'10:00 - 20:00', image:'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400' },
      { id:7, merchant_id:1, name_zh:'匠心食坊', name_en:'ShopSmart',
        address:'美食大道128号, 美食区, 纽约', rating:4.8, review_count:650, category:'Supermarket',
        open_hours:'08:00 - 22:00', image:'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400' },
    ]);

    this._set('orders', [
      { id:1, order_no:'ORD-20240524-889', user_id:1, merchant_id:1,
        total_amount:899, points_used:0, points_earned:90, status:'pending_ship',
        coupon_code:'COUP-8829-4401', coupon_used:0, created_at:'2024-05-24T10:23:00' },
      { id:2, order_no:'ORD-20240524-888', user_id:1, merchant_id:1,
        total_amount:1299, points_used:200, points_earned:130, status:'shipped',
        coupon_code:'COUP-9910-2203', coupon_used:1, coupon_used_at:'2024-05-24T14:32:00',
        created_at:'2024-05-23T09:15:00' },
    ]);

    this._set('order_items', [
      { id:1, order_id:1, product_id:3, name_zh:'简约牛皮单肩包', price:899, quantity:1,
        image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', spec:'大号/礼盒装' },
      { id:2, order_id:2, product_id:2, name_zh:'Pro 降噪蓝牙耳机', price:1299, quantity:1,
        image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', spec:'标准版/延保1年' },
    ]);

    this._set('points_log', [
      { id:1, user_id:1, order_id:2, type:'earn', points:130, balance:1280, remark:'购物获得积分', created_at:'2024-05-23T09:15:00' },
      { id:2, user_id:1, order_id:2, type:'redeem', points:-200, balance:1150, remark:'积分抵扣', created_at:'2024-05-23T09:15:00' },
    ]);

    this._set('cart_items', []);
    this._set('addresses', []);
    this._set('payment_methods', []);
    this._set('notifications', []);
    this._set('settlements', [
      { id:1, merchant_id:1, settlement_no:'SETL_89230144', type:'settlement', amount:4500, status:'completed', created_at:'2024-05-20T14:23:12' },
      { id:2, merchant_id:1, settlement_no:'WDRA_22910321', type:'withdrawal', amount:-12000, status:'processing', created_at:'2024-05-19T09:15:45' },
    ]);

    localStorage.setItem('_db_initialized', '1');
  },

  // ── 重置数据库（调试用）─────────────────────────────────────
  reset() {
    // 完全清除所有数据
    localStorage.clear();
    // 重新初始化
    this.init();
    console.log('数据库已重置，用户006重置为T+3天');
  },

  // ── 确保演示用户存在 ─────────────────────────────────────────
  ensureDemoUser() {
    const users = this._get('users');
    const demoUser = users.find(u => u.phone === '13800000002');
    if (!demoUser) {
      // 如果演示用户不存在，创建它
      users.push({
        id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
        phone: '13800000002',
        password: 'user123',
        nickname: '测试用户',
        level: 'gold',
        points: 1280,
        avatar: '',
        member_status: 'new',
        is_trial_member: false,
        trial_expire_at: null,
        trial_claimed: false
      });
      this._set('users', users);
    } else if (!demoUser.password) {
      // 如果演示用户存在但没有密码，添加密码
      demoUser.password = 'user123';
      this._set('users', users);
    }
  },
  
  // ── 更新用户006的到期时间（每天自动递减）─────────────────────
  updateUser006TrialTime() {
    const users = this._get('users');
    const user006 = users.find(u => u.phone === '13800000006');
    
    if (!user006) return;
    
    // 获取上次更新的日期
    const lastUpdateDate = localStorage.getItem('user006_last_update_date');
    const today = new Date().toDateString();
    
    // 如果是同一天，不更新
    if (lastUpdateDate === today) return;
    
    // 获取当前剩余天数
    const now = new Date();
    const expireAt = new Date(user006.trial_expire_at);
    const diffDays = Math.ceil((expireAt - now) / (24 * 60 * 60 * 1000));
    
    let newDaysRemaining;
    
    if (diffDays <= 0 || diffDays > 3) {
      // 如果已过期或超过3天，重置为3天
      newDaysRemaining = 3;
    } else {
      // 递减：3 -> 2 -> 1 -> 3
      newDaysRemaining = diffDays - 1;
      if (newDaysRemaining <= 0) {
        newDaysRemaining = 3; // 循环回到3天
      }
    }
    
    // 计算新的到期时间
    const newExpireAt = new Date(now.getTime() + newDaysRemaining * 24 * 60 * 60 * 1000);
    const newCreatedAt = new Date(now.getTime() - (7 - newDaysRemaining) * 24 * 60 * 60 * 1000);
    
    // 更新用户006
    user006.trial_expire_at = newExpireAt.toISOString();
    user006.created_at = newCreatedAt.toISOString();
    user006.trial_claimed_at = newCreatedAt.toISOString();
    
    this._set('users', users);
    
    // 记录今天已更新
    localStorage.setItem('user006_last_update_date', today);
    
    console.log(`用户006已更新：还剩${newDaysRemaining}天`);
  },

  // ── 初始化系统配置 ─────────────────────────────────────────
  initSystemConfig() {
    if (!localStorage.getItem('system_config')) {
      const defaultConfig = {
        // 积分计算规则
        pointsRatio: 0.1,
        pointsDeduction: 0.01,
        maxDeductionRatio: 0.5,
        
        // 会员等级权益
        bronzeMultiplier: 1.0,
        silverMultiplier: 1.2,
        goldMultiplier: 1.5,
        platinumMultiplier: 2.0,
        
        // 新用户权益
        newUserPoints: 100,
        firstOrderDiscount: 10,
        trialDays: 7,
        
        // 流失召回
        churnDays: 90,
        recallCoupon: 20,
        recallPoints: 200,
        
        // 活动参数
        holidayMultiplier: 2.0,
        discountThreshold: 100,
        discountAmount: 20,
        
        // 转正优惠
        upgradeOrders: 3,
        upgradeAmount: 500,
        upgradeBonus: 500,
        
        // 权益计算器配置
        avgMemberDiscount: 0.95, // 平均会员折扣率
        shippingFeePerOrder: 8,
        avgOrdersPerYear: 12,
        returnInsurancePerYear: 50,
        
        // 会员价格配置
        memberYearlyPrice: 199,
        trialLimitedPrice: 169,
        trialLimitedHours: 48,
        
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('system_config', JSON.stringify(defaultConfig));
    }
  },

  // ── 通用 CRUD ──────────────────────────────────────────────
  findAll(table) { return this._get(table); },
  findById(table, id) { return this._get(table).find(r => r.id === id) || null; },
  findWhere(table, fn) { return this._get(table).filter(fn); },
  insert(table, data) {
    const rows = this._get(table);
    const row = { ...data, id: this._nextId(rows), created_at: new Date().toISOString() };
    rows.push(row);
    this._set(table, rows);
    return row;
  },
  update(table, id, data) {
    const rows = this._get(table);
    const idx = rows.findIndex(r => r.id === id);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...data };
    this._set(table, rows);
    return rows[idx];
  },
  remove(table, id) {
    const rows = this._get(table).filter(r => r.id !== id);
    this._set(table, rows);
  },

  // ── 业务方法 ───────────────────────────────────────────────
  getCurrentUser() {
    const id = parseInt(localStorage.getItem('user_id'));
    return id ? this.findById('users', id) : null;
  },
  getCurrentMerchant() {
    const id = parseInt(localStorage.getItem('merchant_id'));
    return id ? this.findById('merchants', id) : null;
  },
  loginMerchant(phone, password) {
    const m = this.findWhere('merchants', r => r.phone === phone && r.password === password)[0];
    if (m) localStorage.setItem('merchant_id', m.id);
    return m || null;
  },
  loginUser(phone, password) {
    // 带密码登录
    const u = this.findWhere('users', r => r.phone === phone && r.password === password)[0];
    if (u) localStorage.setItem('user_id', u.id);
    return u || null;
  },
  registerUser(phone, password, nickname) {
    if (this.findWhere('users', r => r.phone === phone).length) return null; // 已存在
    
    // 自动发放7天准会员体验
    const now = new Date();
    const config = JSON.parse(localStorage.getItem('system_config') || '{}');
    const trialDays = config.trialDays || 7;
    const trialExpireAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    
    const u = this.insert('users', { 
      phone, 
      password, 
      nickname: nickname || phone.slice(-4), 
      level:'bronze', 
      points: config.newUserPoints || 100,
      member_status: 'trial',
      is_trial_member: true,
      trial_expire_at: trialExpireAt.toISOString(),
      trial_claimed: true,
      trial_claimed_at: now.toISOString(),
      is_formal_member: false,
      member_expire_at: null
    });
    localStorage.setItem('user_id', u.id);
    return u;
  },
  logoutUser() {
    localStorage.removeItem('user_id');
  },
  getCartCount(userId) {
    return this.findWhere('cart_items', r => r.user_id === userId)
      .reduce((s, r) => s + r.quantity, 0);
  },
  addToCart(userId, productId, quantity = 1, spec = '') {
    const items = this._get('cart_items');
    const idx = items.findIndex(r => r.user_id === userId && r.product_id === productId && r.spec === spec);
    if (idx > -1) {
      items[idx].quantity += quantity;
      this._set('cart_items', items);
      return items[idx];
    }
    return this.insert('cart_items', { user_id: userId, product_id: productId, quantity, spec });
  },
  createOrder(userId, merchantId, items, pointsUsed = 0, useMemberPrice = false) {
    const orderNo = 'ORD-' + Date.now();
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const pointsEarned = Math.floor(total / 10);
    const discount = pointsUsed * 0.01;
    
    // 检查是否享受会员价或准会员价
    const user = this.findById('users', userId);
    const isMember = this.isMemberActive(userId);
    const shippingFee = isMember ? 0 : 8; // 会员包邮
    
    const order = this.insert('orders', {
      order_no: orderNo, user_id: userId, merchant_id: merchantId,
      total_amount: total - discount + shippingFee, 
      points_used: pointsUsed,
      points_earned: pointsEarned, 
      status: 'paid',
      coupon_code: 'COUP-' + Math.random().toString(36).slice(2,10).toUpperCase(),
      coupon_used: 0,
      is_member_order: isMember,
      shipping_fee: shippingFee
    });
    items.forEach(item => this.insert('order_items', { ...item, order_id: order.id }));
    // 积分变动
    const newPoints = user.points - pointsUsed + pointsEarned;
    this.update('users', userId, { points: newPoints });
    if (pointsUsed > 0) this.insert('points_log', { user_id: userId, order_id: order.id, type:'redeem', points:-pointsUsed, balance: user.points - pointsUsed, remark:'积分抵扣' });
    this.insert('points_log', { user_id: userId, order_id: order.id, type:'earn', points: pointsEarned, balance: newPoints, remark:'购物获得积分' });
    // 清空购物车
    const cart = this._get('cart_items').filter(r => r.user_id !== userId);
    this._set('cart_items', cart);
    return order;
  },
  
  // ── 会员相关方法 ───────────────────────────────────────────
  isMemberActive(userId) {
    const user = this.findById('users', userId);
    if (!user) return false;
    
    const now = new Date();
    
    // 检查正式会员
    if (user.is_formal_member && user.member_expire_at) {
      if (new Date(user.member_expire_at) > now) {
        return true;
      }
    }
    
    // 检查准会员
    if (user.is_trial_member && user.trial_expire_at) {
      if (new Date(user.trial_expire_at) > now) {
        return true;
      }
    }
    
    return false;
  },
  
  getTrialRemainingTime(userId) {
    const user = this.findById('users', userId);
    if (!user || !user.is_trial_member || !user.trial_expire_at) return null;
    
    const now = new Date();
    const expireAt = new Date(user.trial_expire_at);
    const diff = expireAt - now;
    
    if (diff <= 0) return { expired: true, days: 0, hours: 0 };
    
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    return { expired: false, days, hours, totalHours: Math.floor(diff / (60 * 60 * 1000)) };
  },
  
  // ── 站内消息系统 ───────────────────────────────────────────
  getNotifications(userId) {
    const notifications = this._get('notifications');
    return notifications.filter(n => n.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  
  getUnreadNotificationCount(userId) {
    const notifications = this._get('notifications');
    return notifications.filter(n => n.user_id === userId && !n.is_read).length;
  },
  
  markNotificationAsRead(notificationId) {
    const notifications = this._get('notifications');
    const idx = notifications.findIndex(n => n.id === notificationId);
    if (idx > -1) {
      notifications[idx].is_read = true;
      notifications[idx].read_at = new Date().toISOString();
      this._set('notifications', notifications);
      return notifications[idx];
    }
    return null;
  },
  
  markAllNotificationsAsRead(userId) {
    const notifications = this._get('notifications');
    notifications.forEach(n => {
      if (n.user_id === userId && !n.is_read) {
        n.is_read = true;
        n.read_at = new Date().toISOString();
      }
    });
    this._set('notifications', notifications);
  },
  
  createNotification(userId, type, title, content, actionUrl = null) {
    return this.insert('notifications', {
      user_id: userId,
      type, // 'trial_reminder', 'trial_expiring', 'trial_expired', 'promotion', 'system'
      title,
      content,
      action_url: actionUrl,
      is_read: false,
      read_at: null
    });
  },
  
  // 检查并生成准会员到期提醒
  checkAndCreateTrialReminders(userId) {
    const user = this.findById('users', userId);
    if (!user || !user.is_trial_member || !user.trial_expire_at) return;
    
    const trialTime = this.getTrialRemainingTime(userId);
    if (!trialTime || trialTime.expired) return;
    
    const notifications = this.getNotifications(userId);
    const config = JSON.parse(localStorage.getItem('system_config') || '{}');
    const trialPrice = config.trialLimitedPrice || 169;
    const normalPrice = config.memberYearlyPrice || 199;
    
    // T-3天提醒（第4天）
    if (trialTime.days === 3 && !notifications.some(n => n.type === 'trial_reminder_3days')) {
      this.createNotification(
        userId,
        'trial_reminder_3days',
        '准会员体验还剩3天',
        `您的准会员体验还剩3天，已为您节省不少费用。开通正式会员享更多权益！`,
        'membership.html'
      );
    }
    
    // T-1天提醒（第6天）
    if (trialTime.days === 1 && !notifications.some(n => n.type === 'trial_reminder_1day')) {
      this.createNotification(
        userId,
        'trial_reminder_1day',
        '会员体验明天到期',
        `您的会员体验将在明天到期，限时优惠开通仅需¥${trialPrice}（原价¥${normalPrice}）`,
        'membership.html'
      );
    }
    
    // T-0天提醒（第7天）
    if (trialTime.days === 0 && trialTime.hours > 0 && !notifications.some(n => n.type === 'trial_reminder_today')) {
      this.createNotification(
        userId,
        'trial_reminder_today',
        '今天到期！限时优惠即将失效',
        `您的准会员体验今天到期！限时优惠¥${trialPrice}即将失效，立即开通享受全年权益。`,
        'membership.html'
      );
    }
  },
  
  claimTrialMembership(userId) {
    const user = this.findById('users', userId);
    if (!user) return { success: false, message: '用户不存在' };
    if (user.trial_claimed) return { success: false, message: '您已领取过7天体验' };
    
    const now = new Date();
    const config = JSON.parse(localStorage.getItem('system_config') || '{}');
    const trialDays = config.trialDays || 7;
    const trialExpireAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    
    this.update('users', userId, {
      is_trial_member: true,
      trial_expire_at: trialExpireAt.toISOString(),
      trial_claimed: true,
      trial_claimed_at: now.toISOString()
    });
    
    return { success: true, expireAt: trialExpireAt };
  },
  
  upgradeToPaidMember(userId, months = 12) {
    const user = this.findById('users', userId);
    if (!user) return { success: false, message: '用户不存在' };
    
    const now = new Date();
    const expireAt = new Date(now.getTime() + months * 30 * 24 * 60 * 60 * 1000);
    
    this.update('users', userId, {
      is_formal_member: true,
      member_expire_at: expireAt.toISOString(),
      is_trial_member: false, // 转正后准会员身份结束
      upgraded_at: now.toISOString()
    });
    
    return { success: true, expireAt };
  },
  
  calculateMemberSavings(annualSpending) {
    const config = JSON.parse(localStorage.getItem('system_config') || '{}');
    
    const avgDiscount = config.avgMemberDiscount || 0.95;
    const shippingFee = config.shippingFeePerOrder || 8;
    const ordersPerYear = config.avgOrdersPerYear || 12;
    const returnInsurance = config.returnInsurancePerYear || 50;
    
    // 商品价差节省
    const productSavings = annualSpending * (1 - avgDiscount);
    
    // 运费节省
    const shippingSavings = shippingFee * ordersPerYear;
    
    // 退换无忧节省
    const returnSavings = returnInsurance;
    
    const totalSavings = productSavings + shippingSavings + returnSavings;
    
    return {
      total: Math.round(totalSavings),
      productSavings: Math.round(productSavings),
      shippingSavings: Math.round(shippingSavings),
      returnSavings: Math.round(returnSavings)
    };
  },
  verifyCoupon(merchantId, code) {
    const orders = this._get('orders');
    const idx = orders.findIndex(r => r.merchant_id === merchantId && r.coupon_code === code && r.coupon_used === 0);
    if (idx === -1) return null;
    orders[idx].coupon_used = 1;
    orders[idx].coupon_used_at = new Date().toISOString();
    orders[idx].status = 'completed';
    this._set('orders', orders);
    return orders[idx];
  },
};

// 语言工具
const I18N = {
  lang: localStorage.getItem('lang') || 'zh',
  t(zh, en) { return this.lang === 'zh' ? zh : en; },
  toggle() {
    this.lang = this.lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('lang', this.lang);
    location.reload();
  },
  applyAll() {
    document.querySelectorAll('[data-zh]').forEach(el => {
      el.textContent = this.lang === 'zh' ? el.dataset.zh : (el.dataset.en || el.dataset.zh);
    });
    document.querySelectorAll('[data-ph-zh]').forEach(el => {
      el.placeholder = this.lang === 'zh' ? el.dataset.phZh : (el.dataset.phEn || el.dataset.phZh);
    });
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = this.lang === 'zh' ? 'EN' : '中';
  }
};
