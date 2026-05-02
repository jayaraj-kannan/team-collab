import { chatWithAssistant } from './chat-actions';
import { auth } from '@/auth';
import { getTasks, getCalendar } from './actions';
import { model } from '@/lib/gemini';

// Mock dependencies
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('./actions', () => ({
  getTasks: jest.fn(),
  getCalendar: jest.fn(),
}));

jest.mock('@/lib/gemini', () => ({
  model: {
    generateContent: jest.fn(),
  },
}));

describe('Assistant Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('should throw an error if the user is not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValueOnce(null);
    await expect(chatWithAssistant('Hello')).rejects.toThrow('Unauthorized');
  });

  it('should successfully send a message to Gemini with context and return the response', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123', name: 'John' } });
    (getTasks as jest.Mock).mockResolvedValueOnce([{ title: 'Task 1', status: 'TODO' }]);
    (getCalendar as jest.Mock).mockResolvedValueOnce([{ summary: 'Meeting 1', start: { dateTime: '2024-01-01T10:00:00Z' } }]);
    
    (model.generateContent as jest.Mock).mockResolvedValueOnce({
      response: {
        text: () => 'Hello John, you have one task and one meeting.'
      }
    });

    const response = await chatWithAssistant('What is my schedule?');
    
    expect(response).toBe('Hello John, you have one task and one meeting.');
    expect(model.generateContent).toHaveBeenCalledWith([
      expect.stringContaining('John'),
      'What is my schedule?'
    ]);
    expect(model.generateContent).toHaveBeenCalledWith([
      expect.stringContaining('Task 1'),
      'What is my schedule?'
    ]);
  });

  it('should return a fallback message if Gemini fails', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123' } });
    (getTasks as jest.Mock).mockResolvedValueOnce([]);
    (getCalendar as jest.Mock).mockResolvedValueOnce([]);
    (model.generateContent as jest.Mock).mockRejectedValueOnce(new Error('API Down'));

    const response = await chatWithAssistant('Hello');
    expect(response).toBe("I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.");
  });

  it('should handle whole-day events in the calendar context', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123', name: 'John' } });
    (getTasks as jest.Mock).mockResolvedValueOnce([]);
    (getCalendar as jest.Mock).mockResolvedValueOnce([
      { summary: 'Holiday', start: { date: '2024-01-01' } } // Covers the .date branch
    ]);
    
    (model.generateContent as jest.Mock).mockResolvedValueOnce({
      response: { text: () => 'Enjoy your holiday.' }
    });

    const response = await chatWithAssistant('Hi');
    expect(response).toBe('Enjoy your holiday.');
  });
});
