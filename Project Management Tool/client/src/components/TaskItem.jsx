import React from 'react';
import { Calendar, AlertCircle, Clock, CheckCircle2, User, Edit2, Trash2 } from 'lucide-react';

const TaskItem = ({ task, onStatusChange, onEdit, onDelete }) => {
  const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'badge-priority-high';
      case 'Low':
        return 'badge-priority-low';
      case 'Medium':
      default:
        return 'badge-priority-medium';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Done':
        return 'badge-done';
      case 'In Progress':
        return 'badge-inprogress';
      case 'To Do':
      default:
        return 'badge-todo';
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.1rem',
        marginBottom: '0.85rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'all 0.2s ease',
        borderLeft: task.status === 'Done' ? '4px solid var(--success)' : task.isOverdue ? '4px solid var(--danger)' : '4px solid var(--primary)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            textDecoration: task.status === 'Done' ? 'line-through' : 'none',
            opacity: task.status === 'Done' ? 0.75 : 1
          }}
        >
          {task.title}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <button
            className="btn btn-secondary btn-icon"
            title="Edit Task"
            onClick={() => onEdit(task)}
            style={{ padding: '0.3rem' }}
          >
            <Edit2 size={13} color="var(--text-muted)" />
          </button>
          <button
            className="btn btn-danger btn-icon"
            title="Delete Task"
            onClick={() => onDelete(task._id)}
            style={{ padding: '0.3rem' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {task.description && (
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          {task.description}
        </p>
      )}

      {/* Badges and metadata row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* Status selector */}
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className={`badge ${getStatusBadgeClass(task.status)}`}
            style={{ cursor: 'pointer', border: 'none', outline: 'none', padding: '0.3rem 0.6rem' }}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          {/* Priority */}
          <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
            {task.priority}
          </span>

          {/* Overdue tag */}
          {task.isOverdue && (
            <span className="badge badge-overdue">
              <AlertCircle size={12} />
              Overdue
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {/* Due date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: task.isOverdue ? 'var(--danger)' : 'inherit', fontWeight: task.isOverdue ? 600 : 400 }}>
            <Calendar size={13} />
            <span>{formattedDate}</span>
          </div>

          {/* Assigned user */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title={task.assignedTo ? `Assigned to: ${task.assignedTo.name} (${task.assignedTo.email})` : 'Unassigned'}>
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: task.assignedTo ? '#e0e7ff' : '#f1f5f9',
                color: task.assignedTo ? 'var(--primary)' : 'var(--text-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700
              }}
            >
              {task.assignedTo ? task.assignedTo.name.charAt(0).toUpperCase() : <User size={12} />}
            </div>
            <span>{task.assignedTo ? task.assignedTo.name.split(' ')[0] : 'Unassigned'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
