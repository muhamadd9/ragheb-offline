import express from "express";
import { config } from "dotenv";
import bootstrap from "./app.controller";

config();

const app: express.Application = express();
const port: string | number = process.env.PORT || 3000;

bootstrap(app);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
