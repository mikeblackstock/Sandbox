import {h, app} from 'hyperapp';
import {Box, BoxContainer, Button, Menubar, MenubarItem, Toolbar, Statusbar, TextareaField} from '@osjs/gui';
import * as ace from 'brace';
//import 'brace/theme/monokai';
//import 'brace/mode/javascript';
//import 'brace/mode/python';
//import 'brace/mode/css';
//import 'brace/mode/html';

// FOCUS SANDBOX AFTER LOAD!!



import './lilypond';
import 'brace/mode/html';
import 'brace/mode/json';
//import 'brace/ext/modelist';
//import 'brace/ext/themelist';
import 'brace/theme/chrome';
let snippet = {"filename":"Untitled.ly"};
let tmpID = '';
let zoomString = '#zoom=100';


const getCookie = (name) => {
	 let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

const createMainMenu = (current, actions, _) => ([
  {label: _('LBL_NEW'), onclick: () => actions.menuNew()},
  {label: _('LBL_OPEN'), onclick: () => actions.menuOpen()},
  {label: _('LBL_SAVE'), disabled: !current, onclick: () => actions.menuSave()},
  {label: _('LBL_SAVEAS'), onclick: () => actions.menuSaveAs()},
  {label: _('LBL_QUIT'), onclick: () => actions.menuQuit()}
]);

const createViewMenu = (state, actions, _) => ([{
  label: _('LBL_SHOW_LOG'),
  checked: state.showLog,
  onclick: () => actions.toggleLog(!state.showLog)
}]);

const createEditorInterface = (core, proc, win, $content) => {
  let editor;

  const _ = core.make('osjs/locale').translate;
  const vfs = core.make('osjs/vfs');
  const contextmenu = core.make('osjs/contextmenu').show;
  const basic = core.make('osjs/basic-application', proc, win, {
    defaultFilename: 'Untitled.ly'
  });

// const setText = contents => editor.setValue(contents); 
const setText = function(contents, path) {
	editor.setValue(contents);
	editor.navigateFileStart();

	win.setTitle(path);
};

const setSavedTitle= function(path) {
		win.setTitle("Saved");
	    setTimeout(() => {
      		win.setTitle(path);
    	},1000);
};

  const getText = () => editor.getValue();

  const view = (state, actions) =>  h(Box, {}, [
    h(Menubar, {}, [
      h(MenubarItem, {
        onclick: ev => actions.openMainMenu(ev)
      }, _('LBL_FILE')),
      h(MenubarItem, {
        onclick: ev => actions.openViewMenu(ev)
      }, _('LBL_VIEW')),
      h(MenubarItem, {
        onclick: () => actions.compile()
      }, 'Compile'),
      
      h(MenubarItem, {
        onclick: () => win.maximize()
      }, 'FS')


    ]),
    

    
    h(BoxContainer, {
      grow: 3,
      shrink: 1,
      oncreate: el => {
        editor = ace.edit(el);
//        editor.setTheme('ace/theme/chrome');
        editor.setTheme('ace/theme/chrome');
	    editor.getSession().setMode('ace/mode/lilypond');
		editor.setOptions({
   			fontSize: "11pt"
		});
				editor.setValue("%\n% New file\n%\n"); 	
		//		 \n\n\n\n\n\n\n\n\n\n\n\n 
		// if we're mobile, this will disable the device's auto keyboard popup
		// we'll have our own keyboard
		editor.on('focus', () => {

			if (window.mobile && !hyperapp.fullscreen) {
				
				editor.blur();

//				actions.toggleTools(!state.showTools);
			}
		});		
 //    editor.getSession().on('change', () => {
 // 				win.setTitle("*" + proc.title);
 //     });

      }
    }),
    h(TextareaField, {
      class: 'lilypond__log',
      readonly: true,
      onupdate: el => {
        el.scrollTop = el.scrollHeight;
      },
      style: {
        fontFamily: 'monospace'
      },
      box: {
        grow: 1,
        shrink: 1,
        style: {
          display: state.showLog ? undefined : 'none'
        }
      },
      value: state.log
    }),
    h(Statusbar, {}, [
      h('span', {}, '')
    ])
  ]);

  const hyperapp = app({
    theme: 'ace/theme/chrome',
    mode: 'ace/mode/lilypond',
    row: 0,
    column: 0,
    lines: 0,
    log: '',
    focused: false,
    fullscreen: false,
    showLog: false
  }, {
    openMainMenu: ev => (state, actions) => {
      contextmenu({
        position: ev.target,
        menu: createMainMenu(proc.args.file, actions, _)
      });
    },

    openViewMenu: ev => (state, actions) => {
      contextmenu({
        position: ev.target,
        menu: createViewMenu(state, actions, _)
      });
    },

    compile: () => (state, actions) => {
    	let file= {"filename": snippet.filename, "path": "home:/" + snippet.path};
    	if (!proc.args.file) {
    		proc.args.file= file;
 
		}	

		basic.emit('save-file');	
      proc.emit('lilypond:compile', proc.args.file);
      actions.toggleLog(true);
    },

	fullscreen: () => {
//		if (!hyperapp.BIK)
			win.maximize();

//		else
//			win.restore();
	},
	
	
	insert: (token) => {
console.log(win);
		editor.insert(token);
		editor.focus();
	},
    command: (cmd) => {
    	eval(cmd);
    },
    
    restore: () => {
 
    	win.restore();

    	hyperapp.fullscreen= false;
 
    },
    
 
    toggleLog: showLog => ({showLog}),
    appendLog: append => state => ({log: state.log + append + '\n'}),

    menuNew: () => basic.createNew(),
    menuOpen: () => basic.createOpenDialog(),
    menuSave: () => (state, actions) => basic.emit('save-file'),
    menuSaveAs: () => basic.createSaveDialog(),
    menuQuit: () => proc.destroy(),
    
    		loadSnippet: (filename) => {
			
			snippet = {
				filename: filename,
				path: 'home:/' + getCookie('ometID') + '/' + filename
			};
			//		OSjs.run('Sandbox', {file: {filename: 'Scale.ly', path:'home:/Scale.ly'}});
			vfs.readfile(snippet)
				.then(contents => setText(contents, snippet.path))
				.catch(error => console.error(error)); // FIXME: Dialog

		}
  }, view, $content);

  proc.on('destroy', () => basic.destroy());

	proc.on('lilypond:compile:log', (type, string) => {
    hyperapp.appendLog(`[${type}] ${string}`);
  });

proc.on('lilypond:close-log', () => {
	    setTimeout(() => {
      hyperapp.toggleLog(false);
    }, 5000);
});
    proc.on('lilypond:compile:success', file => {
    proc.emit('lilypond:open-result', file);

    hyperapp.appendLog('*** COMPILATION SUCCESSFUL ***');

    setTimeout(() => {
      hyperapp.toggleLog(false);
    }, 5000);
  });

  proc.on('lilypond:compile:error', (error) => {
    hyperapp.appendLog('*** FAILED TO COMPILE ***');
    hyperapp.appendLog(error);
  });
 
proc.on('Insert', (...args) => hyperapp.insert(...args));
proc.on('Command', (...args) => hyperapp.command(...args));
proc.on('restore', () => hyperapp.restore());
proc.on('focus', () => win.focus());
proc.on('attention', (args) => {
win.focus();		
let filepath= args.file.path.substring(0, args.file.path.lastIndexOf('/'));
core.run('Browser', {path: filepath});	
	snippet.filename= args.file.filename;
 	snippet.path= args.file.path;	
		vfs.readfile(args.file)
			.then(contents => setText(contents, args.file.path))
			.catch(error => console.error(error)); // FIXME: Dialog
	});

  basic.on('new-file', () => {
    setText('');
  });
  basic.on('save-file', () => {
      const contents = getText();
    	let file= {"filename": snippet.filename, "path": snippet.path};
		// for session
    	if (!proc.args.file) {
    		proc.args.file= file;
 		}
	
      vfs.writefile(file, contents)
 //       .then(() => win.setTitle(proc.title))
 		.then(() => setSavedTitle(file.path))		
        .catch(error => console.error(error)); // FIXME: Dialog

  });

basic.on('open-file', (file) => {
 
let filepath= file.path.substring(0, file.path.lastIndexOf('/'));
core.run('Browser', {path: filepath});
 	snippet.filename= file.filename;
 	snippet.path= file.path;
    vfs.readfile(file)
      .then(contents => setText(contents, file.path))
      .catch(error => console.error(error)); // FIXME: Dialog
  });

  basic.init();

  win.on('resized', () => {
  	editor.resize();
 
  });	

  win.on('maximize', () => {
  		hyperapp.fullscreen= true;
  		editor.resize();
 
  });	 
  win.on('blur', () => {
  	hyperapp.focused= false;
  	editor.blur();
  });	
  
  win.on('focus', () => {
  	hyperapp.focused= true;
  	editor.focus();
  	

 
  });
  


	
if (window.mobile === true) {

	win.setPosition({top:32, left:0});
//244 is the approx. size of the bottom keyboard plus top panel	

	win.setDimension({width: 360, height: window.innerHeight - 244});
	core.run('Keyboard');
}
	hyperapp.fullscreen= false;
	
  return hyperapp;
};

export const createEditorWindow = (core, proc) =>
  proc.createWindow({
	id:'SandboxWindow',
    title: proc.metadata.title.en_EN,
    icon: proc.resource(proc.metadata.icon),
    dimension: {width: 600, height: 500},
    position: 'center'
//    dimension: {width: 360, height: 306},
//    position: 'topleft'
  })
    .on('destroy', () => proc.destroy())
    .render(($content, win) => {
    	
      createEditorInterface(core, proc, win, $content);
    });

