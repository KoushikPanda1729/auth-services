import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Wellcome to home page");
});

export default app;
