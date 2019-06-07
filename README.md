# RMQ-SUB
Simple, lightweight PUB/SUB with RabbitMQ and Node.js based on amqplib.

The RmqSub class features an easy API for the producer(s) and consumer(s) of PUB/SUB data.

## Installation and quickstart
```sh
npm install rmq-sub
```
Require the module:
```js
const RmqSub = require('rmq-sub');
```
Implement the consumer (server):
```js

    const mq = new RmqRpc(`amqp://user:password@host`);

    // Create connection and channel
    await mq.init();
    
    // Initialize an exchange and queue 'square'
    await mq.setupQueue('square');
    
    // Wait for requests
    mq.listenForMessages(async (request) => {
        // Handle request
        return Math.pow(Number(request), 2);
    }).then(() => {
        console.log('Server ready.')
    });
```
Implement the producer (client):
```js
    const num = Math.random();

    const mq = new RmqRpc(`amqp://${user}:${password}@localhost`);

    // Create connection and channel
    await mq.init();

    // Send request and await result
    const result = await mq.sendRpc('square', num);

    console.log(`Num: ${num}, Square: ${result}`);
```