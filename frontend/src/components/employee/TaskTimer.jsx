import React, { useState } from 'react';
import { taskAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import useTimer from '../../hooks/useTimer';
import { fmtTime, priColor, statusLabel, statusClass } from '../../utils/helpers';
import './TaskTimer.css';

const TaskTimer = ({ task, onUpdate }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const timer = useTimer(task.elapsedSeconds || 0, task.timerRunning, task.allocatedHours);
  const isDone = task.status === 'done';
  const limitSec = task.allocatedHours * 3600;

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data } = await taskAPI.startTimer(task._id);
      timer.start();
      onUpdate(data);
      toast.success('Timer started ▶');
    } catch (err) {
      toast.error(err.error || 'Failed to start timer');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    timer.stop();
    try {
      const { data } = await taskAPI.stopTimer(task._id);
      onUpdate(data);
      toast.success('Timer paused ⏸');
    } catch (err) {
      toast.error(err.error || 'Failed to stop timer');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    timer.reset();
    try {
      await taskAPI.update(task._id, { elapsedSeconds: 0, timerRunning: false, status: task.status === 'inprogress' ? 'pending' : task.status });
      toast.success('Timer reset ↺');
    } catch (err) {
      toast.error(err.error || 'Failed to reset timer');
    }
  };

  const handleDone = async () => {
    setLoading(true);
    timer.stop();
    try {
      const { data } = await taskAPI.markDone(task._id);
      onUpdate(data);
      toast.success('Task completed ✓');
    } catch (err) {
      toast.error(err.error || 'Failed to mark done');
    } finally {
      setLoading(false);
    }
  };

  const timerColor = isDone ? '#34d399' : timer.isOverLimit ? '#f87171' : timer.running ? '#fbbf24' : 'var(--text)';
  const progColor = timer.pct > 90 ? '#f87171' : timer.pct > 65 ? '#fbbf24' : '#34d399';

  return (
    <div className={`task-timer-card ${timer.running ? 'running' : ''} ${isDone ? 'done' : ''}`}>
      {/* Header */}
      <div className="ttc-header">
        <div className="ttc-header-left">
          <div
            className="ttc-priority-dot"
            style={{ background: priColor(task.priority) }}
            title={`${task.priority} priority`}
          />
          <div>
            <div className="ttc-title">{task.title}</div>
            <div className="ttc-meta">
              {task.category} · Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
              {task.allocatedHours > 0 && ` · ${task.allocatedHours}h allocated`}
            </div>
          </div>
        </div>
        <span className={statusClass(task.status)}>{statusLabel(task.status)}</span>
      </div>

      {/* Description */}
      {task.description && (
        <div className="ttc-desc">{task.description}</div>
      )}

      {/* Timer Panel */}
      <div className="ttc-timer-panel">
        <div className="ttc-timer-left">
          <div className="ttc-timer-label">TIME ELAPSED</div>
          <div className="ttc-timer-display" style={{ color: timerColor }}>
            {fmtTime(timer.elapsed)}
          </div>
          {limitSec > 0 && !isDone && (
            <div className="ttc-timer-remaining">
              {timer.isOverLimit ? '⚠ Time limit exceeded' : `${fmtTime(timer.remaining)} remaining`}
            </div>
          )}
        </div>

        {!isDone && (
          <div className="ttc-controls">
            {!timer.running ? (
              <button className="ttc-btn ttc-start" onClick={handleStart} disabled={loading || isDone}>
                ▶ Start
              </button>
            ) : (
              <button className="ttc-btn ttc-stop" onClick={handleStop} disabled={loading}>
                ⏸ Pause
              </button>
            )}
            <button className="ttc-btn ttc-reset" onClick={handleReset} disabled={loading || timer.running}>
              ↺
            </button>
            <button className="ttc-btn ttc-done" onClick={handleDone} disabled={loading}>
              ✓ Done
            </button>
          </div>
        )}
        {isDone && (
          <div className="ttc-done-tag">✓ Completed</div>
        )}
      </div>

      {/* Progress bar */}
      {limitSec > 0 && (
        <div className="ttc-progress">
          <div className="ttc-progress-bar">
            <div
              className="ttc-progress-fill"
              style={{ width: `${timer.pct}%`, background: progColor }}
            />
          </div>
          <div className="ttc-progress-label">{timer.pct}% of time used</div>
        </div>
      )}
    </div>
  );
};

export default TaskTimer;
