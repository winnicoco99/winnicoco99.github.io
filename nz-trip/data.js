/* ══════════════════════════════════════════════════════════════
   新西兰南岛 · 12 晚  行程数据
   日期：2026-12-22 抵达 → 2027-01-03 离境
   航线：基督城进、基督城出，顺时针一圈
   ══════════════════════════════════════════════════════════════ */

const TRIP = {
  title: '新西兰南岛',
  subtitle: '12 晚 · 8 个住宿点 · 约 1700 km',
  dateRange: '2026.12.22 — 2027.1.3',
  start: '2026-12-22T08:35:00+13:00',
  end: '2027-01-03T22:30:00+13:00',
  travelers: 2,
  mode: '自驾（右舵左侧行驶）',
  hero: '基督城落地，穿过麦肯奇高地的奶蓝色湖泊，在瓦纳卡过圣诞，皇后镇跨年前的最后一站放到但尼丁。',
  heroSub: '一天最多开三小时，不赶路。地图上的虚线是建议路线，实际随时可改。'
};

/* ── 住宿节点（均未预订）────────────────────────────── */
const STAYS = [
  {
    city: '基督城 Christchurch', nights: '12/22 — 12/23', n: 1,
    area: '市中心 / 大教堂广场一带',
    why: '落地第一晚只做一件事：把时差倒过来。选能步行到 Riverside Market 的位置，车停进酒店就不用动了。',
    type: '酒店（含停车位）',
    price: '约 NZ$180–260 / 晚',
    booked: false,
    lat: -43.5306, lng: 172.6358,
    search: 'Christchurch CBD hotel parking',
    tip: 'CBD 停车又贵又难找，订之前确认含车位。早上八点开始贴条，别抱侥幸。'
  },
  {
    city: '库克山 Mt Cook', nights: '12/23 — 12/24', n: 1,
    area: 'Mt Cook Village / Glentanner',
    why: '住村里是为了省掉来回 210 公里的折返，早上推门就是雪山。这里也是暗夜保护区，晚上看星星不比蒂卡波差，人还少。',
    type: '山景酒店 / 度假营地',
    price: '约 NZ$380–560 / 晚',
    booked: false,
    lat: -43.7344, lng: 170.0958,
    search: 'Mount Cook Village accommodation',
    tip: '村里只有 Hermitage 和 Mt Cook Lodge 两家，加 Glentanner 营地，总共几百张床。圣诞前一周是全年最紧，现在就该订。'
  },
  {
    city: '瓦纳卡 Wanaka', nights: '12/24 — 12/26', n: 2,
    area: '镇中心 / 湖滨步行圈',
    why: '圣诞两晚不挪窝。瓦纳卡周边能徒步、能打枪、能跳伞，价格比皇后镇低一截，玩同样的项目省下来的钱够吃两顿好的。',
    type: '公寓（带厨房）',
    price: '约 NZ$260–420 / 晚',
    booked: false,
    lat: -44.6942, lng: 169.1367,
    search: 'Wanaka holiday home',
    tip: '带厨房是刚需——圣诞当天全镇餐馆基本关门，自己做饭是唯一的选项。'
  },
  {
    city: '皇后镇 Queenstown', nights: '12/26 — 12/28', n: 2,
    area: '市中心步行圈（Shotover St / Beach St）',
    why: '两晚，够走一趟格林诺奇和箭镇，晚上回镇上吃饭。12/31 跨年不在这里，房价能便宜一半。',
    type: '公寓 / 精品酒店',
    price: '约 NZ$380–600 / 晚',
    booked: false,
    lat: -45.0312, lng: 168.6626,
    search: 'Queenstown central apartment',
    tip: '避开 12/31 那晚，价格能差一倍。26 号入住时镇上是节后最松弛的时候。'
  },
  {
    city: '蒂阿瑙 Te Anau', nights: '12/28 — 12/30', n: 2,
    area: '湖滨 / 镇中心',
    why: '两晚是为峡湾留的。第一天到了休整，第二天一整天进峡湾，不用摸黑赶路。',
    type: '汽车旅馆 / 公寓',
    price: '约 NZ$200–300 / 晚',
    booked: false,
    lat: -45.4144, lng: 167.7181,
    search: 'Te Anau accommodation',
    tip: '蒂阿瑙是去峡湾的唯一落脚点，元旦前后房很紧。镇子很小，步行十分钟能横穿。'
  },
  {
    city: '但尼丁 Dunedin', nights: '12/30 — 1/1', n: 2,
    area: '八角广场 / 乔治街一带',
    why: '跨年两晚。白天看建筑和半岛，晚上走回住处。但尼丁是南岛最有城市感的地方，值得慢下来。',
    type: '酒店 / 公寓',
    price: '约 NZ$180–280 / 晚',
    booked: false,
    lat: -45.8788, lng: 170.5028,
    search: 'Dunedin Octagon hotel',
    tip: '跨年夜餐厅必须提前订，Octagon 周边的位置一周前就满了。'
  },
  {
    city: '奥马鲁 Oamaru', nights: '1/1 — 1/2', n: 1,
    area: '历史街区 / 海港附近',
    why: '一晚只为企鹅。蓝企鹅归巢是日落之后，看完就睡，第二天北上回基督城。',
    type: '旅馆 / B&B',
    price: '约 NZ$170–260 / 晚',
    booked: false,
    lat: -45.0972, lng: 170.9708,
    search: 'Oamaru accommodation',
    tip: '企鹅归巢门票要单独买，旺季当天很可能售完，提前在网上订好场次。'
  },
  {
    city: '基督城 Christchurch（返程）', nights: '1/2 — 1/3', n: 1,
    area: '机场 20 分钟车程内',
    why: '最后一晚，靠近机场省心。第二天白天进城逛，傍晚还车。',
    type: '机场周边酒店',
    price: '约 NZ$180–260 / 晚',
    booked: false,
    lat: -43.5306, lng: 172.6358,
    search: 'Christchurch airport hotel',
    tip: '不用住机场里面，Riccarton 或 CBD 都行，开车 15–20 分钟。'
  }
];

/* ── 交通与门票 ────────────────────────────────────── */
const BOOKINGS = [
  {
    group: '航班（已出票）',
    urgent: '已完成',
    items: [
      { name: '上海虹桥 SHA → 广州 CAN', meta: '12/21 周一 11:50–14:20 · CZ3524 · 经济舱',
        note: '虹桥 T2 出发，行李直挂到基督城。中转 1 小时 55 分。', status: '已订',
        link: 'https://www.csair.com' },
      { name: '广州 CAN → 基督城 CHC', meta: '12/21 16:15 → 12/22 08:35 · CZ8373 · 飞行 11h20m',
        note: '次日早上到，落地就能开始，不浪费一天。', status: '已订',
        link: 'https://www.csair.com' },
      { name: '基督城 CHC → 广州 CAN', meta: '1/3 周日 22:30 → 1/4 05:10 · CZ618',
        note: '最后一晚在飞机上，1/3 白天还能在基督城逛一整天。', status: '已订',
        link: 'https://www.csair.com' },
      { name: '广州 CAN → 上海虹桥 SHA', meta: '1/4 07:00–09:15 · CZ3533',
        note: '中转 1 小时 50 分，行李直挂。', status: '已订',
        link: 'https://www.csair.com' }
    ]
  },
  {
    group: '租车',
    urgent: '高',
    items: [
      { name: '基督城机场取车 / 还车（12 天）', meta: '12/22 09:30 取 → 1/3 18:00 还',
        note: '同机场取还，没有异地还车费。SUV 或旅行车，建议全险（新西兰碎石路多，挡风玻璃和保险杠最容易伤）。需要 NZTA 驾照翻译件。', status: '未订',
        link: 'https://www.rentalcars.com' }
    ]
  },
  {
    group: '必订体验',
    urgent: '高',
    items: [
      { name: '米尔福德峡湾游船（2 人）', meta: '12/29 上午场 · Nature Cruise 约 2 小时',
        note: '从蒂阿瑙开车 2 小时到码头，订 10:30 前后的班次，当天来回。旺季现场买不到票。', status: '未订',
        link: 'https://www.realnz.com' },
      { name: '奥马鲁蓝企鹅归巢', meta: '1/1 晚 21:00 前后 · 需按日落时间选场次',
        note: '座位分区，前排贵但看得清。日落后企鹅上岸，禁止拍照。', status: '未订',
        link: 'https://www.penguins.co.nz' },
      { name: '但尼丁奥塔哥半岛（信天翁 / 企鹅）', meta: '12/31 白天 · 半日团或自驾',
        note: 'Taiaroa Head 是大陆唯一信天翁繁殖地。自驾走 Portobello Road 风景很好，但路窄弯多。', status: '未订',
        link: 'https://www.albatross.org.nz' },
      { name: '皇后镇天空缆车 + Luge', meta: '12/26 下午',
        note: '缆车上去看全景，Luge 滑板车可以买三次的套票。傍晚人多，早点去。', status: '未订',
        link: 'https://www.skyline.co.nz' },
      { name: '蒂阿瑙萤火虫洞', meta: '12/28 下午 · 约 2.5 小时含船',
        note: '坐船过湖再进洞，洞里不能说话不能拍照。可选，不去就在湖边走走。', status: '未订',
        link: 'https://www.realnz.com' }
    ]
  },
  {
    group: '建议但不必抢',
    urgent: '中',
    items: [
      { name: '瓦纳卡跳伞 / 开飞机', meta: '12/25 或 12/26 上午',
        note: '瓦纳卡比皇后镇便宜 10–20%。天气决定，当天早上再定。', status: '未订',
        link: 'https://www.skydivewanaka.com' },
      { name: '库克山冰湖船 / 直升机', meta: '12/23 下午',
        note: 'Hooker Valley 徒步是免费的，这个看预算。直升机看冰川要 300 起。', status: '未订',
        link: 'https://www.hermitage.co.nz' }
    ]
  }
];

/* ── 行前清单 ────────────────────────────────────── */
const CHECKLIST = [
  { group: '证件', items: ['护照（有效期 > 6 个月）','NZETA 电子签','驾照原件','NZTA 驾照翻译件','机票行程单','旅行保险单','租车预订单'] },
  { group: '钱与通讯', items: ['信用卡（带芯片，开通境外）','少量纽币现金','手机国际漫游或当地卡','离线地图已下载'] },
  { group: '开车', items: ['右舵车练习（停车场绕两圈）','加油 App（Gaspy）','停车 App（PayMyPark）','确认租车含全险'] },
  { group: '衣物', items: ['防风外套（冲锋衣）','薄羽绒或抓绒','徒步鞋','泳衣（温泉 / 湖边）','墨镜','帽子'] },
  { group: '药品', items: ['防晒霜 SPF50+','驱虫喷雾','常用药（感冒 / 肠胃 / 止痛）','创可贴'] },
  { group: '电子', items: ['转换插头（国标 → 八字）','充电宝','车充','相机 / 备用电池'] }
];

const NOTE_SECTIONS = [
  {
    title: '为什么这样排',
    items: [
      '落地当天不跑长途。飞了 20 小时，第一晚只做三件事：取车、进城、吃饭。',
      '圣诞两天钉在瓦纳卡不动。12/25 全国闭店，搬家等于没饭吃。',
      '库克山住一晚而不是当天往返，省掉 210 公里折返，早上推门就是雪山。',
      '皇后镇只给两晚，因为跨年放在了但尼丁，避开了 12/31 的房价峰值。',
      '最后两天倒着排：奥马鲁一晚看企鹅，基督城一晚缓冲，1/3 白天还能逛。'
    ]
  },
  {
    title: '被砍掉的',
    items: [
      '西海岸冰川（Franz Josef / Fox）。要绕 400 公里，12 晚装不下。',
      '凯库拉。在基督城北边，往返 5 小时车程，要占两天。',
      '蒂卡波住宿。小镇被住满且贵，只路过拍照，晚上到库克山看星。',
      '特威泽尔（Twizel）。住宿条件一般，不如往前开到库克山。',
      '峡湾如果天气不好，改成蒂阿瑙湖边 + 萤火虫洞，不要硬闯山路。'
    ]
  },
  {
    title: '天气敏感点',
    items: [
      '库克山和峡湾是两处最看天的地方。库克山阴天就看不到雪峰，峡湾下雨反而是瀑布最多的时候。',
      '12 月底南岛白天 20–25℃，晚上 8–12℃。峡湾和库克山更冷，带一件薄羽绒。',
      '紫外线极强，阴天也要涂防晒。新西兰臭氧层薄，晒伤比想象中快。',
      '南岛夏天晚上 9 点半后才天黑，每天可玩时间比行程表上写的长。'
    ]
  },
  {
    title: '第一天与最后一天',
    items: [
      '12/22 08:35 落地，取车约 1 小时。别急着开远，CBD 住下，下午逛 Riverside Market 和植物园。',
      '租车验车时拍一圈视频，重点拍前挡风玻璃、四个轮毂、车顶。新西兰碎石路多，还车时容易扯皮。',
      '1/3 白天在基督城闲逛，16:00 加满油，18:00 还车，20:30 到机场，22:30 起飞。',
      '还车前 24 小时加满油，机场附近加油站在 Russley 或 Fendalton。'
    ]
  }
];

/* ── 预算分类（单位 NZD，2 人合计）────────────────── */
const BUDGET_CATS = [
  { k:'flight', name:'机票',   icon:`<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>`, plan: 3820, note:'上海往返基督城，2 人含税（已出票 ¥16,428）' },
  { k:'stay',   name:'住宿',   icon:`<path d="M3 20V9l9-6 9 6v11"/><path d="M9 20v-6h6v6"/>`, plan: 3370, note:'12 晚，含圣诞峰值，8 个落脚点' },
  { k:'car',    name:'租车',   icon:`<path d="M5 17h14"/><path d="M6.5 17v2"/><path d="M17.5 17v2"/><path d="M4 17v-4l2-5h12l2 5v4z"/><circle cx="7.5" cy="14" r="1"/><circle cx="16.5" cy="14" r="1"/>`, plan: 1620, note:'12 天 SUV + 全险，同机场取还' },
  { k:'exp',    name:'体验',   icon:`<path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4z"/><path d="M13 7v10" stroke-dasharray="2 2"/>`, plan: 910, note:'峡湾船 + 企鹅 + 半岛 + 缆车 + 萤火虫洞' },
  { k:'fuel',   name:'油费',   icon:`<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M3 21h12"/><path d="M4 10h10"/><path d="M14 8h2l3 3v7a2 2 0 0 0 2 2"/>`, plan: 240, note:'约 1700 km，91 号汽油' },
  { k:'food',   name:'吃饭',   icon:`<path d="M6 3v8a2 2 0 0 0 4 0V3"/><path d="M8 11v10"/><path d="M17 3c-1.5 1.5-2 3.5-2 6 0 2 .5 3 2 3s2-1 2-3c0-2.5-.5-4.5-2-6z"/><path d="M17 12v9"/>`, plan: 1430, note:'13 天，含圣诞和跨年两顿贵的' },
  { k:'other',  name:'其他',   icon:`<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>`, plan: 500, note:'门票 / 停车 / 伴手礼' }
];
const DEFAULT_RATE = 4.3;   // 1 NZD ≈ ? CNY，可在页面里改
const TRIP_PEOPLE = 2;
const TRIP_DAYS = 13;
/* ── 每日行程 ───────────────────────────────────── */
const DAYS = [
  {
    id: 0, label: '总览', color: '#0071e3', locations: []
  },

  /* ─────────── D1 ─────────── */
  {
    id: 1, label: 'D1 · 12/22', date: '12月22日 周二', title: '落地 · 基督城',
    color: '#5b8def', region: 'Canterbury',
    drive: '机场 → CBD 约 12 km / 25 分钟',
    stay: '基督城 CBD',
    summary: '飞了 20 小时，今天不做任何需要体力的事。取车、进城、吃饭、睡觉。',
    route: '广州 → 基督城 08:35 → 取车 → CBD 放行李 → Riverside Market → 植物园 → 早睡',
    weather: '夏季 13–23℃，傍晚有风',
    locations: [
      { name: '基督城机场 取车', lat: -43.4852, lng: 172.5355, type: 'transport', time: '09:30',
        desc: '国际到达出来步行 5 分钟到租车区。验车时绕车拍一圈视频，重点拍前挡风玻璃、四个轮毂和车顶。',
        detail: '驾照原件 + NZTA 翻译件 + 护照，三样一起递。确认三件事：油箱政策（满还满还是预付）、是否含全险、有没有里程限制。\n右舵车：雨刷和转向灯位置是反的，先在停车场里绕两圈再出闸。出闸后靠左行驶，环岛让右。',
        pay: { card: 1, cash: 0 } },
      { name: 'Riverside Market 午餐', lat: -43.5339, lng: 172.6340, type: 'food', time: '12:00',
        desc: '落地第一顿不用想。室内市场，汉堡、生蚝、亚洲菜、咖啡都有，晚上 8 点后陆续收摊。',
        budget: 'NZ$25–40 / 人',
        detail: '推荐：Bacon Bros 的汉堡、市场里的新鲜生蚝、Roots 的素食碗。\n市场外侧沿 Avon 河有露天座位，夏天坐着吃很舒服。',
        pay: { card: 1, cash: 0.5 } },
      { name: '基督城植物园 + 雅芳河', lat: -43.5306, lng: 172.6214, type: 'spot', time: '14:00',
        desc: '免费，走一圈刚好消食。夏天玫瑰园正开，雅芳河上有人撑篙（Punting），想坐就 30 分钟一趟。',
        detail: '从 Riverside Market 步行 15 分钟到。园区很大，不用走完，走到玫瑰园和温室就够。\n撑篙船 NZ$40/人左右，看心情，不坐也不遗憾。' },
      { name: '纸板大教堂', lat: -43.5315, lng: 172.6370, type: 'spot', time: '16:00',
        desc: '2011 年地震后建的过渡教堂，硬纸板管做梁，能用 50 年。免费进，五分钟看完。',
        detail: '就在 Cathedral Square，从植物园走回来顺路。\n旁边是重新开放的追忆桥（Bridge of Remembrance），拍照不错。' },
      { name: '晚餐 + 早睡', lat: -43.5320, lng: 172.6360, type: 'food', time: '18:30',
        desc: '别硬撑到半夜。今天睡够，明天才有力气开 330 公里。',
        budget: 'NZ$30–50 / 人',
        detail: 'CBD 推荐：Twenty Seven Steps（新西兰菜）、King of Snake（亚洲融合）。\n不想出门就在酒店楼下吃，重点是早点躺下。' }
    ]
  },

  /* ─────────── D2 ─────────── */
  {
    id: 2, label: 'D2 · 12/23', date: '12月23日 周三', title: '高原 · 蒂卡波 → 库克山',
    color: '#4aa3df', region: 'Mackenzie Country',
    drive: '基督城 → Tekapo 230 km / 3 h；Tekapo → 库克山 105 km / 1 h 15',
    stay: '库克山 Mt Cook Village',
    summary: '一天从平原开进雪山。Tekapo 只停两小时拍照吃饭，晚上住到库克山脚下看星星。',
    route: '基督城 → 1 号公路南下 → Tekapo（好牧羊人教堂）→ 8 号公路 → Pukaki 湖 → 库克山',
    weather: '高原 10–22℃，晚上 6℃ 左右',
    locations: [
      { name: '基督城出发', lat: -43.5306, lng: 172.6358, type: 'transport', time: '08:30',
        desc: '走 1 号公路南下，过 Ashburton 后转 79 号再接 8 号。全程平坦，第一天上手右舵正好。',
        detail: '出城前加满油，基督城油价最便宜。\n途中 Ashburton 有 Countdown，可以买点路上吃的。' },
      { name: '好牧羊人教堂', lat: -44.0045, lng: 170.4777, type: 'spot', time: '11:15',
        desc: 'Tekapo 唯一的必看点，1935 年的石头小教堂，背后就是湖和雪山。中午人最多，停车位要转两圈。',
        detail: '教堂内部不允许拍照，外面随便拍。\n湖边的鲁冰花 12 月底已经过了盛花期，还剩零星几丛，别抱太大期望。\n真正好看的是湖水的奶蓝色——冰川岩粉悬浮在水里形成的，阴天也蓝。' },
      { name: 'Tekapo 镇午餐', lat: -44.0060, lng: 170.4790, type: 'food', time: '12:30',
        desc: '镇上餐馆不多，Run 77 或 Mackenzies 都行。吃完就走，不在镇上过夜。',
        budget: 'NZ$25–40 / 人',
        detail: '镇上超市 Four Square 东西少且贵，补给留到瓦纳卡。\n如果想吃日本料理，Kohan 的湖畔位置不错，但要排队。' },
      { name: 'Pukaki 湖 · Peter\'s Lookout', lat: -44.1900, lng: 170.1300, type: 'spot', time: '14:00',
        desc: '从 Tekapo 往西开 30 分钟，路边观景台正对库克山，是整条路上最好的机位。',
        detail: '湖水比 Tekapo 更蓝，因为岩粉浓度更高。风大，外套穿上。\n观景台有卖高山三文鱼的摊位，冰鲜的，可以买一块当零食。' },
      { name: 'Hooker Valley 步道', lat: -43.7167, lng: 170.1000, type: 'spot', time: '15:30',
        desc: '新西兰最值回票价的步道，全程 10 公里往返 3 小时，过三座吊桥，终点是冰川湖。几乎没爬升。',
        detail: '入口在 White Horse Hill 营地，停车位紧张，15:30 后反而好停。\n夏天 22:00 才天黑，走到 19:00 回来完全来得及。\n体力不济就走到第一座吊桥折返，40 分钟，风景已经够。\n带水，路上没有补给点。' },
      { name: '库克山村住宿', lat: -43.7344, lng: 170.0958, type: 'hotel', time: '19:30',
        desc: '村里就 Hermitage、Mt Cook Lodge 和 Glentanner 营地。住这里是为了早上推门见雪山。',
        detail: 'Hermitage 贵但位置最好，落地窗正对库克山。Mt Cook Lodge 便宜一半，走路 10 分钟。\nGlentanner 在 20 公里外，是营地和小木屋，性价比高但要开车。' },
      { name: '看星星', lat: -43.7300, lng: 170.0960, type: 'spot', time: '22:30',
        desc: '这里是 Aoraki Mackenzie 暗夜保护区，光污染比 Tekapo 镇还少。出了酒店走 100 米就是一整片银河。',
        detail: '带手电（红光模式）和厚外套，晚上只有 6℃。\n手机拍星空：三脚架 + 长曝光 20 秒，ISO 3200。没有三脚架就靠着车顶。' }
    ]
  },

  /* ─────────── D3 ─────────── */
  {
    id: 3, label: 'D3 · 12/24', date: '12月24日 周四', title: '平安夜 · 库克山 → 瓦纳卡',
    color: '#3fa7b5', region: 'Otago',
    drive: '库克山 → Twizel 65 km / 50 min；→ 瓦纳卡 200 km / 3 h',
    stay: '瓦纳卡（2 晚）',
    summary: '早上补一段短步道，中午穿过 Lindis Pass 到瓦纳卡。到了第一件事是买菜，明后天全国闭店。',
    route: '库克山 → Twizel → Omarama → Lindis Pass → 瓦纳卡 → 超市采购 → 湖边',
    weather: '10–24℃，山口风大',
    locations: [
      { name: 'Kea Point 日出', lat: -43.7200, lng: 170.1050, type: 'spot', time: '07:30',
        desc: '昨天没走完 Hooker Valley 的话，早上补这一段。30 分钟到观景台，正对 Mueller 冰川湖。',
        detail: '夏天日出 5:50 左右，7:30 出发已经算晚，但晨光打在雪山上最好看。\n来回 1 小时，回酒店吃早饭刚好。' },
      { name: 'Twizel 补给', lat: -44.2578, lng: 170.1000, type: 'transport', time: '11:00',
        desc: '路过加个油，镇上有 Four Square。不停也行，但这是到瓦纳卡前最后一个像样的镇。',
        detail: 'Twizel 是三文鱼养殖区，镇上有几家卖高山三文鱼的小店，比景区便宜。' },
      { name: 'Lindis Pass', lat: -44.5833, lng: 169.6500, type: 'spot', time: '12:30',
        desc: '8 号公路最高的垭口，两侧是金黄色的草坡，夏天看像苏格兰高地。路边有观景台。',
        detail: '这一段弯多，注意限速（100 km/h，弯道 55）。\n观景台在最高点，停车拍照 10 分钟就够。' },
      { name: '瓦纳卡 New World 采购', lat: -44.6960, lng: 169.1330, type: 'transport', time: '14:00',
        desc: '到了先别去湖边，直接进超市。12/25 全国闭店，这两天的吃的现在买齐。',
        detail: '必买：面包、鸡蛋、牛奶、水果、意面、酱料、一瓶葡萄酒。\n如果要自己做圣诞晚餐，提前看好火鸡或羊腿，24 号下午可能已经卖完。\n酒类在新西兰超市可以买，葡萄酒区很大，20 纽币就能买到不错的 Central Otago 黑皮诺。' },
      { name: 'That Wanaka Tree', lat: -44.6975, lng: 169.1306, type: 'spot', time: '17:00',
        desc: '长在湖里的那棵柳树，新西兰被拍得最多的一棵树。日落前光线最好。',
        detail: '从镇中心沿湖走 10 分钟。傍晚人不少，但等一会儿总能拍到没人的。\n水位高的时候树根泡在水里，构图最好看。' },
      { name: '平安夜晚餐', lat: -44.6942, lng: 169.1367, type: 'food', time: '19:30',
        desc: '24 号晚上餐馆还开，但会满。要么提前订，要么自己做。',
        budget: 'NZ$45–70 / 人',
        detail: '推荐：Kika（tapas，要订）、Bistro Gentil（法式，湖景）、Francesca\'s（意大利）。\n不想折腾就在公寓做，配一瓶本地黑皮诺。' }
    ]
  },

  /* ─────────── D4 ─────────── */
  {
    id: 4, label: 'D4 · 12/25', date: '12月25日 周五', title: '圣诞 · 瓦纳卡',
    color: '#34c759', region: 'Wanaka',
    drive: '不出镇，最远 10 km',
    stay: '瓦纳卡',
    summary: '全天在瓦纳卡。商店全关，但山和湖都在。走一段步道，下午晒太阳，晚上自己做圣诞饭。',
    route: 'Mt Iron 步道 → 湖边 → Puzzling World（如果开）→ 公寓做饭',
    weather: '12–25℃，晴天概率高',
    locations: [
      { name: 'Mt Iron 步道', lat: -44.7015, lng: 169.1540, type: 'spot', time: '09:30',
        desc: '往返 1.5 小时，山顶 360 度看瓦纳卡湖和 Hawea 湖。爬升 240 米，不难但会出汗。',
        detail: '入口在 State Highway 6 旁的停车场，镇中心开车 5 分钟。\n山顶风大，带件外套。上午光线顺，拍湖最好。' },
      { name: '瓦纳卡湖边', lat: -44.6942, lng: 169.1367, type: 'spot', time: '12:00',
        desc: '圣诞当天镇上安静得不像话，本地人都在湖边野餐。找块草地躺下，这就是新西兰的圣诞节。',
        detail: '湖边有免费烧烤台（BBQ），带食材去烤也行，但要自带锡纸和油。\nRippon 酒庄今天不开，别白跑。' },
      { name: 'Puzzling World', lat: -44.6867, lng: 169.1617, type: 'spot', time: '14:30',
        desc: '视觉错觉博物馆，倾斜房间和迷宫。圣诞当天可能缩短营业，去之前查一下。',
        detail: '门票 NZ$25 左右，两小时够。适合消磨下午，不去也不遗憾。\n带小孩的话很值，两个大人的话看心情。' },
      { name: '圣诞晚餐（自己做）', lat: -44.6942, lng: 169.1367, type: 'food', time: '18:30',
        desc: '今天全镇餐厅基本关门，自己做是唯一选项。这也是为什么订公寓要带厨房。',
        budget: 'NZ$40–60（食材）',
        detail: '简单方案：羊排 + 烤蔬菜 + 沙拉 + 黑皮诺。\n新西兰羊排超市就有，腌一下煎 6 分钟一面，比餐厅不差。' }
    ]
  },

  /* ─────────── D5 ─────────── */
  {
    id: 5, label: 'D5 · 12/26', date: '12月26日 周六', title: '水果小镇 · 瓦纳卡 → 皇后镇',
    color: '#7ac143', region: 'Central Otago',
    drive: '瓦纳卡 → Cromwell 55 km / 45 min；→ 皇后镇 60 km / 45 min',
    stay: '皇后镇（2 晚）',
    summary: 'Boxing Day，商店开门打折。中途在 Cromwell 停一下吃车厘子，下午到皇后镇坐缆车。',
    route: '瓦纳卡 → 6 号公路 → Cromwell → Kawarau 峡谷 → 皇后镇',
    weather: '14–26℃，内陆偏热',
    locations: [
      { name: '瓦纳卡晨湖', lat: -44.6942, lng: 169.1367, type: 'spot', time: '09:00',
        desc: '走之前再去湖边坐一会儿。早上湖面没风，倒影最清楚。',
        detail: '镇上有家 Scroggin 的咖啡不错，买了路上喝。' },
      { name: 'Cromwell 水果小镇', lat: -45.0389, lng: 169.2000, type: 'food', time: '10:30',
        desc: '南岛的水果篮。12 月底到 1 月是车厘子最甜的时候，路边果园直接卖，比超市便宜一半。',
        budget: 'NZ$15–30（买水果）',
        detail: 'Cheeki Cherries 或 Jones Family Fruit Stall，都在 6 号公路边。\n车厘子按公斤卖，越大越贵，中号最划算。\n还能买到杏、桃、油桃、杏干。买多了吃不完，装保鲜盒放车里。\n老城区（Old Cromwell Town）有咖啡馆，湖边坐坐不错。' },
      { name: 'Kawarau 峡谷蹦极', lat: -45.0120, lng: 168.8600, type: 'spot', time: '12:30',
        desc: '世界商业蹦极的发源地，43 米高，桥下是翡翠色的河。不跳也能在观景台看别人尖叫。',
        detail: '跳一次 NZ$205 左右，照片视频另算。现场排队 40 分钟。\n不跳就在观景台看，免费，看十分钟也够刺激。' },
      { name: '皇后镇入住', lat: -45.0312, lng: 168.6626, type: 'hotel', time: '14:00',
        desc: '两晚，选镇中心步行圈。车停酒店，这两天基本不用开车。',
        detail: '镇中心停车位极贵（NZ$4/小时），酒店含车位是刚需。\n入住后先去湖边走走，适应一下这个比瓦纳卡热闹十倍的地方。' },
      { name: '天空缆车 + Luge', lat: -45.0306, lng: 168.6585, type: 'spot', time: '16:00',
        desc: '缆车上去看整个 Wakatipu 湖和 Remarkables 山脉。Luge 滑板车是重力滑行，三轮套票最划算。',
        budget: 'NZ$60–90 / 人',
        detail: '缆车 + 3 次 Luge 套票约 NZ$79。\n傍晚上去能看到日落，但山顶餐厅要提前订。\n滑板车第一次会教，小朋友也能玩。' },
      { name: 'Fergburger', lat: -45.0318, lng: 168.6610, type: 'food', time: '19:30',
        desc: '皇后镇排队最长的汉堡店，24 小时营业。味道确实好，但排 40 分钟要有心理准备。',
        budget: 'NZ$18–25 / 人',
        detail: '招牌 Fergburger（牛肉培根芝士），辣味的 Sweet Bambi 也不错。\n避开 12:00–14:00 和 19:00–21:00，其他时间排队短。\n可以电话订，20 分钟后取。' }
    ]
  },

  /* ─────────── D6 ─────────── */
  {
    id: 6, label: 'D6 · 12/27', date: '12月27日 周日', title: '中土 · 格林诺奇 + 箭镇',
    color: '#f5a623', region: 'Queenstown Lakes',
    drive: '皇后镇 → 格林诺奇 45 km / 45 min；→ 箭镇 35 km；回镇 20 km',
    stay: '皇后镇',
    summary: '一天两个方向：上午沿湖开到格林诺奇看中土风景，下午回程拐进箭镇，晚上回皇后镇。',
    route: '皇后镇 → Glenorchy Road → 格林诺奇 → 箭镇 → 皇后镇',
    weather: '12–22℃，湖边风大',
    locations: [
      { name: 'Glenorchy Road', lat: -45.0000, lng: 168.5500, type: 'transport', time: '09:00',
        desc: '新西兰最美的一段公路，45 公里贴着 Wakatipu 湖走，每个转弯都是观景台。开慢点。',
        detail: '全程有十几个停车点（Lookout），建议停 3–4 个：Bennetts Bluff、Wilson Bay、Seven Mile Point。\n路窄弯多，注意对向车。' },
      { name: '格林诺奇小镇', lat: -44.8500, lng: 168.3833, type: 'spot', time: '10:30',
        desc: '《指环王》取景地，小镇只有一条街。湖头的栈道走 20 分钟，看 Dart River 汇入湖口。',
        detail: 'Glenorchy Wharf 的红房子是标志性机位。\n镇上有家 Mrs Woolly\'s General Store，咖啡和派都不错。\n想深入可以报 Dart River 喷气艇，2 小时，NZ$200 起。' },
      { name: '箭镇 Arrowtown', lat: -44.9389, lng: 168.8333, type: 'spot', time: '14:00',
        desc: '淘金时代的小镇，主街保留着 1860 年代的木头房子。秋天最美，夏天绿荫也很好。',
        detail: 'Buckingham Street 走一遍就够，两侧全是咖啡馆和手工艺店。\n中国矿工村遗址（Chinese Settlement）值得看，讲的是早期华工的故事。\n推荐 Arrowtown Bakery 的派，热的时候最好吃。' },
      { name: '回皇后镇', lat: -45.0312, lng: 168.6626, type: 'hotel', time: '18:00',
        desc: '回镇上吃晚饭，早点休息。明天要开 170 公里去蒂阿瑙。',
        detail: '晚饭可以试试 Botswana Butchery（牛排）或 Amisfield（酒庄餐厅，要订）。' }
    ]
  },

  /* ─────────── D7 ─────────── */
  {
    id: 7, label: 'D7 · 12/28', date: '12月28日 周一', title: '湖畔 · 皇后镇 → 蒂阿瑙',
    color: '#e8863a', region: 'Fiordland',
    drive: '皇后镇 → 蒂阿瑙 170 km / 2 h',
    stay: '蒂阿瑙（2 晚）',
    summary: '上午在皇后镇收个尾，中午开到蒂阿瑙。下午湖边走走或去萤火虫洞，明天一整天进峡湾。',
    route: '皇后镇 → 6 号公路 → Kingston → 94 号公路 → 蒂阿瑙',
    weather: '11–21℃，湖区多雨',
    locations: [
      { name: '皇后镇最后半天', lat: -45.0312, lng: 168.6626, type: 'spot', time: '09:30',
        desc: '买点东西、喝杯咖啡。Patagonia 的冰淇淋和热巧克力是本地招牌。',
        detail: 'Patagonia Chocolates 在湖边，排队但值得。\n想买伴手礼，镇上有羊毛制品店和蜂蜜店。' },
      { name: 'Kingston 湖边', lat: -45.3333, lng: 168.7167, type: 'spot', time: '12:00',
        desc: '路过的小站，老火车车厢停在湖边。停 15 分钟拍照，顺便吃个三明治。',
        detail: 'Kingston Flyer 是老蒸汽火车，只在特定日子运行。' },
      { name: '蒂阿瑙入住', lat: -45.4144, lng: 167.7181, type: 'hotel', time: '14:00',
        desc: '峡湾门户，镇子小得走十分钟就穿过去。两晚，明天不用收拾行李。',
        detail: '镇上有 FreshChoice 超市，比皇后镇便宜。\n油站在镇中心，明天进峡湾前加满——峡湾里面没有加油站。' },
      { name: '蒂阿瑙萤火虫洞', lat: -45.4100, lng: 167.7060, type: 'spot', time: '15:30',
        desc: '坐船过湖，再进洞看萤火虫（其实是发光幼虫）。全程 2 小时 15 分，洞里不能说话不能拍照。',
        budget: 'NZ$105–120 / 人',
        detail: 'RealNZ 运营，从镇中心码头出发。\n洞里冷，穿厚点。仰头看像星空，值不值看个人。\n不想去就在湖边步道走，免费，日落很好看。' },
      { name: '蒂阿瑙湖滨晚餐', lat: -45.4150, lng: 167.7190, type: 'food', time: '19:00',
        desc: '镇上餐馆不多，Redcliff 或 The Fat Duck 都行。早点睡，明天 8 点出发。',
        budget: 'NZ$35–55 / 人',
        detail: 'Redcliff 的鹿肉和蓝鳕鱼是招牌，湖景位要订。' }
    ]
  },

  /* ─────────── D8 ─────────── */
  {
    id: 8, label: 'D8 · 12/29', date: '12月29日 周二', title: '峡湾 · 米尔福德',
    color: '#d9663f', region: 'Fiordland',
    drive: '蒂阿瑙 → 米尔福德 120 km / 2 h（单程），往返 240 km',
    stay: '蒂阿瑙',
    summary: '一整天给峡湾。8 点出发，10:30 上船，下午 5 点回到蒂阿瑙。这条路本身就是景点。',
    route: '蒂阿瑙 → 94 号公路 → Eglinton Valley → Mirror Lakes → Homer Tunnel → 米尔福德 → 游船',
    weather: '8–18℃，峡湾年降雨 200 天',
    locations: [
      { name: '94 号公路出发', lat: -45.4144, lng: 167.7181, type: 'transport', time: '08:00',
        desc: '加满油再走，峡湾里面没有加油站。全程 120 公里，但弯多，要开 2 小时。',
        detail: '出发前查路况：NZTA 网站看 Milford Road 是否封路（大雪或塌方会关）。\n带防雨外套，峡湾一天四季。' },
      { name: 'Eglinton Valley', lat: -45.1500, lng: 168.0000, type: 'spot', time: '08:45',
        desc: '电影《指环王》里的金色平原，两侧是陡峭的山壁。路边有停车带。',
        detail: '清晨常有雾，光线最好。停 10 分钟拍照。' },
      { name: 'Mirror Lakes', lat: -45.1167, lng: 167.9333, type: 'spot', time: '09:15',
        desc: '路边的倒影湖，木栈道伸进水里，天气好时能拍出完美倒影。免费，5 分钟看完。',
        detail: '风小的时候才有倒影，早上概率高。' },
      { name: 'Homer Tunnel', lat: -44.7600, lng: 167.9800, type: 'transport', time: '09:45',
        desc: '1.2 公里的单车道隧道，1900 年代人工凿出来的。隧道口常堵车，等 10–20 分钟正常。',
        detail: '隧道内有红绿灯控流，跟车走，别超车。\n出隧道后是一段陡下坡，挂低挡。' },
      { name: '米尔福德峡湾游船', lat: -44.6414, lng: 167.8975, type: 'spot', time: '10:30',
        desc: '两小时船程，开到 Tasman Sea 口再回来。两侧是 1200 米的垂直峭壁，瀑布从云雾里挂下来。',
        budget: 'NZ$120–180 / 人',
        detail: '订 Nature Cruise（小船，能靠近瀑布）或 Scenic Cruise（大船，稳）。\n船上很冷，穿冲锋衣。\n看到海豹和企鹅的概率高，运气好有海豚。\n雨天其实更好看——上千条临时瀑布会同时出现。' },
      { name: '返回蒂阿瑙', lat: -45.4144, lng: 167.7181, type: 'hotel', time: '17:00',
        desc: '原路返回，2 小时。晚上在镇上吃，早点休息。',
        detail: '回程会累，中途在 Eglinton Valley 停一下换人开。' }
    ]
  },

  /* ─────────── D9 ─────────── */
  {
    id: 9, label: 'D9 · 12/30', date: '12月30日 周三', title: '南下 · 蒂阿瑙 → 但尼丁',
    color: '#c25a8a', region: 'Otago',
    drive: '蒂阿瑙 → 但尼丁 290 km / 4 h',
    stay: '但尼丁（2 晚）',
    summary: '今天纯赶路，290 公里。中途在 Gore 休息，下午到但尼丁，看火车站和世界最陡的街。',
    route: '蒂阿瑙 → 94 号 → 6 号 → Gore → 1 号公路 → 但尼丁',
    weather: '12–19℃，沿海风大',
    locations: [
      { name: '蒂阿瑙出发', lat: -45.4144, lng: 167.7181, type: 'transport', time: '09:00',
        desc: '走 94 号回 6 号，再转 1 号。全程平原和牧场，好开。',
        detail: '出镇前加油，下一个像样的镇是 Gore（80 公里外）。' },
      { name: 'Gore 午餐', lat: -46.1000, lng: 168.9439, type: 'food', time: '11:00',
        desc: '南地大区的乡下小镇，吉他之乡。主街有几家咖啡馆，吃个派歇一下。',
        budget: 'NZ$15–25 / 人',
        detail: '推荐 The Thomas Green 或 Cafe Ambience，都在主街。' },
      { name: '但尼丁火车站', lat: -45.8720, lng: 170.5080, type: 'spot', time: '14:30',
        desc: '1906 年的爱德华巴洛克建筑，瓷砖地面和彩色玻璃，被叫作"新西兰最上镜的建筑"。免费进。',
        detail: '站台可以随便走，火车不一定有。\n二楼有体育名人堂，要门票，可以不去。' },
      { name: '鲍德温街', lat: -45.8500, lng: 170.5100, type: 'spot', time: '15:30',
        desc: '吉尼斯认证的世界最陡街道，坡度 35%。走上去喘，拍照要站在坡底往上拍。',
        detail: '开车上去要小心，手动挡容易溜车。建议停坡底步行。\n每年有巧克力球滚坡比赛（Cadbury Jaffa Race），不在这个季节。' },
      { name: '八角广场 + 入住', lat: -45.8740, lng: 170.5033, type: 'hotel', time: '17:00',
        desc: '市中心，圣保罗大教堂和市政厅都在这。今晚先探个路，明天跨年就在这个广场。',
        detail: '周边餐厅多，跨年夜的位子今天就去问一下能不能订。' },
      { name: '晚餐', lat: -45.8740, lng: 170.5030, type: 'food', time: '19:00',
        desc: '但尼丁餐饮比想象中好，海鲜和精酿都不错。',
        budget: 'NZ$40–60 / 人',
        detail: '推荐：Plato（海鲜，本地人最爱）、Etrusco（意大利）、No.7 Balmac（新西兰菜）。' }
    ]
  },

  /* ─────────── D10 ─────────── */
  {
    id: 10, label: 'D10 · 12/31', date: '12月31日 周四', title: '跨年 · 但尼丁',
    color: '#a855c7', region: 'Otago Peninsula',
    drive: '市区 → 半岛 20 km / 35 min',
    stay: '但尼丁',
    summary: '白天去奥塔哥半岛看信天翁和企鹅，下午回城休息，晚上在八角广场跨年。',
    route: '市区 → Portobello Road → Taiaroa Head → 回城 → 八角广场',
    weather: '11–18℃，半岛风极大',
    locations: [
      { name: '奥塔哥半岛自驾', lat: -45.8350, lng: 170.6500, type: 'transport', time: '10:00',
        desc: 'Portobello Road 贴着海湾走，一侧是山一侧是水。路窄弯多，但风景是但尼丁最好的。',
        detail: '全程 20 公里，开 40 分钟。中途在 Portobello 镇停一下。\n注意避让自行车，这条路人骑行多。' },
      { name: 'Taiaroa Head 信天翁', lat: -45.7747, lng: 170.7300, type: 'spot', time: '11:00',
        desc: '大陆上唯一的皇家信天翁繁殖地，翼展 3 米。观景台能看到它们贴海面滑翔。',
        budget: 'NZ$55–65 / 人',
        detail: 'Albatross Centre 有导览，1 小时，能进观测室看巢。\n不买票在外部观景台也能看到远处飞行的信天翁，但看不清巢。' },
      { name: '半岛午餐', lat: -45.8350, lng: 170.6500, type: 'food', time: '13:00',
        desc: 'Portobello 镇上有几家咖啡馆，海鲜浓汤不错。',
        budget: 'NZ$25–40 / 人',
        detail: '推荐 1908 Café 或 The Portsider。' },
      { name: '回城休息', lat: -45.8788, lng: 170.5028, type: 'hotel', time: '16:00',
        desc: '跨年要站到半夜，下午认真睡一觉。这是今晚唯一正确的安排。',
        detail: '跨年活动一般 21:00 开始，Octagon 会封路。\n带件外套，但尼丁晚上只有 11℃。' },
      { name: '八角广场跨年', lat: -45.8740, lng: 170.5033, type: 'spot', time: '21:00',
        desc: '但尼丁的跨年在 Octagon，现场音乐 + 倒计时。规模比皇后镇小，但不用挤成沙丁鱼。',
        detail: '活动通常免费，具体安排看但尼丁市议会官网。\n周边酒吧会满，想喝一杯就早点进去。\n午夜倒计时后有烟花（不是每年都有，看当年安排）。' }
    ]
  },

  /* ─────────── D11 ─────────── */
  {
    id: 11, label: 'D11 · 1/1', date: '1月1日 周五', title: '元旦 · 但尼丁 → 奥马鲁',
    color: '#6b7fd7', region: 'North Otago',
    drive: '但尼丁 → 摩拉基 75 km / 1 h；→ 奥马鲁 40 km / 35 min',
    stay: '奥马鲁',
    summary: '元旦，慢慢开。中途看摩拉基大圆石，下午到奥马鲁逛维多利亚老街，晚上等企鹅上岸。',
    route: '但尼丁 → 1 号公路 → Moeraki Boulders → 奥马鲁 → 历史街区 → 企鹅归巢',
    weather: '12–20℃，海边风大',
    locations: [
      { name: '摩拉基大圆石', lat: -45.3450, lng: 170.8270, type: 'spot', time: '11:30',
        desc: '海滩上散落着几十个完美的球形巨石，直径一两米，是六千万年才形成的结核。退潮时最好看。',
        budget: 'NZ$2（停车）',
        detail: '查潮汐表，退潮时才能走到石头中间。涨潮只能远远看。\n从停车场走下去 5 分钟，有一段台阶。\n旁边的 Fleurs Place 餐厅很有名，海鲜，要订。' },
      { name: '奥马鲁历史街区', lat: -45.1020, lng: 170.9700, type: 'spot', time: '14:00',
        desc: '维多利亚风格的石头建筑群，Harbour Street 一整条都是 1870 年代的原物。有书店、画廊、古董店。',
        detail: '推荐：Oamaru Bookshop（旧书店）、Steampunk HQ（蒸汽朋克博物馆，NZ$10）。\n下午光线打在石灰岩上最好看。' },
      { name: '企鹅归巢', lat: -45.1064, lng: 170.9700, type: 'spot', time: '21:00',
        desc: '蓝企鹅是世界上最小的企鹅，日落后成群上岸回巢。奥马鲁是看它们最稳定的地方。',
        budget: 'NZ$45–60 / 人',
        detail: 'Oamaru Blue Penguin Colony 有看台，按日落时间排场次，1 月大概 21:00–21:30。\n禁止拍照（闪光会吓到它们）。\n提前网上订票，旺季当天售完。\n普通区就够，VIP 区离得近但贵一倍。' }
    ]
  },

  /* ─────────── D12 ─────────── */
  {
    id: 12, label: 'D12 · 1/2', date: '1月2日 周六', title: '北上 · 奥马鲁 → 基督城',
    color: '#5b8def', region: 'Canterbury',
    drive: '奥马鲁 → 基督城 250 km / 3 h',
    stay: '基督城',
    summary: '三小时回基督城，路上没什么景点。下午休息，把伴手礼买了。',
    route: '奥马鲁 → 1 号公路 → Timaru → Ashburton → 基督城',
    weather: '14–23℃',
    locations: [
      { name: '奥马鲁出发', lat: -45.0972, lng: 170.9708, type: 'transport', time: '09:30',
        desc: '沿 1 号公路北上，全程平坦。中途 Timaru 可以休息。',
        detail: '出城前加油，Timaru 之前的加油站少。' },
      { name: 'Timaru 休息', lat: -44.3980, lng: 171.2510, type: 'food', time: '11:00',
        desc: '南坎特伯雷的海边小城，主街有咖啡馆。停 30 分钟，吃个 brunch。',
        budget: 'NZ$15–25 / 人',
        detail: 'Caroline Bay 海边公园不错，天气好可以走走。' },
      { name: '基督城入住', lat: -43.5306, lng: 172.6358, type: 'hotel', time: '13:00',
        desc: '最后一晚，住机场 20 分钟车程内。下午不安排远的地方。',
        detail: '如果住 CBD，晚上可以再去 Riverside Market 吃一顿，当作收尾。' },
      { name: '伴手礼采购', lat: -43.5339, lng: 172.6340, type: 'transport', time: '15:30',
        desc: '蜂蜜、巧克力、羊毛制品。机场也有，但贵 30%。',
        detail: 'Manuka 蜂蜜认准 UMF 标识，UMF 5+ 日常，10+ 以上贵。\nWhitestone Cheese 的奶酪可以带（需托运）。\n新西兰海关对食品入境限制严，买之前想清楚是不是要带回国的。' }
    ]
  },

  /* ─────────── D13 ─────────── */
  {
    id: 13, label: 'D13 · 1/3', date: '1月3日 周日', title: '收尾 · 基督城 → 起飞',
    color: '#1d1d1f', region: 'Christchurch',
    drive: '市区 → 机场 12 km / 25 分钟',
    stay: '夜航（22:30 起飞）',
    summary: '白天在城里闲逛，16:00 加满油，18:00 还车，20:30 到机场。22:30 起飞。',
    route: '市区 → 植物园 / 艺术中心 → 加油 → 还车 → 机场 → 22:30 起飞',
    weather: '14–23℃',
    locations: [
      { name: '基督城闲逛', lat: -43.5306, lng: 172.6214, type: 'spot', time: '10:00',
        desc: '最后半天，不赶。植物园、艺术中心、新摄政街，随便走走。',
        detail: 'Arts Centre 周末有手工艺市集，值得逛。\nNew Regent Street 的彩色小房子是拍照点。' },
      { name: '加满油', lat: -43.5150, lng: 172.5700, type: 'transport', time: '16:00',
        desc: '还车前必须加满，否则租车公司按高价补。机场附近有几家。',
        detail: '推荐 Russley Road 上的 Z 或 BP，离机场 5 分钟。\n留好加油小票，有时会查。' },
      { name: '还车', lat: -43.4852, lng: 172.5355, type: 'transport', time: '18:00',
        desc: '还车留 30 分钟，验车可能排队。把车内垃圾清掉，拍一张里程表照片。',
        detail: '确认还车单上没有额外收费。\n如果有小划痕，看是否在保险范围内。' },
      { name: '机场值机', lat: -43.4894, lng: 172.5322, type: 'transport', time: '20:30',
        desc: '国际航站楼，南航柜台。提前 2 小时到，退税（GST refund）柜台在安检前。',
        detail: '退税要求单笔消费满 NZ$50，商品要在随身行李里备查。\n免税店在安检后，蜂蜜和酒都有。' },
      { name: '22:30 起飞', lat: -43.4894, lng: 172.5322, type: 'transport', time: '22:30',
        desc: 'CZ618 基督城 → 广州，次日 05:10 到。转 CZ3533 07:00 飞上海，09:15 落地虹桥。',
        detail: '夜航，上飞机就睡。到广州中转 1 小时 50 分，行李直挂不用取。' }
    ]
  }
];
