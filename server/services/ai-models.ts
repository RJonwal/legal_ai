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