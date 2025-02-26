import express, { Request, Response, NextFunction } from "express";
import env from "./env";
import { errorHandler } from "./middlewares/errorHandler";
import { customerRouter } from "./routes/customer.routes";
import cookireParser from 'cookie-parser';
import { CustomError } from "./utils/customError";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

const app = express();
const port = env.PORT;

app.use(express.json());
app.use(cookireParser());
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
    console.log(`📜 Swagger Docs available at http://localhost:${port}/api-docs`);
});
