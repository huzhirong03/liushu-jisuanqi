// 获取开奖数据并保存到 data.json
const https = require('https');
const fs = require('fs');

const API_URL = 'https://marksix6.net/index.php?api=1';

function fetchData() {
    return new Promise((resolve, reject) => {
        https.get(API_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function parseData(apiData) {
    const result = {
        updateTime: new Date().toISOString(),
        xam: null,  // 新澳门
        hk: null    // 香港
    };
    
    if (!apiData || !apiData.lottery_data) {
        return result;
    }
    
    // 解析新澳门数据
    const xamLottery = apiData.lottery_data.find(l => l.name === '新澳门彩');
    if (xamLottery) {
        const numbers = xamLottery.openCode.split(',').map(n => parseInt(n.trim()));
        result.xam = {
            numbers: numbers,
            issue: xamLottery.expect,
            time: xamLottery.openTime,
            zodiac: xamLottery.zodiac,
            wave: xamLottery.wave
        };
    }
    
    // 解析香港数据
    const hkLottery = apiData.lottery_data.find(l => l.name === '香港彩');
    if (hkLottery) {
        const numbers = hkLottery.openCode.split(',').map(n => parseInt(n.trim()));
        result.hk = {
            numbers: numbers,
            issue: hkLottery.expect,
            time: hkLottery.openTime,
            zodiac: hkLottery.zodiac,
            wave: hkLottery.wave
        };
    }
    
    return result;
}

async function main() {
    console.log('🚀 开始获取开奖数据...');
    console.log('⏰ 时间:', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
    
    try {
        const apiData = await fetchData();
        console.log('✅ API 数据获取成功');
        
        const parsedData = parseData(apiData);
        
        // 保存到 data.json
        fs.writeFileSync('data.json', JSON.stringify(parsedData, null, 2));
        console.log('✅ 数据已保存到 data.json');
        
        // 显示结果
        if (parsedData.xam) {
            console.log(`📊 新澳门 第${parsedData.xam.issue}期: ${parsedData.xam.numbers.join(', ')}`);
        }
        if (parsedData.hk) {
            console.log(`📊 香港 第${parsedData.hk.issue}期: ${parsedData.hk.numbers.join(', ')}`);
        }
        
    } catch (error) {
        console.error('❌ 获取失败:', error.message);
        
        // 如果获取失败，保留旧数据
        if (fs.existsSync('data.json')) {
            console.log('⚠️ 保留旧数据');
        } else {
            // 创建空数据文件
            fs.writeFileSync('data.json', JSON.stringify({
                updateTime: new Date().toISOString(),
                xam: null,
                hk: null,
                error: '数据获取失败'
            }, null, 2));
        }
        
        process.exit(1);
    }
}

main();

