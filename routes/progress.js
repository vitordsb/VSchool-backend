const express = require('express');
const StudentProgress = require('../models/StudentProgress');
const Module = require('../models/Module');
const Roadmap = require('../models/Roadmap');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Atualizar progresso de um módulo
router.post('/', auth, async (req, res) => {
  try {
    const { module_id, completed } = req.body;

    // Verificar se o módulo existe
    const module = await Module.findById(module_id);
    if (!module) {
      return res.status(404).json({ message: 'Módulo não encontrado' });
    }

    // Verificar se o usuário tem acesso ao roadmap
    const roadmap = await Roadmap.findById(module.roadmap_id);
    if (roadmap.owner_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Buscar ou criar progresso
    let progress = await StudentProgress.findOne({
      user_id: req.user._id,
      module_id: module_id
    });

    if (progress) {
      progress.completed = completed;
      await progress.save();
    } else {
      progress = new StudentProgress({
        user_id: req.user._id,
        module_id: module_id,
        roadmap_id: module.roadmap_id,
        completed: completed
      });
      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter progresso de um roadmap
router.get('/roadmap/:roadmapId', auth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap não encontrado' });
    }

    // Verificar se o usuário tem acesso ao roadmap
    if (roadmap.owner_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const progress = await StudentProgress.find({
      user_id: req.user._id,
      roadmap_id: req.params.roadmapId
    }).populate('module_id', 'title order');

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter progresso de um módulo específico
router.get('/module/:moduleId', auth, async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Módulo não encontrado' });
    }

    // Verificar se o usuário tem acesso ao roadmap
    const roadmap = await Roadmap.findById(module.roadmap_id);
    if (roadmap.owner_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const progress = await StudentProgress.findOne({
      user_id: req.user._id,
      module_id: req.params.moduleId
    });

    if (!progress) {
      return res.json({ completed: false });
    }

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter estatísticas de progresso (apenas admin)
router.get('/stats/:roadmapId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
    }

    const roadmap = await Roadmap.findById(req.params.roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap não encontrado' });
    }

    const stats = await StudentProgress.aggregate([
      { $match: { roadmap_id: roadmap._id } },
      {
        $group: {
          _id: '$user_id',
          totalModules: { $sum: 1 },
          completedModules: {
            $sum: { $cond: ['$completed', 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          username: { $arrayElemAt: ['$user.username', 0] },
          totalModules: 1,
          completedModules: 1,
          progressPercentage: {
            $multiply: [
              { $divide: ['$completedModules', '$totalModules'] },
              100
            ]
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

