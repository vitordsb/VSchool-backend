const mongoose = require("mongoose");

const roadmapSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    is_public: {
      type: Boolean,
      default: false,
    },
    shared_url: {
      type: String,
      unique: true,
      sparse: true, // Permite valores nulos únicos
    },
  },
  {
    timestamps: true,
  },
);

// Gerar URL compartilhável antes de salvar se is_public for true
roadmapSchema.pre("save", function (next) {
  if (this.is_public && !this.shared_url) {
    this.shared_url = generateSharedUrl();
  }
  next();
});

function generateSharedUrl() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

module.exports = mongoose.model("Roadmap", roadmapSchema);
