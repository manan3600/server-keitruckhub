// server.js
import express from "express";
import cors from "cors";
import Joi from "joi";

const app = express();
app.use(cors());
app.use(express.json());


const models = [
  { id: "suzuki", name: "Suzuki Carry", year: 1999, description: "Reliable workhorse with compact size and great utility." },
  { id: "honda", name: "Honda Acty", year: 1997, description: "Efficient, lightweight, and versatile for daily tasks." },
  { id: "hijet", name: "Daihatsu Hijet", year: 2001, description: "Durable mini truck with plenty of customization options." },
  { id: "sambar", name: "Subaru Sambar", year: 2005, description: "Rear-engine layout with great stability and traction." }
];


app.get("/api/models", (req, res) => {
  res.json(models);
});


const modelSchema = Joi.object({
  id: Joi.string().min(2).required(),
  name: Joi.string().min(2).required(),
  year: Joi.number().integer().min(1900).max(2100).required(),
  description: Joi.string().allow("").optional()
});


app.post("/api/models", (req, res) => {
  const { error, value } = modelSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Prevent duplicates by ID
  if (models.find(m => m.id === value.id)) {
    return res.status(409).json({ error: "A model with that ID already exists." });
  }

  models.push(value);
  res.status(201).json({
    message: "Model successfully added!",
    model: value
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
