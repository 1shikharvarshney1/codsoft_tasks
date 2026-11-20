import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import { Plus, Search, Folder, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed, overdue

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Could not retrieve projects. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateOrUpdateProject = async (projectData) => {
    if (editingProject) {
      const res = await api.put(`/projects/${editingProject._id}`, projectData);
      setProjects((prev) => prev.map((p) => (p._id === editingProject._id ? res.data : p)));
    } else {
      const res = await api.post('/projects', projectData);
      setProjects((prev) => [res.data, ...prev]);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will also be permanently deleted.')) {
      try {
        await api.delete(`/projects/${projectId}`);
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  // Metrics
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.progress === 100 && (p.stats?.totalTasks || 0) > 0).length;
  const overdueProjects = projects.filter((p) => p.isOverdue).length;
  const totalTasksCount = projects.reduce((acc, p) => acc + (p.stats?.totalTasks || 0), 0);

  // Filtered projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === 'completed') return project.progress === 100 && (project.stats?.totalTasks || 0) > 0;
    if (filter === 'overdue') return project.isOverdue;
    if (filter === 'active') return project.progress < 100 && !project.isOverdue;
    return true;
  });

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Project Dashboard</h1>
          <p className="page-subtitle">Track, manage and collaborate on all your ongoing deliverables.</p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Folder size={24} />
          </div>
          <div>
            <div className="stat-number">{totalProjects}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-number">{completedProjects}</div>
            <div className="stat-label">Completed Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-number">{overdueProjects}</div>
            <div className="stat-label">Overdue Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-number">{totalTasksCount}</div>
            <div className="stat-label">Total Work Items</div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search projects by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'active', 'overdue', 'completed'].map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm ${filter === tab ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(tab)}
              style={{ textTransform: 'capitalize' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Loading your projects...
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={openEditModal}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Folder size={48} strokeWidth={1.5} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            No projects found
          </h3>
          <p style={{ maxWidth: '380px', margin: '0 auto 1.25rem', fontSize: '0.9rem' }}>
            {searchTerm || filter !== 'all'
              ? 'Try modifying your search or filter criteria to see projects.'
              : 'Get started by creating your very first project to organize and track tasks.'}
          </p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            <span>Create New Project</span>
          </button>
        </div>
      )}

      {/* Project Create/Edit Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdateProject}
        project={editingProject}
      />
    </div>
  );
};

export default Dashboard;
