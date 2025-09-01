const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function createStudent() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/roadmap-saas",
    );
    console.log("Conectado ao MongoDB");

    const student = new User({
      username: "Kauan",
      password: "senha123",
      role: "student",
    });

    await student.save();
    console.log("Usuário estudante criado com sucesso!");
    console.log("Username: estudante1");
    console.log("Password: senha123");
  } catch (error) {
    console.error("Erro ao criar usuários:", error);
  } finally {
    mongoose.connection.close();
  }
}

createStudent();
