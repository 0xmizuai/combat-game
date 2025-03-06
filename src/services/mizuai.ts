import OpenAI from 'openai';

/**
 * Creates a client for the MIZU API with the provided API key
 * @param apiKey The MIZU API key
 * @returns An OpenAI-compatible client instance configured for MIZU API
 */
export const createMizuClient = (apiKey: string): OpenAI => {
  return new OpenAI({
    apiKey,
    baseURL: 'https://node.mizuai.io/v1',
    dangerouslyAllowBrowser: true, // Note: In production, API calls should be made from a backend
  });
};

/**
 * Performs inference using the MIZU API
 * @param model The model to use for inference (user-specified)
 * @param apiKey The MIZU API key
 * @param prompt The prompt to send to the model
 * @returns The model's response
 */
export const performInference = async (
  model: string,
  _apiKey: string,
  prompt: string
): Promise<string> => {
  try {
    // Mock implementation - return a simulated response
    console.log('MOCK: Performing inference with MIZU API');
    console.log('Model:', model);
    console.log('Prompt:', prompt);
    
    // Add a delay to simulate network request (2-4 seconds)
    const delay = 2000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Extract questions from the prompt
    const questionsMatch = prompt.match(/\d+\.\s.+/g);
    const questions = questionsMatch || [];
    
    // Generate mock answers
    const answers = questions.map((question, index) => {
      return `Answer ${index + 1}: This is a simulated response to the question "${question.trim()}". The MIZU API is working correctly with the model ${model}.`;
    });
    
    return `As an AI agent, I've analyzed the questions and here are my responses:

${answers.join('\n\n')}

I hope these answers demonstrate my capabilities. I'm ready for the next challenge!`;
    
    // Real implementation (commented out for now)
    /*
    if (!apiKey) {
      throw new Error('MIZU API key is required');
    }

    if (!model) {
      throw new Error('Model name is required');
    }

    const client = createMizuClient(apiKey);
    
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || 'No response generated';
    */
  } catch (error) {
    console.error('Error performing inference with MIZU API:', error);
    throw error;
  }
};

/**
 * Validates a MIZU API key by making a test request
 * @param apiKey The MIZU API key to validate
 * @returns True if the API key is valid, false otherwise
 */
export const validateAPIKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Mock implementation - always return true for now
    console.log('MOCK: Validating MIZU API key (always passing):', apiKey);
    
    // Add a small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
    
    // Real implementation (commented out for now)
    /*
    if (!apiKey) return false;
    
    const client = createMizuClient(apiKey);
    
    // Make a minimal request to check if the API key is valid
    // Using a simple models.list call which should be supported by MIZU API
    await client.models.list();
    
    return true;
    */
  } catch (error) {
    console.error('MIZU API key validation failed:', error);
    return false;
  }
};

/**
 * Gets a list of available models for the given MIZU API key
 * @param apiKey The MIZU API key
 * @returns An array of available model IDs
 */
export const getAvailableModels = async (apiKey: string): Promise<string[]> => {
  try {
    // Mock implementation - return a list of mock models
    console.log('MOCK: Getting available models from MIZU API');
    
    // Add a delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock models
    return [
      'gpt-3.5-turbo',
      'gpt-4',
      'gpt-4-turbo',
      'claude-3-opus',
      'claude-3-sonnet',
      'llama-3-70b',
      'llama-3-8b',
      'mistral-large',
      'mistral-medium'
    ];
    
    // Real implementation (commented out for now)
    /*
    if (!apiKey) {
      return [];
    }
    
    const client = createMizuClient(apiKey);
    const models = await client.models.list();
    
    // Return all available models
    return models.data.map(model => model.id);
    */
  } catch (error) {
    console.error('Error fetching available models from MIZU API:', error);
    // Return an empty array if there's an error
    return [];
  }
}; 