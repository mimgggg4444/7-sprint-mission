import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

app.get("/", (req, res) => {
  res.send("Server Running!");
});

app.post("/user", async (req, res) => {
  const { name } = req.body;
  const user = await prisma.user.create({
    data: { name },
  });
  res.json(user);
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(3000, () => console.log("Server running"));
