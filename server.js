// server.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const models = [
  { id: "suzuki", name: "Suzuki Carry", year: 1999, description: "Reliable workhorse with compact size and great utility." },
  { id: "honda", name: "Honda Acty", year: 1997, description: "Efficient, lightweight, and versatile for daily tasks." },
  { id: "hijet", name: "Daihatsu Hijet", year: 2001, description: "Durable mini truck with plenty of customization options." },
  { id: "sambar", name: "Subaru Sambar", year: 2005, description: "Rear-engine layout with great stability and traction." }
];

app.get("/api/models", (req, res) => {
  res.json(models);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));