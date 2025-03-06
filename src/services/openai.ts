import OpenAI from 'openai';

/**
 * Creates an OpenAI client with the provided API key
 * @param apiKey The OpenAI API key
 * @returns An OpenAI client instance
 */
export const createOpenAIClient = (apiKey: string): OpenAI => {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Note: In production, API calls should be made from a backend
  });
};

/**
 * Performs inference using the specified model and API key
 * @param model The model to use for inference
 * @param apiKey The OpenAI API key
 * @param prompt The prompt to send to the model
 * @returns The model's response
 */
export const performInference = async (
  model: string,
  apiKey: string,
  prompt: string
): Promise<string> => {
  try {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    const openai = createOpenAIClient(apiKey);
    
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('Error performing inference:', error);
    throw error;
  }
};

/**
 * Validates an OpenAI API key by making a test request
 * @param apiKey The OpenAI API key to validate
 * @returns True if the API key is valid, false otherwise
 */
export const validateAPIKey = async (apiKey: string): Promise<boolean> => {
  try {
    if (!apiKey) return false;
    
    const openai = createOpenAIClient(apiKey);
    
    // Make a minimal request to check if the API key is valid
    await openai.models.list();
    
    return true;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
};

/**
 * Gets a list of available models for the given API key
 * @param apiKey The OpenAI API key
 * @returns An array of available model IDs
 */
export const getAvailableModels = async (apiKey: string): Promise<string[]> => {
  try {
    if (!apiKey) {
      return [];
    }
    
    const openai = createOpenAIClient(apiKey);
    const models = await openai.models.list();
    
    return models.data
      .map(model => model.id)
      .filter(id => id.startsWith('gpt-')); // Filter to only GPT models
  } catch (error) {
    console.error('Error fetching available models:', error);
    return [];
  }
}; 