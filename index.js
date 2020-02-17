import osjs from 'osjs';
import {name as applicationName} from './metadata.json';
import {createEditorWindow} from './src/editor-window.js';

const register = (core, args, options, metadata) => {
let fileObj= {};	
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

  const sendMessage = (event, ...args) => proc.send(JSON.stringify({
    event,
    args
  }));

  createEditorWindow(core, proc);
// messages from websocket  
  proc.on('ws:message', (...args) => {
 	if (args[0].length > 1)
	  	proc.emit('lilypond:compile:log', 'stderr', ...args); 
	if (args[0].search("Success:") !== -1) {
		osjs.run('FileBrowser', 'refresh');
//		console.log(fileObj);
 	fileObj.path= fileObj.path.replace('.ly', '.pdf');
 	fileObj.filename= fileObj.filename.replace('.ly', '.pdf');

		osjs.run('PDFViewer', fileObj);
		proc.emit('lilypond:close-log');
		
	};  	
  	
  })
  proc.on('lilypond:compile', file => {
 	fileObj= file;

  	const username= core.getUser().username;

    sendMessage(username, file);
 
  })

  proc.on('lilypond:open-result', file => {
    osjs.run('LegacyPDF', {file});
 //   osjs.run('PDFReader', {file});
  });

  return proc;
};

osjs.register(applicationName, register);
