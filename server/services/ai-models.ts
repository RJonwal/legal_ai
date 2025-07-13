interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
}

interface ProviderModels {
  [key: string]: ModelInfo[];
}

export class AIModelsService {
  private static modelCache: ProviderModels = {};
  private static cacheTimestamp: { [key: string]: number } = {};
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static async getAvailableModels(provider: string, apiKey?: string): Promise<ModelInfo[]> {
    const now = Date.now();
    const cacheKey = `${provider}_${apiKey?.substring(0, 10) || 'default'}`;

    // Check cache
    if (
      this.modelCache[cacheKey] && 
      this.cacheTimestamp[cacheKey] && 
      (now - this.cacheTimestamp[cacheKey]) < this.CACHE_DURATION
    ) {
      return this.modelCache[cacheKey];
    }

    let models: ModelInfo[] = [];

    try {
      switch (provider.toLowerCase()) {
        case 'openai':
          models = await this.fetchOpenAIModels(apiKey);
          break;
        case 'anthropic':
          models = await this.fetchAnthropicModels(apiKey);
          break;
        case 'deepseek':
          models = await this.fetchDeepseekModels(apiKey);
          break;
        default:
          models = this.getDefaultModels(provider);
      }

      // Update cache
      this.modelCache[cacheKey] = models;
      this.cacheTimestamp[cacheKey] = now;
    } catch (error) {
      console.error(`Failed to fetch models for ${provider}:`, error);
      // Return cached data if available, otherwise return defaults
      return this.modelCache[cacheKey] || this.getDefaultModels(provider);
    }

    return models;
  }

  private static async fetchOpenAIModels(apiKey?: string): Promise<ModelInfo[]> {
    if (!apiKey || apiKey.startsWith('sk-proj-xyz')) {
      return this.getDefaultModels('openai');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch OpenAI models');
      }

      const data = await response.json();
      return data.data
        .filter((model: any) => model.id.includes('gpt'))
        .map((model: any) => ({
          id: model.id,
          name: model.id.replace(/-/g, ' ').toUpperCase(),
          description: `OpenAI ${model.id}`
        }))
        .sort((a: ModelInfo, b: ModelInfo) => b.id.localeCompare(a.id));
    } catch (error) {
      return this.getDefaultModels('openai');
    }
  }

  private static async fetchAnthropicModels(apiKey?: string): Promise<ModelInfo[]> {
    // Anthropic doesn't have a public models endpoint, so we return known models
    return [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Latest)', description: 'Most capable model' },
      { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet', description: 'Previous version' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful model' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest model' }
    ];
  }

  private static async fetchDeepseekModels(apiKey?: string): Promise<ModelInfo[]> {
    if (!apiKey) {
      return this.getDefaultModels('deepseek');
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Deepseek models');
      }

      const data = await response.json();
      return data.data.map((model: any) => ({
        id: model.id,
        name: model.id.replace(/-/g, ' ').toUpperCase(),
        description: `Deepseek ${model.id}`
      }));
    } catch (error) {
      return this.getDefaultModels('deepseek');
    }
  }

  private static getDefaultModels(provider: string): ModelInfo[] {
    const defaultModels: ProviderModels = {
      openai: [
        { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest multimodal model' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Faster, cost-effective' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Enhanced performance' },
        { id: 'gpt-4', name: 'GPT-4', description: 'Original GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' }
      ],
      anthropic: [
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Latest)', description: 'Most capable model' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful model' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest model' }
      ],
      deepseek: [
        { id: 'deepseek-chat', name: 'Deepseek Chat', description: 'General purpose chat model' },
        { id: 'deepseek-coder', name: 'Deepseek Coder', description: 'Code-specialized model' }
      ]
    };

    return defaultModels[provider.toLowerCase()] || [];
  }

  static async refreshModelCache(provider: string, apiKey?: string): Promise<ModelInfo[]> {
    const cacheKey = `${provider}_${apiKey?.substring(0, 10) || 'default'}`;
    delete this.modelCache[cacheKey];
    delete this.cacheTimestamp[cacheKey];
    return this.getAvailableModels(provider, apiKey);
  }
}

const AI_MODELS = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest GPT-4 Omni model', contextLength: 128000 },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Affordable and intelligent small model', contextLength: 128000 },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Latest GPT-4 Turbo model', contextLength: 128000 },
    { id: 'gpt-4', name: 'GPT-4', description: 'High-intelligence flagship model', contextLength: 8192 },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast, inexpensive model', contextLength: 16385 },
    { id: 'o1-preview', name: 'o1 Preview', description: 'Advanced reasoning model', contextLength: 128000 },
    { id: 'o1-mini', name: 'o1 Mini', description: 'Faster reasoning model', contextLength: 128000 },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Latest)', description: 'Most capable model with latest updates', contextLength: 200000 },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most capable model for complex tasks', contextLength: 200000 },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed', contextLength: 200000 },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest model for simple tasks', contextLength: 200000 },
  ],
  deepseek: [
    { id: 'deepseek-chat', name: 'Deepseek Chat', description: 'General conversation model', contextLength: 32000 },
    { id: 'deepseek-coder', name: 'Deepseek Coder', description: 'Code-focused model', contextLength: 32000 },
    { id: 'deepseek-r1', name: 'Deepseek R1', description: 'Latest reasoning model', contextLength: 32000 },
  ],
};

export async function fetchLiveModels(provider: string, apiKey?: string): Promise<ModelInfo[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    switch (provider) {
      case 'openai':
        if (apiKey) {
          // In production, make actual API call to OpenAI
          // const response = await fetch('https://api.openai.com/v1/models', {
          //   headers: { 'Authorization': `Bearer ${apiKey}` }
          // });
          // For now, return updated static models
        }
        return AI_MODELS.openai;

      case 'anthropic':
        if (apiKey) {
          // In production, make actual API call to Anthropic
          // const response = await fetch('https://api.anthropic.com/v1/models', {
          //   headers: { 'x-api-key': apiKey }
          // });
        }
        return AI_MODELS.anthropic;

      case 'deepseek':
        if (apiKey) {
          // In production, make actual API call to Deepseek
          // const response = await fetch('https://api.deepseek.com/v1/models', {
          //   headers: { 'Authorization': `Bearer ${apiKey}` }
          // });
        }
        return AI_MODELS.deepseek;

      default:
        return [];
    }
  } catch (error) {
    console.error(`Error fetching models for ${provider}:`, error);
    return AI_MODELS[provider as keyof typeof AI_MODELS] || [];
  }
}
interface ModelInfo {
  id: string;
  name: string;
  inputCost: number;
  outputCost: number;
  maxTokens: number;
  contextWindow: number;
  description: string;
  supportsVision?: boolean;
  supportsAudio?: boolean;
  isBeta?: boolean;
  releaseDate?: string;
}
const AI_MODELS = {
  openai: [
    {
      id: "gpt-4o",
      name: "GPT-4o",
      inputCost: 5,
      outputCost: 15,
      maxTokens: 4096,
      contextWindow: 128000,
      description: "Our most advanced multimodal flagship model",
      supportsVision: true,
      supportsAudio: true,
      isBeta: false,
      releaseDate: "2024-05-13"
    },
    {
      id: "gpt-4o-2024-08-06",
      name: "GPT-4o (2024-08-06)",
      inputCost: 2.5,
      outputCost: 10,
      maxTokens: 128000,
      contextWindow: 128000,
      description: "Latest GPT-4o model with improved performance",
      supportsVision: true,
      supportsAudio: false,
      isBeta: false,
      releaseDate: "2024-08-06"
    },
    {
      id: "gpt-4o-realtime-preview",
      name: "GPT-4o Realtime Preview",
      inputCost: 6,
      outputCost: 24,
      maxTokens: 128000,
      contextWindow: 128000,
      description: "Realtime audio and text processing (Beta)",
      supportsVision: true,
      supportsAudio: true,
      isBeta: true,
      releaseDate: "2024-10-01"
    },
    {
      id: "o1-preview",
      name: "o1-preview",
      inputCost: 15,
      outputCost: 60,
      maxTokens: 32768,
      contextWindow: 128000,
      description: "Reasoning model for complex problem solving (Beta)",
      supportsVision: false,
      supportsAudio: false,
      isBeta: true,
      releaseDate: "2024-09-12"
    },
    {
      id: "o1-mini",
      name: "o1-mini",
      inputCost: 3,
      outputCost: 12,
      maxTokens: 65536,
      contextWindow: 128000,
      description: "Faster reasoning model for simpler tasks (Beta)",
      supportsVision: false,
      supportsAudio: false,
      isBeta: true,
      releaseDate: "2024-09-12"
    },
    {
      id: "gpt-4-turbo-preview",
      name: "GPT-4 Turbo Preview",
      inputCost: 10,
      outputCost: 30,
      maxTokens: 4096,
      contextWindow: 128000,
      description: "Most capable GPT-4 model with improved instruction following",
      supportsVision: true,
      supportsAudio: false,
      isBeta: false,
      releaseDate: "2024-01-25"
    },
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      inputCost: 0.5,
      outputCost: 1.5,
      maxTokens: 4096,
      contextWindow: 16385,
      description: "Most capable GPT-3.5 model and optimized for chat",
      supportsVision: false,
      supportsAudio: false,
      isBeta: false,
      releaseDate: "2023-06-13"
    },
  ],
  anthropic: [
    {
      id: "claude-3-5-sonnet-20241022",
      name: "Claude 3.5 Sonnet (Latest)",
      inputCost: 3,
      outputCost: 15,
      maxTokens: 8192,
      contextWindow: 200000,
      description: "Latest Claude 3.5 Sonnet with improved capabilities",
      supportsVision: true,
      supportsAudio: false,
      isBeta: false,
      releaseDate: "2024-10-22"
    },
    {
      id: "claude-3-5-haiku-20241022",
      name: "Claude 3.5 Haiku",
      inputCost: 1,
      outputCost: 5,
      maxTokens: 8192,
      contextWindow: 200000,
      description: "Fast and efficient Claude model (Beta)",
      supportsVision: true,
      supportsAudio: false,
      isBeta: true,
      releaseDate: "2024-10-22"
    },
    {
      id: "claude-3-opus-20240229",
      name: "Claude 3 Opus",
      inputCost: 15,
      outputCost: 75,
      maxTokens: 4096,
      contextWindow: 200000,
      description: "Most powerful model for highly complex tasks",
      supportsVision: true,
      supportsAudio: false,
      isBeta: false,
      releaseDate: "2024-02-29"
    },
    {
      id: "claude-3-sonnet-20240229",
      name: "Claude 3 Sonnet",
      inputCost: 3,
      outputCost: 15,
      maxTokens: 4096,
      contextWindow: 200000,
      description: "Ideal balance of intelligence and speed",
      supportsVision: true,
      supportsAudio: false,
      isBeta: false,
      releaseDate: "2024-02-29"
    },
    {
      id: "claude-3-haiku-20240307",
      name: "Claude 3 Haiku",
      inputCost: 0.25,
      outputCost: 1.25,
      maxTokens: 4096,
      contextWindow: 200000,
      description: "Fastest and most compact model for near-instant responsiveness",
      supportsVision: true,
      supportsAudio: false,
      isBeta: false,
      releaseDate: "2024-03-07"
    },
  ],
  deepseek: [
    {
      id: "deepseek-chat-v3",
      name: "DeepSeek Chat V3",
      inputCost: 0.14,
      outputCost: 0.28,
      maxTokens: 8192,
      contextWindow: 64000,
      description: "Latest DeepSeek model with enhanced reasoning (Beta)",
      supportsVision: false,
      supportsAudio: false,
      isBeta: true,
      releaseDate: "2024-10-15"
    },
    {
      id: "deepseek-coder-v2",
      name: "DeepSeek Coder V2",
      inputCost: 0.14,
      outputCost: 0.28,
      maxTokens: 8192,
      contextWindow: 128000,
      description: "Specialized coding model with improved capabilities (Beta)",
      supportsVision: false,
      supportsAudio: false,
      isBeta: true,
      releaseDate: "2024-09-20"
    },
    {
      id: "deepseek-chat",
      name: "DeepSeek Chat",
      inputCost: 0.14,
      outputCost: 0.28,
      maxTokens: 4096,
      contextWindow: 32000,
      description: "General purpose conversational model",
      supportsVision: false,
      supportsAudio: false,
      isBeta: false,
      releaseDate: "2024-01-01"
    },
    {
      id: "deepseek-coder",
      name: "DeepSeek Coder",
      inputCost: 0.14,
      outputCost: 0.28,
      maxTokens: 4096,
      contextWindow: 32000,
      description: "Specialized for code generation and analysis",
      supportsVision: false,
      supportsAudio: false,
      isBeta: false,
      releaseDate: "2024-01-01"
    },
  ],
}
export async function fetchLiveModels(provider: string, apiKey?: string, includeBeta: boolean = true): Promise<ModelInfo[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    switch (provider) {
      case 'openai':
        return await fetchOpenAIModels(apiKey, includeBeta);
      case 'anthropic':
        return await fetchAnthropicModels(apiKey, includeBeta);
      case 'deepseek':
        return await fetchDeepseekModels(apiKey, includeBeta);
      default:
        return [];
    }
  } catch (error) {
    console.error('Error fetching live models:', error);
    return AI_MODELS[provider as keyof typeof AI_MODELS] || [];
  }
}

async function fetchOpenAIModels(apiKey?: string, includeBeta: boolean = true): Promise<ModelInfo[]> {
  if (apiKey) {
    try {
      // In production, use actual API call:
      // const response = await fetch('https://api.openai.com/v1/models', {
      //   headers: { 'Authorization': `Bearer ${apiKey}` }
      // });
      // const data = await response.json();
      // return parseOpenAIModels(data.data, includeBeta);
    } catch (error) {
      console.error('Error fetching OpenAI models:', error);
    }
  }

  return includeBeta ? AI_MODELS.openai : AI_MODELS.openai.filter(m => !m.isBeta);
}

async function fetchAnthropicModels(apiKey?: string, includeBeta: boolean = true): Promise<ModelInfo[]> {
  if (apiKey) {
    try {
      // In production, use actual API call:
      // const response = await fetch('https://api.anthropic.com/v1/models', {
      //   headers: { 'x-api-key': apiKey }
      // });
      // const data = await response.json();
      // return parseAnthropicModels(data.data, includeBeta);
    } catch (error) {
      console.error('Error fetching Anthropic models:', error);
    }
  }

  return includeBeta ? AI_MODELS.anthropic : AI_MODELS.anthropic.filter(m => !m.isBeta);
}

async function fetchDeepseekModels(apiKey?: string, includeBeta: boolean = true): Promise<ModelInfo[]> {
  if (apiKey) {
    try {
      // In production, use actual API call:
      // const response = await fetch('https://api.deepseek.com/v1/models', {
      //   headers: { 'Authorization': `Bearer ${apiKey}` }
      // });
      // const data = await response.json();
      // return parseDeepseekModels(data.data, includeBeta);
    } catch (error) {
      console.error('Error fetching DeepSeek models:', error);
    }
  }

  return includeBeta ? AI_MODELS.deepseek : AI_MODELS.deepseek.filter(m => !m.isBeta);
}