import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface Global {
            signin(id?: string): string[];
        }
    }
}

let mongo: any;

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = 'sk_test_51IdsSdSAbLfQ22QliXFudJPJ2MSTuYxqhxLTe3ftpQV0mvCkR6zvfoFOIz9QjJmi1Mqq1ZPnrXiA08HGhixXzPoG00gGjYVEnM';

beforeAll(async () => {
    process.env.JWT_KEY = 'asfajfle';

    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});


beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for(let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = (id?: string) => {
    const email = 'test@test.com';
    const password = 'password';

    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: email,
    }

    const token = jwt.sign(payload, process.env.JWT_KEY!);

    const session = { jwt: token };
    const sessionJSON = JSON.stringify(session);

    const base64 = Buffer.from(sessionJSON).toString('base64');

    return [`express:sess=${base64}`];
};