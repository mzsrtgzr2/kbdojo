var workerPath = 'https://archive.org/download/ffmpeg_asm/ffmpeg_asm.js';
// if(document.domain == 'localhost') {
//     workerPath = location.href.replace(location.href.split('/').pop(), '') + 'ffmpeg_asm.js';
// }

function processInWebWorker() {
    var blob = URL.createObjectURL(new Blob(['importScripts("' + workerPath + '");var now = Date.now;function print(text) {postMessage({"type" : "stdout","data" : text});};onmessage = function(event) {var message = event.data;if (message.type === "command") {var Module = {print: print,printErr: print,files: message.files || [],arguments: message.arguments || [],TOTAL_MEMORY: message.TOTAL_MEMORY || false};postMessage({"type" : "start","data" : Module.arguments.join(" ")});postMessage({"type" : "stdout","data" : "Received command: " +Module.arguments.join(" ") +((Module.TOTAL_MEMORY) ? ".  Processing with " + Module.TOTAL_MEMORY + " bits." : "")});var time = now();var result = ffmpeg_run(Module);var totalTime = now() - time;postMessage({"type" : "stdout","data" : "Finished processing (took " + totalTime + "ms)"});postMessage({"type" : "done","data" : result,"time" : totalTime});}};postMessage({"type" : "ready"});'], {
        type: 'application/javascript'
    }));

    var worker = new Worker(blob);
    URL.revokeObjectURL(blob);
    return worker;
}

var worker;

export function convertStreams(videoBlob) {
    return new Promise((resolve)=>{
        var aab;
        var buffersReady;
        var workerReady;
        var posted;

        var fileReader = new FileReader();
        fileReader.onload = function() {
            aab = this.result;
            postMessage();
        };
        fileReader.readAsArrayBuffer(videoBlob);

        if (!worker) {
            worker = processInWebWorker();
        }

        worker.onmessage = function(event) {
            var message = event.data;
            if (message.type == "ready") {
                console.log('mp4 ready')
                workerReady = true;
                if (buffersReady)
                    postMessage();
            } else if (message.type == "stdout") {
                console.log(message.data);
            } else if (message.type == "start") {
                console.log('convert started')
            } else if (message.type == "done") {

                var result = message.data[0];
                
                var blob = new File([result.data], 'test.mp4', {
                    type: 'video/mp4'
                });

                resolve(blob)
            }
        };
        var postMessage = function() {
            posted = true;

            worker.postMessage({
                type: 'command',
                // TOTAL_MEMORY: 335544320,
                arguments: '-i video.webm -c:v mpeg4 output.mp4'.split(' '),
                files: [
                    {
                        data: new Uint8Array(aab),
                        name: 'video.webm'
                    }
                ]
            });
        };
    })
}