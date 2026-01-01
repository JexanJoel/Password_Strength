import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

// ===== Routes =====
app.get("/", (req, res) => {
  res.json({ status: "Password Strength API is running" });
});

// ===== Password Strength Checker =====
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

  const strength = score < 50 ? "Weak" : score < 75 ? "Medium" : "Strong";

  return { score, strength, suggestions };
}

app.post("/check-password", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  const result = checkStrength(password);
  res.json(result);
});

// ===== Password Generator =====
function generatePassword(length = 12) {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = lowercase + uppercase + numbers + symbols;

  // Ensure at least one of each
  let password = [
    lowercase[crypto.randomInt(lowercase.length)],
    uppercase[crypto.randomInt(uppercase.length)],
    numbers[crypto.randomInt(numbers.length)],
    symbols[crypto.randomInt(symbols.length)],
  ];

  for (let i = password.length; i < length; i++) {
    password.push(allChars[crypto.randomInt(allChars.length)]);
  }

  // Shuffle password
  return password.sort(() => Math.random() - 0.5).join("");
}

app.post("/generate-password", (req, res) => {
  const { length = 12 } = req.body;

  if (length < 8 || length > 64) {
    return res
      .status(400)
      .json({ error: "Password length must be between 8 and 64" });
  }

  const password = generatePassword(length);
  const strength = checkStrength(password);

  res.json({
    password,
    ...strength,
  });
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// ===== Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
