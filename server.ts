import cors from "cors";
import express from "express";
import router from "./router";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
