const RmqRpc = require('./index');

const user = process.env.RMQUSER || 'guest';
const password = process.env.RMQPASS || 'guest';

class Publisher {
    async run() {
        const mq = new RmqRpc(`amqp://${user}:${password}@localhost`);

        // Create connection and channel
        await mq.init();

        // Send some messages
        for (let i = 0; i < 3; i++) {
            const msg = `Message ${i}`;
            console.log(`Publishing ${msg}`);
            mq.publish('myExchange', msg);
        }
    }
}

class Subscriber {
    async init() {
        const mq = new RmqRpc(`amqp://${user}:${password}@localhost`);

        // Create connection and channel
        await mq.init();

        // Initialize an exchange and bind an exclusive queue
        await mq.setupQueue('myExchange', '', true);

        // Wait for requests
        mq.listenForMessages(async (msg) => {
            // Handle request
            console.log(`Received: ${msg}`);
        }).then(() => {
            console.log('Subscriber ready.')
        });
    }
}

async function run() {
    // Create 3 subscribers
    for (let i = 0; i < 3; i++) {
        const sub = new Subscriber();
        await sub.init();
    }

    const pub = new Publisher();
    await pub.run();
}

run().then();

