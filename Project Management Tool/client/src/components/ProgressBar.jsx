import React from 'react';

const ProgressBar = ({ progress = 0, showLabel = true, height = 8 }) => {
  const normalized = Math.min(100, Math.max(0, Math.round(progress)));

  const getColor = (val) => {
    if (val === 100) return 'var(--success)';
    if (val > 50) return 'var(--primary)';
    if (val > 25) return 'var(--info)';
    return 'var(--warning)';
  };

  return (
    <div className="progress-container">
      {showLabel && (
        <div className="progress-header">
          <span>Progress</span>
          <span>{normalized}%</span>
        </div>
      )}
      <div className="progress-track" style={{ height: `${height}px` }}>
        <div
          className="progress-fill"
          style={{
            width: `${normalized}%`,
            backgroundColor: getColor(normalized)
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
