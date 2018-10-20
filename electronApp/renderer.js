
var amqp = require('amqplib/callback_api');

const actButton = document.getElementById('SendAction');
const messagetxt = document.getElementById('message')

//Queues
const sendQ = "ele_to_py"
const recvQ = "py_to_ele"

actButton.addEventListener('click',(event)=> {
    amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, ch) {
            var msg = JSON.stringify({action: "init"});
            q = sendQ

            ch.assertQueue(q, {durable: false});
            ch.sendToQueue(q, Buffer.from(msg));
            console.log(" [x] Sent %s", msg);
        });
    });
});




// Receiving the message
amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    q = recvQ
    ch.assertQueue(q, {durable: false});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
      received_msg = JSON.parse(msg);
      messagetxt.innerHTML = received_msg.status.toString();
    }, {noAck: true});
  });
});
