import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { Calendar, AlertCircle, CheckCircle2, Clock, Edit2, Trash2, ArrowRight } from 'lucide-react';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const formattedDate = new Date(project.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const total = project.stats?.totalTasks || 0;
  const completed = project.stats?.completedTasks || 0;

  const handleCardClick = (e) => {
    // Prevent navigation if clicked on action buttons
    if (e.target.closest('button')) return;
    navigate(`/projects/${project._id}`);
  };

  return (
    <div
      className="card"
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onClick={handleCardClick}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-word' }}>
            {project.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button
              className="btn btn-secondary btn-icon"
              title="Edit Project"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
            >
              <Edit2 size={15} color="var(--text-muted)" />
            </button>
            <button
              className="btn btn-danger btn-icon"
              title="Delete Project"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project._id);
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem', minHeight: '40px', lineClamp: 2 }}>
          {project.description || 'No description provided.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Calendar size={14} />
            <span>Due {formattedDate}</span>
          </div>

          {project.isOverdue && (
            <span className="badge badge-overdue">
              <AlertCircle size={12} />
              Overdue
            </span>
          )}

          {project.progress === 100 && total > 0 && (
            <span className="badge badge-done">
              <CheckCircle2 size={12} />
              Completed
            </span>
          )}
        </div>
      </div>

      <div>
        <div style={{ marginBottom: '1rem' }}>
          <ProgressBar progress={project.progress || 0} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          <span>
            <strong>{completed}</strong> of <strong>{total}</strong> tasks done
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: 600 }}>
            View Board <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
