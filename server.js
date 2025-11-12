import express from "express";
import cors from "cors";

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

app.post("/api/models", (req, res) => {
  const { id, name, year, description } = req.body;

  if (!id || !name) {
    return res.status(400).json({ error: "id and name are required" });
  }

  if (models.find(m => m.id === id)) {
    return res.status(409).json({ error: "A model with that id already exists" });
  }

  const newModel = {
    id,
    name,
    year: Number(year) || null,
    description: description || ""
  };

  models.push(newModel);
  res.status(201).json(newModel);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
