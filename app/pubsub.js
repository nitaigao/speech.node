import redis from "redis"

const client = redis.createClient()

export const publish = (message) => {
  client.publish('speech', message)
}
