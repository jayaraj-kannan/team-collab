import { createTask, getTasks, getCalendar, handleSignIn, handleSignOut, toggleTaskStatus, deleteTask } from './actions';
import { auth } from '@/auth';
import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { getCalendarEvents } from '@/lib/google-calendar';

// Mock dependencies
jest.mock('@/auth', () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('@/lib/firebase-admin', () => {
  const addMock = jest.fn();
  const updateMock = jest.fn();
  const deleteMock = jest.fn();
  const docMock = jest.fn().mockReturnValue({ update: updateMock, delete: deleteMock });
  const getMock = jest.fn();
  const orderByMock = jest.fn().mockReturnValue({ get: getMock });
  const whereMock = jest.fn().mockReturnValue({ orderBy: orderByMock });
  
  return {
    adminDb: {
      collection: jest.fn().mockReturnValue({
        add: addMock,
        where: whereMock,
        doc: docMock,
      }),
    },
    // Exporting these for assertion checks in the tests
    __mocks: { addMock, whereMock, orderByMock, getMock, docMock, updateMock, deleteMock }
  };
});

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/lib/google-calendar', () => ({
  getCalendarEvents: jest.fn(),
}));

describe('Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('createTask', () => {
    it('should throw an error if the user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValueOnce(null);
      const formData = new FormData();
      formData.append('title', 'Test Task');

      await expect(createTask(formData)).rejects.toThrow('Unauthorized');
    });

    it('should bail early if title is empty', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123' } });
      const formData = new FormData();
      // No title appended
      
      const { __mocks } = require('@/lib/firebase-admin');
      
      await createTask(formData);
      
      expect(__mocks.addMock).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it('should add a task to Firestore and revalidate the path', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123' } });
      const formData = new FormData();
      formData.append('title', 'Test Task');
      
      const { __mocks } = require('@/lib/firebase-admin');
      
      await createTask(formData);
      
      expect(adminDb.collection).toHaveBeenCalledWith('tasks');
      expect(__mocks.addMock).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Task',
        status: 'TODO',
        projectId: 'default',
        assigneeId: 'user123',
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });
  });

  describe('getTasks', () => {
    it('should return an empty array if the user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValueOnce(null);
      
      const tasks = await getTasks();
      
      expect(tasks).toEqual([]);
      expect(adminDb.collection).not.toHaveBeenCalled();
    });

    it('should fetch and map tasks from Firestore for the authenticated user', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123' } });
      
      const { __mocks } = require('@/lib/firebase-admin');
      __mocks.getMock.mockResolvedValueOnce({
        docs: [
          { id: '1', data: () => ({ title: 'Task 1', status: 'TODO' }) },
          { id: '2', data: () => ({ title: 'Task 2', status: 'DONE' }) },
        ]
      });

      const tasks = await getTasks();
      
      expect(adminDb.collection).toHaveBeenCalledWith('tasks');
      expect(__mocks.whereMock).toHaveBeenCalledWith('assigneeId', '==', 'user123');
      expect(__mocks.orderByMock).toHaveBeenCalledWith('createdAt', 'desc');
      
      expect(tasks).toEqual([
        { 
          id: '1', 
          title: 'Task 1', 
          status: 'TODO', 
          projectId: 'default', 
          assigneeId: undefined, 
          createdAt: expect.any(Number) 
        },
        { 
          id: '2', 
          title: 'Task 2', 
          status: 'DONE', 
          projectId: 'default', 
          assigneeId: undefined, 
          createdAt: expect.any(Number) 
        },
      ]);
    });
  });

  describe('toggleTaskStatus', () => {
    it('should throw if unauthorized', async () => {
      (auth as jest.Mock).mockResolvedValueOnce(null);
      await expect(toggleTaskStatus('1', 'TODO')).rejects.toThrow('Unauthorized');
    });

    it('should toggle TODO to DONE', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123' } });
      const { __mocks } = require('@/lib/firebase-admin');
      
      await toggleTaskStatus('task1', 'TODO');
      
      expect(__mocks.docMock).toHaveBeenCalledWith('task1');
      expect(__mocks.updateMock).toHaveBeenCalledWith(expect.objectContaining({
        status: 'DONE',
        updatedAt: expect.any(Date)
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    it('should toggle DONE to TODO', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123' } });
      const { __mocks } = require('@/lib/firebase-admin');
      
      await toggleTaskStatus('task1', 'DONE');
      
      expect(__mocks.updateMock).toHaveBeenCalledWith(expect.objectContaining({
        status: 'TODO'
      }));
    });
  });

  describe('deleteTask', () => {
    it('should throw if unauthorized', async () => {
      (auth as jest.Mock).mockResolvedValueOnce(null);
      await expect(deleteTask('1')).rejects.toThrow('Unauthorized');
    });

    it('should delete a task from Firestore', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123' } });
      const { __mocks } = require('@/lib/firebase-admin');
      
      await deleteTask('task1');
      
      expect(__mocks.docMock).toHaveBeenCalledWith('task1');
      expect(__mocks.deleteMock).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });
  });

  describe('getCalendar', () => {
    it('should return an empty array if unauthorized', async () => {
      (auth as jest.Mock).mockResolvedValueOnce(null);
      const events = await getCalendar();
      expect(events).toEqual([]);
    });

    it('should return events from the calendar service', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123' } });
      (getCalendarEvents as jest.Mock).mockResolvedValueOnce([{ summary: 'Event' }]);
      
      const events = await getCalendar();
      expect(events).toEqual([{ summary: 'Event' }]);
    });

    it('should return an empty array if service fails', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'user123' } });
      (getCalendarEvents as jest.Mock).mockRejectedValueOnce(new Error('Sync failed'));
      
      const events = await getCalendar();
      expect(events).toEqual([]);
    });
  });

  describe('handleSignIn', () => {
    it('should call signIn with google', async () => {
      const { signIn } = require('@/auth');
      await handleSignIn();
      expect(signIn).toHaveBeenCalledWith('google');
    });
  });

  describe('handleSignOut', () => {
    it('should call signOut', async () => {
      const { signOut } = require('@/auth');
      await handleSignOut();
      expect(signOut).toHaveBeenCalled();
    });
  });
});
