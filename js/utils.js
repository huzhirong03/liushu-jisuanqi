// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  六叔火箭计算器 - 工具函数                                                 ║
// ║  版本: v1.9.2                                                              ║
// ║  拆分自 index.html                                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ==================== 通用工具函数 ====================

// 复制到剪贴板
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return Promise.resolve();
}

// 格式化数字输入（补零）
function formatNumInput(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    if (value.length > 2) {
        value = value.slice(-2);
    }
    let num = parseInt(value);
    if (isNaN(num)) num = 0;
    if (num > 49) num = 49;
    if (num < 0) num = 0;
    
    if (num > 0) {
        input.value = String(num).padStart(2, '0');
    } else {
        input.value = '';
    }
    return num;
}

// 获取号码对应的颜色
function getNumberColor(num) {
    if (LHC_DATA.bose['红波'].includes(num)) return 'red';
    if (LHC_DATA.bose['蓝波'].includes(num)) return 'blue';
    if (LHC_DATA.bose['绿波'].includes(num)) return 'green';
    return '';
}

// 获取号码对应的生肖
function getNumberZodiac(num) {
    for (const [zodiac, nums] of Object.entries(LHC_DATA.shengxiao)) {
        if (nums.includes(num)) return zodiac;
    }
    return '';
}

// 获取号码对应的五行
function getNumberWuxing(num) {
    for (const [wx, nums] of Object.entries(LHC_DATA.wuxing)) {
        if (nums.includes(num)) return wx;
    }
    return '';
}

// 更新输入框颜色（根据号码）
function updateInputColor(input, num, isSpecial) {
    const color = getNumberColor(num);
    if (color === 'red') {
        input.style.borderColor = '#e74c3c';
        input.style.color = '#e74c3c';
    } else if (color === 'blue') {
        input.style.borderColor = '#3498db';
        input.style.color = '#3498db';
    } else if (color === 'green') {
        input.style.borderColor = '#2ecc71';
        input.style.color = '#2ecc71';
    } else {
        input.style.borderColor = isSpecial ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)';
        input.style.color = isSpecial ? '#fbbf24' : '#fff';
    }
}

// 显示Toast提示
function showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:12px 24px;border-radius:8px;font-size:14px;z-index:9999;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// 显示自动关闭的Toast
function showAutoCloseToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.innerHTML = message;
    toast.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);background:linear-gradient(90deg,#667eea,#764ba2);color:white;padding:12px 20px;border-radius:8px;font-size:13px;z-index:9999;box-shadow:0 4px 15px rgba(102,126,234,0.4);';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// 显示直播提示
function showLiveToast(msg) {
    const toast = document.createElement('div');
    toast.innerHTML = msg;
    toast.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);background:linear-gradient(90deg,#e94560,#c23a51);color:white;padding:12px 20px;border-radius:8px;font-size:13px;z-index:9999;box-shadow:0 4px 15px rgba(233,69,96,0.4);';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ==================== 安全脱敏系统 ====================

// 脱敏映射表（敏感词 → 代号）
const SANITIZE_MAP = {
    // === 生肖（最重要，按长度排序）===
    '鼠': 'Z1', '牛': 'Z2', '虎': 'Z3', '兔': 'Z4',
    '龙': 'Z5', '蛇': 'Z6', '马': 'Z7', '羊': 'Z8',
    '猴': 'Z9', '鸡': 'Z10', '狗': 'Z11', '猪': 'Z12',
    
    // === 玩法关键词（按长度降序）===
    '平特一肖': 'PT1', '平特二连肖': 'PT2', '平特三连肖': 'PT3',
    '平特四连肖': 'PT4', '平特五连肖': 'PT5',
    '二连肖': 'PT2', '三连肖': 'PT3', '四连肖': 'PT4', '五连肖': 'PT5',
    '平特尾': 'PTW', '平尾': 'PTW', '平特': 'PT',
    '一友': 'PT1', '二友': 'PT2', '三友': 'PT3',
    '六肖': 'LX6', '合肖': 'HX', '正肖': 'ZX',
    '单平': 'DP', '平码': 'DP',
    '二中二': 'E2', '三中三': 'S3',
    '二全中': 'LM2Q', '三全中': 'LM3Q', 
    '二中特': 'LM2Z', '三中特': 'LM3Z', '特串': 'LMTC',
    '五不中': 'BZ5', '六不中': 'BZ6', '七不中': 'BZ7', '八不中': 'BZ8',
    '九不中': 'BZ9', '十不中': 'BZ10', '十一不中': 'BZ11', '十二不中': 'BZ12',
    '特码': 'T01', '特': 'T01',
    
    // === 波色（按长度降序）===
    '红波': 'C1', '蓝波': 'C2', '绿波': 'C3',
    '红单': 'C1S', '红双': 'C1D', '红大': 'C1B', '红小': 'C1X',
    '蓝单': 'C2S', '蓝双': 'C2D', '蓝大': 'C2B', '蓝小': 'C2X',
    '绿单': 'C3S', '绿双': 'C3D', '绿大': 'C3B', '绿小': 'C3X',
    
    // === 其他玩法 ===
    '总和大': 'ZHB', '总和小': 'ZHX', '总和单': 'ZHS', '总和双': 'ZHD',
    '总和': 'ZH',
    '家禽': 'JYJ', '野兽': 'JYY',
    '小数': 'XS', '大数': 'DS',
    '单数': 'ODD', '双数': 'EVEN',
    
    // === 五行 ===
    '金': 'WXJ', '木': 'WXM', '水': 'WXS', '火': 'WXH', '土': 'WXT',
    
    // === 敏感词替换 ===
    '六合彩': '数据', '六合': '数据',
    '买': '选', '下注': '选择', '投注': '选择',
    '开奖': '结果', '中奖': '命中', '赔率': '比率'
};

// 生成还原映射表（代号 → 敏感词）
const RESTORE_MAP = {};
for (const [key, value] of Object.entries(SANITIZE_MAP)) {
    RESTORE_MAP[value] = key;
}

// 获取按长度降序排列的键
const SANITIZE_KEYS_SORTED = Object.keys(SANITIZE_MAP).sort((a, b) => b.length - a.length);
const RESTORE_KEYS_SORTED = Object.keys(RESTORE_MAP).sort((a, b) => b.length - a.length);

// 脱敏函数
function sanitizeText(text) {
    if (!text) return text;
    let result = text;
    
    for (const key of SANITIZE_KEYS_SORTED) {
        result = result.split(key).join(SANITIZE_MAP[key]);
    }
    
    console.log('🔒 脱敏:', text, '→', result);
    return result;
}

// 还原函数
function restoreText(text) {
    if (!text) return text;
    let result = text;
    
    for (const key of RESTORE_KEYS_SORTED) {
        result = result.split(key).join(RESTORE_MAP[key]);
    }
    
    console.log('🔓 还原:', text, '→', result);
    return result;
}

// 还原AI返回的结果数组
function restoreAIResult(aiResult) {
    if (!Array.isArray(aiResult)) return aiResult;
    
    return aiResult.map(item => {
        // 新版 Function Calling 格式（对象）
        if (item && typeof item === 'object' && !Array.isArray(item)) {
            const code = item.code || 'UK';
            const original = restoreText(item.original || '');
            const numbers = item.numbers || null;
            const amount = item.amount || null;
            const zodiacCode = item.zodiac_code || null;
            return [code, original, numbers, amount, zodiacCode];
        }
        // 旧版格式（数组）
        if (Array.isArray(item) && item.length >= 2) {
            return [item[0], restoreText(item[1])];
        }
        return item;
    });
}

// JSON修复函数
function repairJSON(str) {
    if (!str) return str;
    let result = str.trim();
    
    // 移除markdown代码块
    result = result.replace(/```json?\n?/g, '').replace(/```/g, '');
    
    // 提取JSON数组
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
        result = jsonMatch[0];
    }
    
    // 修复尾部逗号
    result = result.replace(/,(\s*[\]\}])/g, '$1');
    
    // 修复缺失引号的类型
    result = result.replace(/\[([A-Z][A-Z0-9]*),/g, '["$1",');
    
    // 修复单引号
    result = result.replace(/'/g, '"');
    
    return result;
}

// 校验AI返回结果的格式
function validateAIResult(data) {
    const validTypes = [
        'T01', 'TM', 'T', 'SXTM', 'SX', 'BS', 'BB',
        'PT', 'PT1', 'PT2', 'PT3', 'PT4', 'PT5', 'PTW',
        'LX6', 'HX', 'ZX', 'DP', 'DXDS',
        'E2', 'S3', 'BZ5', 'BZ6', 'BZ7', 'BZ8', 'BZ9', 'BZ10', 'BZ11', 'BZ12',
        'LM2Q', 'LM3Q', 'LM2Z', 'LM3Z', 'LMTC',
        'C1', 'C2', 'C3', 'C1S', 'C1D', 'C1B', 'C1X', 'C2S', 'C2D', 'C2B', 'C2X', 'C3S', 'C3D', 'C3B', 'C3X',
        'ZH', 'ZHB', 'ZHX', 'ZHS', 'ZHD',
        'WXJ', 'WXM', 'WXS', 'WXH', 'WXT',
        'JYJ', 'JYY', 'XS', 'DS', 'ODD', 'EVEN',
        'LX', 'BZ', 'LM', 'WX', 'JY', 'UK'
    ];
    
    if (!Array.isArray(data)) {
        return { valid: false, error: '返回值不是数组' };
    }
    
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        let typeCode;
        
        if (item && typeof item === 'object' && !Array.isArray(item)) {
            if (!item.code || !item.original) {
                return { valid: false, error: `第${i+1}项缺少code或original字段` };
            }
            typeCode = item.code;
        }
        else if (Array.isArray(item) && item.length >= 2) {
            typeCode = item[0];
        }
        else {
            return { valid: false, error: `第${i+1}项格式错误` };
        }
        
        if (!validTypes.includes(typeCode)) {
            console.warn(`⚠️ 未知类型代号: ${typeCode}，将尝试处理`);
        }
    }
    
    return { valid: true };
}

// ==================== 理由代码映射表 ====================
const REASON_MAP = {
    'R01': '匹配"特码+号码+金额"格式',
    'R02': '匹配"号码+金额"简写格式',
    'R03': '匹配生肖玩法',
    'R04': '匹配波色玩法',
    'R05': '匹配大小单双玩法',
    'R06': '匹配平特玩法',
    'R07': '匹配连码玩法',
    'R08': '匹配不中玩法',
    'R09': '匹配五行玩法',
    'R10': '匹配家禽野兽玩法',
    'R11': '匹配总和玩法',
    'R12': '匹配平码/单平玩法',
    'R13': '匹配六肖玩法',
    'R14': '匹配合肖玩法',
    'R15': '匹配正肖玩法',
    'R16': '匹配半波玩法',
    'R17': '匹配头尾数玩法',
    'R18': '无法识别的格式',
    'R19': '号码格式错误',
    'R20': '金额格式错误',
    'R21': '玩法类型不支持',
    'R22': '缺少必要信息',
    'R23': '格式模糊需确认',
    'R24': '包含多种玩法',
    'R25': '包含中文数字',
    'R26': '包含特殊符号',
    'R27': '包含多行内容',
    'R28': '匹配"生肖+x+金额"格式（如龙x10）',
    'R29': '匹配"多生肖+x+金额"格式（如猴鸡x50）',
    'R30': '识别到生肖组合分拆为单个生肖'
};

// 获取理由描述
function getReasonDescription(code) {
    return REASON_MAP[code] || code;
}

