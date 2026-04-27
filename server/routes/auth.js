import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Admin } from "../models/Admin.js";
import { asRollNumber } from "../utils/normalize.js";
import { signAuthToken } from "../utils/jwt.js";

const router = express.Router();

function sanitizeAuthDoc(doc) {
  return {
    rollNumber: doc.rollNumber,
    email: doc.email,
    name: doc.name,
  };
}

async function registerEntity(model, payload) {
  const rollNumber = asRollNumber(payload.rollNumber);
  const email = String(payload.email || "").trim().toLowerCase();

  const existing = await model.findOne({
    $or: [{ rollNumber }, { email }],
  });

  if (existing) {
    throw new Error("User already exists");
  }

  const incomingPassword = String(payload.password || "");
  const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(incomingPassword);
  const passwordToStore = isBcryptHash
    ? incomingPassword
    : await bcrypt.hash(incomingPassword, 10);

  const created = await model.create({
    rollNumber,
    name: String(payload.name || "").trim(),
    email,
    password: passwordToStore,
  });

  return sanitizeAuthDoc(created);
}

async function loginEntity(model, rollNumber, password) {
  const user = await model.findOne({ rollNumber: asRollNumber(rollNumber) }).lean();

  if (!user) {
    throw new Error("User not found");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid password");
  }

  return sanitizeAuthDoc(user);
}

router.post("/register/user", async (req, res) => {
  try {
    const created = await registerEntity(User, req.body || {});
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message || "Registration failed" });
  }
});

router.post("/register/admin", async (req, res) => {
  try {
    const created = await registerEntity(Admin, req.body || {});
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message || "Registration failed" });
  }
});

router.post("/login/user", async (req, res) => {
  try {
    const { rollNumber, password } = req.body || {};
    const loggedIn = await loginEntity(User, rollNumber, password);
    const token = signAuthToken({
      role: "user",
      rollNumber: loggedIn.rollNumber,
      name: loggedIn.name,
      email: loggedIn.email,
    });

    res.json({ ...loggedIn, token });
  } catch (error) {
    res.status(401).json({ message: error.message || "Login failed" });
  }
});

router.post("/login/admin", async (req, res) => {
  try {
    const { rollNumber, password } = req.body || {};
    const loggedIn = await loginEntity(Admin, rollNumber, password);
    const token = signAuthToken({
      role: "admin",
      rollNumber: loggedIn.rollNumber,
      name: loggedIn.name,
      email: loggedIn.email,
    });

    res.json({ ...loggedIn, token });
  } catch (error) {
    res.status(401).json({ message: error.message || "Login failed" });
  }
});

export default router;
