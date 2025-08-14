const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    roadmap_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Índice composto para garantir ordem única por roadmap
moduleSchema.index({ roadmap_id: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("Module", moduleSchema);
