const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// Helper to format task with overdue status
const formatTask = (taskDoc) => {
  const taskObj = taskDoc.toObject ? taskDoc.toObject() : { ...taskDoc };
  const now = new Date();
  const isOverdue = new Date(taskObj.dueDate) < now && taskObj.status !== 'Done';
  return {
    ...taskObj,
    isOverdue
  };
};

// @route   GET /api/tasks/project/:projectId
// @desc    Get all tasks belonging to a specific project
// @access  Private
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1, createdAt: -1 });

    const formattedTasks = tasks.map((task) => formatTask(task));
    res.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error retrieving tasks' });
  }
});

// @route   POST /api/tasks/project/:projectId
// @desc    Create a new task inside a project
// @access  Private
router.post('/project/:projectId', protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Task title and due date are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'To Do',
      priority: priority || 'Medium',
      dueDate,
      project: projectId,
      assignedTo: assignedTo && assignedTo !== '' ? assignedTo : null
    });

    const populatedTask = await task.populate('assignedTo', 'name email');
    res.status(201).json(formatTask(populatedTask));
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: error.message || 'Server error creating task' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update an existing task
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) {
      task.assignedTo = assignedTo && assignedTo !== '' ? assignedTo : null;
    }

    await task.save();
    const populatedTask = await task.populate('assignedTo', 'name email');

    res.json(formatTask(populatedTask));
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: error.message || 'Server error updating task' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
});

// @route   GET /api/tasks/my-tasks
// @desc    Get all tasks assigned to currently logged in user
// @access  Private
router.get('/my-tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'title dueDate')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });

    res.json(tasks.map(formatTask));
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ message: 'Server error retrieving user tasks' });
  }
});

module.exports = router;
