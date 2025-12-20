// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  六叔火箭计算器 - 数据常量配置                                             ║
// ║  版本: v1.9.2                                                              ║
// ║  拆分自 index.html                                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ==================== 六合彩基础数据 ====================
const LHC_DATA = {
    // 生肖对应号码（2024年为基准）
    shengxiao: {
        '鼠': [6, 18, 30, 42],
        '牛': [5, 17, 29, 41],
        '虎': [4, 16, 28, 40],
        '兔': [3, 15, 27, 39],
        '龙': [2, 14, 26, 38],
        '蛇': [1, 13, 25, 37, 49],
        '马': [12, 24, 36, 48],
        '羊': [11, 23, 35, 47],
        '猴': [10, 22, 34, 46],
        '鸡': [9, 21, 33, 45],
        '狗': [8, 20, 32, 44],
        '猪': [7, 19, 31, 43]
    },
    
    // 五行对应号码
    wuxing: {
        '金': [3, 4, 11, 12, 25, 26, 33, 34, 41, 42],
        '木': [7, 8, 15, 16, 23, 24, 37, 38, 45, 46],
        '水': [13, 14, 21, 22, 29, 30, 43, 44],
        '火': [1, 2, 9, 10, 17, 18, 31, 32, 39, 40, 47, 48],
        '土': [5, 6, 19, 20, 27, 28, 35, 36, 49]
    },
    
    // 波色对应号码
    bose: {
        '红波': [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46],
        '蓝波': [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48],
        '绿波': [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49]
    },
    
    // 家禽野兽
    jiaqin: {
        '家禽': ['牛', '马', '羊', '鸡', '狗', '猪'],
        '野兽': ['鼠', '虎', '兔', '龙', '蛇', '猴']
    }
};

// ==================== API配置 ====================
// API配置（开奖数据源）
const LOTTERY_APIS = {
    // API 1: Marksix6（推荐，数据最完整）
    marksix6: {
        name: 'Marksix6',
        url: 'https://marksix6.net/index.php?api=1',
        // 彩种映射
        lotteryMap: {
            'hk': '香港彩',
            'xam': '新澳门彩',
            'am': '澳门彩'
        },
        parse: function(data, lotteryType) {
            const targetName = this.lotteryMap[lotteryType];
            if (!data.lottery_data) return null;
            
            const lottery = data.lottery_data.find(l => l.name === targetName);
            if (!lottery) return null;
            
            // 解析开奖号码
            const numbers = lottery.openCode.split(',').map(n => parseInt(n.trim()));
            if (numbers.length !== 7) return null;
            
            return {
                numbers: numbers,
                issue: lottery.expect,
                time: lottery.openTime,
                zodiac: lottery.zodiac,
                wave: lottery.wave,
                source: 'Marksix6'
            };
        }
    }
};

// ==================== AI服务商配置 ====================
// region: 'cn' = 国内模型（走阿里云代理），'overseas' = 海外模型（走Cloudflare代理），'direct' = 直连（第三方中转API）
const AI_PROVIDERS = {
    // ⚠️ API Key 已移至阿里云函数环境变量，不再在前端存储
    deepseek: {
        name: 'DeepSeek',
        shortName: 'DS',
        url: 'https://api.deepseek.com/v1/chat/completions',
        model: 'deepseek-chat',
        region: 'cn'
    },
    tuzi: {
        name: 'Gemini-Flash',
        shortName: 'Gemini',
        url: 'https://api.tu-zi.com/v1/chat/completions',
        model: 'gemini-2.0-flash',
        region: 'cn',
        useTuziMultiSite: true
    },
    qwen: {
        name: '通义千问',
        shortName: '千问',
        url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: 'qwen-turbo',
        region: 'cn'
    },
    zhipu: {
        name: '智谱GLM-4',
        shortName: '智谱',
        url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        model: 'glm-4-plus',
        region: 'cn'
    },
    doubao: {
        name: '豆包',
        shortName: '豆包',
        url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        model: 'doubao-lite-32k',
        region: 'cn'
    },
    claude: {
        name: 'Claude-Sonnet',
        shortName: 'Claude',
        url: 'https://api.tu-zi.com/v1/chat/completions',
        model: 'claude-sonnet-4-0',
        region: 'cn',
        useTuziMultiSite: true
    },
    gpt: {
        name: 'GPT-4o-Mini',
        shortName: 'GPT4o',
        url: 'https://api.tu-zi.com/v1/chat/completions',
        model: 'gpt-4o-mini',
        region: 'cn',
        useTuziMultiSite: true
    }
};

// ==================== 兔子API 多站点配置 ====================
const TUZI_SITES = [
    { name: '广州', url: 'https://api.ourzhishi.top/v1/chat/completions' },
    { name: '深圳', url: 'https://apisz.ourzhishi.top/v1/chat/completions' },
    { name: '主站', url: 'https://api.tu-zi.com/v1/chat/completions' },
    { name: '备用1-cdn', url: 'https://apius.tu-zi.com/v1/chat/completions' },
    { name: '备用2-cdn', url: 'https://apicdn.tu-zi.com/v1/chat/completions' }
];

// 多站点状态管理
const tuziSiteManager = {
    currentIndex: 0,
    successCount: 0,
    回归检查阈值: 10,
    
    getCurrentUrl() {
        return TUZI_SITES[this.currentIndex].url;
    },
    
    getCurrentName() {
        return TUZI_SITES[this.currentIndex].name;
    },
    
    onSuccess() {
        this.successCount++;
        console.log(`✅ 兔子API [${this.getCurrentName()}] 请求成功，连续成功: ${this.successCount}次`);
        
        if (this.currentIndex > 0 && this.successCount >= this.回归检查阈值) {
            console.log(`🔄 尝试回归到更高优先级站点...`);
            this.currentIndex = 0;
            this.successCount = 0;
        }
    },
    
    onFailure() {
        const failedSite = this.getCurrentName();
        this.successCount = 0;
        
        if (this.currentIndex < TUZI_SITES.length - 1) {
            this.currentIndex++;
            console.log(`⚠️ 兔子API [${failedSite}] 失败，切换到 [${this.getCurrentName()}]`);
            return true;
        } else {
            console.log(`❌ 兔子API 所有站点都失败了`);
            this.currentIndex = 0;
            return false;
        }
    },
    
    reset() {
        this.currentIndex = 0;
        this.successCount = 0;
        console.log('🔄 兔子API站点管理器已重置');
    }
};

