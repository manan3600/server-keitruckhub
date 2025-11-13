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
app.use(cors());
app.use(express.json());

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
  }
});

const upload = multer({ storage });

app.use("/uploads", express.static(uploadDir));

let models = [
  {
    id: "suzuki",
    name: "Suzuki Carry",
    year: 1999,
    description: "Reliable workhorse with compact size and great utility.",
    imageUrl: ""
  },
  {
    id: "honda",
    name: "Honda Acty",
    year: 1997,
    description: "Efficient, lightweight, and versatile for daily tasks.",
    imageUrl: ""
  },
  {
    id: "hijet",
    name: "Daihatsu Hijet",
    year: 2001,
    description: "Durable mini truck with plenty of customization options.",
    imageUrl: ""
  },
  {
    id: "sambar",
    name: "Subaru Sambar",
    year: 1998,
    description: "Compact and quirky kei truck with all-wheel drive options.",
    imageUrl: ""
  }
];

const modelSchema = Joi.object({
  id: Joi.string().min(2).required(),
  name: Joi.string().min(2).required(),
  year: Joi.number().integer().min(1900).max(2100).required(),
  description: Joi.string().allow("").optional()
});

app.get("/api/models", (req, res) => {
  res.json(models);
});

app.post("/api/models", upload.single("image"), (req, res) => {
  const { id, name, year, description } = req.body;

  const parsed = {
    id: id ? id.trim() : "",
    name: name ? name.trim() : "",
    year: year ? Number(year) : undefined,
    description: description || ""
  };

  const { error } = modelSchema.validate(parsed);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
