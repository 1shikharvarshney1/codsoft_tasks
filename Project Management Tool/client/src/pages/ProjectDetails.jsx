import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import ProjectModal from '../components/ProjectModal';
import ProgressBar from '../components/ProgressBar';
import {
  ArrowLeft,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  ListTodo,
  Clock,
  CheckCircle,
  FolderKanban
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Failed to load project details:', err);
      setError('Could not load project details. It may have been deleted.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  // Recalculate metrics locally or re-fetch project metrics from server
  const refreshProjectMetrics = async () => {
    try {
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data);
    } catch (err) {
      console.error('Error refreshing project metrics:', err);
    }
  };

  const handleCreateOrUpdateTask = async (taskData) => {
    if (editingTask) {
      const res = await api.put(`/tasks/${editingTask._id}`, taskData);
      setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? res.data : t)));
    } else {
      const res = await api.post(`/tasks/project/${id}`, taskData);
      setTasks((prev) => [res.data, ...prev]);
    }
    await refreshProjectMetrics();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
      await refreshProjectMetrics();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        await refreshProjectMetrics();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleUpdateProject = async (projectData) => {
    const res = await api.put(`/projects/${id}`, projectData);
    setProject(res.data);
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Delete this entire project and all associated tasks?')) {
      try {
        await api.delete(`/projects/${id}`);
        navigate('/');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  const openAddTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Loading project details...</div>;
  }

  if (error || !project) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} color="var(--danger)" />
        <h3>Project not found</h3>
        <p>{error || 'The requested project does not exist.'}</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const formattedDueDate = new Date(project.dueDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const todoCount = tasks.filter((t) => t.status === 'To Do').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;
  const overdueCount = tasks.filter((t) => t.isOverdue).length;

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'All') return true;
    return t.status === statusFilter;
  });

  return (
    <div>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-muted)'
          }}
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>

      {/* Project Overview Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1', minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>{project.title}</h1>
              {project.isOverdue && (
                <span className="badge badge-overdue">
                  <AlertCircle size={13} />
                  Project Overdue
                </span>
              )}
              {project.progress === 100 && tasks.length > 0 && (
                <span className="badge badge-done">
                  <CheckCircle2 size={13} />
                  100% Completed
                </span>
              )}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
              {project.description || 'No description provided for this project.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} color="var(--primary)" />
                <span>
                  Deadline: <strong>{formattedDueDate}</strong>
                </span>
              </div>
              <div>
                Created by: <strong>{project.owner?.name || 'You'}</strong>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsProjectModalOpen(true)}>
              <Edit2 size={15} />
              <span>Edit Project</span>
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Progress Bar inside project banner */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <ProgressBar progress={project.progress || 0} height={10} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            <span>
              {doneCount} of {tasks.length} tasks completed
            </span>
            <span>
              {overdueCount > 0 ? (
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{overdueCount} task(s) overdue</span>
              ) : (
                'On track'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Task Summary Metrics */}
      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="stat-card" onClick={() => setStatusFilter('All')} style={{ cursor: 'pointer', border: statusFilter === 'All' ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
          <div className="stat-icon" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
            <ListTodo size={22} />
          </div>
          <div>
            <div className="stat-number">{tasks.length}</div>
            <div className="stat-label">All Tasks</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => setStatusFilter('To Do')} style={{ cursor: 'pointer', border: statusFilter === 'To Do' ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
          <div className="stat-icon" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-number">{todoCount}</div>
            <div className="stat-label">To Do</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => setStatusFilter('In Progress')} style={{ cursor: 'pointer', border: statusFilter === 'In Progress' ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-number">{inProgressCount}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => setStatusFilter('Done')} style={{ cursor: 'pointer', border: statusFilter === 'Done' ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="stat-number">{doneCount}</div>
            <div className="stat-label">Done</div>
          </div>
        </div>
      </div>

      {/* Tasks Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Project Tasks</h2>
          <span className="badge badge-todo">{filteredTasks.length}</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={openAddTaskModal}>
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div>
          {filteredTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={openEditTaskModal}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FolderKanban size={44} />
          <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.3rem' }}>
            {statusFilter === 'All' ? 'No tasks yet' : `No tasks with status "${statusFilter}"`}
          </h4>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Break down this project by creating actionable tasks with deadlines and assignments.
          </p>
          <button className="btn btn-primary btn-sm" onClick={openAddTaskModal}>
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateOrUpdateTask}
        task={editingTask}
        projectId={id}
      />

      {/* Project Edit Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleUpdateProject}
        project={project}
      />
    </div>
  );
};

export default ProjectDetails;
