// index.js
import express from "express";
import cors from "cors";

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== RapidAPI Key Protection =====
app.use((req, res, next) => {
  // Allow root route without key
  if (req.path === "/") return next();

  // Skip key check in development
  if (process.env.NODE_ENV !== "production") return next();

  // Check for RapidAPI key in production
  if (!req.headers["x-rapidapi-key"]) {
    return res.status(403).json({
      error: "RapidAPI key required",
    });
  }
  next();
});

// ===== Routes =====
app.get("/", (req, res) => {
  res.json({ status: "Password Strength API is running" });
});

function checkStrength(password) {
  let score = 0;
  const suggestions = [];

  if (password.length >= 8) score += 25;
  else suggestions.push("Use at least 8 characters");

  if (/[A-Z]/.test(password)) score += 25;
  else suggestions.push("Add uppercase letters");

  if (/[0-9]/.test(password)) score += 25;
  else suggestions.push("Add numbers");

  if (/[^A-Za-z0-9]/.test(password)) score += 25;
  else suggestions.push("Add special characters");

  const strength =
    score < 50 ? "Weak" : score < 75 ? "Medium" : "Strong";

  return { score, strength, suggestions };
}

app.post("/check-password", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      error: "Password is required",
    });
  }

  const result = checkStrength(password);
  res.json(result);
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal server error",
  });
});

// ===== Server =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
