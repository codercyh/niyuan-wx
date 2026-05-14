/**
 * 农历转换工具
 * 支持农历与阳历日期互转
 */

// 农历数据 1900-2100年
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520
];

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 生肖
const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
// 农历月份
const LUNAR_MONTH = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
// 农历日期
const LUNAR_DAY = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

/**
 * 返回农历y年一整年的总天数
 */
function lYearDays(y) {
  let i, sum = 348;
  for (i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[y - 1900] & i) ? 1 : 0;
  }
  return sum + leapDays(y);
}

/**
 * 返回农历y年闰月的天数
 */
function leapDays(y) {
  if (leapMonth(y)) {
    return (LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29;
  }
  return 0;
}

/**
 * 返回农历y年闰哪个月 1-12 , 没闰返回 0
 */
function leapMonth(y) {
  return LUNAR_INFO[y - 1900] & 0xf;
}

/**
 * 返回农历y年m月的总天数
 */
function monthDays(y, m) {
  return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29;
}

/**
 * 阳历转农历
 * @param {number} year 阳历年
 * @param {number} month 阳历月 (1-12)
 * @param {number} day 阳历日
 * @returns {object} {year, month, day, isLeap, yearCn, monthCn, dayCn, shengxiao}
 */
function solarToLunar(year, month, day) {
  // 参数边界检查
  if (year < 1900 || year > 2100) {
    return null;
  }
  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > 31) {
    return null;
  }

  // 计算与1900年1月31日相差的天数
  const baseDate = new Date(1900, 0, 31);
  const objDate = new Date(year, month - 1, day);
  let offset = Math.floor((objDate - baseDate) / 86400000);

  // 用offset减去每个农历年的天数，算出当前农历年
  let i, temp = 0;
  for (i = 1900; i < 2101 && offset > 0; i++) {
    temp = lYearDays(i);
    offset -= temp;
  }
  if (offset < 0) {
    offset += temp;
    i--;
  }

  const lunarYear = i;
  const leap = leapMonth(i);
  let isLeap = false;

  // 用offset减去每个农历月的天数，算出当前农历月
  for (i = 1; i < 13 && offset > 0; i++) {
    // 闰月
    if (leap > 0 && i === (leap + 1) && !isLeap) {
      --i;
      isLeap = true;
      temp = leapDays(lunarYear);
    } else {
      temp = monthDays(lunarYear, i);
    }

    // 解除闰月
    if (isLeap && i === (leap + 1)) {
      isLeap = false;
    }

    offset -= temp;
  }

  if (offset === 0 && leap > 0 && i === leap + 1) {
    if (isLeap) {
      isLeap = false;
    } else {
      isLeap = true;
      --i;
    }
  }

  if (offset < 0) {
    offset += temp;
    --i;
  }

  const lunarMonth = i;
  const lunarDay = offset + 1;

  // 计算干支年
  const ganZhiYear = (lunarYear - 4) % 60;
  const ganIndex = ganZhiYear % 10;
  const zhiIndex = ganZhiYear % 12;

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeap: isLeap,
    yearCn: TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex],
    monthCn: (isLeap ? '闰' : '') + LUNAR_MONTH[lunarMonth - 1] + '月',
    dayCn: LUNAR_DAY[lunarDay - 1],
    shengxiao: SHENG_XIAO[(lunarYear - 4) % 12]
  };
}

/**
 * 农历转阳历
 * @param {number} year 农历年
 * @param {number} month 农历月 (1-12)
 * @param {number} day 农历日
 * @param {boolean} isLeap 是否闰月
 * @returns {object} {year, month, day}
 */
function lunarToSolar(year, month, day, isLeap = false) {
  // 参数边界检查
  if (year < 1900 || year > 2100) {
    return null;
  }
  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > 30) {
    return null;
  }

  const leap = leapMonth(year);
  const isLeapMonth = (leap === month && isLeap);

  // 计算与1900年1月31日相差的天数
  let offset = 0;

  // 累加每年的天数
  for (let i = 1900; i < year; i++) {
    offset += lYearDays(i);
  }

  // 累加当年每月的天数
  let i;
  for (i = 1; i < month; i++) {
    // 闰月
    if (leap > 0 && i === (leap + 1) && !isLeap) {
      --i;
      isLeap = true;
      offset += leapDays(year);
    } else {
      offset += monthDays(year, i);
    }
    if (isLeap && i === (leap + 1)) {
      isLeap = false;
    }
  }

  // 如果是闰月，还需要加上闰月之前那个月的天数
  if (isLeapMonth) {
    offset += monthDays(year, month);
  }

  // 加上当月的天数
  offset += day - 1;

  // 从1900年1月31日开始计算
  const baseDate = new Date(1900, 0, 31);
  const resultDate = new Date(baseDate.getTime() + offset * 86400000);

  return {
    year: resultDate.getFullYear(),
    month: resultDate.getMonth() + 1,
    day: resultDate.getDate()
  };
}

/**
 * 获取农历日期显示文本
 * @param {number} year 阳历年
 * @param {number} month 阳历月 (1-12)
 * @param {number} day 阳历日
 * @returns {string} 农历日期文本
 */
function getLunarDateText(year, month, day) {
  const lunar = solarToLunar(year, month, day);
  if (!lunar) return '';
  return `${lunar.yearCn}年 ${lunar.monthCn}${lunar.dayCn}`;
}

module.exports = {
  solarToLunar,
  lunarToSolar,
  getLunarDateText,
  LUNAR_MONTH,
  LUNAR_DAY,
  SHENG_XIAO
};
