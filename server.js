import express from "express";
import cors from "cors";
import Joi from "joi";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { connect, Schema, model } from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS
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

// ---- MongoDB / Mongoose setup ----

// seed data (will be inserted once if collection empty)
const seedModels = [
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

const truckSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  year: { type: Number, required: true },
  description: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
});

const Truck = model("Truck", truckSchema);

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

// ---- Routes using MongoDB ----

// GET all models
app.get("/api/models", async (req, res) => {
  try {
    const trucks = await Truck.find().sort({ id: 1 }).lean();
    res.json(trucks);
  } catch (err) {
    console.error("GET /api/models error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET a single model
app.get("/api/models/:id", async (req, res) => {
  try {
    const truck = await Truck.findOne({ id: req.params.id }).lean();
    if (!truck) {
      return res.status(404).json({ error: "Model not found" });
    }
    res.json(truck);
  } catch (err) {
    console.error("GET /api/models/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create model
app.post("/api/models", upload.single("image"), async (req, res) => {
  try {
    const { id, name, year, description } = req.body;

    const parsed = {
      id: id?.trim(),
      name: name?.trim(),
      year: Number(year),
      description: description || "",
    };

    const { error } = createSchema.validate(parsed);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const exists = await Truck.findOne({ id: parsed.id });
    if (exists) {
      return res
        .status(400)
        .json({ error: "A model with that ID already exists." });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const modelToAdd = new Truck({ ...parsed, imageUrl });
    await modelToAdd.save();

    res.status(201).json({ success: true, model: modelToAdd });
  } catch (err) {
    console.error("POST /api/models error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT edit model
app.put("/api/models/:id", upload.single("image"), async (req, res) => {
  try {
    const modelId = req.params.id;

    const truck = await Truck.findOne({ id: modelId });
    if (!truck) {
      return res.status(404).json({ error: "Model not found" });
    }

    const { name, year, description } = req.body;

    const parsed = {
      name: name?.trim(),
      year: Number(year),
      description: description || "",
    };

    const { error } = editSchema.validate(parsed);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (req.file) {
      truck.imageUrl = `/uploads/${req.file.filename}`;
    }

    truck.name = parsed.name;
    truck.year = parsed.year;
    truck.description = parsed.description;

    await truck.save();

    res.json({ success: true, model: truck });
  } catch (err) {
    console.error("PUT /api/models/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE model
app.delete("/api/models/:id", async (req, res) => {
  try {
    const modelId = req.params.id;

    const deleted = await Truck.findOneAndDelete({ id: modelId });
    if (!deleted) {
      return res.status(404).json({ error: "Model not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/models/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


const PORT = process.env.PORT || 4000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb+srv://<user>:<password>@cluster0.h9t7k5i.mongodb.net/";

async function start() {
  try {
    await connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    const count = await Truck.countDocuments();
    if (count === 0) {
      await Truck.insertMany(seedModels);
      console.log("Seeded initial models collection.");
    }

    app.listen(PORT, () => {
      console.log(`server-keitruckhub running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

start();
