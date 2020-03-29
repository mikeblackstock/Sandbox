import osjs from 'osjs';
import {name as applicationName} from './metadata.json';
import {createEditorWindow} from './src/sandbox-window.js';

const register = (core, args, options, metadata) => {
let fileObj= {};
let pdfFileObj= {file: {}};
let zoomString="#zoom=page-width";


  const proc = core.make('osjs/application', {args, options, metadata});
//  const ws = proc.socket('/socket');
/*
  ws.on('message', ev => {
    const {event, args} = JSON.parse(ev.data);

    console.log({event, args});

    proc.emit('lilypond:' + event, ...args);
  });
*/
//	proc.on('ws:message', (...args) => iframe.contentWindow.postMessage(args, window.location.href));

  const sendMessage = (cmd, user, ...args) => proc.send(JSON.stringify({
  	cmd,
    user,
    args
  }));

  createEditorWindow(core, proc);
 
 // sendMessage("init", "demo", "");
  
// messages from websocket  
  proc.on('ws:message', (...args) => {
 	if (args[0].length > 1) { // checks for blank line (a single CR, length 1) and ignores
 		console.log(...args);
	  	proc.emit('lilypond:compile:log', 'stderr', ...args);
	}  	


	if (args[0].search("Success:") !== -1) { //compilation finished
//		osjs.run('FileBrowser', 'refresh');

 		fileObj.path= fileObj.path.replace('.ly', '.pdf');
 		fileObj.filename= fileObj.filename.replace('.ly', '.pdf');

//alert(fileObj.filename);
//		fileObj.zoomString= zoomString;
//		fileObj.zoomString= zoomString;
// var y = Object.assign({}, x);
		pdfFileObj.file= Object.assign({}, fileObj);
		pdfFileObj.file.path= pdfFileObj.file.path + "?" + Date.now() + zoomString;
		proc.emit('lilypond:compile:success');
		
		osjs.run('PDFViewer', pdfFileObj);
		fileObj.path= fileObj.path.replace('.pdf', '.ly');
 		fileObj.filename= fileObj.filename.replace('.pdf', '.ly');		
	}  	
//init stuff
	if (args[0].search("init:") !== -1) {
		userID= args[0].split(":")[1];
	
		proc.emit('setTmpID', userID);	
		sendMessage("rsync", userID, "");
		
	}	

  	
  });
  
  
 
 
  proc.on('lilypond:compile', file => {

console.log(file);
 	fileObj= Object.assign({}, file);

 	const username= core.getUser().username;

 	sendMessage("lilypond", username, file);
 //   sendMessage("lilypond", userID, file);
 
  });

	proc.on('showZoom', () => {
		alert(zoomString);
	});
 
	proc.on('zoom', file => {

		zoomString= file;
        let tmpPath= pdfFileObj.file.path.split("?");
        pdfFileObj.file.path=  tmpPath[0] + "?" + Date.now() + zoomString;
        osjs.run('FileManager', 'refresh');
        osjs.run('PDFViewer', pdfFileObj);
	});
 
 
  return proc;
};

osjs.register(applicationName, register);
