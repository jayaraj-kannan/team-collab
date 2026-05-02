import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { TaskForm, TaskList } from './TaskSection';
import Toaster, { toast } from './Toaster';
import { createTask, toggleTaskStatus, deleteTask } from '@/app/actions';

// Mock useTransition to execute immediately
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: () => [false, (callback: () => void) => callback()],
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Plus: () => <div data-testid="plus" />,
  CheckCircle: () => <div data-testid="check" />,
  Circle: () => <div data-testid="circle" />,
  Trash2: () => <div data-testid="trash" />,
  MoreVertical: () => <div data-testid="more" />,
  CheckCircle2: () => <div data-testid="check2" />,
  Info: () => <div data-testid="info" />,
  AlertCircle: () => <div data-testid="alert" />,
  X: () => <div data-testid="x" />,
}));

// Mock Server Actions
jest.mock('@/app/actions', () => ({
  createTask: jest.fn(),
  toggleTaskStatus: jest.fn(),
  deleteTask: jest.fn(),
}));

describe('TaskSection Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TaskForm', () => {
    it('renders and handles task creation', async () => {
      render(<TaskForm />);
      const input = screen.getByPlaceholderText(/What needs to be done/i);
      const button = screen.getByText(/Add Task/i);

      fireEvent.change(input, { target: { value: 'New Task' } });
      
      const form = input.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(createTask).toHaveBeenCalled();
      });
    });
  });

  describe('TaskList', () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', status: 'TODO' },
      { id: '2', title: 'Task 2', status: 'DONE' },
    ];

    it('renders empty state', () => {
      render(<TaskList tasks={[]} />);
      expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();
    });

    it('renders tasks and handles toggle', async () => {
      render(<TaskList tasks={mockTasks} />);
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();

      const toggleButtons = screen.getAllByRole('button').filter(b => !b.className.includes('delete-btn'));
      
      await act(async () => {
        fireEvent.click(toggleButtons[0]);
      });
      expect(toggleTaskStatus).toHaveBeenCalledWith('1', 'TODO');
    });

    it('handles delete with confirmation', async () => {
      window.confirm = jest.fn().mockReturnValue(true);
      render(<TaskList tasks={mockTasks} />);
      
      const deleteButtons = screen.getAllByRole('button').filter(b => b.className.includes('delete-btn'));
      
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      expect(window.confirm).toHaveBeenCalled();
      expect(deleteTask).toHaveBeenCalledWith('1');
    });

    it('does not delete if confirmation is cancelled', async () => {
      window.confirm = jest.fn().mockReturnValue(false);
      render(<TaskList tasks={mockTasks} />);
      
      const deleteButtons = screen.getAllByRole('button').filter(b => b.className.includes('delete-btn'));
      
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      expect(deleteTask).not.toHaveBeenCalled();
    });
  });
});

describe('Toaster System', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders and displays toasts via global function', () => {
    render(<Toaster />);
    
    act(() => {
      toast('Success Message', 'success');
    });
    expect(screen.getByText('Success Message')).toBeInTheDocument();

    act(() => {
      toast('Info Message', 'info');
      toast('Error Message', 'error');
    });
    expect(screen.getByText('Info Message')).toBeInTheDocument();
    expect(screen.getByText('Error Message')).toBeInTheDocument();
  });

  it('auto-removes toasts after delay', () => {
    render(<Toaster />);
    
    act(() => {
      toast('Temp Toast');
    });
    expect(screen.getByText('Temp Toast')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3500);
    });
    
    expect(screen.queryByText('Temp Toast')).not.toBeInTheDocument();
  });
});
