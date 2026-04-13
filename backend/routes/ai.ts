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
      
      return {
        riskDistribution: {
          none: getRandom(250, 400),
          yellow: getRandom(30, 80),
          orange: getRandom(20, 50),
          red: getRandom(5, 25)
        },
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

export default router;