import OpenAI from "openai";

// AI Provider Service Configuration
interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
  priority: number;
}

interface AIServiceConfig {
  primary: string;
  fallback: string[];
  providers: Record<string, AIProvider>;
}

// Default configuration for the three selected providers
export const defaultAIConfig: AIServiceConfig = {
  primary: "openai",
  fallback: ["anthropic", "deepseek"],
  providers: {
    openai: {
      id: "openai",
      name: "OpenAI",
      enabled: true,
      apiKey: process.env.OPENAI_API_KEY,
      priority: 1
    },
    anthropic: {
      id: "anthropic", 
      name: "Anthropic",
      enabled: true,
      apiKey: process.env.ANTHROPIC_API_KEY,
      priority: 2
    },
    deepseek: {
      id: "deepseek",
      name: "DeepSeek", 
      enabled: true,
      apiKey: process.env.DEEPSEEK_API_KEY,
      priority: 3
    }
  }
};

// AI Service Provider Manager
export class AIServiceProvider {
  private config: AIServiceConfig;
  private clients: Record<string, any> = {};

  constructor(config: AIServiceConfig = defaultAIConfig) {
    this.config = config;
    this.initializeClients();
  }

  private initializeClients() {
    // Initialize OpenAI client
    if (this.config.providers.openai?.enabled && this.config.providers.openai.apiKey) {
      this.clients.openai = new OpenAI({
        apiKey: this.config.providers.openai.apiKey
      });
    }

    // Initialize Anthropic client (when implemented)
    if (this.config.providers.anthropic?.enabled && this.config.providers.anthropic.apiKey) {
      // TODO: Initialize Anthropic client
      // this.clients.anthropic = new Anthropic({
      //   apiKey: this.config.providers.anthropic.apiKey
      // });
    }

    // Initialize DeepSeek client (when implemented) 
    if (this.config.providers.deepseek?.enabled && this.config.providers.deepseek.apiKey) {
      // TODO: Initialize DeepSeek client
      // this.clients.deepseek = new DeepSeek({
      //   apiKey: this.config.providers.deepseek.apiKey
      // });
    }
  }

  // Get the primary AI client
  getPrimaryClient(): any {
    const primaryProvider = this.config.primary;
    if (this.clients[primaryProvider]) {
      return this.clients[primaryProvider];
    }
    
    // Fallback to first available client
    for (const provider of this.config.fallback) {
      if (this.clients[provider]) {
        return this.clients[provider];
      }
    }
    
    throw new Error("No AI provider client available");
  }

  // Get client for specific provider
  getClient(providerId: string): any {
    return this.clients[providerId];
  }

  // Get all available providers
  getAvailableProviders(): string[] {
    return Object.keys(this.clients);
  }

  // Update configuration
  updateConfig(newConfig: Partial<AIServiceConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.initializeClients();
  }

  // Chat completion with automatic fallback
  async chatCompletion(params: {
    messages: Array<{ role: string; content: string }>;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }): Promise<any> {
    const providers = [this.config.primary, ...this.config.fallback];
    
    for (const providerId of providers) {
      try {
        const client = this.clients[providerId];
        if (!client) continue;

        if (providerId === 'openai') {
          const messages = params.systemPrompt 
            ? [{ role: "system", content: params.systemPrompt }, ...params.messages]
            : params.messages;

          const response = await client.chat.completions.create({
            model: params.model || "gpt-4o",
            messages,
            temperature: params.temperature || 0.7,
            max_tokens: params.maxTokens || 2000
          });

          return {
            content: response.choices[0].message.content,
            provider: providerId,
            model: params.model || "gpt-4o"
          };
        }
        
        // TODO: Add Anthropic and DeepSeek implementations
        
      } catch (error) {
        console.error(`${providerId} failed:`, error);
        continue; // Try next provider
      }
    }
    
    throw new Error("All AI providers failed");
  }

  // Get model information for a provider
  getProviderModels(providerId: string): Array<{ id: string; name: string; description: string }> {
    switch (providerId) {
      case 'openai':
        return [
          { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest GPT-4 Omni model with vision capabilities' },
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Smaller, faster version of GPT-4o' },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'GPT-4 Turbo with 128K context' },
          { id: 'gpt-4', name: 'GPT-4', description: 'Most capable GPT-4 model' },
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient model' }
        ];
      
      case 'anthropic':
        return [
          { id: 'claude-3.5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Latest)', description: 'Latest and most capable Claude model with improved reasoning' },
          { id: 'claude-3.5-sonnet-20240620', name: 'Claude 3.5 Sonnet', description: 'Advanced reasoning and coding capabilities' },
          { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most capable Claude 3 model' },
          { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed' },
          { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fast and efficient' }
        ];
      
      case 'deepseek':
        return [
          { id: 'deepseek-chat', name: 'DeepSeek Chat (Latest)', description: 'Advanced reasoning and coding model' },
          { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Specialized code generation model' },
          { id: 'deepseek-math', name: 'DeepSeek Math', description: 'Mathematical reasoning model' },
          { id: 'deepseek-reasoning', name: 'DeepSeek Reasoning', description: 'Enhanced logical reasoning capabilities' }
        ];
      
      default:
        return [];
    }
  }
}

// Global instance
export const aiServiceProvider = new AIServiceProvider();