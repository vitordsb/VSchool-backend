const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');

    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Usuário admin já existe:', existingAdmin.username);
      process.exit(0);
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Criar usuário admin
    const admin = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Usuário admin criado com sucesso!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();

