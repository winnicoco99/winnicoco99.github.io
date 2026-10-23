/* ══════════════════════════════════════════════════════════════
   新西兰南岛 · 12日环线  行程数据
   日期：2026-12-20 → 2026-12-31
   结构：TRIP / DAYS / STAYS / BOOKINGS / CHECKLIST
   ══════════════════════════════════════════════════════════════ */

const TRIP = {
  title: '新西兰南岛',
  subtitle: '12 天 · 6 个住宿点 · 1600 km',
  dateRange: '2026.12.20 — 12.31',
  start: '2026-12-20T00:00:00+08:00',
  end: '2026-12-31T23:59:00+13:00',
  travelers: 2,
  mode: '自驾（右舵左侧行驶）',
  hero: '从基督城出发，穿过南阿尔卑斯到西海岸，再南下皇后镇过圣诞、跨年。',
  heroSub: '一天一个区域，不为凑点赶路。图上虚线是建议路线，真实执行可以随时改。'
};

/* ── 住宿节点（未预订，仅给建议与搜索入口）────────────── */
const STAYS = [
  {
    city: '基督城 Christchurch', nights: '12/20 — 12/21', n: 1,
    area: '市中心 / 大教堂广场一带',
    why: '落地当晚只做一件事：倒时差。选能步行到 Riverside Market 的位置，车停酒店不用动。',
    type: '酒店（有停车位）',
    price: '约 NZ$180–260 / 晚',
    booked: false,
    lat: -43.5306, lng: 172.6358,
    search: 'Christchurch CBD hotel parking',
    tip: '基督城 CBD 停车贵且难找，确认酒店含车位再订。'
  },
  {
    city: '特卡波 Lake Tekapo', nights: '12/21 — 12/23', n: 2,
    area: '镇中心 / 湖畔步道 3 分钟步行圈',
    why: '两晚是给天气留量：晴夜观星、阴天湖边也不亏。好牧羊人教堂清晨无人，住得近才有这个红利。',
    type: '公寓 / 汽车旅馆（带厨房最好）',
    price: '约 NZ$350–550 / 晚（旺季）',
    booked: false,
    lat: -44.0045, lng: 170.4777,
    search: 'Lake Tekapo accommodation',
    tip: 'Tekapo 全镇客房就几百间，12 月 21–23 是全年最紧的几天之一，越早越好。'
  },
  {
    city: '弗朗兹约瑟夫 Franz Josef', nights: '12/23 — 12/25', n: 2,
    area: '主街 Cron Street 附近',
    why: '冰川徒步公司门店都在主街，走两步就到。第二晚是天气备选夜，不动车。',
    type: '汽车旅馆 / 小旅馆',
    price: '约 NZ$280–420 / 晚',
    booked: false,
    lat: -43.4757, lng: 170.1981,
    search: 'Franz Josef accommodation',
    tip: '全镇约 400 个常住人口，客房极少。12/24 必须提前锁死，否则要开 85 km 去 Fox。'
  },
  {
    city: '皇后镇 Queenstown', nights: '12/25 — 12/31', n: 6,
    area: '市中心步行圈（Shotover St / Beach St）',
    why: '一住 6 晚不搬家。圣诞三晚全程步行不碰车，跨年夜走回住处比打车现实。同一家连住通常还能谈到折扣。',
    type: '公寓 / 精品酒店',
    price: '约 NZ$450–800 / 晚（圣诞跨年峰值）',
    booked: false,
    lat: -45.0312, lng: 168.6626,
    search: 'Queenstown centre accommodation',
    tip: '全年最贵的一周。湖景房溢价高，隔一条街便宜三分之一；Frankton / Kelvin Heights 更便宜但要开车进城。12/31 晚市中心封路，住处离 Earnslaw Park 步行 15 分钟内最省心。'
  }
];

/* ── 交通与门票（均未预订）──────────────────────────── */
const BOOKINGS = [
  {
    section: '航班', urgent: '高',
    items: [
      { name: '上海浦东 PVG → 奥克兰 AKL', meta: '12/20 出 · 建议 12/19 深夜或 12/20 上午的班次，落地当天转机基督城',
        note: '东航 MU779 约 00:10 起飞、当天 16:35 落地；新西兰航空 NZ288 约 14:15 起飞、次日 06:40 落地。跨圣诞票价上浮明显，越早越好。', status: '未订', link: 'https://www.google.com/travel/flights?q=PVG%20to%20AKL%202026-12-20' },
      { name: '奥克兰 AKL → 基督城 CHC', meta: '12/20 傍晚 · 国内航站楼换乘，预留 2.5 小时以上',
        note: '国际到达后需步行 10 分钟到国内航站楼，取行李+入境通关在圣诞前很慢。不要买间隔 2 小时内的票。', status: '未订', link: 'https://www.google.com/travel/flights?q=AKL%20to%20CHC%202026-12-20' },
      { name: '皇后镇 ZQN → 奥克兰 AKL → 上海 PVG', meta: '12/31 晚或 1/1 上午 · 取决于你想不想在皇后镇看烟花',
        note: '想看跨年烟花就必须 1/1 走。1/1 是新西兰新年假期，机场繁忙、票价高，但值得。', status: '未订', link: 'https://www.google.com/travel/flights?q=ZQN%20to%20PVG%202027-01-01' }
    ]
  },
  {
    section: '租车', urgent: '高',
    items: [
      { name: '基督城机场取车 · 皇后镇机场还车', meta: '12/20 — 12/31 · 紧凑型 SUV 或旅行车，自动挡',
        note: '旺季自动挡中型车最先租完。选含全险（excess 降到 0）的方案，南岛碎石路多，玻璃和轮胎险别省。异地还车费约 NZ$50–150。', status: '未订', link: 'https://www.rentalcars.com/' },
      { name: '中国驾照 + NZTA 认可英文翻译件', meta: '出发前办好 · 纸质彩印随身带',
        note: '中国驾照非英文，必须配 NZTA 认可译员的翻译件（含译员编号与声明）。自己翻译或软件翻译不被租车行认可。原件+翻译件+护照三样一起带。', status: '未办', link: 'https://www.nzta.govt.nz/travelling-on-our-roads/visitors-and-new-residents/driving-on-nz-roads' }
    ]
  },
  {
    section: '必订体验', urgent: '高',
    items: [
      { name: '弗朗兹约瑟夫冰川直升机徒步', meta: '12/24 上午 08:45 或 09:15 场 · 约 NZ$650–750/人',
        note: '圣诞当天（12/25）停业，所以只能排 12/24。旺季提前 2–3 个月订，选中可改期的方案，天气取消能顺延到当天下午。', status: '未订', link: 'https://www.franzjosefglacier.com/' },
      { name: '米尔福德峡湾 大巴+游船一日游', meta: '12/27 · 皇后镇出发约 12.5 小时 · NZ$239–290/人',
        note: '从皇后镇自驾往返 576 km、9 小时车程，看完还要开回来，不如坐玻璃顶大巴。12 月必须提前订，圣诞周最快满。', status: '未订', link: 'https://www.milford-sound.co.nz/book-now/' },
      { name: '特卡波暗夜观星（Dark Sky Project）', meta: '12/22 夜 · 约 NZ$120–200/人',
        note: '满月附近观星效果差。12/23 前后接近满月，优先排 12/21 或 12/22 早场。阴天可改期。', status: '未订', link: 'https://www.darkskyproject.co.nz/' },
      { name: '天空缆车 + 山顶晚餐', meta: '12/26 傍晚 · 缆车 NZ$62/人，自助餐另计',
        note: '12/26 是新年假期最挤的一天，山顶餐厅要提前订位。不想排队就只坐缆车，下来城里吃。', status: '未订', link: 'https://www.skyline.co.nz/en/queenstown/' }
    ]
  },
  {
    section: '建议但不必抢', urgent: '中',
    items: [
      { name: '皇后镇跨年夜晚餐', meta: '12/31 · Rata / Amisfield / Jervois 等',
        note: '跨年夜多数餐厅做套餐并加价，好位置 10 月就开始订。订不到就买点东西去湖畔野餐，气氛一样。', status: '未订', link: '' },
      { name: 'TSS Earnslaw 蒸汽船', meta: '12/28 或 12/29 · 约 NZ$95/人 起',
        note: '百年蒸汽船，1 小时湖上巡游。适合疲惫日下午，不用早起。', status: '未订', link: 'https://www.realnz.com/' }
    ]
  }
];

/* ── 行前清单 ────────────────────────────────────── */
const CHECKLIST = [
  { group: '证件', items: ['护照（有效期 > 6 个月）', 'NZeTA 电子签 + IVL 旅游税（在线申请，提前 1 个月）', '中国驾照原件', 'NZTA 认可英文翻译件（彩印）', '机票行程单 / 酒店确认单（离线存好）', '旅行保险保单'] },
  { group: '钱与网络', items: ['Visa / Master 芯片卡（新西兰几乎无现金）', '少量 NZD 现金（$200 够）', 'eSIM 或本地 Spark / One NZ 卡', '离线地图（南岛山区无信号）'] },
  { group: '驾驶', items: ['确认租车含全险 + 玻璃轮胎险', '下载 NZTA 路况 App / 查 journeys.map', '加油站分布图（Haast 到 Wanaka 之间无油）', '车载手机支架 + 车充'] },
  { group: '穿着', items: ['防晒霜 SPF50（新西兰紫外线极强）', '墨镜（冰川上必带）', '防风防水外套', '徒步鞋', '保暖中层（皇后镇夜里 8–10℃）', '泳衣（冰川温泉 / 湖边）'] },
  { group: '防虫', items: ['驱蚊液（沙蝇 sandfly，西海岸和峡湾很凶）', '长袖长裤（峡湾那天）', '抗过敏药'] },
  { group: '圣诞准备', items: ['12/24 傍晚前买齐 25 号两餐的食材', '超市当天全关，加油站自营店可能开', '带一个可折叠购物袋'] }
];

const NOTE_SECTIONS = [
  {
    title: '为什么这样排',
    items: [
      '12/20 落地当晚不跑远。倒时差那天开车最危险，基督城住一晚是唯一正确解。',
      '12/21 直接南下 Tekapo，把最容易被抢的住宿（Tekapo 两晚）放在行程最前面。',
      '12/23 走 Arthur\'s Pass 进西海岸，这是全南岛最美的一段山路，也是唯一能把冰川接在 Tekapo 后面的走法。',
      '12/25 圣诞当天冰川徒步全停业，所以冰川必须 12/24 做。25 号只在路上和皇后镇，不安排任何需要预约的东西。',
      '12/26–12/28 皇后镇三连，中间插一天米尔福德峡湾。峡湾那天坐大巴，不自己开车，回来还能有力气吃饭。',
      '12/29–12/30 两天完全留空。旺季连跑 8 天后，这两天是缓冲：天气不好就补，天气好就去箭镇或酒庄。',
      '12/31 不出城，白天轻松，晚上 Earnslaw Park 跨年。住得近，不用开车。'
    ]
  },
  {
    title: '被砍掉的点（以及为什么）',
    items: [
      '米尔福德峡湾自驾 → 改成大巴团。单程 288 km、4 小时 15 分，往返 9 小时纯开车，看完峡湾再开回来是折磨。',
      '罗伊峰 Roys Peak → 砍。8 小时往返的硬爬，12 月旺季停车场 7 点前就满，和 Wanaka 只停半天的节奏冲突。',
      '福克斯冰川 Fox → 砍。和弗朗兹约瑟夫二选一，多开 25 分钟只为看另一个冰川不划算。',
      '凯库拉观鲸 / 阿卡罗阿 → 砍。都在基督城东北，绕路 3 小时以上，12 天塞不进去。',
      '但尼丁 + 奥马鲁 → 砍。从 Tekapo 到但尼丁 3.5 小时，再折回皇后镇又是 3.5 小时，等于白扔一天。',
      '库克山住一晚 → 改成一日往返。库克山村住宿贵且少，Tekapo 出发 1 小时 15 分能到，当天回更灵活。',
      '北岛（奥克兰 / 罗托鲁瓦 / 霍比屯）→ 砍。你说要南岛深度，北岛转机就走，不进城。'
    ]
  },
  {
    title: '天气敏感点',
    items: [
      '冰川徒步：西海岸年降雨 4000–6000 mm，取消率不低。12/23 晚到、12/24 上午飞，下午作为备选窗口；都不行就 12/24 走山谷步道 + 温泉。',
      '米尔福德峡湾：下雨反而更好看（瀑布变多），但大风会停船。12/27 如果取消，12/29 还有一天可以补。',
      '观星：阴天就换成 Tekapo Springs 温泉，或者第二天早场。',
      '库克山 Hooker Valley：全程无遮阴，正午紫外线爆表，尽量 10 点前出发。',
      '峡湾公路 SH94 偶尔因雪崩或落石关闭，出发前一晚查 NZTA 路况。'
    ]
  },
  {
    title: '第一天与最后一天怎么走',
    items: [
      '12/20：PVG 起飞 → AKL 落地 → 步行到国内航站楼 → CHC → 机场取车（约 1 小时）→ 开 25 分钟进城 → 入住 → Riverside Market 吃饭。全程不安排景点。',
      '12/31：白天在皇后镇随便逛，16:00 回住处休息，19:00 去 Earnslaw Park 占位置，午夜烟花，走回住处。',
      '1/1：皇后镇机场还车 → 飞奥克兰 → 转上海。还车前 24 小时加满油，机场附近加油站在 Frankton。'
    ]
  }
];

/* ── 每日行程 ───────────────────────────────────── */
const DAYS = [
  {
    id: 0, label: '总览', color: '#0071e3', locations: []
  },

  /* ─────────── D1 ─────────── */
  {
    id: 1, label: 'D1 · 12/20', date: '12月20日 周日', title: '落地 · 基督城',
    color: '#5b8def', region: 'Canterbury',
    drive: '机场 → CBD 约 12 km / 25 分钟',
    stay: '基督城 CBD',
    summary: '只做三件事：取车、进城、吃饭。倒时差那天不开长途。',
    route: '奥克兰 AKL → 基督城 CHC → 取车 → CBD 入住 → Riverside Market',
    weather: '夏季 12–22℃，傍晚偏凉',
    locations: [
      { name: '基督城机场 取车', lat: -43.4852, lng: 172.5355, type: 'transport', time: '17:30',
        desc: '国际到达出来步行 5 分钟到租车区。验车时拍一圈视频，重点拍前挡风玻璃和四个轮毂。',
        detail: '驾照原件 + NZTA 翻译件 + 护照三样一起递。确认油箱政策（满还满 / 预付油）和异地还车费是否已含。\n右舵车：雨刷和转向灯位置是反的，先在停车场里绕两圈再上路。' },
      { name: 'Riverside Market', lat: -43.5339, lng: 172.6340, type: 'food', time: '19:00',
        desc: '落地第一顿，不用想。室内市场，从汉堡到生蚝到亚洲菜都有，20:00 后陆续收摊。',
        budget: 'NZ$25–45 / 人',
        detail: '推荐：Bacon Bros 的汉堡、基地里的新鲜生蚝、Roots 的素食碗。\n市场外侧沿 Avon 河有座位，夏天傍晚坐着吃很舒服。\n吃完步行 5 分钟到 New Regent Street 看一眼，西班牙传教士风格的彩色小街。',
        pay: { card: 1, cash: 0.5 } },
      { name: '基督城 CBD 酒店（待订）', lat: -43.5306, lng: 172.6358, type: 'hotel', time: '20:30',
        desc: '只住一晚，选带车位的。别为了省 30 块停路边，基督城 CBD 早上 8 点开始贴条。',
        detail: '建议区域：Cathedral Square 周边 800 m 内，步行到 Riverside Market 不超 10 分钟。\n12/20 房价通常还没到峰值，可以挑位置。' }
    ]
  },

  /* ─────────── D2 ─────────── */
  {
    id: 2, label: 'D2 · 12/21', date: '12月21日 周一', title: '南下 · 特卡波',
    color: '#4aa3df', region: 'Mackenzie Country',
    drive: '基督城 → Tekapo 约 230 km / 3 小时',
    stay: '特卡波（住 2 晚）',
    summary: '走 SH1 转 SH79 的平路，路上两个小镇歇脚。傍晚湖边散步，夜里看星。',
    route: '基督城 → Geraldine（咖啡）→ Burkes Pass → Lake Tekapo → 湖畔 → 观星',
    weather: '高地 8–24℃，夜里 8℃ 左右',
    locations: [
      { name: '出发 · 加满油', lat: -43.5306, lng: 172.6358, type: 'transport', time: '09:00',
        desc: '出城前加满。基督城到 Tekapo 之间加油站不少，但价格一路涨。',
        detail: '基督城 → Geraldine 约 1 小时 40 分，走 SH1 南下。路上车少，适合先熟悉右舵。' },
      { name: 'Geraldine 小镇', lat: -44.0921, lng: 171.2426, type: 'food', time: '10:45',
        desc: '南岛最像"英国乡村"的小镇。Barker\'s 果酱店、Talbot Forest 奶酪店，配一杯 flat white。',
        budget: 'NZ$15–25 / 人',
        detail: 'Barker\'s Foodstore：1894 年开的老果酱店，可以试吃十几种果酱，伴手礼在这里买比景区便宜一半。\nCafe 建议：The Running Duck 或 Verde。\n停留 45 分钟足够，别恋战，后面才是重点。',
        pay: { card: 1 } },
      { name: 'Burkes Pass', lat: -44.0901, lng: 170.5996, type: 'spot', time: '12:00',
        desc: '路边一个复古小店 + 老教堂，10 分钟拍照点。从这里开始进入 Mackenzie 盆地，视野突然打开。',
        detail: 'Three Creeks 小店门口的旧加油站招牌是全南岛出片率最高的路边景之一。',
        pay: { card: 1 } },
      { name: 'Lake Tekapo 湖畔 & 好牧羊人教堂', lat: -44.0034, lng: 170.4825, type: 'spot', time: '15:30',
        desc: '牛奶蓝的湖水 + 石头小教堂。下午人多，明早 07:00 再来一次，那才是真正的它。',
        detail: '教堂内部不对游客开放（有礼拜时才开），只能在外部看。\n停车：教堂旁有免费停车场，旺季下午常常满，往前开 200 m 有备用停车。\n湖边鲁冰花 12 月正当季，沿 Godley Peaks Road 往约翰山方向路边有成片紫色。\n⚠️ 鲁冰花是入侵物种，不要摘、不要踩进花丛里拍。' },
      { name: 'Tekapo 镇中心晚餐', lat: -44.0047, lng: 170.4784, type: 'food', time: '18:00',
        desc: '小镇能吃的就几家。日料 Kohan 在湖景位置，落地窗看湖，要订位。',
        budget: 'NZ$45–70 / 人',
        detail: 'Kohan Restaurant：日料，三文鱼盖饭和天妇罗稳定，湖景位提前打电话。\n备选：The Better Batter（炸鱼薯条，本地人排队）、Mackenzie\'s Bar & Grill（牛排，量大）。\n⚠️ 全镇餐厅不多，圣诞周不订位可能等 40 分钟。',
        pay: { card: 1 } },
      { name: '暗夜观星 · Dark Sky Project', lat: -44.0034, lng: 170.4775, type: 'drink', time: '22:30',
        desc: '全球最大暗夜保护区之一。夏季 22:30 后天才黑透，别去早了。',
        budget: 'NZ$120–200 / 人',
        detail: '两种玩法：\n1) 约翰山天文台团（约 2 小时，含望远镜观测，最推荐）\n2) 镇上中文观星团（更便宜，讲得细）\n12/22 前后接近满月，月亮太亮会压掉银河。如果只有一晚，优先选月亮还没升起的时段。\n云量 > 50% 会取消并改期。',
        pay: { card: 1 } },
      { name: 'Tekapo Springs 温泉', lat: -43.9947, lng: 170.4612, type: 'spot', time: '—',
        desc: '阴天或观星取消的 Plan B。三个池子正对湖和山，晚上泡着看星星。',
        budget: 'NZ$32 / 人',
        detail: '营业到 21:00 左右（夏季可能延长），带泳衣，毛巾可租。' }
    ]
  },

  /* ─────────── D3 ─────────── */
  {
    id: 3, label: 'D3 · 12/22', date: '12月22日 周二', title: '库克山一日往返',
    color: '#3f8fc4', region: 'Aoraki / Mt Cook',
    drive: 'Tekapo ⇄ 库克山村 约 105 km / 1 小时 20 分 单程',
    stay: '特卡波',
    summary: '全天最高光：胡克谷步道走到冰川湖。早上出发，中午回程，下午留白。',
    route: 'Tekapo → Lake Pukaki 观景台 → 鲑鱼农场 → 库克山村 → Hooker Valley → 回 Tekapo',
    weather: '山区 5–20℃，随时可能变天，风大',
    locations: [
      { name: '好牧羊人教堂（清晨场）', lat: -44.0034, lng: 170.4825, type: 'spot', time: '07:00',
        desc: '七点的教堂只有你和湖。这是整个行程最该早起的一天。',
        detail: '夏季日出约 05:50，07:00 时太阳已经照亮湖对岸的山，教堂还在阴影里，光线最柔。\n拍完回镇上吃早餐，08:30 出发去库克山。' },
      { name: 'Peter\'s Lookout · 普卡基湖', lat: -44.1902, lng: 170.1400, type: 'spot', time: '09:30',
        desc: '普卡基湖最经典的观景台，蓝得不真实。风大，穿外套。',
        detail: '从 Tekapo 走 SH8 到 Twizel 方向，转 SH80 前就是这个观景台。\n这里是拍库克山倒影最好的位置之一，晴天上午顺光。' },
      { name: 'Mt Cook Alpine Salmon 鲑鱼农场', lat: -44.1900, lng: 170.1400, type: 'food', time: '10:00',
        desc: '玻璃房里卖现切帝王鲑，$15 一小盒，配着湖景吃。',
        budget: 'NZ$15–30 / 人',
        detail: '就在 Peter\'s Lookout 旁边，同一片停车场。\n买 sashimi 盒（生鱼片），不要买烟熏的，差别很大。\n带个保温袋，回程还能吃。',
        pay: { card: 1, cash: 1 } },
      { name: 'Hooker Valley Track', lat: -43.7073, lng: 170.0999, type: 'spot', time: '11:00',
        desc: '新西兰性价比最高的步道：10 km 往返、3 小时、几乎没有爬升，终点是浮冰湖。',
        detail: '全程三座吊桥，最后一段到 Hooker Lake，冰川末端就在湖对岸。\n路面平缓但无遮阴，正午紫外线极强，帽子墨镜防晒必带。\n停车在 White Horse Hill 营地，旺季 10 点后要排队，所以今天 11 点到已经偏晚——如果车位满，先去 Hermitage 停，再走 15 分钟过来。\n带 1L 水/人，路上没有补给。' },
      { name: 'The Hermitage 午餐', lat: -43.7332, lng: 170.0937, type: 'food', time: '14:30',
        desc: '走完步道唯一的正经餐厅，落地窗正对库克山。不需要惊艳，需要热量。',
        budget: 'NZ$35–55 / 人',
        detail: 'The Panorama Room 自助 / Snowline Lounge 简餐。\n如果不想吃正餐，村里只有这一家，没有别的选择。',
        pay: { card: 1 } },
      { name: '回 Tekapo · 湖边发呆', lat: -44.0045, lng: 170.4777, type: 'spot', time: '17:00',
        desc: '下午什么都不安排。走了一天，泡澡、洗衣、把鞋晾干。',
        detail: '回程可在 Twizel 加油（比 Tekapo 便宜）。\n晚上如果昨天观星取消，今天是第二次机会。' }
    ]
  },

  /* ─────────── D4 ─────────── */
  {
    id: 4, label: 'D4 · 12/23', date: '12月23日 周三', title: '穿山 · 进西海岸',
    color: '#3c8f6e', region: 'Arthur\'s Pass → West Coast',
    drive: 'Tekapo → Franz Josef 约 430 km / 6 小时（含停留）',
    stay: '弗朗兹约瑟夫（住 2 晚）',
    summary: '全天在路上，但这是南岛最美的一段。Arthur\'s Pass 山口、Otira 峡谷、Hokitika。',
    route: 'Tekapo → Fairlie → Burkes Pass → Arthur\'s Pass → Otira → Hokitika → Franz Josef',
    weather: '山口 6–18℃，西海岸多雨，带雨衣',
    locations: [
      { name: '出发 · 加满油', lat: -44.0045, lng: 170.4777, type: 'transport', time: '08:00',
        desc: '今天 430 km，出发前加满。Fairlie 是最后一个便宜的加油站。',
        detail: '今天是最长的一天，早点走。\n路线上没有任何"必须看"的点，看到好看的观景台就停，这是自驾的意义。' },
      { name: 'Fairlie Bakehouse', lat: -44.0976, lng: 170.8289, type: 'food', time: '08:45',
        desc: '南岛最有名的派店，猪肉苹果派和鹿肉派。早上 9 点刚出炉。',
        budget: 'NZ$10–20 / 人',
        detail: '排队是常态，但翻台快。买两个带走，路上当午餐。\nFairlie 也是最后能买到像样咖啡的地方。',
        pay: { card: 1, cash: 1 } },
      { name: 'Arthur\'s Pass 山口', lat: -42.9328, lng: 171.5683, type: 'spot', time: '10:30',
        desc: '南阿尔卑斯唯一贯穿东西的公路山口，海拔 920 m。Devil\'s Punchbowl 瀑布就在这。',
        detail: 'Devil\'s Punchbowl 步道往返 1 小时、131 米爬升、两座吊桥，终点是 131 m 瀑布，值得走。\n山口天气变化快，可能突然起雾或下雨，路滑减速。\n⚠️ 这一段山路弯多，右舵新手别赶时间。' },
      { name: 'Otira 峡谷', lat: -42.8550, lng: 171.6150, type: 'spot', time: '12:00',
        desc: '下山的盘山公路，旧铁路桥和隧道口。电影感很强的一段。',
        detail: '这段路 steep 且窄，货车多。用低挡下坡，别一路踩刹车。\n观景台在 Otira 镇上，可以停下来看看老铁路。' },
      { name: 'Hokitika 小镇', lat: -42.7175, lng: 170.9669, type: 'food', time: '13:30',
        desc: '西海岸最大镇，绿玉（pounamu）产地。海滩上有那个著名的 HOKITIKA 木牌。',
        budget: 'NZ$20–35 / 人',
        detail: '吃：Fat Pipi Pizza（本地最有名，湖景）、Stumpers Cafe。\n逛：Hokitika Glass Studio 看玻璃吹制，Jade Factory 看玉石。\n海滩被当地人叫 Sunset Point，傍晚才好看，今天赶时间就别等了。',
        pay: { card: 1 } },
      { name: 'Franz Josef 村 · 入住', lat: -43.4757, lng: 170.1981, type: 'hotel', time: '16:30',
        desc: '一条主街的小村，400 个常住人口。冰川就在村子后面几公里。',
        detail: '今晚两件事：\n1) 去冰川向导公司前台确认明天集合时间和天气判断\n2) 超市买 25 号两餐的食材（镇上 Four Square 小但够用，今天不买明天就更少）\n⚠️ 明天是圣诞前夜，镇上餐厅八成要做圣诞套餐且需要订位。' },
      { name: 'Franz Josef 山谷步道（雨天备选）', lat: -43.4700, lng: 170.1750, type: 'spot', time: '—',
        desc: '如果明天飞不了，这条 5.4 km 往返的免费步道能走到离冰川末端几百米的地方。',
        detail: '约 1.5 小时往返，平缓。牌子标着几十年前冰在哪儿，看着挺震撼。\n下大雨后可能封闭，出发前看停车场公告板。' }
    ]
  },

  /* ─────────── D5 ─────────── */
  {
    id: 5, label: 'D5 · 12/24', date: '12月24日 周四', title: '冰川徒步 · 平安夜',
    color: '#2f7d5f', region: 'Westland Tai Poutini',
    drive: '村内步行 · 马瑟森湖 25 分钟车程',
    stay: '弗朗兹约瑟夫',
    summary: '今天只做一件大事：上冰川。下午泡温泉，平安夜在村里吃一顿。',
    route: '冰川基地集合 → 直升机 → 冰上徒步 → 温泉 → Matheson 湖日落',
    weather: '村里 12–20℃，冰上体感 5℃ 左右',
    locations: [
      { name: 'Franz Josef Glacier Guides 集合', lat: -43.4757, lng: 170.1981, type: 'transport', time: '08:45',
        desc: '提前 15 分钟到。换装备、称重、看安全片，全程约 3 小时含飞行。',
        budget: 'NZ$650–750 / 人',
        detail: '穿：3–4 层上装 + 薄长裤（不要牛仔裤）+ 墨镜（必带，冰面反光会灼眼）。\n公司提供：防水外套、防水裤、雪靴、厚袜、冰爪、手套、帽子。\n体重上限约 115 kg，年龄下限约 10 岁，孕妇不能参加。\n⚠️ 圣诞当天（12/25）全部停业，所以今天必须飞。' },
      { name: '直升机 → 冰上徒步', lat: -43.4650, lng: 170.1600, type: 'spot', time: '09:30',
        desc: '5 分钟飞到冰川上部，冰爪踩上蓝冰，走 2 小时。冰洞、冰塔、融水沟。',
        detail: '向导每天现改路线，冰川每天都在变。\n相机：带手机就够，挂脖子上别拿手上。直升机上不能带包、自拍杆、无人机。\n天气取消：可以直接顺延到当天下午场，或者改天。这也是我为什么在村里留两晚。',
      },
      { name: 'Glacier Hot Pools', lat: -43.4740, lng: 170.1880, type: 'spot', time: '13:30',
        desc: '三个丛林里的热水池，走完冰川泡进去。某些徒步套餐含门票。',
        budget: 'NZ$35 / 人（套餐可能含）',
        detail: '带泳衣和毛巾。池子不大，旺季下午人多，14:00 前到最好。' },
      { name: 'Lake Matheson', lat: -43.4392, lng: 169.9652, type: 'spot', time: '18:00',
        desc: '南岛最著名的倒影湖，晴天能看到库克山和塔斯曼山的完整倒影。',
        detail: '环湖步道 1 小时，Reflection Island 是最佳机位。\n没有风的时候（清晨/傍晚）倒影最清。今天傍晚去正好，但要有云才出彩，全晴反而平淡。\n从村里开 25 分钟，路上会经过 Fox 小镇。' },
      { name: '平安夜晚餐', lat: -43.4757, lng: 170.1981, type: 'food', time: '19:30',
        desc: '村里几家餐厅今天会做圣诞套餐，一定要 12/23 就订好。',
        budget: 'NZ$60–100 / 人（圣诞套餐价）',
        detail: '村内选择不多：The Landing、Full of Beans、Snake Bite Brewery。\n⚠️ 明天（12/25）镇上餐厅大量休息，所以今晚把明天的早餐和午餐买好。',
        pay: { card: 1 } }
    ]
  },

  /* ─────────── D6 ─────────── */
  {
    id: 6, label: 'D6 · 12/25', date: '12月25日 周五', title: '圣诞节 · 到皇后镇',
    color: '#d4583c', region: 'Haast Pass → Queenstown',
    drive: 'Franz Josef → 皇后镇 约 350 km / 5 小时',
    stay: '皇后镇（住 3 晚）',
    summary: '圣诞当天不安排任何需要预约的东西。沿着 Haast Pass 一路南下，车里吃三明治。',
    route: 'Franz Josef → Fox → Haast Pass → Lake Hawea → Lake Wanaka → Crown Range → 皇后镇',
    weather: '山口 10–20℃，瓦纳卡湖边风大',
    locations: [
      { name: '出发 · 今天加油站大部分关门', lat: -43.4757, lng: 170.1981, type: 'transport', time: '08:30',
        desc: '⚠️ 圣诞当天超市、商店几乎全关，加油站看运气。出发前加满，油箱半箱以下绝对不行。',
        detail: 'Franz Josef 到 Haast 约 1 小时 40 分，中间只有 Fox 一个村。\nHaast 到 Wanaka 之间有 120 km 完全没有加油站，注意。' },
      { name: 'Fox Glacier 村', lat: -43.5170, lng: 170.1387, type: 'spot', time: '09:20',
        desc: '路过看一眼。如果昨天冰川取消，这里也有向导公司（但圣诞也停业）。',
        detail: '镇上的 Fox Glacier Viewpoint 可以远看冰川末端，10 分钟的事。' },
      { name: 'Ship Creek / Knights Point', lat: -43.7131, lng: 169.2248, type: 'spot', time: '11:00',
        desc: '西海岸最荒的一段路，海就在左边。Knights Point 观景台是《钢琴课》的取景地。',
        detail: 'Ship Creek 有两条短步道：沙丘步道 20 分钟、雨林步道 30 分钟。\n运气好能在河口看到白鹭。风极大，别穿帽子松松的外套。' },
      { name: 'Haast Pass 山口', lat: -44.1073, lng: 169.3548, type: 'spot', time: '12:00',
        desc: '从西海岸翻回东侧的通道。Blue Pools 和 Thunder Creek Falls 都在附近。',
        detail: 'Blue Pools：往返 30 分钟，吊桥下的水是真的蓝绿色，但 2026 年部分区域可能因步道维护关闭，到现场看告示。\nThunder Creek Falls：路边 5 分钟就能看，96 m 高，免费。\n今天下着雨也别沮丧，这条路雨天更有气氛。' },
      { name: 'Lake Hawea 观景台', lat: -44.4392, lng: 169.3257, type: 'spot', time: '13:30',
        desc: '一片深蓝的湖，观景台就在公路边。停下来吃自带的饭。',
        detail: 'The Neck 是 Hawea 和 Wanaka 两湖之间的地峡，两侧都是湖，是南岛最奇特的一段公路。' },
      { name: 'That Wanaka Tree', lat: -44.6983, lng: 169.1176, type: 'spot', time: '14:30',
        desc: '湖里长着的那棵树，新西兰被拍得最多的树。圣诞当天人反而少。',
        detail: '停车：湖滨路边有免费车位，步行 3 分钟到树。\n想拍没人版本：清晨 06:30 前，或者像今天这种节日中午——本地人都在家吃饭。\n⚠️ 水位低的时候不要走到树根下面的泥里，会被罚。' },
      { name: 'Crown Range 山路 → 皇后镇', lat: -44.9159, lng: 168.7396, type: 'spot', time: '16:00',
        desc: '新西兰最高的一条铺装公路，海拔 1076 m。山顶俯瞰整个 Wakatipu 盆地。',
        detail: '山路弯急且窄，下坡用低挡。房车和大巴多，遇到让行区一定要停。\n如果不想走山路，可以从 Cromwell 绕行（多 30 分钟但全程平缓）。\n山顶 Cardrona Hotel 是 1863 年的老酒馆，门口拍照点，今天可能休息。' },
      { name: '皇后镇 · 入住', lat: -45.0312, lng: 168.6626, type: 'hotel', time: '17:30',
        desc: '到了。今天什么都不做，把车停进车位就不要再开。',
        detail: '⚠️ 圣诞当天超市全关。今晚和明天的早餐，如果昨天没买够，只能靠便利店（Four Square 可能开半天）。\n好消息：皇后镇属于有圣诞交易豁免的旅游区，餐厅和部分商店会开门。' },
      { name: '圣诞晚餐 · 湖畔', lat: -45.0328, lng: 168.6587, type: 'food', time: '19:30',
        desc: '圣诞夜的皇后镇餐厅基本都开，但几乎都要提前订。订不到就在湖边买炸鱼薯条。',
        budget: 'NZ$60–120 / 人',
        detail: '可选：Rata（现代新西兰菜，需早订）、Botswana Butchery（牛排）、Fergburger（永远排队但不用订）。\n今天澳新地区最松弛的一天，别把节奏排满。',
        pay: { card: 1 } }
    ]
  },

  /* ─────────── D7 ─────────── */
  {
    id: 7, label: 'D7 · 12/26', date: '12月26日 周六', title: '皇后镇 · 慢慢来',
    color: '#c94c33', region: 'Queenstown',
    drive: '镇上全程步行',
    stay: '皇后镇',
    summary: 'Boxing Day。上午湖边和花园，下午缆车看全景，晚上吃一顿正经饭。',
    route: '湖畔 → Queenstown Gardens → 镇中心 → Skyline 缆车 → 晚餐',
    weather: '18–24℃，午后可能阵雨',
    locations: [
      { name: 'Fergburger', lat: -45.0317, lng: 168.6595, type: 'food', time: '10:30',
        desc: '全世界最有名的汉堡。聪明做法：上午 10:30 去，避开 12 点到 20 点的长队。',
        budget: 'NZ$18–25 / 人',
        detail: '招牌：Fergburger with cheese（牛肉+蓝纹芝士酱）、Sweet Bambi（鹿肉）。\n排队 30–60 分钟是常态，10:30 去基本 10 分钟拿到。\n隔壁 Fergbaker 的派和 donut 也值得顺手买。',
        pay: { card: 1, alipay: 0.5 } },
      { name: 'Queenstown Gardens', lat: -45.0363, lng: 168.6617, type: 'spot', time: '12:00',
        desc: '半岛上的老植物园，绕一圈 40 分钟。湖、山、老树，皇后镇最不吵的地方。',
        detail: '从镇上走过去 8 分钟。里面有免费飞盘高尔夫场（disc golf），本地人天天来。\n半岛尽头正对 Remarkables 山脉，是拍全景的好机位。' },
      { name: '镇上闲逛 / 购物', lat: -45.0312, lng: 168.6626, type: 'spot', time: '13:30',
        desc: 'Boxing Day 是新西兰的折扣日，户外装备店会有真折扣。',
        detail: 'Outside Sports、Small Planet 有羽绒服和冲锋衣折扣，比国内便宜。\n⚠️ 今天全镇最挤，餐厅要排队取号。' },
      { name: 'Skyline 缆车 + 山顶', lat: -45.0283, lng: 168.6561, type: 'spot', time: '17:00',
        desc: '缆车 6 分钟上到 Bob\'s Peak，整片湖和山在脚下。傍晚上去看日落最好。',
        budget: 'NZ$62 / 人（缆车往返）',
        detail: '山顶还有 luge（滑板车）和观景平台。\n日落约 21:15，17:00 上去可以先玩 luge，再等光。\n山顶自助餐厅要提前订位，不订就下来城里吃。' },
      { name: '晚餐 · 牛排或亚洲菜', lat: -45.0313, lng: 168.6588, type: 'food', time: '19:30',
        desc: '今天可以吃顿好的。Jervois Steak House 是南岛最好的牛排馆之一。',
        budget: 'NZ$80–140 / 人',
        detail: '备选：Blue Kanu（太平洋融合菜，气氛好）、Madam Woo（马来菜）、Botswana Butchery（湖景牛排）。\n都要提前订，12/26 是全年最忙的一天之一。',
        pay: { card: 1 } }
    ]
  },

  /* ─────────── D8 ─────────── */
  {
    id: 8, label: 'D8 · 12/27', date: '12月27日 周日', title: '米尔福德峡湾',
    color: '#2e6f8e', region: 'Fiordland',
    drive: '不自己开 · 跟大巴团 往返约 12.5 小时',
    stay: '皇后镇',
    summary: '全天跟团。早上 06:45 出发，晚上 19:30 回来。不用开车，车上睡觉。',
    route: '皇后镇 → Te Anau → Milford Road → 峡湾游船 → 原路返回',
    weather: '峡湾年降雨 6 米，带防水外套，下雨更好看',
    locations: [
      { name: '皇后镇集合出发', lat: -45.0312, lng: 168.6626, type: 'transport', time: '06:45',
        desc: '玻璃顶大巴，从镇上酒店或指定点接。今天起最早的一天。',
        budget: 'NZ$239–290 / 人（含游船与午餐）',
        detail: '要带：防水外套、保暖层、防晒、水、晕车药（山路 4 小时）。\n不要自己开车：单程 288 km、4 小时 15 分，往返 9 小时纯驾驶，看完峡湾再开回来非常危险。' },
      { name: 'Te Anau 休息', lat: -45.4183, lng: 167.7143, type: 'transport', time: '09:00',
        desc: '去程的 20 分钟休息点，Fiordland 的门户小镇。买杯咖啡。',
        detail: '从这里开始进入 Fiordland 国家公园，之后 2 小时没有信号、没有加油站。' },
      { name: 'Milford Road 沿途停靠', lat: -44.9000, lng: 168.1000, type: 'spot', time: '10:00',
        desc: 'Eglinton Valley 草原、Mirror Lakes 倒影湖、Homer Tunnel 隧道。司机会停几个点。',
        detail: 'Homer Tunnel 单边通行，可能要等 10–15 分钟，隧道里没灯。\n这条路是新西兰工程奇迹，1930 年代全靠人工凿出来。' },
      { name: '米尔福德峡湾 游船', lat: -44.6410, lng: 167.8970, type: 'spot', time: '11:45',
        desc: '2 小时游船，开到塔斯曼海口再折返。Mitre Peak 的尖顶、Stirling Falls 的水雾。',
        detail: '最好的位置：顶层露天甲板，靠右舷（去程看瀑布侧）。\nStirling Falls 旁船会开到瀑布底下让你淋，相机收好。\n看海豹：通常在入口处的岩石上；运气好有企鹅和海豚。\n⚠️ 下雨天最壮观——几百条临时瀑布从崖壁上挂下来，这也是峡湾名字的来源。' },
      { name: '回程 · 车上睡觉', lat: -45.0312, lng: 168.6626, type: 'transport', time: '16:00',
        desc: '回程 4 小时。今天不安排任何晚餐计划，回来点个外卖就行。',
        detail: '19:30 左右回到皇后镇。Fergburger 这会儿排队反而短。' },
      { name: '备选：峡湾观光飞行', lat: -44.6410, lng: 167.8970, type: 'spot', time: '—',
        desc: '如果不想坐 8 小时车，可以飞进飞出，单程 40 分钟，但贵且怕天气。约 NZ$600–750/人。',
        detail: '天气取消率高，一般建议单程飞、单程坐车。' }
    ]
  },

  /* ─────────── D9 ─────────── */
  {
    id: 9, label: 'D9 · 12/28', date: '12月28日 周一', title: '箭镇 + 酒庄',
    color: '#8a6a3f', region: 'Wakatipu Basin',
    drive: '皇后镇 ⇄ 箭镇 约 20 km / 25 分钟',
    stay: '皇后镇',
    summary: '开出去半小时就换了世界。淘金小镇、河谷、中奥塔哥的黑皮诺。',
    route: '皇后镇 → Lake Hayes → 箭镇老街 → 华人定居点 → Gibbston 酒庄 → 回城',
    weather: '20–26℃，河谷更热',
    locations: [
      { name: 'Lake Hayes 环湖', lat: -44.9811, lng: 168.8084, type: 'spot', time: '09:30',
        desc: '一面镜子。没风的时候山和树的倒影完整得不像话。',
        detail: '环湖步道 8 km，走一段就够。湖东侧有观景台，从皇后镇过去顺路。\n早上去，风小、人少。' },
      { name: '箭镇 Buckingham Street', lat: -44.9389, lng: 168.8339, type: 'spot', time: '10:30',
        desc: '1860 年代淘金潮留下的主街，木结构老房子，现在是咖啡馆和小店。',
        detail: '吃：Provisions of Arrowtown（brunch 名店，要等位）、Postmasters Kitchen（老邮局改建）。\n逛：Patagonia Chocolates（手工巧克力和冰淇淋）、The Remarkable Sweet Shop。\n⚠️ 箭镇的"金色"是秋天（4 月），12 月是绿色夏天，别抱着看秋色的期待来。' },
      { name: 'Arrowtown Chinese Settlement', lat: -44.9382, lng: 168.8257, type: 'spot', time: '12:30',
        desc: '1860 年代华人矿工住的石屋遗址，就在河边，免费。看完这段历史会有点沉默。',
        detail: '沿 Arrow River 步行 5 分钟。\n河对岸可以淘金（Lakes District Museum 租淘金盘 $5），小孩和大人都会上瘾。' },
      { name: 'Gibbston Valley 酒庄', lat: -45.0287, lng: 168.9684, type: 'food', time: '14:30',
        desc: '中奥塔哥黑皮诺的核心产区，世界最南的葡萄酒产区之一。',
        budget: '品酒 NZ$25–45 / 人',
        detail: '几家可选：Gibbston Valley（有酒窖参观）、Kinross（多家酒庄集合品鉴）、Amisfield（餐厅米其林级别，要早订）。\n⚠️ 开车不能喝。两人出行建议：一人品酒、一人当司机，或者订带接送的一日团。\n今天安排了品酒，司机就只喝气泡水。',
        pay: { card: 1 } },
      { name: 'Amisfield（可选晚餐）', lat: -44.9862, lng: 168.8152, type: 'food', time: '18:30',
        desc: '新西兰最受推崇的餐厅之一，主厨 Vaughan Mabee。菜单可能 20 道以上。',
        budget: 'NZ$250–400 / 人',
        detail: '必须提前很久订，且要求整桌都点套餐。\n如果预算不允许，Gibbston Valley 的 bistro 也不错。' },
      { name: 'Kawarau Bridge Bungy', lat: -45.0094, lng: 168.9003, type: 'spot', time: '—',
        desc: '世界商业蹦极的发源地，43 米。不跳也可以去看别人跳，免费的观景台。',
        budget: '跳 NZ$205 / 人',
        detail: '回程顺路，停车 10 分钟看一会儿。' }
    ]
  },

  /* ─────────── D10 ─────────── */
  {
    id: 10, label: 'D10 · 12/29', date: '12月29日 周二', title: '留白日 · 格林诺奇',
    color: '#6b5f8f', region: 'Glenorchy / Queenstown',
    drive: '皇后镇 → 格林诺奇 约 45 km / 45 分钟',
    stay: '皇后镇',
    summary: '这天故意空着。天气好就去格林诺奇，天气差就补觉、逛街、坐蒸汽船。',
    route: '皇后镇 → Lake Wakatipu 湖滨公路 → Glenorchy → Bob\'s Cove（回程）',
    weather: '18–24℃，湖边风大',
    locations: [
      { name: 'Glenorchy–Queenstown Road', lat: -45.0200, lng: 168.5200, type: 'spot', time: '09:30',
        desc: '被称为世界上最美的一条公路。45 分钟，一路都是湖和雪山。',
        detail: '沿途有几个观景台（Bennett\'s Bluff、Seven Mile Point），看到就停。\n路窄弯多，注意会车。' },
      { name: '格林诺奇小镇 & 栈桥', lat: -44.8500, lng: 168.3830, type: 'spot', time: '10:30',
        desc: '《指环王》的"中土世界"取景地。红色小木屋和湖上栈桥是标志性机位。',
        detail: 'Glenorchy Wharf 的红房子 + 栈桥，45° 角拍最出片。\n镇上有两家咖啡馆，Glenorchy Cafe 的派不错。\n想深入中土：Dart River 喷气船 Safari（约 2 小时，NZ$200+）或骑马团。' },
      { name: 'Bob\'s Cove', lat: -45.0749, lng: 168.5122, type: 'spot', time: '12:30',
        desc: '回程路上的隐藏景点：一片被山包围的翡翠小湾，有老码头和野餐区。',
        detail: '停车场到码头 5 分钟，码头可以跳水（水很冷但清）。\n比格林诺奇人少得多，适合野餐。' },
      { name: 'TSS Earnslaw 蒸汽船（备选）', lat: -45.0337, lng: 168.6577, type: 'spot', time: '16:00',
        desc: '1912 年的蒸汽船，和泰坦尼克同岁。1 小时湖上往返，能看到船工往炉子里铲煤。',
        budget: 'NZ$95 / 人 起',
        detail: '如果今天天气不好，这个不受影响。\n可选含 Walter Peak 高原农场下午茶套餐。' },
      { name: '镇上买菜 · 备跨年', lat: -45.0312, lng: 168.6626, type: 'food', time: '18:30',
        desc: '今晚把 12/31 的零食饮料买好。跨年夜镇上超市会排长队。',
        detail: 'FreshChoice 或 Countdown（现在叫 Woolworths），在 Frankton 有更大的店。' }
    ]
  },

  /* ─────────── D11 ─────────── */
  {
    id: 11, label: 'D11 · 12/30', date: '12月30日 周三', title: '自由日',
    color: '#c2683a', region: 'Queenstown',
    drive: '看心情',
    stay: '皇后镇',
    summary: '第二个缓冲日。想刺激就跳伞/喷气船，想安静就喝咖啡看书。',
    route: '—（这一天不设定路线）',
    weather: '18–25℃',
    locations: [
      { name: 'Shotover Jet', lat: -44.9871, lng: 168.6714, type: 'spot', time: '10:00',
        desc: '25 分钟峡谷喷气船，360 度急转，会湿身。皇后镇最经典的刺激项目。',
        budget: 'NZ$184 / 人',
        detail: '在 Arthurs Point，镇上开车 10 分钟。\n带换洗衣物，坐后排右边最湿。' },
      { name: 'NZONE 高空跳伞', lat: -45.0200, lng: 168.7300, type: 'spot', time: '—',
        desc: '12000 或 15000 英尺，自由落体 60 秒。天气窗口决定一切。',
        budget: 'NZ$359–459 / 人 + 摄影套餐',
        detail: '12/30 订不到也没关系，这天的价值就是"随时能改"。' },
      { name: '镇上咖啡馆', lat: -45.0316, lng: 168.6594, type: 'food', time: '—',
        desc: 'Vudu Cafe、The Boat Shed、Yonder。新西兰咖啡水准整体很高，随便进不会踩雷。',
        budget: 'NZ$8–15 / 人',
        detail: '点 flat white，这是澳新地区的标准咖啡。\nYonder 的 brunch 有户外座位，晒得到太阳。' },
      { name: '跨年前一晚 · 早点睡', lat: -45.0312, lng: 168.6626, type: 'hotel', time: '21:00',
        desc: '明天要熬到午夜。今天别贪杯。',
        detail: '把明天的衣服准备好：白天短袖，晚上加外套（午夜湖边 12℃ 左右）。' }
    ]
  },

  /* ─────────── D12 ─────────── */
  {
    id: 12, label: 'D12 · 12/31', date: '12月31日 周四', title: '跨年',
    color: '#b8402e', region: 'Queenstown',
    drive: '不出城',
    stay: '皇后镇（深夜）',
    summary: '白天轻，傍晚回住处休息，19:30 去湖边占位置。午夜烟花在湖上炸开。',
    route: '上午湖边 → 下午休息 → Earnslaw Park 跨年 → 午夜烟花',
    weather: '18–24℃，午夜约 12℃',
    locations: [
      { name: '湖边早午餐', lat: -45.0330, lng: 168.6580, type: 'food', time: '10:00',
        desc: '跨年当天早上，镇上有一种"比赛还没开始"的安静。',
        budget: 'NZ$20–35 / 人',
        detail: '慢慢吃，今天没有要赶的地方。' },
      { name: 'Queenstown Hill 步道', lat: -45.0260, lng: 168.6660, type: 'spot', time: '13:00',
        desc: '1.5 小时往返，山顶的"Basket of Dreams"雕塑正对湖和 Remarkables。',
        detail: '入口在 Belfast Terrace，从镇上步行 10 分钟。\n不用等到日落，14:00 上去人少，看全景足够。' },
      { name: '回住处休息', lat: -45.0312, lng: 168.6626, type: 'hotel', time: '16:00',
        desc: '⚠️ 认真休息。跨年活动从晚上 7 点半一直到凌晨 1 点，站 5 个小时。',
        detail: '吃点东西，洗个澡，充电宝充满。\n今晚市中心从下午开始封路，别开车。' },
      { name: 'Earnslaw Park 跨年', lat: -45.0328, lng: 168.6587, type: 'drink', time: '19:30',
        desc: '免费公共跨年，Earnslaw Park 主舞台 + Marine Parade DJ 台，午夜湖上烟花。',
        budget: '免费',
        detail: '往年流程：13:00 起家庭活动（面部彩绘、巡游）→ 19:30 乐队开演 → 23:00 压轴 → 午夜烟花。\n占位建议：19:30 前到湖边，带野餐垫。Queenstown Gardens 半岛和码头也是好机位，人相对少。\n⚠️ 12/25 06:00 到 1/6 06:00，皇后镇和瓦纳卡 CBD 全域禁酒，带酒在街上喝会被警告或罚款。\n⚠️ 人多，看管好手机钱包。散场后走回住处，别等出租车。' },
      { name: '烟花 · 午夜', lat: -45.0358, lng: 168.6563, type: 'spot', time: '00:00',
        desc: '在 Lake Whakatipu 上空炸开。山谷会回响，整个湖面都是倒影。',
        detail: '这是整个行程的句号。\n1/1 早上飞走或留一天都行——但建议 1/1 下午的航班，别订太早。' }
    ]
  }
];
