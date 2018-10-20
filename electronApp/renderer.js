
var amqp = require('amqplib/callback_api');

const actButton = document.getElementById('startActivity');
const messagetxt = document.getElementById('message')

//Queues
const sendQ = "ele_to_py"
const recvQ = "py_to_ele"

actButton.addEventListener('click',(event)=> {
    amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, ch) {
            var msg = 'Hello World! from electron app';

            ch.assertQueue(sendQ, {durable: false});
            ch.sendToQueue(q, Buffer.from(msg));
            console.log(" [x] Sent %s", msg);
        });
    });
});




// Receiving the message
amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {

    ch.assertQueue(recvQ, {durable: false});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
      messagetxt.innerHTML = msg.content.toString();
    }, {noAck: true});
  });
});
