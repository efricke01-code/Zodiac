import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { apiRouter } from "./routes/api.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// In production, the client is built to ../../client/dist relative to this
// compiled file (server/dist/index.js). If that build is present, serve it
// as static files and fall back to index.html for client-side routing, so
// the whole app can run as a single deployed service.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../../client/dist");

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Zodiac server listening on http://localhost:${PORT}`);
});
