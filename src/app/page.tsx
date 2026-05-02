import { 
  LayoutDashboard, 
  CheckCircle2, 
  CalendarDays, 
  FolderSync, 
  Plus,
  MoreVertical,
  Clock,
  LogOut
} from "lucide-react";
import { auth } from "@/auth";
import { getTasks, createTask, getCalendar, handleSignIn, handleSignOut } from "./actions";
import ChatPanel from "@/components/ChatPanel";

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: 400, width: '100%', textAlign: 'center', padding: 40 }}>
          <div style={{ width: 48, height: 48, background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <FolderSync size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 24, margin: 0, letterSpacing: '-0.5px' }}>Workspace Collab</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, marginTop: 8 }}>Sign in to coordinate with your team.</p>
          
          <form action={handleSignIn}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}>
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tasks = await getTasks();
  const calendarEvents = await getCalendar();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderSync size={18} color="white" />
          </div>
          Workspace
        </div>

        <nav>
          <a href="#" className="nav-link active">
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="#" className="nav-link">
            <CheckCircle2 size={18} /> My Tasks
          </a>
          <a href="#" className="nav-link">
            <CalendarDays size={18} /> Calendar
          </a>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <form action={handleSignOut}>
            <button className="nav-link" style={{ width: '100%', background: 'transparent', textAlign: 'left', border: 'none', padding: '12px 16px', cursor: 'pointer' }}>
              <LogOut size={18} /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <h1 className="header-title">Good morning, {session.user.name?.split(' ')[0] || 'Team'}!</h1>
          
          <form action={createTask} style={{ display: 'flex', gap: 12 }}>
            <input 
              name="title" 
              placeholder="What needs to be done?" 
              style={{ 
                padding: '10px 16px', 
                borderRadius: 8, 
                border: '1px solid var(--border)', 
                background: 'var(--surface-hover)', 
                color: 'var(--text-main)', 
                width: 300,
                outline: 'none',
                fontFamily: 'inherit'
              }}
              required
            />
            <button className="btn-primary" type="submit">
              <Plus size={18} /> Add Task
            </button>
          </form>
        </header>

        <div className="dashboard-grid">
          {/* Card 1: Active Tasks */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Priority Tasks</h3>
              <MoreVertical size={16} color="var(--text-muted)" />
            </div>
            
            <div className="task-list">
              {tasks.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>No tasks yet. You're all caught up!</p>
              ) : (
                tasks.map((task: any) => (
                  <div className="task-item" key={task.id}>
                    <div style={{ marginTop: 2 }}>
                      <CheckCircle2 size={16} color="var(--text-muted)" />
                    </div>
                    <div className="task-content">
                      <h4>{task.title}</h4>
                      <p>Created just now</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 2: Upcoming Meetings */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Upcoming Syncs</h3>
              <span className="badge">Live Sync</span>
            </div>
            
            <div className="task-list">
              {calendarEvents.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>No meetings scheduled.</p>
              ) : (
                calendarEvents.map((event: any) => {
                  const start = event.start?.dateTime || event.start?.date;
                  const startTime = start ? new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day';
                  
                  return (
                    <div className="task-item" key={event.id}>
                      <div style={{ marginTop: 2 }}>
                        <Clock size={16} color="var(--primary)" />
                      </div>
                      <div className="task-content">
                        <h4>{event.summary}</h4>
                        <p>{startTime} • {event.location || 'No location'}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Card 3: Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
              <MoreVertical size={16} color="var(--text-muted)" />
            </div>
            
            <div className="task-list">
              <div className="task-item">
                <div className="task-content">
                  <h4>Priya attached a file</h4>
                  <p>Updated 'Q3 Marketing Deck.pdf' to task</p>
                </div>
              </div>
              <div className="task-item">
                <div className="task-content">
                  <h4>Alex completed a task</h4>
                  <p>Finished 'Design system update'</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <ChatPanel />
    </div>
  );
}
