import { getCalendarEvents } from './google-calendar';
import { adminDb } from './firebase-admin';
import { google } from 'googleapis';

// Mock dependencies
jest.mock('./firebase-admin', () => {
  const getMock = jest.fn();
  const limitMock = jest.fn().mockReturnValue({ get: getMock });
  const whereMock2 = jest.fn().mockReturnValue({ limit: limitMock });
  const whereMock1 = jest.fn().mockReturnValue({ where: whereMock2 });

  return {
    adminDb: {
      collection: jest.fn().mockReturnValue({
        where: whereMock1,
      }),
    },
    __mocks: { getMock, whereMock1, whereMock2, limitMock }
  };
});

jest.mock('googleapis', () => {
  const listMock = jest.fn();
  return {
    google: {
      auth: {
        OAuth2: jest.fn().mockImplementation(() => ({
          setCredentials: jest.fn(),
        })),
      },
      calendar: jest.fn().mockReturnValue({
        events: {
          list: listMock,
        }
      }),
    },
    __mocks: { listMock }
  };
});

describe('Google Calendar Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if no Google account is found for the user', async () => {
    const { __mocks: dbMocks } = require('./firebase-admin');
    dbMocks.getMock.mockResolvedValueOnce({ empty: true });

    await expect(getCalendarEvents('user123')).rejects.toThrow('No Google account found for user');
  });

  it('should successfully fetch events if the account exists', async () => {
    const { __mocks: dbMocks } = require('./firebase-admin');
    dbMocks.getMock.mockResolvedValueOnce({
      empty: false,
      docs: [{
        data: () => ({
          access_token: 'abc',
          refresh_token: 'def',
          expires_at: 123456789
        })
      }]
    });

    const { __mocks: gMocks } = require('googleapis');
    gMocks.listMock.mockResolvedValueOnce({
      data: {
        items: [{ id: 'evt1', summary: 'Meeting' }]
      }
    });

    const events = await getCalendarEvents('user123');
    
    expect(events).toEqual([{ id: 'evt1', summary: 'Meeting' }]);
    expect(dbMocks.whereMock1).toHaveBeenCalledWith('userId', '==', 'user123');
    expect(gMocks.listMock).toHaveBeenCalledWith(expect.objectContaining({
      calendarId: 'primary',
      maxResults: 5
    }));
  });

  it('should handle missing expires_at and empty items list', async () => {
    const { __mocks: dbMocks } = require('./firebase-admin');
    dbMocks.getMock.mockResolvedValueOnce({
      empty: false,
      docs: [{
        data: () => ({
          access_token: 'abc',
          refresh_token: 'def',
          expires_at: undefined // This covers line 29 undefined branch
        })
      }]
    });

    const { __mocks: gMocks } = require('googleapis');
    gMocks.listMock.mockResolvedValueOnce({
      data: {
        items: undefined // This covers line 44 || [] branch
      }
    });

    const events = await getCalendarEvents('user123');
    expect(events).toEqual([]);
  });
});
