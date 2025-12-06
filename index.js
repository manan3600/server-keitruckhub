// index.js (CommonJS)
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


const IMG_BASE = "https://manan3600.github.io/keitruckhub/images";

const models = [
  {
    id: "suzuki",
    name: "Suzuki Carry",
    meta: "660cc • 4WD • 1999",
    img: `${IMG_BASE}/suzuki-carry.webp`,
    engine: "660cc (K6A)",
    drive: "4WD",
    transmission: "5-speed manual",
    year: 1999,
    description: "Reliable workhorse with compact size and great utility."
  },
  {
    id: "honda",
    name: "Honda Acty",
    meta: "656cc • RWD • 1997",
    img: `${IMG_BASE}/honda-acty.JPG`,
    engine: "656cc (E07A)",
    drive: "RWD",
    transmission: "5-speed manual",
    year: 1997,
    description: "Efficient, lightweight, and versatile for daily tasks."
  },
  {
    id: "hijet",
    name: "Daihatsu Hijet",
    meta: "659cc • 4WD • 2001",
    img: `${IMG_BASE}/daihatsu-hijet.jpeg`,
    engine: "659cc (EF-SE/VE)",
    drive: "4WD",
    transmission: "5-speed manual",
    year: 2001,
    description: "Durable mini truck with plenty of customization options."
  },
  {
    id: "sambar",
    name: "Subaru Sambar",
    meta: "660cc • AWD • 2005",
    img: `${IMG_BASE}/subaru-sambar.jpg`,
    engine: "660cc (EN07)",
    drive: "AWD",
    transmission: "5-speed manual",
    year: 2005,
    description: "Rear-engine layout with great stability and traction."
  }
];

// List endpoint
app.get("/api/models", (req, res) => res.json(models));

// Detail endpoint (useful for ModelDetail page)
app.get("/api/models/:id", (req, res) => {
  const item = models.find(m => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ server-keitruckhub running on http://localhost:${PORT}`);
});


