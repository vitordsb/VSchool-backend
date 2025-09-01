const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function deleteAdmin() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/roadmap-saas",
    );
    console.log("Conectado ao MongoDB");
    const input = process.argv[2];

    const existingAdmin = await User.findOne({
      role: "admin",
      username: input,
    });
    if (existingAdmin === null) {
      console.log("Usuário admin não encontrado");
      process.exit(0);
    }

    await User.deleteOne(existingAdmin);
    console.log("Usuário admin deletado com sucesso!");
  } catch (error) {
    console.error("Erro ao deletar usuários:", error);
  } finally {
    mongoose.connection.close();
  }
}

deleteAdmin();
