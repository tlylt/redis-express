import redis from "redis"

let redisClient

(async () => {
    redisClient = redis.createClient({ url: `redis://${process.env.REDIS_HOST}:6379` });
    redisClient.on("error", (error) => console.error(`Error: ${error}`))
    await redisClient.connect()
    console.log("Connected to Redis")
})()

export async function getOrSetCache(key, callback) {
    try {
        let value = await redisClient.get(key)
        if (value != null && value != undefined) {
            return JSON.parse(value)
        }
        value = await callback() // Cache miss
        await redisClient.set(key, JSON.stringify(value))
        return value
    } catch (error) {
        console.error(error)
        return null
    }
}