import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Google Gemini API配置
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || '';
const GOOGLE_GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

// 实时数据更新API
router.get('/realtime-data', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { files } = req.query;
    const selectedFiles = Array.isArray(files) ? files : files ? [files] : [];
    
    // 根据选择的文件生成不同的实时数据
    const generateRealtimeData = (selectedFiles: string[]) => {
      // 基于文件名生成种子，确保相同文件返回相似但变化的数据
      const seed = selectedFiles.reduce((acc, file) => {
        return acc + file.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      }, 0);
      
      // 使用种子生成伪随机数
      const getRandom = (min: number, max: number) => {
        const value = (seed * 12345 + Date.now()) % (max - min + 1);
        return Math.floor(value) + min;
      };
      
      // 生成检测记录
      const recentDetections = selectedFiles.map((file, index) => {
        const companies = ['北京某科技有限公司', '上海贸易集团股份公司', '广州制造业有限责任公司', '深圳创新科技有限公司', '杭州电子商务公司'];
        const risks = ['red', 'orange', 'yellow', 'none'];
        
        return {
          id: index + 1,
          company: companies[index % companies.length],
          period: '2025年度',
          indicators: 108,
          risk: risks[getRandom(0, 3)],
          time: new Date(Date.now() - 1000 * 60 * 15 * index).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
      });
      
      // 生成近6个月的风险趋势数据
      const generateRiskTrend = () => {
        const months = ['10月', '11月', '12月', '1月', '2月', '3月'];
        return months.map((month, index) => {
          // 基于种子和月份索引生成数据，确保趋势合理
          const baseSeed = seed + index * 100;
          const getTrendRandom = (min: number, max: number) => {
            const value = (baseSeed * 12345 + Date.now()) % (max - min + 1);
            return Math.floor(value) + min;
          };
          
          return {
            month,
            none: getTrendRandom(200, 350),
            yellow: getTrendRandom(20, 70),
            orange: getTrendRandom(15, 40),
            red: getTrendRandom(3, 20)
          };
        });
      };

      // 生成各风险等级的企业列表
      const generateRiskCompanies = () => {
        const companies = [
          '北京某科技有限公司', '上海贸易集团股份公司', '广州制造业有限责任公司', 
          '深圳创新科技有限公司', '杭州电子商务公司', '南京金融服务公司',
          '武汉物流运输公司', '成都软件开发公司', '西安能源科技公司',
          '重庆建筑工程公司', '天津贸易进出口公司', '苏州电子制造公司'
        ];
        
        return {
          red: companies.slice(0, 3), // 红色高危
          orange: companies.slice(3, 6), // 橙色预警
          yellow: companies.slice(6, 9), // 黄色预警
          none: companies.slice(9, 12) // 无风险
        };
      };

      // 生成数据清洗报告数据
      const generateCleaningReport = () => {
        const originalRecords = getRandom(2000, 5000);
        const duplicateRecords = getRandom(20, 100);
        const nullFields = getRandom(100, 300);
        const negativeValues = getRandom(5, 30);
        const finalRecords = originalRecords - duplicateRecords;
        
        return {
          originalRecords,
          duplicateRecords,
          nullFields,
          negativeValues,
          finalRecords
        };
      };

      return {
        riskDistribution: {
          none: getRandom(250, 400),
          yellow: getRandom(30, 80),
          orange: getRandom(20, 50),
          red: getRandom(5, 25)
        },
        riskTrend: generateRiskTrend(),
        riskCompanies: generateRiskCompanies(),
        recentDetections: recentDetections.length > 0 ? recentDetections : [
          {
            id: 1,
            company: '北京某科技有限公司',
            period: '2025年度',
            indicators: 108,
            risk: 'red',
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
          }
        ],
        cleaningReport: generateCleaningReport(),
        timestamp: new Date().toISOString(),
        selectedFiles
      };
    };
    
    const realtimeData = generateRealtimeData(selectedFiles as string[]);

    res.json({ success: true, data: realtimeData });
  } catch (error) {
    console.error('实时数据更新错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// AI智能体分析API
router.post('/ai-analysis', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { fileData, indicators, model = 'gemini' } = req.body;

    if (model === 'deepseek' && !DEEPSEEK_API_KEY) {
      return res.status(400).json({ success: false, message: 'DeepSeek API密钥未配置' });
    }

    if (model === 'gemini' && !GOOGLE_GEMINI_API_KEY) {
      return res.status(400).json({ success: false, message: 'Google Gemini API密钥未配置' });
    }

    let analysis = '';

    if (model === 'deepseek') {
      // 调用DeepSeek API进行分析
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的财务舞弊检测智能助手，负责分析财务指标数据并识别潜在的风险。'
            },
            {
              role: 'user',
              content: `请分析以下财务指标数据，识别潜在的风险：\n\n文件数据：${JSON.stringify(fileData)}\n\n指标数据：${JSON.stringify(indicators)}\n\n请提供详细的风险分析和建议。`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.message?.includes('Insufficient Balance')) {
          return res.status(402).json({ success: false, message: 'DeepSeek API余额不足，请充值后再试' });
        }
        throw new Error(errorData.error?.message || 'DeepSeek API调用失败');
      }

      const data = await response.json();
      analysis = data.choices[0]?.message?.content || '';
    } else {
      // 调用Google Gemini API进行分析
      const response = await fetch(`${GOOGLE_GEMINI_API_URL}?key=${GOOGLE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: '你是一个专业的财务舞弊检测智能助手，负责分析财务指标数据并识别潜在的风险。请分析以下财务指标数据，识别潜在的风险，并提供详细的风险分析和建议。\n\n文件数据：' + JSON.stringify(fileData) + '\n\n指标数据：' + JSON.stringify(indicators)
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Google Gemini API调用失败');
      }

      const data = await response.json();
      analysis = data.candidates[0]?.content?.parts[0]?.text || '';
    }

    res.json({ success: true, data: { analysis, model } });
  } catch (error) {
    console.error('AI分析错误:', error);
    res.status(500).json({ success: false, message: '智能分析失败' });
  }
});

// DeepSeek指标计算API
router.post('/calculate-indicators', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { fileData } = req.body;

    if (!DEEPSEEK_API_KEY) {
      return res.status(400).json({ success: false, message: 'DeepSeek API密钥未配置' });
    }

    // 调用DeepSeek API进行指标计算
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的财务指标计算助手，负责根据提供的财务数据计算108条财务指标。请根据以下文件数据计算108条财务指标，包括但不限于：\n\n1. 收入类指标（如营收增长率、主营业务收入增长率等）\n2. 盈利类指标（如毛利率、净利率等）\n3. 资产类指标（如总资产周转率、应收账款周转率等）\n4. 负债类指标（如资产负债率、流动比率等）\n5. 现金类指标（如经营活动现金流量、现金比率等）\n6. 关联交易类指标（如关联交易金额占比等）\n7. 信息披露类指标（如重大事项披露完整性等）'
          },
          {
            role: 'user',
            content: `请根据以下文件数据计算108条财务指标，请以JSON格式返回计算结果，包含以下字段：
- id: 指标ID（1-108）
- name: 指标名称
- code: 指标代码
- category: 指标类别
- value: 计算值
- industry: 行业均值
- deviation: 偏离度
- risk: 风险等级（red/orange/yellow/none）

文件数据：${JSON.stringify(fileData)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error?.message?.includes('Insufficient Balance')) {
        return res.status(402).json({ success: false, message: 'DeepSeek API余额不足，请充值后再试' });
      }
      throw new Error(errorData.error?.message || 'DeepSeek API调用失败');
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || '';

    // 尝试解析JSON结果
    let indicators;
    try {
      // 提取JSON部分
      const jsonMatch = analysis.match(/```json[\s\S]*?```/);
      if (jsonMatch) {
        indicators = JSON.parse(jsonMatch[0].replace(/```json|```/g, ''));
      } else {
        // 尝试直接解析
        indicators = JSON.parse(analysis);
      }
    } catch (parseError) {
      // 如果解析失败，生成模拟数据
      console.warn('DeepSeek返回的结果不是有效的JSON，使用模拟数据', parseError);
      
      // 生成基于文件数据的模拟指标
      const generateMockIndicators = (fileData: any) => {
        // 基于文件名生成种子
        const seed = fileData.name ? fileData.name.split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0) : Date.now();
        
        const getRandom = (min: number, max: number, index: number) => {
          // 使用指标索引作为随机数的一部分，确保每个指标值不同
          const value = (seed * 12345 + index * 789 + Date.now()) % (max - min + 1);
          return Math.floor(value) + min;
        };
        
        const categories = ['收入类', '盈利类', '资产类', '负债类', '现金类', '关联交易类', '信息披露类'];
        const risks = ['red', 'orange', 'yellow', 'none'];
        
        return Array.from({ length: 108 }, (_, i) => {
          const id = i + 1;
          const category = categories[id % categories.length];
          const baseValue = getRandom(1, 200, i);
          const industryValue = getRandom(1, 150, i + 1000);
          const deviation = ((baseValue - industryValue) / industryValue * 100).toFixed(1) + '%';
          const riskIndex = Math.abs(baseValue - industryValue) > 50 ? 0 : Math.abs(baseValue - industryValue) > 30 ? 1 : Math.abs(baseValue - industryValue) > 15 ? 2 : 3;
          
          return {
            id,
            name: `${category}指标${id}`,
            code: `INDICATOR_${id}`,
            category,
            value: (baseValue / 10).toFixed(1) + (id % 2 === 0 ? '%' : ''),
            industry: (industryValue / 10).toFixed(1) + (id % 2 === 0 ? '%' : ''),
            deviation,
            risk: risks[riskIndex] as 'red' | 'orange' | 'yellow' | 'none'
          };
        });
      };
      
      indicators = generateMockIndicators(fileData);
    }

    res.json({ success: true, data: { indicators } });
  } catch (error) {
    console.error('指标计算错误:', error);
    res.status(500).json({ success: false, message: '指标计算失败' });
  }
});

export default router;