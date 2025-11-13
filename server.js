// server.js
import express from "express";
import cors from "cors";
import Joi from "joi";

const app = express();


app.use(cors());
app.use(express.json()); 


const models = [
  {
    id: "suzuki",
    name: "Suzuki Carry",
    year: 1999,
    description: "Reliable workhorse with compact size and great utility."
  },
  {
    id: "honda",
    name: "Honda Acty",
    year: 1997,
    description: "Efficient, lightweight, and versatile for daily tasks."
  },
  {
    id: "hijet",
    name: "Daihatsu Hijet",
    year: 2001,
    description: "Durable mini truck with plenty of customization options."
  },
  {
    id: "sambar",
    name: "Subaru Sambar",
    year: 2005,
    description: "Rear-engine layout with great stability and traction."
  }
];

const modelSchema = Joi.object({
  id: Joi.string().trim().min(2).max(30).required(),
  name: Joi.string().trim().min(2).max(60).required(),
  year: Joi.number().integer().min(1980).max(2050).optional(),
  description: Joi.string().trim().max(500).allow("").optional()
});


app.get("/api/models", (req, res) => {
  res.json(models);
});


app.get("/api/models/:id", (req, res) => {
  const model = models.find(m => m.id === req.params.id);
  if (!model) {
    return res.status(404).json({ error: "Model not found" });
  }
  res.json(model);
});


app.post("/api/models", (req, res) => {
  // Validate with Joi
  const { error, value } = modelSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.details.map(d => d.message)
    });
  }

  const { id, name, year, description } = value;

  if (models.find(m => m.id === id)) {
    return res.status(409).json({ error: "A model with that id already exists" });
  }

  const newModel = {
    id,
    name,
    year: year ?? null,
    description: description ?? ""
  };

  models.push(newModel);

  res.status(201).json({
    message: "Model added successfully",
    model: newModel
  });
});


app.get("/", (req, res) => {
  res.send("KeiTruck Hub API – try GET /api/models");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
