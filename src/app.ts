import express from "express";
import router from "./routes";

const app = express();


app.use(express.json());

app.use("/api", router);

app.use("", (req, res) => {
    res.send("hola");
})

const port = 3000;
app.listen(port);
console.log("Servidor abierto en puerto", port);

export default app;