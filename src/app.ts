import express, { Request, Response } from "express";
import env from "./env";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

const port = env.PORT;

app.use("/healthcheck", (req: Request, res: Response) => {
    res.send("الصحه حديد");
});


app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server running in port ${port}`);
});
