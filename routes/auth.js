const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Registro (criação de conta pública - role padrão: student)
router.post('/register', async (req, res) => {
  try {
    const { username = '', password = '' } = req.body || {};

    // validações básicas
    if (!username.trim() || !password.trim()) {
      return res.status(400).json({ message: 'username e password são obrigatórios' });
    }
    if (username.trim().length < 3) {
      return res.status(400).json({ message: 'username deve ter ao menos 3 caracteres' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'password deve ter ao menos 6 caracteres' });
    }

    // checar duplicidade
    const exists = await User.findOne({ username: username.trim() });
    if (exists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const user = new User({ username: username.trim(), password, role: 'student' });
    await user.save();

    // gerar token e retornar payload similar ao login
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verificar se o usuário existe
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

module.exports = router;
