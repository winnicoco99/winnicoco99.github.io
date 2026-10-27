/* ══════════════════════════════════════════════════════════════
   新西兰南岛 · 14 晚  行程数据
   日期：2027-01-02 抵达 → 2027-01-16 离境
   航线：基督城进、基督城出，顺时针一圈
   ══════════════════════════════════════════════════════════════ */

const TRIP = {
  title: '新西兰南岛',
  subtitle: '14 晚 · 8 个住宿点 · 约 1950 km',
  dateRange: '2027.1.2 — 1.16',
  start: '2027-01-02T08:35:00+13:00',
  end: '2027-01-16T22:30:00+13:00',
  travelers: 2,
  mode: '自驾（右舵左侧行驶）',
  hero: '避开圣诞和元旦的高价，一月中出发。麦肯奇高地的湖、瓦纳卡的慢、皇后镇的热闹、凯库拉的鲸，一路走完再回基督城。',
  heroSub: '一天最多开三小时，只有最后一天例外。地图上的折线是建议路线，随时可改。'
};

/* ── 住宿节点（均未预订）────────────────────────────── */
const STAYS = [
  {
    city: '基督城 Christchurch', nights: '1/2 — 1/3', n: 1,
    area: '市中心 / 大教堂广场一带',
    why: '落地第一晚只做一件事：把时差倒过来。选能步行到 Riverside Market 的位置，车停进酒店就不用动了。',
    type: '酒店（含停车位）',
    price: '约 NZ$180–260 / 晚',
    booked: false,
    lat: -43.5306, lng: 172.6358,
    search: 'Christchurch CBD hotel parking',
    tip: '一月不是旺季峰值，房价比圣诞那周低三四成，可以挑位置好的。'
  },
  {
    city: '库克山 Mt Cook', nights: '1/3 — 1/4', n: 1,
    area: 'Mt Cook Village / Glentanner',
    why: '住村里是为了省掉来回 210 公里的折返，早上推门就是雪山。这里也是暗夜保护区，晚上看星星不比蒂卡波差，人还少。',
    type: '山景酒店 / 度假营地',
    price: '约 NZ$380–520 / 晚',
    booked: false,
    lat: -43.7344, lng: 170.0958,
    search: 'Mount Cook Village accommodation',
    tip: '村里只有 Hermitage、Mt Cook Lodge 和 Glentanner 营地。一月比圣诞好订，但仍建议提前两周。'
  },
  {
    city: '瓦纳卡 Wanaka', nights: '1/4 — 1/7', n: 3,
    area: '镇中心 / 湖滨步行圈',
    why: '三晚不挪窝。瓦纳卡周边能徒步、能打枪、能跳伞，价格比皇后镇低一截，玩同样的项目省下来的钱够吃两顿好的。',
    type: '公寓（带厨房）',
    price: '约 NZ$240–380 / 晚',
    booked: false,
    lat: -44.6942, lng: 169.1367,
    search: 'Wanaka holiday home',
    tip: '一月超市餐馆全开，不用像圣诞那样囤粮。带厨房仍划算，早餐自己做省一半。'
  },
  {
    city: '皇后镇 Queenstown', nights: '1/7 — 1/10', n: 3,
    area: '市中心步行圈（Shotover St / Beach St）',
    why: '三晚，够走一趟格林诺奇、一趟箭镇，再留一天给项目或者发呆。一月房价比跨年那周低一半。',
    type: '公寓 / 精品酒店',
    price: '约 NZ$300–480 / 晚',
    booked: false,
    lat: -45.0312, lng: 168.6626,
    search: 'Queenstown central apartment',
    tip: '镇中心停车贵（NZ$4/小时），订带车位的。'
  },
  {
    city: '蒂阿瑙 Te Anau', nights: '1/10 — 1/12', n: 2,
    area: '湖滨 / 镇中心',
    why: '两晚是为峡湾留的。第一天到了休整，第二天一整天进峡湾，不用摸黑赶路。',
    type: '汽车旅馆 / 公寓',
    price: '约 NZ$200–290 / 晚',
    booked: false,
    lat: -45.4144, lng: 167.7181,
    search: 'Te Anau accommodation',
    tip: '蒂阿瑙是去峡湾的唯一落脚点，镇子很小，步行十分钟能横穿。'
  },
  {
    city: '但尼丁 Dunedin', nights: '1/12 — 1/14', n: 2,
    area: '八角广场 / 乔治街一带',
    why: '两晚，一天给半岛和信天翁，一天在城里看建筑。南岛最有城市感的地方。',
    type: '酒店 / 公寓',
    price: '约 NZ$180–280 / 晚',
    booked: false,
    lat: -45.8788, lng: 170.5028,
    search: 'Dunedin Octagon hotel',
    tip: '半岛看企鹅要提前订票，一月仍是旺季。'
  },
  {
    city: '奥马鲁 Oamaru', nights: '1/14 — 1/15', n: 1,
    area: '历史街区 / 海港附近',
    why: '一晚只为企鹅。蓝企鹅归巢是日落之后，看完就睡，第二天北上。',
    type: '旅馆 / B&B',
    price: '约 NZ$170–250 / 晚',
    booked: false,
    lat: -45.0972, lng: 170.9708,
    search: 'Oamaru accommodation',
    tip: '企鹅归巢门票单独买，提前在网上订好场次。'
  },
  {
    city: '凯库拉 Kaikoura', nights: '1/15 — 1/16', n: 1,
    area: '镇中心 / 海边',
    why: '最后一晚，只为第二天早上的观鲸。住镇上，走到集合点十分钟。',
    type: '汽车旅馆 / B&B',
    price: '约 NZ$220–320 / 晚',
    booked: false,
    lat: -42.4008, lng: 173.6810,
    search: 'Kaikoura accommodation',
    tip: '观鲸 7:15 集合，住处越近越好。镇上餐馆不多，龙虾那家要订。'
  }
];

/* ── 交通与门票 ────────────────────────────────────── */
const BOOKINGS = [
  {
    group: '航班（1/1 出发）',
    urgent: '待出票',
    items: [
      { name: '上海虹桥 SHA → 广州 CAN', meta: '1/1 周五 11:50–14:20 · CZ3524 · 空客 350',
        note: '虹桥 T2 出发，行李直挂到基督城。中转 1 小时 55 分。', status: '待订',
        link: 'https://www.csair.com' },
      { name: '广州 CAN → 基督城 CHC', meta: '1/1 16:15 → 1/2 08:35 · CZ8373 · 波音 787',
        note: '次日早上到，落地就能开始。总时长 15 小时 45 分。', status: '待订',
        link: 'https://www.csair.com' },
      { name: '基督城 CHC → 广州 CAN', meta: '1/16 周六 22:30 → 1/17 05:10 · CZ618 · 787-9',
        note: '最后一晚在飞机上，1/16 白天还能在凯库拉观鲸。', status: '待订',
        link: 'https://www.csair.com' },
      { name: '广州 CAN → 上海虹桥 SHA', meta: '1/17 07:00–09:15 · CZ3533',
        note: '中转 1 小时 50 分，行李直挂。', status: '待订',
        link: 'https://www.csair.com' }
    ]
  },
  {
    group: '租车',
    urgent: '高',
    items: [
      { name: '基督城机场取车 / 还车（15 天）', meta: '1/2 09:30 取 → 1/16 18:00 还',
        note: '同机场取还，没有异地费。SUV 或旅行车，建议全险（碎石路多，挡风玻璃最容易伤）。需要 NZTA 驾照翻译件。', status: '未订',
        link: 'https://www.rentalcars.com' }
    ]
  },
  {
    group: '必订体验',
    urgent: '高',
    items: [
      { name: '凯库拉观鲸（2 人）', meta: '1/16 早 7:15 场 · Whale Watch · 约 3.5 小时',
        note: '全程最关键的一票。抹香鲸全年可见，但海况不好会取消。订最早班，下午才来得及回机场。', status: '未订',
        link: 'https://www.whalewatch.co.nz' },
      { name: '米尔福德峡湾游船（2 人）', meta: '1/11 上午场 · Nature Cruise 约 2 小时',
        note: '从蒂阿瑙开车 2 小时到码头，订 10:30 前后的班次。', status: '未订',
        link: 'https://www.realnz.com' },
      { name: '奥马鲁蓝企鹅归巢', meta: '1/14 晚 21:00 前后 · 按日落时间选场次',
        note: '日落后企鹅上岸，禁止拍照。前排贵但看得清。', status: '未订',
        link: 'https://www.penguins.co.nz' },
      { name: '但尼丁奥塔哥半岛（信天翁 / 企鹅）', meta: '1/13 白天 · 半日团或自驾',
        note: 'Taiaroa Head 是大陆唯一信天翁繁殖地。自驾走 Portobello Road 风景好，路窄弯多。', status: '未订',
        link: 'https://www.albatross.org.nz' },
      { name: '皇后镇天空缆车 + Luge', meta: '1/8 下午',
        note: '缆车上看全景，Luge 买三次套票划算。傍晚人多，早点去。', status: '未订',
        link: 'https://www.skyline.co.nz' },
      { name: '蒂阿瑙萤火虫洞', meta: '1/10 下午 · 约 2.5 小时含船',
        note: '坐船过湖再进洞，洞里不能说话不能拍照。可选。', status: '未订',
        link: 'https://www.realnz.com' }
    ]
  },
  {
    group: '建议但不必抢',
    urgent: '中',
    items: [
      { name: '瓦纳卡跳伞 / 开飞机', meta: '1/5 或 1/6 上午',
        note: '瓦纳卡比皇后镇便宜 10–20%。天气决定，当天早上再定。', status: '未订',
        link: 'https://www.skydivewanaka.com' },
      { name: '库克山冰湖船 / 直升机', meta: '1/3 下午',
        note: 'Hooker Valley 徒步免费，这个看预算。直升机看冰川 300 起。', status: '未订',
        link: 'https://www.hermitage.co.nz' }
    ]
  }
];

/* ── 行前清单 ────────────────────────────────────── */
const CHECKLIST = [
  { group: '现在就要办', when: '10 月底 – 11 月中', items: [
    '改签机票：12/21 → 1/1 去，1/3 → 1/16 回（南航 95539）',
    '申请新西兰访客签证 Visitor Visa，NZD 441 起，官网 RealMe 账号',
    '签证材料：护照扫描、白底照、在职证明、3 个月流水（余额 5 万+）',
    '办 NZTA 认可驾照翻译件，6–8 个工作日，每人一份不能共用',
    '买旅行保险：要含医疗、行李、租车自付额、跳伞等高危项目',
    '检查护照有效期，需超过离境日 3 个月以上',
    '确认驾照未过期（过期要先换新证，再翻译）'
  ]},
  { group: '12 月要订掉', when: '越早越好，一月是本地暑假高峰', items: [
    '租车：基督城机场取还，15 天 SUV，全险把自付额降到 0',
    '库克山 1/3 一晚（Hermitage / Mt Cook Lodge / Glentanner）',
    '凯库拉 1/15 一晚，离观鲸集合点步行十分钟内',
    '瓦纳卡 1/4–6 三晚，带厨房，确认有停车位',
    '皇后镇 1/7–9 三晚',
    '蒂阿瑙 1/10–11 两晚',
    '但尼丁 1/12–13 两晚',
    '奥马鲁 1/14 一晚',
    '凯库拉观鲸 1/16 最早班 7:15，旺季提前 2–3 周',
    '米尔福德峡湾游船 1/11（RealNZ 或 Southern Discoveries）',
    '奥马鲁企鹅归巢 1/14 晚，VIP 看台要早订',
    '但尼丁奥塔哥半岛半日，含企鹅或信天翁',
    '皇后镇天空缆车 + 滑板车',
    '蒂阿瑙萤火虫洞（可选，和峡湾撞时间就放弃）'
  ]},
  { group: '出发前 7 天', when: '1/16 之前一周内', items: [
    '填 NZTD 电子入境申报，起飞前 24 小时内，免费',
    '买 eSIM（走 One NZ 网络，南岛覆盖最好）或落地机场买',
    '换 NZD 300–500 现金，小镇停车和集市只收现金',
    '装 App：Gaspy 加油比价、PayMyPark 停车、MetService 天气',
    '装 NZTA Journey Planner，出发前查封路和施工',
    '打印：护照复印件、签证、驾照翻译件、保险单、租车单',
    '所有预订确认页截图存相册，山里没信号也能看',
    '打电话给银行开通境外交易，避免刷卡被拒'
  ]},
  { group: '证件 · 随身包', when: '不要托运，放随身', items: [
    '护照原件 + 复印件（和原件分开放）',
    '签证批准信，打印一份',
    '中国驾照原件',
    'NZTA 驾照翻译件，彩色打印，每人一份',
    '旅行保险单 + 24 小时救援电话',
    '租车预订单 + 取车凭证',
    '机票行程单，含广州中转',
    '信用卡 2 张，Visa 或 Master，带芯片',
    '紧急联系人卡：使馆、家人、保险'
  ]},
  { group: '衣服 · 洋葱三层', when: '白天 22℃，夜里 10℃，一天四季', items: [
    '速干短袖 3–4 件，不要纯棉，湿了不干会失温',
    '长袖排汗衣 1–2 件',
    '抓绒或薄羽绒 1 件',
    '防风防水冲锋衣 1 件，必备，别省这个钱',
    '防水雨裤 1 条，徒步淋湿下半身最容易失温',
    '长裤 2 条：徒步裤 + 休闲裤',
    '短裤 1 条',
    '泳衣，湖边和温泉都用得上',
    '徒步鞋，防水，出发前穿开',
    '拖鞋或凉鞋',
    '帽子，带系绳，风大会吹走',
    '墨镜，UV400',
    '内衣袜子 5–6 套，快干材质',
    '一条薄围巾或脖套，峡湾船上挡风'
  ]},
  { group: '徒步与户外', when: 'Hooker Valley 3 小时，峡湾半天', items: [
    '20L 小背包',
    '1L 水壶或水袋',
    '登山杖，Hooker Valley 和峡湾步道有用',
    '头灯或手电',
    '防晒霜 SPF50+，100ml 以内随身',
    '润唇膏，带防晒，风大容易裂',
    '驱蚊液含 DEET，蒂阿瑙和峡湾是沙蝇重灾区',
    '止痒膏 + 抗组胺药，沙蝇咬了别抓',
    '速干毛巾',
    '可重复使用购物袋，超市塑料袋收费',
    '防水袋或密封袋，装手机和证件'
  ]},
  { group: '药品 · 注意违禁', when: '含麻黄碱的感冒药禁止入境', items: [
    '感冒药，不要含麻黄碱：新康泰克、白加黑、连花清瘟都禁',
    '肠胃药、止泻药',
    '止痛退烧药',
    '抗过敏药，氯雷他定',
    '晕船药，观鲸和峡湾提前 30–60 分钟吃',
    '创可贴、碘伏、纱布',
    '个人处方药，带医生英文说明和原包装',
    '隐形眼镜护理液，带足量',
    '所有药品集中一袋，主动申报'
  ]},
  { group: '电子与开车', when: '插座是 I 型三孔扁脚', items: [
    '转换插头，国标三孔可直接插，两孔需要转换',
    '多口插排，一个顶四个，很实用',
    '充电宝，小于 100Wh，随身不托运',
    '车充 + 数据线，导航很耗电',
    '相机 + 备用电池 + 存储卡',
    '提前看交规：靠左行驶、环岛让右、STOP 必须停',
    '记住限速：开放公路 100，城镇 50',
    '约定不开夜路，南岛夜路没灯，有动物横穿'
  ]},
  { group: '落地第一晚', when: '1/2 周六，基督城', items: [
    '取车拍视频：车身四角、轮胎、油表、里程',
    '确认还车时间和地点，1/16 基督城机场',
    '超市补给：Countdown、New World 或 Pak\u2019nSave',
    '买本地 SIM 或激活 eSIM，试一下能不能上网',
    '确认 1/3 路线和第一个加油点',
    '记住紧急电话 111',
    '注意：1/2 是新年假期尾巴，1/4 周一是公共假日，餐厅常加收 15%'
  ]}
];

const NOTE_SECTIONS = [
  {
    title: '为什么改到一月',
    items: [
      '圣诞和元旦那一周，蒂卡波、库克山、皇后镇的房价是平时的两倍，还要提前一个月抢。',
      '一月是南岛天气最稳的时候，白天 22–26℃，降雨少，看雪山的概率高。',
      '一月所有店全开，不用像 12/25 那样提前囤两天的粮。',
      '白天更长，晚上 9 点半才天黑，每天多玩两小时。',
      '机票也便宜：同样航线，一月比圣诞那周省 ¥1,000/人以上。'
    ]
  },
  {
    title: '为什么这样排',
    items: [
      '落地当天不跑长途，第一晚只做三件事：取车、进城、吃饭。',
      '库克山住一晚而不是当天往返，省掉 210 公里折返。',
      '瓦纳卡和皇后镇各三晚，中途不搬家，圣诞那种赶路感没有了。',
      '蒂阿瑙两晚是峡湾的物理要求：那边往返 4 小时车程加 2 小时船，一天只够干这一件事。',
      '最后从奥马鲁一路北上到凯库拉，1/16 早上观鲸，晚上飞。'
    ]
  },
  {
    title: '唯一的长途',
    items: [
      '1/15 奥马鲁 → 凯库拉 430 公里、5.5 小时，是全程最长的一天。',
      '凯库拉在基督城北边，从南边过来必须先经过基督城再往北折，绕不开。',
      '建议 8:00 出发，11:00 到基督城吃午饭，12:30 继续，15:00 到凯库拉。',
      '1/16 观鲸 7:15 集合，11:00 下船，12:30 出发回基督城，13:30 到，18:00 还车。'
    ]
  },
  {
    title: '被砍掉的',
    items: [
      '西海岸冰川（Franz Josef / Fox）。要绕 400 公里，14 晚塞进去就得砍掉南部两个镇。',
      '特威泽尔（Twizel）。住宿一般，不如往前开到库克山。',
      '基督城深度游。落地一晚 + 最后一天路过，够用。',
      '峡湾如果天气不好，改成蒂阿瑙湖边 + 萤火虫洞，不要硬闯山路。'
    ]
  }
];

/* ── 预算分类（单位 NZD，2 人合计）────────────────── */
const BUDGET_CATS = [
  { k:'flight', name:'机票',   icon:`<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>`, plan: 3318, note:'上海往返基督城，2 人 ¥14,268（¥7,134/人）' },
  { k:'stay',   name:'住宿',   icon:`<path d="M3 20V9l9-6 9 6v11"/><path d="M9 20v-6h6v6"/>`, plan: 3790, note:'14 晚，一月非峰值，8 个落脚点' },
  { k:'car',    name:'租车',   icon:`<path d="M5 17h14"/><path d="M6.5 17v2"/><path d="M17.5 17v2"/><path d="M4 17v-4l2-5h12l2 5v4z"/><circle cx="7.5" cy="14" r="1"/><circle cx="16.5" cy="14" r="1"/>`, plan: 1950, note:'15 天 SUV + 全险，同机场取还' },
  { k:'exp',    name:'体验',   icon:`<path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4z"/><path d="M13 7v10" stroke-dasharray="2 2"/>`, plan: 1090, note:'观鲸 + 峡湾 + 企鹅 + 半岛 + 缆车' },
  { k:'fuel',   name:'油费',   icon:`<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M3 21h12"/><path d="M4 10h10"/><path d="M14 8h2l3 3v7a2 2 0 0 0 2 2"/>`, plan: 273, note:'约 1950 km，91 号汽油' },
  { k:'food',   name:'吃饭',   icon:`<path d="M6 3v8a2 2 0 0 0 4 0V3"/><path d="M8 11v10"/><path d="M17 3c-1.5 1.5-2 3.5-2 6 0 2 .5 3 2 3s2-1 2-3c0-2.5-.5-4.5-2-6z"/><path d="M17 12v9"/>`, plan: 1650, note:'15 天，含凯库拉一顿龙虾' },
  { k:'other',  name:'其他',   icon:`<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>`, plan: 500, note:'门票 / 停车 / 伴手礼' }
];
const DEFAULT_RATE = 4.3;   // 1 NZD ≈ ? CNY，可在页面里改
const TRIP_PEOPLE = 2;
const TRIP_DAYS = 15;
/* ── 每日行程 ───────────────────────────────────── */
const DAYS = [
  {
    id: 0, label: '总览', color: '#0071e3', locations: []
  },

  /* ─────────── D1 ─────────── */
  {
    id: 1, label: 'D1 · 1/2', date: '1月2日 周六', title: '落地 · 基督城',
    color: '#5b8def', region: 'Canterbury',
    drive: '机场 → CBD 约 12 km / 25 分钟',
    stay: '基督城 CBD',
    summary: '飞了 16 小时，今天不做任何需要体力的事。取车、进城、吃饭、睡觉。',
    route: '广州 → 基督城 08:35 → 取车 → CBD 放行李 → Riverside Market → 植物园 → 早睡',
    weather: '夏季 14–25℃，傍晚有风',
    locations: [
      { name: '基督城机场 取车', lat: -43.4852, lng: 172.5355, type: 'transport', time: '09:30',
        desc: '国际到达出来步行 5 分钟到租车区。验车时绕车拍一圈视频，重点拍前挡风玻璃、四个轮毂和车顶。',
        detail: '驾照原件 + NZTA 翻译件 + 护照，三样一起递。确认三件事：油箱政策、是否含全险、有没有里程限制。\n右舵车：雨刷和转向灯位置是反的，先在停车场里绕两圈再出闸。出闸后靠左行驶，环岛让右。',
        pay: { card: 1, cash: 0 } },
      { name: 'Riverside Market 午餐', lat: -43.5339, lng: 172.6340, type: 'food', time: '12:00',
        desc: '落地第一顿不用想。室内市场，汉堡、生蚝、亚洲菜、咖啡都有，晚上 8 点后陆续收摊。',
        budget: 'NZ$25–40 / 人',
        detail: '推荐：Bacon Bros 的汉堡、市场里的新鲜生蚝、Roots 的素食碗。\n市场外侧沿 Avon 河有露天座位。',
        pay: { card: 1, cash: 0.5 } },
      { name: '基督城植物园 + 雅芳河', lat: -43.5306, lng: 172.6214, type: 'spot', time: '14:00',
        desc: '免费，走一圈刚好消食。一月玫瑰园正盛，雅芳河上有人撑篙（Punting）。',
        detail: '从 Riverside Market 步行 15 分钟到。园区很大，走到玫瑰园和温室就够。\n撑篙船 NZ$40/人左右，不坐也不遗憾。' },
      { name: '纸板大教堂', lat: -43.5315, lng: 172.6370, type: 'spot', time: '16:00',
        desc: '2011 年地震后建的过渡教堂，硬纸板管做梁，能用 50 年。免费进，五分钟看完。',
        detail: '就在 Cathedral Square，从植物园走回来顺路。\n旁边是追忆桥（Bridge of Remembrance）。' },
      { name: '晚餐 + 早睡', lat: -43.5320, lng: 172.6360, type: 'food', time: '18:30',
        desc: '别硬撑到半夜。今天睡够，明天才有力气开 335 公里。',
        budget: 'NZ$30–50 / 人',
        detail: 'CBD 推荐：Twenty Seven Steps（新西兰菜）、King of Snake（亚洲融合）。' }
    ]
  },

  /* ─────────── D2 ─────────── */
  {
    id: 2, label: 'D2 · 1/3', date: '1月3日 周日', title: '高原 · 蒂卡波 → 库克山',
    color: '#4aa3df', region: 'Mackenzie Country',
    drive: '基督城 → Tekapo 230 km / 3 h；Tekapo → 库克山 105 km / 1 h 15',
    stay: '库克山 Mt Cook Village',
    summary: '一天从平原开进雪山。Tekapo 停两小时拍照吃饭，晚上住到库克山脚下看星星。',
    route: '基督城 → 1 号公路南下 → Tekapo（好牧羊人教堂）→ 8 号公路 → Pukaki 湖 → 库克山',
    weather: '高原 11–24℃，晚上 8℃ 左右',
    locations: [
      { name: '基督城出发', lat: -43.5306, lng: 172.6358, type: 'transport', time: '08:30',
        desc: '走 1 号公路南下，过 Ashburton 后转 79 号再接 8 号。全程平坦，第一天上手右舵正好。',
        detail: '出城前加满油，基督城油价最便宜。\n途中 Ashburton 有超市，可以买点路上吃的。' },
      { name: '好牧羊人教堂', lat: -44.0045, lng: 170.4777, type: 'spot', time: '11:15',
        desc: 'Tekapo 唯一的必看点，1935 年的石头小教堂，背后就是湖和雪山。一月中午人不少，停车位要转两圈。',
        detail: '教堂内部不允许拍照，外面随便拍。\n一月鲁冰花基本谢了，别抱期望。真正好看的是湖水的奶蓝色——冰川岩粉悬浮在水里形成的，阴天也蓝。' },
      { name: 'Tekapo 镇午餐', lat: -44.0060, lng: 170.4790, type: 'food', time: '12:30',
        desc: '镇上餐馆不多，Run 77 或 Mackenzies 都行。吃完就走，不在镇上过夜。',
        budget: 'NZ$25–40 / 人',
        detail: '镇上 Four Square 东西少且贵，补给留到瓦纳卡。\n想吃日本料理可以看 Kohan，湖畔位置不错，要排队。' },
      { name: 'Pukaki 湖 · Peter\'s Lookout', lat: -44.1900, lng: 170.1300, type: 'spot', time: '14:00',
        desc: '从 Tekapo 往西开 30 分钟，路边观景台正对库克山，是整条路上最好的机位。',
        detail: '湖水比 Tekapo 更蓝，因为岩粉浓度更高。风大，外套穿上。\n观景台有卖高山三文鱼的摊位，冰鲜的。' },
      { name: 'Hooker Valley 步道', lat: -43.7167, lng: 170.1000, type: 'spot', time: '15:30',
        desc: '新西兰最值回票价的步道，全程 10 公里往返 3 小时，过三座吊桥，终点是冰川湖。几乎没爬升。',
        detail: '入口在 White Horse Hill 营地，停车位紧张，15:30 后反而好停。\n一月 22:00 才天黑，走到 19:00 回来完全来得及。\n体力不济就走到第一座吊桥折返，40 分钟，风景已经够。\n带水，路上没有补给点。' },
      { name: '库克山村住宿', lat: -43.7344, lng: 170.0958, type: 'hotel', time: '19:30',
        desc: '村里就 Hermitage、Mt Cook Lodge 和 Glentanner 营地。住这里是为了早上推门见雪山。',
        detail: 'Hermitage 贵但位置最好，落地窗正对库克山。Mt Cook Lodge 便宜一半，走路 10 分钟。\nGlentanner 在 20 公里外，是营地和小木屋。' },
      { name: '看星星', lat: -43.7300, lng: 170.0960, type: 'spot', time: '22:30',
        desc: 'Aoraki Mackenzie 暗夜保护区，光污染比 Tekapo 镇还少。出了酒店走 100 米就是一整片银河。',
        detail: '带手电（红光模式）和厚外套，晚上只有 8℃。\n手机拍星空：三脚架 + 长曝光 20 秒，ISO 3200。' }
    ]
  },

  /* ─────────── D3 ─────────── */
  {
    id: 3, label: 'D3 · 1/4', date: '1月4日 周一', title: '穿山口 · 库克山 → 瓦纳卡',
    color: '#3fa7b5', region: 'Otago',
    drive: '库克山 → Twizel 65 km / 50 min；→ 瓦纳卡 200 km / 3 h',
    stay: '瓦纳卡（3 晚）',
    summary: '早上补一段短步道，中午穿过 Lindis Pass 到瓦纳卡。到了先安顿，然后什么都不做。',
    route: '库克山 → Twizel → Omarama → Lindis Pass → 瓦纳卡 → 湖边',
    weather: '11–26℃，山口风大',
    locations: [
      { name: 'Kea Point 晨光', lat: -43.7200, lng: 170.1050, type: 'spot', time: '07:30',
        desc: '昨天没走完 Hooker Valley 的话，早上补这一段。30 分钟到观景台，正对 Mueller 冰川湖。',
        detail: '一月日出 6:10 左右，7:30 出发已经算晚，但晨光打在雪山上最好看。\n来回 1 小时，回酒店吃早饭刚好。' },
      { name: 'Twizel 补给', lat: -44.2578, lng: 170.1000, type: 'transport', time: '11:00',
        desc: '路过加个油，镇上有 Four Square。这是到瓦纳卡前最后一个像样的镇。',
        detail: 'Twizel 是三文鱼养殖区，镇上有几家卖高山三文鱼的小店，比景区便宜。' },
      { name: 'Lindis Pass', lat: -44.5833, lng: 169.6500, type: 'spot', time: '12:30',
        desc: '8 号公路最高的垭口，两侧是金黄色草坡，夏天看像苏格兰高地。',
        detail: '这一段弯多，注意限速（100 km/h，弯道 55）。\n观景台在最高点，停 10 分钟就够。' },
      { name: '瓦纳卡入住', lat: -44.6942, lng: 169.1367, type: 'hotel', time: '14:00',
        desc: '三晚，选步行能到湖和超市的。安顿下来就别开车了。',
        detail: '一月超市全开，不用囤粮。但带厨房仍划算。\nNew World 在镇中心，走路就到。' },
      { name: 'That Wanaka Tree', lat: -44.6975, lng: 169.1306, type: 'spot', time: '17:00',
        desc: '长在湖里的那棵柳树，新西兰被拍得最多的一棵树。日落前光线最好。',
        detail: '从镇中心沿湖走 10 分钟。傍晚人不少，等一会儿总能拍到没人的。\n水位高的时候树根泡在水里，构图最好看。' },
      { name: '晚餐', lat: -44.6942, lng: 169.1367, type: 'food', time: '19:30',
        desc: '镇上餐馆比皇后镇便宜，也不那么难订。',
        budget: 'NZ$40–60 / 人',
        detail: '推荐：Kika（tapas，要订）、Bistro Gentil（法式，湖景）、Francesca\'s（意大利）。' }
    ]
  },

  /* ─────────── D4 ─────────── */
  {
    id: 4, label: 'D4 · 1/5', date: '1月5日 周二', title: '慢 · 瓦纳卡',
    color: '#34c759', region: 'Wanaka',
    drive: '不出镇，最远 10 km',
    stay: '瓦纳卡',
    summary: '第一个整天。上午走一段步道，下午湖边发呆，或者去跳伞。',
    route: 'Mt Iron 步道 → 湖边 → Puzzling World（可选）→ 镇上吃饭',
    weather: '12–26℃，晴天概率高',
    locations: [
      { name: 'Mt Iron 步道', lat: -44.7015, lng: 169.1540, type: 'spot', time: '09:30',
        desc: '往返 1.5 小时，山顶 360 度看瓦纳卡湖和 Hawea 湖。爬升 240 米，不难但会出汗。',
        detail: '入口在 6 号公路旁的停车场，镇中心开车 5 分钟。\n山顶风大，带件外套。上午光线顺，拍湖最好。' },
      { name: '瓦纳卡湖边', lat: -44.6942, lng: 169.1367, type: 'spot', time: '12:00',
        desc: '一月湖水最暖，本地人直接下去游。找块草地躺下，这就是新西兰的夏天。',
        detail: '湖边有免费烧烤台（BBQ），带食材去烤也行，要自带锡纸和油。\nRippon 酒庄下午开门，湖景是全 NZ 最好的酒庄视角之一。' },
      { name: 'Puzzling World', lat: -44.6867, lng: 169.1617, type: 'spot', time: '14:30',
        desc: '视觉错觉博物馆，倾斜房间和迷宫。适合消磨下午。',
        detail: '门票 NZ$25 左右，两小时够。不去也不遗憾。' },
      { name: '跳伞 / 开飞机（可选）', lat: -44.6900, lng: 169.1400, type: 'spot', time: '16:00',
        desc: '瓦纳卡跳伞比皇后镇便宜 10–20%，12000 英尺约 NZ$439。开飞机体验 NZ$299 起。',
        budget: 'NZ$300–450 / 人',
        detail: '看天气，当天早上再定。上午气流稳，跳伞体验更好。' }
    ]
  },

  /* ─────────── D5 ─────────── */
  {
    id: 5, label: 'D5 · 1/6', date: '1月6日 周三', title: '再慢一天 · 瓦纳卡',
    color: '#7ac143', region: 'Wanaka',
    drive: '可选 Glendhu Bay / Cardrona 30–50 km',
    stay: '瓦纳卡',
    summary: '第三天。可以往湖上游开，去 Glendhu Bay 或 Cardrona 老酒馆，也可以什么都不做。',
    route: '湖西岸 Glendhu Bay → Cardrona → 回瓦纳卡',
    weather: '12–26℃',
    locations: [
      { name: 'Glendhu Bay', lat: -44.6667, lng: 169.0167, type: 'spot', time: '10:00',
        desc: '湖上游的一处开阔湾，水更静，人更少。沿湖开 20 分钟就到。',
        detail: '路边有野餐区和营地，适合带早饭来吃。\n再往里是 Motatapu 和 Diamond Lake 步道，短的那条 1 小时。' },
      { name: 'Cardrona 老酒馆', lat: -44.8833, lng: 168.9500, type: 'food', time: '12:30',
        desc: '1863 年的淘金时代酒馆，木头房子，墙上贴满旧钞票。冬天是滑雪场，夏天安静。',
        budget: 'NZ$30–50 / 人',
        detail: 'Cardrona Valley Road 上山，弯多但路况好，20 分钟。\n招牌是 lamb shank 和本地啤酒。' },
      { name: '回瓦纳卡 · 自由', lat: -44.6942, lng: 169.1367, type: 'spot', time: '15:00',
        desc: '下午回来，游泳、看书、洗衣服。旅行到第三天需要一天什么都不赶。',
        detail: '镇上洗衣房在 Ardmore Street，投币。' }
    ]
  },

  /* ─────────── D6 ─────────── */
  {
    id: 6, label: 'D6 · 1/7', date: '1月7日 周四', title: '水果小镇 · 瓦纳卡 → 皇后镇',
    color: '#f5a623', region: 'Central Otago',
    drive: '瓦纳卡 → Cromwell 55 km / 45 min；→ 皇后镇 60 km / 45 min',
    stay: '皇后镇（3 晚）',
    summary: '中途在 Cromwell 停一下吃车厘子，下午到皇后镇，傍晚上缆车看全景。',
    route: '瓦纳卡 → 6 号公路 → Cromwell → Kawarau 峡谷 → 皇后镇',
    weather: '15–28℃，内陆偏热',
    locations: [
      { name: '瓦纳卡晨湖', lat: -44.6942, lng: 169.1367, type: 'spot', time: '09:00',
        desc: '走之前再去湖边坐一会儿。早上湖面没风，倒影最清楚。',
        detail: 'Scroggin 的咖啡不错，买了路上喝。' },
      { name: 'Cromwell 水果小镇', lat: -45.0389, lng: 169.2000, type: 'food', time: '10:30',
        desc: '南岛的水果篮。一月是车厘子最甜、产量最集中的时候，路边果园直接卖。',
        budget: 'NZ$15–30（买水果）',
        detail: 'Cheeki Cherries 或 Jones Family Fruit Stall，都在 6 号公路边。\n车厘子按公斤卖，越大越贵，中号最划算。\n还有杏、桃、油桃、杏干。买多了装保鲜盒放车里。\n老城区（Old Cromwell Town）有咖啡馆，湖边坐坐不错。' },
      { name: 'Kawarau 峡谷蹦极', lat: -45.0120, lng: 168.8600, type: 'spot', time: '12:30',
        desc: '世界商业蹦极的发源地，43 米高，桥下是翡翠色的河。不跳也能在观景台看别人尖叫。',
        detail: '跳一次 NZ$205 左右，照片视频另算。\n不跳就在观景台看，免费。' },
      { name: '皇后镇入住', lat: -45.0312, lng: 168.6626, type: 'hotel', time: '14:00',
        desc: '三晚，选镇中心步行圈。车停酒店，这几天基本不用开。',
        detail: '镇中心停车 NZ$4/小时，酒店含车位是刚需。' },
      { name: '天空缆车 + Luge', lat: -45.0306, lng: 168.6585, type: 'spot', time: '16:00',
        desc: '缆车上去看整个 Wakatipu 湖和 Remarkables 山脉。Luge 滑板车是重力滑行，三轮套票最划算。',
        budget: 'NZ$60–90 / 人',
        detail: '缆车 + 3 次 Luge 套票约 NZ$79。\n傍晚上去能看到日落，山顶餐厅要提前订。' },
      { name: 'Fergburger', lat: -45.0318, lng: 168.6610, type: 'food', time: '19:30',
        desc: '皇后镇排队最长的汉堡店，24 小时营业。味道确实好，但排 40 分钟要有心理准备。',
        budget: 'NZ$18–25 / 人',
        detail: '招牌 Fergburger（牛肉培根芝士），辣味的 Sweet Bambi 也不错。\n避开 12:00–14:00 和 19:00–21:00。可以电话订，20 分钟后取。' }
    ]
  },

  /* ─────────── D7 ─────────── */
  {
    id: 7, label: 'D7 · 1/8', date: '1月8日 周五', title: '中土 · 格林诺奇',
    color: '#e8863a', region: 'Queenstown Lakes',
    drive: '皇后镇 → 格林诺奇 45 km / 45 min（单程）',
    stay: '皇后镇',
    summary: '沿湖开到格林诺奇，中土世界的取景地。下午回来休息。',
    route: '皇后镇 → Glenorchy Road → 格林诺奇 → 回皇后镇',
    weather: '13–24℃，湖边风大',
    locations: [
      { name: 'Glenorchy Road', lat: -45.0000, lng: 168.5500, type: 'transport', time: '09:00',
        desc: '新西兰最美的一段公路，45 公里贴着 Wakatipu 湖走，每个转弯都是观景台。开慢点。',
        detail: '全程有十几个停车点，建议停 3–4 个：Bennetts Bluff、Wilson Bay、Seven Mile Point。\n路窄弯多，注意对向车。' },
      { name: '格林诺奇小镇', lat: -44.8500, lng: 168.3833, type: 'spot', time: '10:30',
        desc: '《指环王》取景地，小镇只有一条街。湖头栈道走 20 分钟，看 Dart River 汇入湖口。',
        detail: 'Glenorchy Wharf 的红房子是标志性机位。\nMrs Woolly\'s General Store 的咖啡和派都不错。\n想深入可以报 Dart River 喷气艇，2 小时，NZ$200 起。' },
      { name: 'Paradise（可选）', lat: -44.7333, lng: 168.3667, type: 'spot', time: '12:00',
        desc: '再往里开 15 公里土路，就是《指环王》里的"天堂"。路不好走，普通轿车要慢。',
        detail: '土路有碎石和水坑，SUV 更合适。下雨后不建议进。' },
      { name: '回皇后镇', lat: -45.0312, lng: 168.6626, type: 'hotel', time: '15:00',
        desc: '下午回镇上，休息或者逛街。晚上自由。',
        detail: '可以试试 Patagonia 的冰淇淋，湖边那家。' }
    ]
  },

  /* ─────────── D8 ─────────── */
  {
    id: 8, label: 'D8 · 1/9', date: '1月9日 周六', title: '金矿小镇 · 箭镇',
    color: '#c25a8a', region: 'Queenstown Lakes',
    drive: '皇后镇 → 箭镇 20 km / 25 min',
    stay: '皇后镇',
    summary: '上午去箭镇逛淘金老街，下午回皇后镇，留给项目或者发呆。',
    route: '皇后镇 → 箭镇 → 回皇后镇',
    weather: '14–26℃',
    locations: [
      { name: '箭镇 Arrowtown', lat: -44.9389, lng: 168.8333, type: 'spot', time: '10:00',
        desc: '淘金时代的小镇，主街保留着 1860 年代的木头房子。夏天绿荫很好，秋天是最美的季节。',
        detail: 'Buckingham Street 走一遍就够，两侧全是咖啡馆和手工艺店。\n中国矿工村遗址（Chinese Settlement）值得看，讲早期华工的故事。\nArrowtown Bakery 的派，热的时候最好吃。' },
      { name: '箭河淘金（可选）', lat: -44.9400, lng: 168.8350, type: 'spot', time: '12:00',
        desc: '河边可以自己淘金，镇上小店租盘子。小孩很喜欢，大人图个乐。',
        detail: '淘到的金片小得几乎看不见，主要是体验。' },
      { name: '回皇后镇 · 自由', lat: -45.0312, lng: 168.6626, type: 'hotel', time: '14:00',
        desc: '下午可以补一个项目：喷射艇、跳伞、或者就是湖边坐着。',
        detail: 'Shotover 喷射艇 NZ$159，1.5 小时，峡谷里贴着岩壁开。\n想安静就去 Queenstown Gardens，环湖步道 30 分钟。' },
      { name: '晚餐', lat: -45.0312, lng: 168.6610, type: 'food', time: '19:00',
        desc: '最后一晚在皇后镇，吃顿好的。',
        budget: 'NZ$50–80 / 人',
        detail: '推荐：Botswana Butchery（牛排）、Amisfield（酒庄餐厅，要订）、Rata（新西兰菜）。' }
    ]
  },

  /* ─────────── D9 ─────────── */
  {
    id: 9, label: 'D9 · 1/10', date: '1月10日 周日', title: '湖畔 · 皇后镇 → 蒂阿瑙',
    color: '#d9663f', region: 'Fiordland',
    drive: '皇后镇 → 蒂阿瑙 170 km / 2 h',
    stay: '蒂阿瑙（2 晚）',
    summary: '中午开到蒂阿瑙。下午湖边走走或去萤火虫洞，明天一整天进峡湾。',
    route: '皇后镇 → 6 号公路 → Kingston → 94 号公路 → 蒂阿瑙',
    weather: '11–22℃，湖区多雨',
    locations: [
      { name: '皇后镇最后半天', lat: -45.0312, lng: 168.6626, type: 'spot', time: '09:30',
        desc: '买点东西、喝杯咖啡。Patagonia 的冰淇淋和热巧克力是本地招牌。',
        detail: '想买伴手礼，镇上有羊毛制品店和蜂蜜店。' },
      { name: 'Kingston 湖边', lat: -45.3333, lng: 168.7167, type: 'spot', time: '12:00',
        desc: '路过的小站，老火车车厢停在湖边。停 15 分钟拍照。',
        detail: 'Kingston Flyer 是老蒸汽火车，只在特定日子运行。' },
      { name: '蒂阿瑙入住', lat: -45.4144, lng: 167.7181, type: 'hotel', time: '14:00',
        desc: '峡湾门户，镇子小得走十分钟就穿过去。两晚，明天不用收拾行李。',
        detail: '镇上有 FreshChoice 超市，比皇后镇便宜。\n油站在镇中心，明天进峡湾前加满——峡湾里面没有加油站。' },
      { name: '蒂阿瑙萤火虫洞', lat: -45.4100, lng: 167.7060, type: 'spot', time: '15:30',
        desc: '坐船过湖，再进洞看萤火虫（其实是发光幼虫）。全程 2 小时 15 分，洞里不能说话不能拍照。',
        budget: 'NZ$105–120 / 人',
        detail: 'RealNZ 运营，从镇中心码头出发。洞里冷，穿厚点。\n仰头看像星空。不想去就在湖边步道走，免费。' },
      { name: '湖滨晚餐', lat: -45.4150, lng: 167.7190, type: 'food', time: '19:00',
        desc: '镇上餐馆不多，早点睡，明天 7:30 出发。',
        budget: 'NZ$35–55 / 人',
        detail: 'Redcliff 的鹿肉和蓝鳕鱼是招牌，湖景位要订。' }
    ]
  },

  /* ─────────── D10 ─────────── */
  {
    id: 10, label: 'D10 · 1/11', date: '1月11日 周一', title: '峡湾 · 米尔福德',
    color: '#a855c7', region: 'Fiordland',
    drive: '蒂阿瑙 → 米尔福德 120 km / 2 h（单程），往返 240 km',
    stay: '蒂阿瑙',
    summary: '一整天给峡湾。7:30 出发，10:30 上船，下午 5 点回到蒂阿瑙。这条路本身就是景点。',
    route: '蒂阿瑙 → 94 号公路 → Eglinton Valley → Mirror Lakes → Homer Tunnel → 米尔福德 → 游船',
    weather: '9–19℃，峡湾年降雨 200 天',
    locations: [
      { name: '94 号公路出发', lat: -45.4144, lng: 167.7181, type: 'transport', time: '07:30',
        desc: '加满油再走，峡湾里面没有加油站。全程 120 公里，弯多，要开 2 小时。',
        detail: '出发前查路况：NZTA 网站看 Milford Road 是否封路。\n带防雨外套，峡湾一天四季。' },
      { name: 'Eglinton Valley', lat: -45.1500, lng: 168.0000, type: 'spot', time: '08:45',
        desc: '《指环王》里的金色平原，两侧是陡峭的山壁。路边有停车带。',
        detail: '清晨常有雾，光线最好。停 10 分钟拍照。' },
      { name: 'Mirror Lakes', lat: -45.1167, lng: 167.9333, type: 'spot', time: '09:15',
        desc: '路边的倒影湖，木栈道伸进水里，风小的时候能拍出完美倒影。免费，5 分钟看完。',
        detail: '早上风小，倒影概率高。' },
      { name: 'Homer Tunnel', lat: -44.7600, lng: 167.9800, type: 'transport', time: '09:45',
        desc: '1.2 公里的单车道隧道，1900 年代人工凿出来的。隧道口常堵车，等 10–20 分钟正常。',
        detail: '隧道内有红绿灯控流，跟车走，别超车。\n出隧道后是一段陡下坡，挂低挡。' },
      { name: '米尔福德峡湾游船', lat: -44.6414, lng: 167.8975, type: 'spot', time: '10:30',
        desc: '两小时船程，开到 Tasman Sea 口再回来。两侧是 1200 米的垂直峭壁，瀑布从云雾里挂下来。',
        budget: 'NZ$120–180 / 人',
        detail: '订 Nature Cruise（小船，能靠近瀑布）或 Scenic Cruise（大船，稳）。\n船上很冷，穿冲锋衣。看到海豹和企鹅的概率高，运气好有海豚。\n雨天其实更好看——上千条临时瀑布会同时出现。' },
      { name: '返回蒂阿瑙', lat: -45.4144, lng: 167.7181, type: 'hotel', time: '17:00',
        desc: '原路返回，2 小时。晚上在镇上吃，早点休息。',
        detail: '回程会累，中途在 Eglinton Valley 停一下换人开。' }
    ]
  },

  /* ─────────── D11 ─────────── */
  {
    id: 11, label: 'D11 · 1/12', date: '1月12日 周二', title: '南下 · 蒂阿瑙 → 但尼丁',
    color: '#6b7fd7', region: 'Otago',
    drive: '蒂阿瑙 → 但尼丁 290 km / 4 h',
    stay: '但尼丁（2 晚）',
    summary: '今天纯赶路，290 公里。中途在 Gore 休息，下午到但尼丁，看火车站和世界最陡的街。',
    route: '蒂阿瑙 → 94 号 → 6 号 → Gore → 1 号公路 → 但尼丁',
    weather: '12–20℃，沿海风大',
    locations: [
      { name: '蒂阿瑙出发', lat: -45.4144, lng: 167.7181, type: 'transport', time: '09:00',
        desc: '走 94 号回 6 号，再转 1 号。全程平原和牧场，好开。',
        detail: '出镇前加油，下一个像样的镇是 Gore（80 公里外）。' },
      { name: 'Gore 午餐', lat: -46.1000, lng: 168.9439, type: 'food', time: '11:00',
        desc: '南地大区的乡下小镇，吉他之乡。主街有几家咖啡馆，吃个派歇一下。',
        budget: 'NZ$15–25 / 人',
        detail: '推荐 The Thomas Green 或 Cafe Ambience。' },
      { name: '但尼丁火车站', lat: -45.8720, lng: 170.5080, type: 'spot', time: '14:30',
        desc: '1906 年的爱德华巴洛克建筑，瓷砖地面和彩色玻璃，被叫作"新西兰最上镜的建筑"。免费进。',
        detail: '站台可以随便走。二楼有体育名人堂，要门票，可以不去。' },
      { name: '鲍德温街', lat: -45.8500, lng: 170.5100, type: 'spot', time: '15:30',
        desc: '吉尼斯认证的世界最陡街道，坡度 35%。走上去喘，拍照要站在坡底往上拍。',
        detail: '开车上去要小心，手动挡容易溜车。建议停坡底步行。' },
      { name: '八角广场 + 入住', lat: -45.8740, lng: 170.5033, type: 'hotel', time: '17:00',
        desc: '市中心，圣保罗大教堂和市政厅都在这。两晚，明天去半岛。',
        detail: '周边餐厅多，晚上可以慢慢挑。' },
      { name: '晚餐', lat: -45.8740, lng: 170.5030, type: 'food', time: '19:00',
        desc: '但尼丁餐饮比想象中好，海鲜和精酿都不错。',
        budget: 'NZ$40–60 / 人',
        detail: '推荐：Plato（海鲜，本地人最爱）、Etrusco（意大利）、No.7 Balmac（新西兰菜）。' }
    ]
  },

  /* ─────────── D12 ─────────── */
  {
    id: 12, label: 'D12 · 1/13', date: '1月13日 周三', title: '半岛 · 但尼丁',
    color: '#af52de', region: 'Otago Peninsula',
    drive: '市区 → 半岛 20 km / 35 min',
    stay: '但尼丁',
    summary: '一整天给奥塔哥半岛。信天翁、企鹅、海狮，回程走山脊路。',
    route: '市区 → Portobello Road → Taiaroa Head → Highcliff Road → 回城',
    weather: '11–19℃，半岛风极大',
    locations: [
      { name: 'Portobello Road', lat: -45.8350, lng: 170.6500, type: 'transport', time: '09:30',
        desc: '贴着海湾走，一侧是山一侧是水。路窄弯多，但风景是但尼丁最好的。',
        detail: '全程 20 公里，开 40 分钟。中途在 Portobello 镇停一下。\n注意避让自行车。' },
      { name: 'Taiaroa Head 信天翁', lat: -45.7747, lng: 170.7300, type: 'spot', time: '10:30',
        desc: '大陆上唯一的皇家信天翁繁殖地，翼展 3 米。观景台能看到它们贴海面滑翔。',
        budget: 'NZ$55–65 / 人',
        detail: 'Albatross Centre 有导览，1 小时，能进观测室看巢。\n不买票在外部观景台也能看到远处飞行的信天翁。' },
      { name: 'Sandfly Bay', lat: -45.8300, lng: 170.6100, type: 'spot', time: '13:00',
        desc: '沙丘后面是海滩，常有海狮躺着。走下去 15 分钟，沙子很细。',
        detail: '保持 20 米距离，海狮跑得比人快。\n回程爬沙丘有点累。' },
      { name: '半岛午餐', lat: -45.8350, lng: 170.6500, type: 'food', time: '14:00',
        desc: 'Portobello 镇上有几家咖啡馆，海鲜浓汤不错。',
        budget: 'NZ$25–40 / 人',
        detail: '推荐 1908 Café 或 The Portsider。' },
      { name: 'Highcliff Road 回程', lat: -45.8600, lng: 170.6000, type: 'transport', time: '16:00',
        desc: '回程走山脊，不从原路。一侧是整个海湾，傍晚光线最好。',
        detail: '路更窄，但视野开阔。这段是但尼丁最漂亮的公路。' },
      { name: '回城休息', lat: -45.8788, lng: 170.5028, type: 'hotel', time: '18:00',
        desc: '晚上在城里吃，早点睡。明天开 115 公里去奥马鲁。',
        detail: '' }
    ]
  },

  /* ─────────── D13 ─────────── */
  {
    id: 13, label: 'D13 · 1/14', date: '1月14日 周四', title: '圆石 · 但尼丁 → 奥马鲁',
    color: '#30b0c7', region: 'North Otago',
    drive: '但尼丁 → 摩拉基 75 km / 1 h；→ 奥马鲁 40 km / 35 min',
    stay: '奥马鲁',
    summary: '中途看摩拉基大圆石，下午逛维多利亚老街，晚上等企鹅上岸。',
    route: '但尼丁 → 1 号公路 → Moeraki Boulders → 奥马鲁 → 历史街区 → 企鹅归巢',
    weather: '12–21℃，海边风大',
    locations: [
      { name: '摩拉基大圆石', lat: -45.3450, lng: 170.8270, type: 'spot', time: '11:30',
        desc: '海滩上散落着几十个完美的球形巨石，直径一两米，六千万年才形成的结核。退潮时最好看。',
        budget: 'NZ$2（停车）',
        detail: '查潮汐表，退潮时才能走到石头中间。\n从停车场走下去 5 分钟，有一段台阶。\n旁边 Fleurs Place 餐厅很有名，海鲜，要订。' },
      { name: '奥马鲁历史街区', lat: -45.1020, lng: 170.9700, type: 'spot', time: '14:00',
        desc: '维多利亚风格的石头建筑群，Harbour Street 一整条都是 1870 年代的原物。',
        detail: '推荐：Oamaru Bookshop（旧书店）、Steampunk HQ（蒸汽朋克博物馆，NZ$10）。\n下午光线打在石灰岩上最好看。' },
      { name: 'Bushy Beach 黄眼企鹅', lat: -45.1100, lng: 170.9750, type: 'spot', time: '18:00',
        desc: '免费的观察点，傍晚黄眼企鹅会从海里上来。要躲在掩体后面，不能下沙滩。',
        detail: '日落前 1 小时到，等到天黑。带望远镜。' },
      { name: '企鹅归巢', lat: -45.1064, lng: 170.9700, type: 'spot', time: '21:00',
        desc: '蓝企鹅是世界上最小的企鹅，日落后成群上岸回巢。奥马鲁是看它们最稳定的地方。',
        budget: 'NZ$45–60 / 人',
        detail: 'Oamaru Blue Penguin Colony 有看台，按日落时间排场次，一月大概 21:00–21:30。\n禁止拍照（闪光会吓到它们）。提前网上订票。' }
    ]
  },

  /* ─────────── D14 ─────────── */
  {
    id: 14, label: 'D14 · 1/15', date: '1月15日 周五', title: '北上 · 奥马鲁 → 凯库拉',
    color: '#ff9500', region: 'Canterbury',
    drive: '奥马鲁 → 基督城 250 km / 3 h；→ 凯库拉 180 km / 2.5 h（全程 430 km / 5.5 h）',
    stay: '凯库拉',
    summary: '全程最长的一天。中午在基督城吃个饭，下午继续北上，傍晚到凯库拉看海豹。',
    route: '奥马鲁 → 1 号公路 → Timaru → 基督城 → 1 号公路北上 → 凯库拉',
    weather: '14–24℃',
    locations: [
      { name: '奥马鲁出发', lat: -45.0972, lng: 170.9708, type: 'transport', time: '08:00',
        desc: '早点走，今天 430 公里。出城前加满油。',
        detail: '沿 1 号公路北上，全程平坦。' },
      { name: 'Timaru 休息', lat: -44.3980, lng: 171.2510, type: 'food', time: '09:30',
        desc: '南坎特伯雷的海边小城，主街有咖啡馆。停 20 分钟。',
        budget: 'NZ$10–20 / 人',
        detail: 'Caroline Bay 海边公园不错，天气好可以走走。' },
      { name: '基督城午饭', lat: -43.5339, lng: 172.6340, type: 'food', time: '11:30',
        desc: '进城里吃一顿，顺便休息。Riverside Market 最方便。',
        budget: 'NZ$25–40 / 人',
        detail: '停车在 Lichfield Street 停车场，走路 5 分钟。\n吃完 12:30 出发，北上还有 180 公里。' },
      { name: '凯库拉入住', lat: -42.4008, lng: 173.6810, type: 'hotel', time: '15:30',
        desc: '海边小镇，一条主街。住镇上，明天走到观鲸集合点十分钟。',
        detail: '镇上有 Four Square 和几家餐馆。\n龙虾那家 The Pier Hotel 要订位。' },
      { name: '海边看海豹', lat: -42.4200, lng: 173.7000, type: 'spot', time: '17:00',
        desc: 'Kaikoura Peninsula 步道走 40 分钟，礁石上常躺着海豹，不用专门找。',
        detail: '保持 20 米距离。步道平缓，夕阳时最好看。' }
    ]
  },

  /* ─────────── D15 ─────────── */
  {
    id: 15, label: 'D15 · 1/16', date: '1月16日 周六', title: '观鲸 · 回基督城 · 起飞',
    color: '#1d1d1f', region: 'Kaikoura',
    drive: '凯库拉 → 基督城 180 km / 2.5 h',
    stay: '夜航（22:30 起飞）',
    summary: '早上 7:15 出海看抹香鲸，中午吃龙虾，下午开回基督城还车，晚上飞。',
    route: '凯库拉观鲸 → 午餐 → 1 号公路南下 → 基督城加油还车 → 机场 → 22:30 起飞',
    weather: '14–22℃，海上风大',
    locations: [
      { name: '观鲸集合', lat: -42.4080, lng: 173.6800, type: 'transport', time: '07:15',
        desc: 'Whale Watch 在镇上的集合点，先看安全视频，再上大巴去码头。全程 3.5 小时。',
        budget: 'NZ$175 / 人',
        detail: '抹香鲸全年可见，成功率九成以上。\n海况不好会取消，可以改期或全额退。\n晕船的人提前半小时吃药。' },
      { name: '出海看鲸', lat: -42.4300, lng: 173.7300, type: 'spot', time: '08:00',
        desc: '船开到深海，船长用声呐找鲸。看到后停船，鲸鱼换气几次再下潜，尾巴最后露出水面。',
        detail: '船上风大，穿冲锋衣。\n通常还能看到暗色斑纹海豚，成百上千只围着船。' },
      { name: '龙虾午餐', lat: -42.4020, lng: 173.6810, type: 'food', time: '11:30',
        desc: '凯库拉的龙虾是招牌。The Pier Hotel 或路边海鲜摊都行。',
        budget: 'NZ$50–80 / 人',
        detail: 'The Pier Hotel 的龙虾按只卖，蒜香黄油烤。\n路边 Kaikoura Seafood BBQ 便宜，龙虾尾 + 饭。' },
      { name: '回基督城', lat: -43.4852, lng: 172.5355, type: 'transport', time: '12:30',
        desc: '沿 1 号公路南下，2.5 小时。中途可以在 Cheviot 停一下。',
        detail: '15:00 左右到基督城，先去加油。' },
      { name: '加油还车', lat: -43.5150, lng: 172.5700, type: 'transport', time: '16:00',
        desc: '还车前必须加满。机场附近 Russley Road 上有 Z 和 BP。',
        detail: '留好加油小票。车内垃圾清掉，拍一张里程表。' },
      { name: '机场值机', lat: -43.4894, lng: 172.5322, type: 'transport', time: '20:30',
        desc: '国际航站楼，南航柜台。22:30 起飞，1/17 09:15 到上海虹桥。',
        detail: '退税柜台在安检前，单笔满 NZ$50 可退。\n免税店在安检后。' }
    ]
  }
];
