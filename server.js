import express from "express";
import cors from "cors";
import Joi from "joi";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS (Express 5-safe)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Serve uploaded images statically
app.use("/uploads", express.static(uploadDir));

// Initial dataset
let models = [
  {
    id: "suzuki",
    name: "Suzuki Carry",
    year: 1999,
    description: "Reliable workhorse with compact size and great utility.",
    imageUrl: "",
  },
  {
    id: "honda",
    name: "Honda Acty",
    year: 1997,
    description: "Efficient, lightweight, and versatile for daily tasks.",
    imageUrl: "",
  },
  {
    id: "hijet",
    name: "Daihatsu Hijet",
    year: 2001,
    description: "Durable mini truck with plenty of customization options.",
    imageUrl: "",
  },
  {
    id: "sambar",
    name: "Subaru Sambar",
    year: 2005,
    description: "Rear-engine layout with great stability and traction.",
    imageUrl: "",
  },
];

// Joi validation schemas
const createSchema = Joi.object({
  id: Joi.string().min(2).required(),
  name: Joi.string().min(2).required(),
  year: Joi.number().integer().min(1900).max(2100).required(),
  description: Joi.string().allow("").optional(),
});

const editSchema = Joi.object({
  name: Joi.string().min(2).required(),
  year: Joi.number().integer().min(1900).max(2100).required(),
  description: Joi.string().allow("").optional(),
});

// GET all models
app.get("/api/models", (req, res) => {
  res.json(models);
});

// GET a single model
app.get("/api/models/:id", (req, res) => {
  const model = models.find((m) => m.id === req.params.id);
  if (!model) {
    return res.status(404).json({ error: "Model not found" });
  }
  res.json(model);
});

// POST create model
app.post("/api/models", upload.single("image"), (req, res) => {
  const { id, name, year, description } = req.body;

  const parsed = {
    id: id?.trim(),
    name: name?.trim(),
    year: Number(year),
    description: description || "",
  };

  const { error } = createSchema.validate(parsed);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const exists = models.some((m) => m.id === parsed.id);
  if (exists) {
    return res.status(400).json({ error: "A model with that ID already exists." });
  }

  let imageUrl = "";
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  const modelToAdd = { ...parsed, imageUrl };
  models.push(modelToAdd);

  res.status(201).json({ success: true, model: modelToAdd });
});

// PUT edit model
app.put("/api/models/:id", upload.single("image"), (req, res) => {
  const modelId = req.params.id;
  const index = models.findIndex((m) => m.id === modelId);

  if (index === -1) {
    return res.status(404).json({ error: "Model not found" });
  }

  const { name, year, description } = req.body;

  const parsed = {
    name: name?.trim(),
    year: Number(year),
    description: description || "",
  };

  const { error } = editSchema.validate(parsed);
  if (error) return res.status(400).json({ error: error.details[0].message });

  let imageUrl = models[index].imageUrl;
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  models[index] = {
    ...models[index],
    name: parsed.name,
    year: parsed.year,
    description: parsed.description,
    imageUrl,
  };

  res.json({ success: true, model: models[index] });
});

// DELETE model
app.delete("/api/models/:id", (req, res) => {
  const modelId = req.params.id;
  const index = models.findIndex((m) => m.id === modelId);

  if (index === -1) {
    return res.status(404).json({ error: "Model not found" });
  }

  models.splice(index, 1);

  res.json({ success: true });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`server-keitruckhub running on port ${PORT}`);
});
