const express = require("express");
const User = require("../models/User");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// Criar usuário (apenas admin)
router.post("/", adminAuth, async (req, res) => {
  try {
    const { username, password, role = "student" } = req.body;

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Usuário já existe" });
    }

    const user = new User({
      username,
      password,
      role,
    });

    await user.save();

    res.status(201).json({
      message: "Usuário criado com sucesso",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Listar usuários (apenas admin)
router.get("/", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});
// Listar todos os usuários
router.get("/getAll", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Obter usuário específico
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Deletar usuário (apenas admin)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

module.exports = router;
