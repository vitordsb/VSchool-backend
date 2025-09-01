const express = require("express");
const Module = require("../models/Module");
const Roadmap = require("../models/Roadmap");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Criar módulo
router.post("/", auth, async (req, res) => {
  try {
    const { roadmap_id, title, description, order, content } = req.body;

    // Verificar se o roadmap existe e se o usuário tem acesso
    const roadmap = await Roadmap.findById(roadmap_id);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap não encontrado" });
    }

    if (
      roadmap.owner_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const module = new Module({
      roadmap_id,
      title,
      description,
      order,
      content,
    });

    await module.save();
    res.status(201).json(module);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Já existe um módulo com essa ordem neste roadmap" });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});
//criar o modulo do roadmap do aluno sendo administrador
router.post("/:roadmapId", auth, async (req, res) => {
  try {
    const { title, description, order, content } = req.body;
    const roadmap = await Roadmap.findById(req.params.roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap não encontrado" });
    }
    if (
      roadmap.owner_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    const module = new Module({
      roadmap_id: req.params.roadmapId,
      title,
      description,
      order,
      content,
    });
    await module.save();
    res.status(201).json(module);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Já existe um módulo com essa ordem neste roadmap" });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});
// Listar módulos de um roadmap
router.get("/roadmap/:roadmapId", auth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap não encontrado" });
    }
    if (
      roadmap.owner_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const modules = await Module.find({
      roadmap_id: req.params.roadmapId,
    }).sort({ order: 1 });

    res.json(modules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Obter módulo específico
router.get("/:id", auth, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ message: "Módulo não encontrado" });
    }

    // Verificar se o usuário tem acesso ao roadmap do módulo
    const roadmap = await Roadmap.findById(module.roadmap_id);
    if (
      roadmap.owner_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    res.json(module);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Atualizar módulo
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, description, order, content } = req.body;

    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ message: "Módulo não encontrado" });
    }

    // Verificar se o usuário tem acesso ao roadmap do módulo
    const roadmap = await Roadmap.findById(module.roadmap_id);
    if (
      roadmap.owner_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    module.title = title || module.title;
    module.description = description || module.description;
    module.order = order !== undefined ? order : module.order;
    module.content = content || module.content;

    await module.save();
    res.json(module);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Já existe um módulo com essa ordem neste roadmap" });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Deletar módulo
router.delete("/:id", auth, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ message: "Módulo não encontrado" });
    }

    // Verificar se o usuário tem acesso ao roadmap do módulo
    const roadmap = await Roadmap.findById(module.roadmap_id);
    if (
      roadmap.owner_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    await Module.findByIdAndDelete(req.params.id);
    res.json({ message: "Módulo deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

module.exports = router;
