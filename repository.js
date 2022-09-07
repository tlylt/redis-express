import mongoose from "mongoose"
import fs from "fs"

let mongoDB = `mongodb://${process.env.MONGO_HOST}:27017/users`

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })

let db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))
db.on("connect", () => console.log("Connected to MongoDB"))

const Schema = mongoose.Schema

const UserModelSchema = new Schema({
    id: String,
    first_name: String,
    last_name: String,
    email: String,
    gender: String,
    ip_address: String,
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    },
})

const UserModel = mongoose.model("UserModel", UserModelSchema)
export async function createUser(params) {
    await new UserModel(params).save()
}

export async function getUsers() {
    const users = await UserModel.find({})
    const result = []
    users.forEach((user) => {
        result.push(
            {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                gender: user.gender,
                ip_address: user.ip_address,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        )
    })
    return result
}

export async function importData() {
    try {
        const mockData = JSON.parse(fs.readFileSync('MOCK_DATA.json', 'utf8'));
        for (let i = 0; i < mockData.length; i++) {
            await createUser(mockData[i])
        }
        console.log("Successfully imported data into MongoDB")
    } catch (err) {
        console.error(err)
    }
}
