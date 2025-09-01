const express = require("express");
const Roadmap = require("../models/Roadmap");
const Module = require("../models/Module");
const User = require("../models/User");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// Criar roadmap
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, is_public = false } = req.body;

    const roadmap = new Roadmap({
      title,
      description,
      owner_id: req.user._id,
      is_public,
    });

    await roadmap.save();
    res.status(201).json(roadmap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});
// Como administrador criar um roadmap para um aluno
router.post("/assign/by-username", adminAuth, async (req, res) => {
  try {
    const {
      username,
      title,
      description,
      is_public = false,
      modules = [],
    } = req.body;
    if (!username || !title || !description) {
      return res
        .status(400)
        .json({ message: "username, title e description são obrigatórios" });
    }
    const student = await User.findOne({ username });
    if (!student) {
      return res.status(404).json({ message: "Aluno não encontrado" });
    }
    if (student.role !== "student") {
      return res.status(400).json({
        message: "Somente usuários com role 'student' podem receber roadmaps",
      });
    }
    const roadmap = new Roadmap({
      title,
      description,
      owner_id: student._id,
      is_public,
    });
    await roadmap.save();
    const modulesToCreate = (modules || [])
      .filter((m) => (m?.title || "").trim())
      .map((m, i) => ({
        title: m.title,
        description: m.description || "",
        order: Number.isFinite(m.order) ? m.order : i + 1,
        roadmap_id: roadmap._id,
      }));

    if (modulesToCreate.length) {
      await Module.insertMany(modulesToCreate);
    }

    const createdModules = await Module.find({ roadmap_id: roadmap._id }).sort({
      order: 1,
    });
    return res.status(201).json({ roadmap, modules: createdModules });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Listar roadmaps do usuário
router.get("/", auth, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ owner_id: req.user._id })
      .populate("owner_id", "username")
      .sort({ createdAt: -1 });

    res.json(roadmaps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});
//obter todos os roadmaps publicos e privados para adm
router.get("/getall", adminAuth, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().populate("owner_id", "username");
    res.json(roadmaps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Obter roadmap específico
router.get("/:id", auth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id).populate(
      "owner_id",
      "username",
    );

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap não encontrado" });
    }

    // Verificar se o usuário tem acesso ao roadmap
    if (
      roadmap.owner_id._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    res.json(roadmap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Obter roadmap por URL compartilhada
router.get("/shared/:sharedUrl", async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({
      shared_url: req.params.sharedUrl,
      is_public: true,
    }).populate("owner_id", "username");

    if (!roadmap) {
      return res
        .status(404)
        .json({ message: "Roadmap não encontrado ou não é público" });
    }

    res.json(roadmap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Atualizar roadmap
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, description, is_public } = req.body;

    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap não encontrado" });
    }

    // Verificar se o usuário tem permissão para editar
    if (
      roadmap.owner_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    roadmap.title = title || roadmap.title;
    roadmap.description = description || roadmap.description;
    roadmap.is_public = is_public !== undefined ? is_public : roadmap.is_public;

    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Deletar roadmap
router.delete("/:id", auth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap não encontrado" });
    }

    // Verificar se o usuário tem permissão para deletar
    if (
      roadmap.owner_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    // Deletar módulos relacionados
    await Module.deleteMany({ roadmap_id: req.params.id });

    // Deletar roadmap
    await Roadmap.findByIdAndDelete(req.params.id);

    res.json({ message: "Roadmap deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

module.exports = router;
