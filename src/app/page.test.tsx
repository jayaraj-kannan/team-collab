import { render, screen } from '@testing-library/react';
import Page from './page';
import { auth } from '@/auth';
import { getTasks, getCalendar, createTask } from './actions';

// Mock dependencies
jest.mock('@/auth', () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('./actions', () => ({
  getTasks: jest.fn(),
  createTask: jest.fn(),
  getCalendar: jest.fn(),
}));

jest.mock('@/components/ChatPanel', () => {
  return function MockChatPanel() {
    return <div data-testid="chat-panel">AI Assistant</div>;
  };
});

jest.mock('@/components/Toaster', () => {
  return function MockToaster() {
    return <div data-testid="toaster">Toaster</div>;
  };
});

jest.mock('@/components/TaskSection', () => ({
  TaskForm: () => <div data-testid="task-form">Task Form</div>,
  TaskList: ({ tasks }: any) => (
    <div data-testid="task-list">
      {tasks.length === 0 ? "No tasks yet. You're all caught up!" : tasks.map((t: any) => <div key={t.id}>{t.title}</div>)}
    </div>
  ),
}));

// Mock lucide-react to avoid SVG rendering issues in jsdom
jest.mock('lucide-react', () => {
  return {
    LayoutDashboard: () => <div data-testid="icon-dashboard" />,
    CheckCircle2: () => <div data-testid="icon-check" />,
    CalendarDays: () => <div data-testid="icon-calendar" />,
    FolderSync: () => <div data-testid="icon-folder" />,
    Plus: () => <div data-testid="icon-plus" />,
    MoreVertical: () => <div data-testid="icon-more" />,
    Clock: () => <div data-testid="icon-clock" />,
    LogOut: () => <div data-testid="icon-logout" />,
    Trash2: () => <div data-testid="icon-trash" />,
    CheckCircle: () => <div data-testid="icon-check-circle" />,
    Circle: () => <div data-testid="icon-circle" />,
  };
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login screen when user is unauthenticated', async () => {
    (auth as jest.Mock).mockResolvedValueOnce(null);

    // Resolve the Server Component
    const ui = await Page();
    render(ui);

    expect(screen.getByText('Workspace Collab')).toBeInTheDocument();
    expect(screen.getByText('Sign in to coordinate with your team.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
  });

  it('renders the dashboard and fetches tasks when user is authenticated', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({
      user: { name: 'Jane Doe', email: 'jane@example.com' }
    });

    (getTasks as jest.Mock).mockResolvedValueOnce([
      { id: '1', title: 'Write tests', status: 'TODO' }
    ]);
    (getCalendar as jest.Mock).mockResolvedValueOnce([
      { id: 'e1', summary: 'Standup', start: { dateTime: '2024-01-01T10:00:00Z' } }
    ]);

    const ui = await Page();
    render(ui);

    // Header checks
    expect(screen.getByText('Good morning, Jane!')).toBeInTheDocument();
    expect(screen.getByTestId('task-form')).toBeInTheDocument();
    
    // Sidebar checks
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();

    // Tasks list check
    expect(screen.getByText('Write tests')).toBeInTheDocument();

    // Calendar check
    expect(screen.getByText('Standup')).toBeInTheDocument();
    expect(screen.getByText(/PM|AM/)).toBeInTheDocument();

    // Chat Panel check
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
  });

  it('renders a fallback message when user has no tasks or meetings', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({
      user: { name: 'John', email: 'john@example.com' }
    });

    (getTasks as jest.Mock).mockResolvedValueOnce([]);
    (getCalendar as jest.Mock).mockResolvedValueOnce([]);

    const ui = await Page();
    render(ui);

    expect(screen.getByText("No tasks yet. You're all caught up!")).toBeInTheDocument();
    expect(screen.getByText("No meetings scheduled.")).toBeInTheDocument();
  });

  it('renders fallback values for events without specific times or locations', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123', name: 'Jane' } });
    (getTasks as jest.Mock).mockResolvedValueOnce([]);
    (getCalendar as jest.Mock).mockResolvedValueOnce([
      { id: 'e2', summary: 'All Day Event', start: null, location: null }
    ]);

    const ui = await Page();
    render(ui);

    expect(screen.getByText('All Day Event')).toBeInTheDocument();
    expect(screen.getByText(/All Day • No location/)).toBeInTheDocument();
  });

  it('renders correctly for events with start.date but no start.dateTime', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123', name: 'Jane' } });
    (getTasks as jest.Mock).mockResolvedValueOnce([]);
    (getCalendar as jest.Mock).mockResolvedValueOnce([
      { id: 'e3', summary: 'Whole Day Meeting', start: { date: '2024-01-01' }, location: 'Virtual' }
    ]);

    const ui = await Page();
    render(ui);

    expect(screen.getByText('Whole Day Meeting')).toBeInTheDocument();
    expect(screen.getByText(/AM|PM/)).toBeInTheDocument();
  });

  it('renders "Team" when user name is missing', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123' } });
    (getTasks as jest.Mock).mockResolvedValueOnce([]);
    (getCalendar as jest.Mock).mockResolvedValueOnce([]);

    const ui = await Page();
    render(ui);

    expect(screen.getByText('Good morning, Team!')).toBeInTheDocument();
  });
});
