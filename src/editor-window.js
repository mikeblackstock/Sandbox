/*eslint-disable no-extra-parens, no-sparse-arrays*/
import {
	h,
	app
} from 'hyperapp';
import {
	Box,
	BoxContainer,
	Button,
	Menubar,
	MenubarItem,
	Toolbar,
	Statusbar,
	TextareaField
} from '@osjs/gui';
import * as ace from 'brace';


import './lilypond';
import 'brace/mode/html';
import 'brace/mode/json';

import 'brace/theme/chrome';
import * as clipboard from 'clipboard-polyfill';
let snippet = {};
let tmpID = '';
let zoomString = '#zoom=100';

const createMainMenu = (current, actions, _) => ([
	{
		label: _('Scales.ly'),
		onclick: () => actions.loadSnippet('Scales.ly')
	},
		{
		label: _('Chords.ly'),
		onclick: () => actions.loadSnippet('Chords.ly')
	},
	
		{
		label: _('Rhythms.ly'),
		onclick: () => actions.loadSnippet('Rhythms.ly')
	},
		
	{

		label: _('LBL_SAVE'),
		onclick: () => actions.menuSave()
	},
	{
		label: _('LBL_QUIT'),
		onclick: () => actions.menuQuit()
	}]);

const createEditMenu = (state, actions, _) => ([{
	label: _('Begin selection'),
//		checked: state.showLog,
		onclick: () => actions.beginSelection()
	},
	{
	label: _('End selection'),
//		checked: state.showTools,
		onclick: () => actions.endSelection()
	},	

	{
	label: 'Paste selection',
		onclick: () => actions.pasteSelection()
	},

    {
	label: 'Show',
		onclick: () => actions.showSelection()
	},
    {
	label: 'Clear',
		onclick: () => actions.clearSelection()
	}
]);




const createViewMenu = (state, actions, _) => ([{
	label: _('Log'),
		checked: state.showLog,
		onclick: () => actions.toggleLog(!state.showLog)
	},
	{
	label: _('Tools'),
		checked: state.showTools,
		onclick: () => actions.toggleTools(!state.showTools)
	},	
	{
	label: 'Zoom: page-fit',
		onclick: () => actions.changeZoom('#zoom=page-fit')
	},
	{
	label: 'Zoom: 100',
		onclick: () => actions.changeZoom('#zoom=100')
	},
	{
	label: 'Zoom: 150',
		onclick: () => actions.changeZoom('#zoom=150')
	},


	{
		label: 'Zoom: 200',
		onclick: () => actions.changeZoom('#zoom=200')
	},

	{
		label: 'Show zoom',
		onclick: () => actions.showZoom()
	}

]);



const createEditorInterface = (core, proc, win, $content) => {
	let editor;
 
	const _ = core.make('osjs/locale').translate;
	const vfs = core.make('osjs/vfs');
	const contextmenu = core.make('osjs/contextmenu').show;
	const basic = core.make('osjs/basic-application', proc, win, {

		defaultFilename: 'Default.ly'
	});

	// const setText = contents => editor.setValue(contents); 
	const setText = function(contents, path) {
		editor.setValue(contents);
		editor.navigateFileStart();

		win.setTitle(path);
	};

	const setSavedTitle = function(path) {
		win.setTitle("Saved");
		setTimeout(() => {
			win.setTitle(path);
		}, 1000);
	};
	const {icon} = core.make('osjs/theme');
	const getText = () => editor.getValue();

//	const yell=  yellAtMike(h, state, actions);

	const view = (state, actions) => h(Box, {}, [
		h(Menubar, {}, [
			h(MenubarItem, {
				onclick: ev => actions.openMainMenu(ev)
			}, _('LBL_FILE')),

			h(MenubarItem, {
				onclick: ev => actions.openEditMenu(ev)
			}, _('Edit')),
			h(MenubarItem, {
				onclick: ev => actions.openViewMenu(ev)
			}, _('LBL_VIEW')),
			
			h(MenubarItem, {
				onclick: () => actions.compile()
			}, 'Compile'),



			h(MenubarItem, {
				checked: state.showTools,
				onclick: () => actions.toggleTools(!state.showTools)
			}, 'Tools')

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
				editor.setValue("%\n% Lilypond compiler demo\n%\n" +
				"% Select a snippet from 'File' menu\n" + 
				"% Click 'Compile'\n" +
				"% Make changes, play around\n%\n" +
				"% or click 'Compile' now to\n" +
				"% compile the snippet below\n\n" +
				'\\version "2.18"\n'	+
				"\\layout {indent = 0}\n" +
				"\\relative c'\n" +  
				"{\n" +
				"c d e f g a b c\n" + 
				"}\n"); 

				
				editor.navigateFileEnd();
				editor.on('focus', () => {
if (window.mobile) {
	editor.blur();
	actions.toggleTools(!state.showTools);
}


//					actions.toggleTools(!state.showTools);
				});
				editor.on('blur', () => {

//					actions.toggleTools(state.showTools);
				});

				//    editor.getSession().on('change', () => {
				// 				win.setTitle("*" + proc.title);
				//     });
				
			}
		}),
		
//		h(BoxContainer, {
//			grow: 3,
//			shrink: 1
//		}),
   	h(Toolbar, {
				style: {
					display: state.showTools ? undefined : 'none'
				} 		
   	}, [
       h(Button, {
        title: 'Octave up',
        label: "'",
  
        onclick: () => actions.insert( "'")
      }),
       h(Button, {
        title: 'Octave down',
        label: ",",
  
        onclick: () => actions.insert( ",")
      }),	 
      h(Button, {
       title: '1',
       label: "1",
//  		icon: icon('go-previous'),
        onclick: () => actions.insert("1")
      }),
      
    
      
      h(Button, {
        title: '2',
        label: "2",
//  		icon: icon('go-next'),  
        onclick: () => actions.insert("2")
      }),
      
           h(Button, {
        title: '4',
       label: "4",
//   		icon: icon('go-up'), 
//        onclick: () => editor.navigateUp(1)
         onclick: () => actions.insert("4")
       }),   
      h(Button, {
        title: '8',
        label: "8",
//    	icon: icon('go-down'),
//        onclick: () => editor.navigateDown(1)
        onclick: () => actions.insert("8")
      }),

      h(Button, {
        title: '16',
        label: "16",
//    	icon: icon('go-down'),
//        onclick: () => editor.navigateDown(1)
        onclick: () => actions.insert("16")
      }),
 
      h(Button, {
        title: '32',
        label: "32",
//    	icon: icon('go-down'),
//        onclick: () => editor.navigateDown(1)
        onclick: () => actions.insert("32")
      }), 
 

      h(Button, {
        title: '.',
        label: ".",
//    	icon: icon('go-down'),
//        onclick: () => editor.navigateDown(1)
        onclick: () => actions.insert(".")
      }),
      
       h(Button, {
        title: 'More',
        label: ">>",
//    	icon: icon('go-down'),
//        onclick: () => editor.navigateDown(1)
        onclick:  (ev) => actions.moreTools(ev)
      }), 
           
      
 ]),


   	h(Toolbar, {
				style: {
					display: state.showTools ? undefined : 'none'
				}
				
   	}, [


       h(Button, {
        title: 'c',
        label: "c",
 
        onclick: () => actions.insert( "c")
      }),
             h(Button, {
        title: 'd',
        label: "d",
  
        onclick: () => actions.insert( "d")
      }),
             h(Button, {
        title: 'e',
        label: "e",
  
        onclick: () => actions.insert( "e")
      }),
             h(Button, {
        title: 'f',
        label: "f",
  
        onclick: () => actions.insert( "f")
      }),	  
             h(Button, {
        title: 'g',
        label: "g",
  
        onclick: () => actions.insert( "g")
      }),	  
             h(Button, {
        title: 'a',
        label: "a",
  
        onclick: () => actions.insert( "a")
      }),	  
             h(Button, {
        title: 'b',
        label: "b",
  
        onclick: () => actions.insert( "b")
      }),	
      
       h(Button, {
        title: 'es',
        label: "es",
  
        onclick: () => actions.insert( "es")
      }),	   
      
        h(Button, {
        title: 'is',
        label: "is",
  
        onclick: () => actions.insert( "is")
      }),
      
        h(Button, {
        title: 'r',
        label: "r",
  
        onclick: () => actions.insert( "r")
      })	 
 ]),
h(Toolbar, {
				style: {
					display: state.showTools ? undefined : 'none'
				}
				
   	}, [
   	

      h(Button, {
        title: 'Space',
        label: "space",
				style: {
					width: "100px",
					display: state.showTools ? undefined : 'none'
				},  
        onclick: () => actions.insert( " ")
      }),
   		h(Button, {
        title: 'Backpace',
        label: "bs",
				style: {
					
					display: state.showTools ? undefined : 'none'
				},  
        onclick: () => actions.backspace()
      }),     
 
 h(Button, {
        title: 'Delete',
        label: "del",
  
        onclick: () => editor.remove()
      }),   
      
      h(Button, {
        title: 'Return ((Newline)',
        label: "ret",
  
        onclick: () => actions.insert("\n")
        
      }),
            h(Button, {
        title: 'Undo',
//        label: "<",
  		icon: icon('edit-undo'),
        onclick: () => editor.undo()
      }),
      
      h(Button, {
        title: 'Redo',
//        label: "<",
  		icon: icon('edit-redo'),
        onclick: () => editor.redo()
      }),
 ]),
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
		buttons:'',
		showTools: false,
        selectionRange: "",
        beginSelect: {},
        endSelect: {},
		log: '',
		showLog: false
	}, {
		openMainMenu: ev => (state, actions) => {
			console.log(ev.target);
			contextmenu({
				position: ev.target,
				menu: createMainMenu(proc.args.file, actions, _)
			});
		},

		openEditMenu: ev => (state, actions) => {

			contextmenu({
				position: ev.target,
				menu: createEditMenu(state, actions, _)
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
			proc.emit('lilypond:compile', snippet);
			actions.toggleLog(true);
		},

		yell: ()  => {
			alert("HI THERE MIKE!");
		},
		changeZoom: (zoom) => {
//			zoomString= zoom;
			proc.emit('zoom', zoom);
		},
		showZoom: (zoom) => {
//			zoomString= zoom;
			proc.emit('showZoom');
		},

        beginSelection: () => (state, actions) => {
            state.selectionRange= editor.selection.getRange();
  //          state.beginSelect= editor.getCursorPosition();
            console.log(state.selectionRange.start);
		},
        endSelection: () => (state, actions) => {

            console.log(editor.getCursorPosition());
 //           editor.selection.setRange(0, 0, 10, 0);
            state.selectionRange.end= editor.getCursorPosition();
            editor.selection.setRange(state.selectionRange);
 
		},
        clearSelection: () => (state, actions) => {
//            console.log(editor.getSelectedText());
            editor.selection.clearSelection();
            state.selectionRange= '';
		},
       pasteSelection: () => (state, actions) => {
            if (state.selectionRange !== "") {
            editor.insert(editor.getSession().doc.getTextRange(state.selectionRange));
            console.log(editor.getSession().doc.getTextRange(state.selectionRange));
  
            }
		},

        showSelection: () => (state, actions) => {

            if (state.selectionRange !== "")
                editor.selection.setRange(state.selectionRange);
        },       
        pasteClipboard: () => (state, actions) => {
         //   console.log(window.clipboardData.getData('Text'));
         //   document.execCommand("paste");
clipboard.readText().then(console.log, console.error);
        },
		test: () => {
			proc.emit("sandbox:test");
		}, 
		insert: (token) => {

			editor.insert(token);
//			editor.focus();
		},
		backspace: () => {
			editor.navigateLeft(1);
			editor.remove();
		},
		moreTools: (ev) => {

      		contextmenu({
					position: ev.target,
					
 					menu: [{
 
          				label: '64',
          				onclick: () => editor.insert('64')

						},
						
						{
 
          				label: '128',
          				onclick: () => editor.insert('128')
	
						}]	
					
			});
		},



		toggleLog: showLog => ({
			showLog
		}),
		appendLog: append => state => ({
			log: state.log + append + '\n'
		}),

		toggleTools: showTools => ({
			showTools
		}),
		
		keyOffTools: () => {
			editor.focus();
		},
		menuNew: () => basic.createNew(),
		menuOpen: () => basic.createOpenDialog(),
		menuSave: () => (state, actions) => basic.emit('save-file'),
		menuSaveAs: () => basic.createSaveDialog(),
		menuQuit: () => proc.destroy(),

		
		loadSnippet: (filename) => {

			snippet = {
				filename: filename,
				path: 'home:/' + tmpID + '/' + filename
			};
			//		OSjs.run('Sandbox', {file: {filename: 'Scale.ly', path:'home:/Scale.ly'}});
			vfs.readfile(snippet)
				.then(contents => setText(contents, snippet.path))
				.catch(error => console.error(error)); // FIXME: Dialog

		}

	}, view, $content);

	proc.on('destroy', () => basic.destroy());
	proc.on('setTmpID', (userID) => {
		tmpID = userID;
		snippet = {
			filename: 'Default.ly',
			path: 'home:/' + tmpID + '/Default.ly'
		};


	});
	proc.on('loadDefault', () => {
		vfs.readfile(snippet)
				.then(contents => setText(contents, snippet.path))
				.catch(error => console.error(error)); // FIXME: Dialog
	});
	proc.on('lilypond:compile:log', (type, string) => {
		hyperapp.appendLog(`[${type}] ${string}`);
	});

	proc.on('lilypond:compile:success', file => {
//		proc.emit('lilypond:open-result', file);

		hyperapp.appendLog('*** COMPILATION SUCCESSFUL ***');
		setTimeout(() => {
			hyperapp.toggleLog(false);
		}, 5000);
	});

	proc.on('lilypond:compile:error', (error) => {
		hyperapp.appendLog('*** FAILED TO COMPILE ***');
		hyperapp.appendLog(error);
	});

	proc.on('attention', (args) => {
console.log(args.file.path);
		snippet = args.file;
		vfs.readfile(snippet)
			.then(contents => setText(contents, snippet.path))
			.catch(error => console.error(error)); // FIXME: Dialog
	});
	basic.on('new-file', () => {

	});

	basic.on('save-file', () => {
		//   if (proc.args.file) {
		const contents = getText();

		vfs.writefile(snippet, contents)
			//       .then(() => win.setTitle(proc.title))
			.then(() => setSavedTitle(snippet.path))
			.catch(error => console.error(error)); // FIXME: Dialog
		//   }
	});

	basic.on('open-file', (file) => {
		console.log(file);
		vfs.readfile(file)
			.then(contents => setText(contents, file.path))
			.catch(error => console.error(error)); // FIXME: Dialog
	});

	basic.init();

	win.on('resized', () => editor.resize());
	win.on('blur', () => editor.blur());
//	win.on('focus', () => editor.focus());

	if (window.mobile === true) 
			win.maximize();

	return hyperapp;
};

export const createEditorWindow = (core, proc) =>
	proc.createWindow({
		id: 'SandboxWindow',
		title: proc.metadata.title.en_EN,
		icon: proc.resource(proc.metadata.icon),
		//a bit bigger
		dimension: {
			width: 500,
			height: 500
		},
		position: 'left'
	})
	.on('destroy', () => proc.destroy())
	.render(($content, win) => {
		createEditorInterface(core, proc, win, $content);
	});