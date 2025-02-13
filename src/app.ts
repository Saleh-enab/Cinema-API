import express, { Request, Response, NextFunction } from "express";
import env from "./env";
import { errorHandler } from "./middlewares/errorHandler";
import { customerRouter } from "./routes/customer.routes";
import cookireParser from 'cookie-parser';
import { CustomError } from "./utils/customError";

const app = express();
const port = env.PORT;

app.use(express.json());
app.use(cookireParser())

app.use("/healthcheck", (req: Request, res: Response) => {
    res.send("الصحه حديد");
});

app.use('/customers', customerRouter)
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new CustomError(400, "Invalid URL", "CLIENT ERROR"))
    return;
})


app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server running in port ${port}`);
});
