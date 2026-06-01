import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/environment';

class ChatbotService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 'Bạn là một gia sư tiếng Anh thân thiện, nhiệt tình của ứng dụng EngBoost. Hãy luôn trả lời ngắn gọn, súc tích bằng tiếng Việt hoặc tiếng Anh (tùy theo ngôn ngữ người dùng dùng), có thể dùng emoji cho sinh động. Nếu người dùng hỏi các câu hỏi không liên quan đến học tiếng Anh hoặc ứng dụng EngBoost, hãy lịch sự từ chối và hướng họ quay lại với việc học.',
    });
  }

  async generateReply(userMessage: string): Promise<string> {
    if (!env.GEMINI_API_KEY) {
      return 'Xin lỗi, tính năng Chatbot đang tạm bảo trì do thiếu API Key. Vui lòng liên hệ Admin để cập nhật GEMINI_API_KEY trong file .env nhé! 🔧';
    }

    try {
      const result = await this.model.generateContent(userMessage);
      return result.response.text();
    } catch (error: any) {
      console.error('[ChatbotService] Error generating response:', error);
      throw new Error('Không thể kết nối tới AI. Vui lòng thử lại sau.');
    }
  }
}

export const chatbotService = new ChatbotService();
