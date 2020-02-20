import {h, app} from 'hyperapp';
import {Box, BoxContainer, Button, Menubar, MenubarItem, Toolbar, Statusbar, TextareaField} from '@osjs/gui';
import * as ace from 'brace';
//import 'brace/theme/monokai';
//import 'brace/mode/javascript';
//import 'brace/mode/python';
//import 'brace/mode/css';
//import 'brace/mode/html';

import './lilypond';
import 'brace/mode/html';
import 'brace/mode/json';
//import 'brace/ext/modelist';
//import 'brace/ext/themelist';
import 'brace/theme/chrome';
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
//    defaultFilename: 'New.ly'
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
        onclick: () => actions.fullscreen()
      }, 'FS')

/*      
      h(MenubarItem, {
        onclick: () => actions.insert(' ')
      }, 'Sp'),     

     h(MenubarItem, {
        onclick: () => actions.insert("'")
      }, "' "), 
      
     h(MenubarItem, {
        onclick: () => actions.insert(",")
      }, ", "), 
      
     h(MenubarItem, {
        onclick: () => actions.insert("=")
      }, "= "), 
      
     h(MenubarItem, {
        onclick: () => actions.insert("\\")
      }, "\\ "),       
 
     h(MenubarItem, {
        onclick: () => actions.insert("{")
      }, "{ "),  
 */
    ]),
    
// remove for more screen space on tablets
/*
    h(Toolbar, {}, [
 
      h(Button, {
        onclick: () => actions.insert(' ')
      }, 'S'),
      
 	h(Button, {
        onclick: () => actions.insert('a')
      }, 'a'),
      
      h(Button, {
        onclick: () => actions.insert('b')
      }, 'b'),
      
     h(Button, {
        onclick: () => actions.insert('c')
      }, 'c'),
      
      h(Button, {
        onclick: () => actions.insert('d')
      }, 'd'),     
      
     h(Button, {
        onclick: () => actions.insert('e')
      }, 'e'),      
 
     h(Button, {
        onclick: () => actions.insert('f')
      }, 'f'), 
      
     h(Button, {
        onclick: () => actions.insert('g')
      }, 'g'),       
      
     h(Button, {
        onclick: () => actions.insert('\'')
      }, '\''), 


 
 ]),
*/
    
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
		basic.emit('save-file');	
      proc.emit('lilypond:compile', proc.args.file);
      actions.toggleLog(true);
    },

	fullscreen: () => {
//		if (!hyperapp.BIK)
			win.maximize();
			hyperapp.fullscreen= true;
//		else
//			win.restore();
	},
	
	
	insert: (token) => {
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
    menuQuit: () => proc.destroy()
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
	proc.on('attention', (args) => {
console.log(args.file.path);
		
		vfs.readfile(args.file)
			.then(contents => setText(contents, args.file.path))
			.catch(error => console.error(error)); // FIXME: Dialog
	});

  basic.on('new-file', () => {
    setText('');
  });

  basic.on('save-file', () => {
    if (proc.args.file) {
      const contents = getText();

      vfs.writefile(proc.args.file, contents)
 //       .then(() => win.setTitle(proc.title))
 		.then(() => setSavedTitle(proc.args.file.path))		
        .catch(error => console.error(error)); // FIXME: Dialog
    }
  });

  basic.on('open-file', (file) => {
 
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
  win.on('blur', () => editor.blur());
  win.on('focus', () => editor.focus());

//if (window.mobile === true)
//	win.maximize();
  return hyperapp;
};

export const createEditorWindow = (core, proc) =>
  proc.createWindow({
    id: 'SandboxWindow',
    title: proc.metadata.title.en_EN,
    icon: proc.resource(proc.metadata.icon),
//a bit bigger
    dimension: {width: 360, height: 310},
    position: 'topleft'
  })
    .on('destroy', () => proc.destroy())
    .render(($content, win) => {
      createEditorInterface(core, proc, win, $content);
    });

