import { 
  LayoutDashboard, 
  CheckCircle2, 
  CalendarDays, 
  FolderSync, 
  Plus,
  MoreVertical,
  Clock
} from "lucide-react";

export default function Dashboard() {
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
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <h1 className="header-title">Good morning, Team!</h1>
          <button className="btn-primary">
            <Plus size={18} /> New Task
          </button>
        </header>

        <div className="dashboard-grid">
          {/* Card 1: Active Tasks */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Priority Tasks</h3>
              <MoreVertical size={16} color="var(--text-muted)" />
            </div>
            
            <div className="task-list">
              <div className="task-item">
                <div style={{ marginTop: 2 }}>
                  <CheckCircle2 size={16} color="var(--text-muted)" />
                </div>
                <div className="task-content">
                  <h4>Q3 Marketing Deck Review</h4>
                  <p>Due today • Marketing Team</p>
                </div>
              </div>
              <div className="task-item">
                <div style={{ marginTop: 2 }}>
                  <CheckCircle2 size={16} color="var(--text-muted)" />
                </div>
                <div className="task-content">
                  <h4>Finalize Database Schema</h4>
                  <p>Due tomorrow • Engineering</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Upcoming Meetings */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Upcoming Syncs</h3>
              <span className="badge">Synced via Google</span>
            </div>
            
            <div className="task-list">
              <div className="task-item">
                <div style={{ marginTop: 2 }}>
                  <Clock size={16} color="var(--primary)" />
                </div>
                <div className="task-content">
                  <h4>Engineering Standup</h4>
                  <p>10:00 AM • Google Meet</p>
                </div>
              </div>
              <div className="task-item">
                <div style={{ marginTop: 2 }}>
                  <Clock size={16} color="var(--text-muted)" />
                </div>
                <div className="task-content">
                  <h4>Product Sync</h4>
                  <p>2:00 PM • Room 4B</p>
                </div>
              </div>
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
    </div>
  );
}
