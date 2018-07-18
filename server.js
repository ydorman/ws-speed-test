let http = require('http');
let ws = require('ws');

let server = http.createServer(function(req, res) {
	console.log(req.method + ' ' + req.url);
	res.writeHead(200, { 'Content-Type': 'text/html' });
	res.end(`
<body>
	<button id="run">Run Test</button>
	<span id="result"></span>
</body>
<script>
  document.getElementById("run").onclick = function() {

  	let startTime;
  	let numMessagesArrived = 0;
  	let totalBytes = 0;
    let ws = new WebSocket("ws://" + location.hostname + ":8001/");
    ws.binaryType = "arraybuffer";

    ws.onopen = function() {
	    startTime = performance.now();
    };
    ws.onmessage = function(msg) {
    	numMessagesArrived++;
    	totalBytes += msg.data.byteLength;
    	if (numMessagesArrived === 100) {
    		let totalTime = performance.now() - startTime;
    		let mbBytes = totalBytes/1000000;
    		let totalTimeSeconds = totalTime / 1000;
    		let mbPerSecond = mbBytes / totalTimeSeconds;
    		document.getElementById("result").innerText = "It took " + totalTime + "(ms) to send " + mbBytes.toFixed(2) + " MB, MB/Second = " + mbPerSecond;
    		ws.close();
    	}
    };
  };
</script>
  `);
});

console.log('listening on port 8000');
server.listen(8000);

let wss = new ws.Server({ host: '0.0.0.0', port: 8001 });
wss.on('connection', function(ws) {

	console.log("Connection Established");
	let data = new ArrayBuffer(1024 * 1024);
	for (let i = 0; i < 100; i++) {
		ws.send(data, {binary: true});
	}
	console.log("Test ended");

});