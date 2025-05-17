// lib/mongodb.ts

import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

client = new MongoClient(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
})


declare global {
  var _mongoClientPromise: Promise<MongoClient>
}

if (process.env.NODE_ENV === 'development') {
  // 개발 환경에서는 핫 리로드 때문에 전역 변수에 보관
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // 프로덕션 환경에서는 그냥 사용
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export default clientPromise
