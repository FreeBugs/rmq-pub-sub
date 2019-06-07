const amqp = require('amqplib');

class RmqRpc {
    constructor(connStr) {
        this.connStr = connStr;
    }

    /*
        ********* SETUP
     */
    async init() {
        this.connection = await amqp.connect(this.connStr);
        this.channel = await this.connection.createChannel();
    }

    async setupQueue(exchange, queueName = '', durable = false) {
        this.exchange = exchange;
        await this.channel.assertExchange(exchange, 'fanout', {durable: durable});
        this.queue = await this.channel.assertQueue('', {exclusive: true}).queue;
        await this.channel.bindQueue(this.queue, this.exchange, '');
    };


    /*
        ********* LISTEN / RECEIVE
     */
    async listenForMessages(callback) {
        this.consume(callback);
    };

    consume(callback) {
        return new Promise((resolve, reject) => {
            this.channel.consume(this.queue, async function (msg) {
                // parse message
                let msgBody = msg.content.toString();
                let data = JSON.parse(msgBody);

                // process data
                let self = this;
                try {
                    self.processMessage(data, callback);
                } catch (e) {
                    console.warn(e);
                }
            }.bind(this), {
                noAck: true
            });

            // handle connection closed
            this.connection.on('close', (err) => {
                return reject(err);
            });

            // handle errors
            this.connection.on('error', (err) => {
                return reject(err);
            });
        });
    }

    processMessage(requestData, callback) {
        return new Promise((resolve, reject) => {
            callback(requestData).then((result) => {
                resolve(result);
            }, (result) => {
                reject(result);
            });
        });
    }

    /*
        ********* SENDING / REPLY
     */
    publish(exchangeName, data, routingKey = '') {
        return new Promise(async (resolve, reject) => {
            try {
                await this.channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(data), 'utf-8'));
                resolve();
            } catch(e) {
                console.warn(e);
                reject(e);
            }
        });
    };
}

module.exports = RmqRpc;