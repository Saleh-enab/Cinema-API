import express, { Request, Response } from "express";
import env from "./env";
import { errorHandler } from "./middlewares/errorHandler";
import { customerRouter } from "./routes/customer.routes";
import cookireParser from 'cookie-parser';

const app = express();
const port = env.PORT;

app.use(express.json());
app.use(cookireParser())

app.use("/healthcheck", (req: Request, res: Response) => {
    res.send("الصحه حديد");
});

app.use('/customers', customerRouter)


app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server running in port ${port}`);
});
