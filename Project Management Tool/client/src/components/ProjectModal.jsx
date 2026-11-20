import React, { useState, useEffect } from 'react';
import { X, Calendar, FolderPlus, Edit3 } from 'lucide-react';

const ProjectModal = ({ isOpen, onClose, onSave, project = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setDescription(project.description || '');
      // Format to YYYY-MM-DD for date input
      const formattedDate = project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '';
      setDueDate(formattedDate);
    } else {
      setTitle('');
      setDescription('');
      // Default to 14 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      setDueDate(defaultDate.toISOString().split('T')[0]);
    }
    setError('');
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Project title is required');
      return;
    }
    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({ title: title.trim(), description: description.trim(), dueDate });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {project ? <Edit3 size={20} color="var(--primary)" /> : <FolderPlus size={20} color="var(--primary)" />}
            <h3>{project ? 'Edit Project' : 'Create New Project'}</h3>
          </div>
          <button className="btn btn-icon" onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="project-title">Project Title *</label>
              <input
                id="project-title"
                type="text"
                className="form-control"
                placeholder="e.g. Website Redesign"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="project-desc">Description</label>
              <textarea
                id="project-desc"
                className="form-control"
                placeholder="Brief summary of project goals, scope, and objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="project-due">Target Deadline *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="project-due"
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
