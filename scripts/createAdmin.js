const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function createAdmin() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/roadmap-saas",
    );
    console.log("Conectado ao MongoDB");

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin === null) {
      console.log("Usuário admin já existe:", existingAdmin.username);
      process.exit(0);
    }

    const admin = new User({
      username: "Vitu",
      password: "Vitinho123",
      role: "admin",
    });

    await admin.save();
    console.log("Usuário admin criado com sucesso!");
    console.log(`Username: ${admin.username}`);
    console.log(`Password: ${admin.password}`);
  } catch (error) {
    console.error("Erro ao criar usuários:", error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
