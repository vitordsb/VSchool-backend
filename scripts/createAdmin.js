const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roadmap-saas');
    console.log('Conectado ao MongoDB');

    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Usuário admin já existe:', existingAdmin.username);
      process.exit(0);
    }

    // Criar usuário admin
    const admin = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });

    await admin.save();
    console.log('Usuário admin criado com sucesso!');
    console.log('Username: admin');
    console.log('Password: admin123');

    // Criar um usuário estudante de exemplo
    const student = new User({
      username: 'estudante1',
      password: 'senha123',
      role: 'student'
    });

    await student.save();
    console.log('Usuário estudante criado com sucesso!');
    console.log('Username: estudante1');
    console.log('Password: senha123');

  } catch (error) {
    console.error('Erro ao criar usuários:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();

