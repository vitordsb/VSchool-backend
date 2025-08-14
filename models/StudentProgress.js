const mongoose = require("mongoose");

const studentProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    module_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    roadmap_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Índice composto para garantir progresso único por usuário e módulo
studentProgressSchema.index({ user_id: 1, module_id: 1 }, { unique: true });

// Atualizar completed_at quando completed for true
studentProgressSchema.pre("save", function (next) {
  if (this.completed && !this.completed_at) {
    this.completed_at = new Date();
  } else if (!this.completed) {
    this.completed_at = null;
  }
  next();
});

module.exports = mongoose.model("StudentProgress", studentProgressSchema);
