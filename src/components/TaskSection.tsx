"use client";

import React, { useTransition } from 'react';
import { Plus, CheckCircle, Circle, Trash2, MoreVertical } from 'lucide-react';
import { createTask, toggleTaskStatus, deleteTask } from '@/app/actions';
import { toast } from './Toaster';

export function TaskForm() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get('title') as string;
    
    startTransition(async () => {
      await createTask(formData);
      toast(`Task "${title}" created!`, 'success');
      form.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
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
      <button className="btn-primary" type="submit" disabled={isPending}>
        <Plus size={18} /> {isPending ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
}

export function TaskList({ tasks }: { tasks: any[] }) {
  const [isPending, startTransition] = useTransition();

  return (
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
            <div className="task-item" key={task.id} style={{ justifyContent: 'space-between', opacity: isPending ? 0.7 : 1 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <button 
                  onClick={() => startTransition(async () => {
                    await toggleTaskStatus(task.id, task.status);
                    const msg = task.status === 'DONE' ? 'Task reopened' : 'Task completed!';
                    toast(msg, 'info');
                  })}
                  style={{ marginTop: 2, padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {task.status === "DONE" ? (
                    <CheckCircle size={18} color="var(--primary)" />
                  ) : (
                    <Circle size={18} color="var(--text-muted)" />
                  )}
                </button>
                <div className="task-content">
                  <h4 style={{ 
                    textDecoration: task.status === "DONE" ? 'line-through' : 'none',
                    color: task.status === "DONE" ? 'var(--text-muted)' : 'var(--text-main)',
                    transition: 'all 0.2s'
                  }}>
                    {task.title}
                  </h4>
                  <p>{task.status === "DONE" ? 'Completed' : 'Pending'}</p>
                </div>
              </div>
              
              <button 
                onClick={() => startTransition(async () => {
                  if (confirm('Delete this task?')) {
                    await deleteTask(task.id);
                    toast('Task deleted', 'error');
                  }
                })}
                className="delete-btn" 
                style={{ padding: 6, borderRadius: 6, transition: 'all 0.2s', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Trash2 size={14} color="var(--text-muted)" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
