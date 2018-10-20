
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
            console.log(typeof(msg));
            q = sendQ

            ch.assertQueue(q, {durable: false});
            ch.sendToQueue(q, Buffer.from(msg));
            console.log(" [x] Sent %s", msg);
        });
    });
    // console.log('Hello!');
    
    
});

$("#SendAction").click(function() {
  // console.log('In the JQuery function');
  // $("#gif").fadeOut("fast", function() {
  // $("#gif").remove();
  // });
  $("#gif").remove();
  

  $(".for_gif_pos").append('<img src="g2-crop-slower.gif" class="gif" id="gif" height="200" width="200" alt="Animated Circles" style="border-radius: 60px; margin: 30px; filter: blur(2.5px);"></img>').fadeIn();
});



// Receiving the message
amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    q = recvQ
    ch.assertQueue(q, {durable: false});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      // console.log(typeof msg.content);
      received_msg = JSON.parse(msg.content);
      // console.log(typeof received_msg);
      messagetxt.innerHTML = JSON.parse(received_msg).status;
    }, {noAck: true});
  });
});

function display_intent() {
  var sentence = "Create a function called bake with arguments x y z which returns a list"
}

function startListening() {
  console.log('In the button function')
}

