-- ============================================================
-- Vibrant Commerce System - Database Schema
-- 当前版本: SQLite (本地) | 可切换至 MySQL / PostgreSQL
-- ============================================================

-- 用户表 (客户)
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    phone       TEXT UNIQUE NOT NULL,
    nickname    TEXT,
    avatar      TEXT,
    level       TEXT DEFAULT 'bronze',  -- bronze / silver / gold / platinum
    points      INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 商家表
CREATE TABLE IF NOT EXISTS merchants (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    phone       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,           -- bcrypt hash
    store_name  TEXT NOT NULL,
    store_no    TEXT UNIQUE,
    address     TEXT,
    logo        TEXT,
    balance     REAL DEFAULT 0,
    frozen      REAL DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 商品分类
CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name_zh     TEXT NOT NULL,
    name_en     TEXT NOT NULL,
    icon        TEXT,
    sort_order  INTEGER DEFAULT 0
);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id     INTEGER NOT NULL,
    category_id     INTEGER,
    name_zh         TEXT NOT NULL,
    name_en         TEXT,
    description     TEXT,
    price           REAL NOT NULL,
    original_price  REAL,
    stock           INTEGER DEFAULT 0,
    image           TEXT,
    status          TEXT DEFAULT 'on_sale',  -- on_sale / hidden / sold_out
    points_reward   INTEGER DEFAULT 0,       -- 购买获得积分
    points_redeem   INTEGER DEFAULT 0,       -- 可用积分抵扣
    sku             TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no        TEXT UNIQUE NOT NULL,
    user_id         INTEGER NOT NULL,
    merchant_id     INTEGER NOT NULL,
    total_amount    REAL NOT NULL,
    points_used     INTEGER DEFAULT 0,
    points_earned   INTEGER DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    status          TEXT DEFAULT 'pending_payment',
    -- pending_payment / paid / pending_ship / shipped / completed / refunding / refunded / cancelled
    coupon_code     TEXT,                    -- 核销码
    coupon_used     INTEGER DEFAULT 0,       -- 0=未核销 1=已核销
    coupon_used_at  DATETIME,
    remark          TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at         DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);

-- 订单明细
CREATE TABLE IF NOT EXISTS order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    INTEGER NOT NULL,
    product_id  INTEGER NOT NULL,
    name_zh     TEXT NOT NULL,
    name_en     TEXT,
    price       REAL NOT NULL,
    quantity    INTEGER NOT NULL,
    image       TEXT,
    spec        TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 积分流水
CREATE TABLE IF NOT EXISTS points_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    order_id    INTEGER,
    type        TEXT NOT NULL,  -- earn / redeem / expire / admin_adjust
    points      INTEGER NOT NULL,
    balance     INTEGER NOT NULL,
    remark      TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 结算流水 (商家)
CREATE TABLE IF NOT EXISTS settlements (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id     INTEGER NOT NULL,
    settlement_no   TEXT UNIQUE NOT NULL,
    type            TEXT NOT NULL,  -- settlement / withdrawal
    amount          REAL NOT NULL,
    status          TEXT DEFAULT 'pending',  -- pending / processing / completed / failed
    remark          TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at    DATETIME,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);

-- 购物车
CREATE TABLE IF NOT EXISTS cart_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    product_id  INTEGER NOT NULL,
    quantity    INTEGER DEFAULT 1,
    spec        TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 门店 (Life Circle)
CREATE TABLE IF NOT EXISTS stores (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id INTEGER NOT NULL,
    name_zh     TEXT NOT NULL,
    name_en     TEXT,
    address     TEXT,
    lat         REAL,
    lng         REAL,
    distance    REAL,  -- km, 动态计算
    rating      REAL DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    image       TEXT,
    open_hours  TEXT,
    category    TEXT,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);

-- ============================================================
-- 初始化种子数据
-- ============================================================

INSERT OR IGNORE INTO categories (id, name_zh, name_en, icon) VALUES
(1, '食品', 'Foods', 'restaurant'),
(2, '电子', 'Electronics', 'devices'),
(3, '服装', 'Fashion', 'apparel'),
(4, '家居', 'Home', 'home_iot_device'),
(5, '美妆', 'Beauty', 'face_6'),
(6, '运动', 'Sports', 'sports_soccer');

INSERT OR IGNORE INTO merchants (id, name, phone, password, store_name, store_no, address) VALUES
(1, '管理员', '13800000001', '$2b$10$demo_hash', 'Vibrant Store', 'VS-102', '示例地址 128号');

INSERT OR IGNORE INTO users (id, phone, nickname, level, points) VALUES
(1, '13800000002', '测试用户', 'gold', 1280);
