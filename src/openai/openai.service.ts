import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenaiService {
  private apiKey = process.env.OPENAI_API_KEY;

  async chat(userId: string, prompt: string) {
    if (!this.apiKey) throw new HttpException('OPENAI_API_KEY not set', 500);
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          user: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return res.data;
    } catch (err: any) {
      throw new HttpException(err?.response?.data || err.message, 500);
    }
  }
}
