import "dotenv/config"
import express from "express"
import cors from "cors"
import morgan from "morgan"
import { getUsers, importData } from "./repository.js"
import { getOrSetCache } from "./redis.js"

const app = express()
const router = express.Router()

app.options("*", cors())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
app.use(morgan("dev"))
app.use("/", router).all((_, res) => {
    res.setHeader("content-type", "application/json")
    res.setHeader("Access-Control-Allow-Origin", "*")
})

router.get("/", (_, res) => {
    res.status(200).send({ message: "Hello World" })
})

// This endpoint retrieves the user data from the database, without caching
router.get("/users", async (_, res) => {
    const data = await getUsers()
    res.status(200).send(data)
})

router.get("/data", async (_, res) => {
    let data = await getOrSetCache("data", async () => {
        return await getUsers()
    })
    if (data) {
        res.status(200).send(data)
    } else {
        res.status(200).send({ message: "No data found" })
    }
})

app.listen(8000, async () => {
    console.log("listening on port 8000, go to http://localhost:8000")
    if (process.env.IMPORT_DATA == "true") {
        await importData()
    }
})
