import express from "express";
import path from "node:path";
import { config } from "dotenv";
import bootstrap from "./app.controller";
import { verifyToken } from "./utils/jwt/token";

config({ path: path.resolve("./config/.env") });

const app: express.Application = express();
const port: string | number = process.env.PORT || 3000;

bootstrap(app);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
