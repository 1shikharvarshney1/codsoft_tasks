const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// Helper to calculate progress and overdue status for a project
const attachProjectMetrics = async (projectDoc) => {
  const projectObj = projectDoc.toObject ? projectDoc.toObject() : { ...projectDoc };
  const tasks = await Task.find({ project: projectObj._id });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'To Do').length;

  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const now = new Date();
  const isOverdue = new Date(projectObj.dueDate) < now && progress < 100;

  return {
    ...projectObj,
    stats: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks
    },
    progress,
    isOverdue
  };
};

// @route   GET /api/projects
// @desc    Get all projects (with computed metrics)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    const projectsWithMetrics = await Promise.all(
      projects.map((proj) => attachProjectMetrics(proj))
    );

    res.json(projectsWithMetrics);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error retrieving projects' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project by ID with its metrics
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', 'name email');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectWithMetrics = await attachProjectMetrics(project);
    res.json(projectWithMetrics);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error retrieving project details' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required' });
    }

    const project = await Project.create({
      title,
      description: description || '',
      dueDate,
      owner: req.user._id
    });

    const populated = await project.populate('owner', 'name email');
    const projectWithMetrics = await attachProjectMetrics(populated);

    res.status(201).json(projectWithMetrics);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: error.message || 'Server error creating project' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (dueDate !== undefined) project.dueDate = dueDate;

    await project.save();
    const populated = await project.populate('owner', 'name email');
    const projectWithMetrics = await attachProjectMetrics(populated);

    res.json(projectWithMetrics);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: error.message || 'Server error updating project' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project and its associated tasks
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Cascade delete associated tasks
    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: 'Project and all associated tasks deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
});

module.exports = router;
