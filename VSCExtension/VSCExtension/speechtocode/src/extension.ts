'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

var amqp = require('amqplib/callback_api');
const recvQ = "py_to_ext"

const filePath = vscode.workspace.textDocuments[0]['fileName']

const selectionTop = (editor: TextEditor) => {
    const lineNumber = editor.selection.start.line;
    vscode.commands.executeCommand('revealLine', { lineNumber, at: 'top' })
    return Promise.resolve();
}

const selectionBottom = (editor: TextEditor) => {
    const lineNumber = editor.selection.end.line;
    vscode.commands.executeCommand('revealLine', { lineNumber, at: 'bottom' })
    return Promise.resolve();
}

const scrollDown = (editor: TextEditor) => {
    vscode.commands.executeCommand('editorScroll', { to: 'down', by: 'line', value: 1 });
    return Promise.resolve();
}



// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    terminalSetup();
    

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "speechtocode" is now active!');
    cursorMoveUp();

    let movee = vscode.commands.registerCommand('extension.sayMov',()=>{
        console.log(vscode.window.activeTextEditor.selection.active.line);
        // cursorMoveUp();
        vscode.window.showInformationMessage('Moving');
        const line = vscode.window.activeTextEditor.selection.start.line + 1;
        const uri = vscode.window.activeTextEditor.document.uri;
      const pos = new vscode.Position(line - 1, 0);
      const loc = new vscode.Location(uri, pos);
      const breakpoint = new vscode.SourceBreakpoint(loc, true);
      vscode.debug.addBreakpoints([breakpoint]);
        
    });

    

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed
        
        
        // console.log(vscode.window.activeTextEditor.options);
        
        console.log("save action")

                    
        console.log(vscode.window.activeTextEditor.selection.active.character);
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        const pos = editor.selection.active;

        
        amqp.connect('amqp://localhost', function(err, conn) {
            conn.createChannel(function(err, ch) {
            var q = recvQ;
        
            ch.assertQueue(q, {durable: false});
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
            ch.consume(q, function(msg) {
                console.log(msg);
                editor.edit( (edit) => {
                    const pos = editor.selection.active;
                    console.log(JSON.parse(msg.content).toString());
                    // edit.insert(pos, JSON.parse(msg.content).toString()+"\n" );
                    edit.insert(pos, get_structured_data(JSON.parse(msg.content).toString()) );

                    
                });
            }, {noAck: true});
            });
        });

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
        
        // scrollDownHalfPage();
        // revealLinet(20);
        
        
    });

    
    // vscode.window.activeTextEditor.document.getText(vscode.)
    
    

    context.subscriptions.push(disposable);
    context.subscriptions.push(movee);
    
}

// this method is called when your extension is deactivated
export function deactivate() {
}

export function cursorMoveUp() {
    
    vscode.commands.executeCommand("cursorMove", {
        to: "up",
        by: "line",
        select: false,
        value: 5
      });
}

export function moveTheCursor(lines:number,direction:string) {
    vscode.commands.executeCommand("cursorMove", {
      to:direction,
      by: "line",
      select: false,
      value: lines   
    });
}

function revealLine(lineNumber,at:string) {
    vscode.commands.executeCommand('revealLine',{
        lineNumber,
        at:at
    });
}

export function revealLinet(linenum) {
    revealLine(linenum,'bottom');
}

function editorScroll(to: string, by: string) {
    vscode.commands.executeCommand('editorScroll', {
        to: to,
        by: by,
    });
}

export function scrollDownHalfPage(): void {
    editorScroll('down', 'halfPage');
}

export function scrollUpHalfPage(): void {
    editorScroll('up', 'halfPage');
}

export function scrollDownPage(): void {
    editorScroll('down', 'page');
}

export function scrollUpPage(): void {
    editorScroll('up', 'page');
}

function get_structured_data(data) {
    let dict = JSON.parse(data);
    var codeText = "";
    console.log(dict);
    let num_spaces = vscode.window.activeTextEditor.selection.active.character
    if (dict["action"] == "add_fun") {
        codeText = codeText + "def ";
        let dataDict = dict["data"]
        codeText = codeText + dataDict["func_name"] + "("
        dataDict["args"].forEach(element => {
            
            codeText = codeText + element + ",";
        });
        codeText = codeText.slice(0,-1);
        codeText = codeText + "):"
    } else if(dict["action"]=="add_if_else") {


        codeText = codeText + "if ():\n"
        codeText = codeText + ' '.repeat(num_spaces+4)
        codeText = codeText  + "pass\n";
        codeText = codeText  + ' '.repeat(num_spaces)
        codeText = codeText + "else:\n";
        codeText = codeText  + ' '.repeat(num_spaces+4)
        codeText = codeText + "pass\n";

    } else if (dict["action"] == "add_main") {

        codeText =  codeText + "if __name__ == '__main__':\n"
        codeText = codeText + ' '.repeat(num_spaces+4);
        codeText = codeText + "try:\n"
        codeText = codeText + ' '.repeat(num_spaces+8)
        codeText = codeText + "pass #Write here.\n";
        codeText = codeText + ' '.repeat(num_spaces+4)
        codeText = codeText + "except Exception:\n";
        codeText = codeText + ' '.repeat(num_spaces+8);
        codeText = codeText + "print(traceback.format_exc())";

    } else if (dict["action"] == "add_while") {

        codeText = "while ():\n\tpass";

    } else if (dict["action"] == "goto") {

        if (dict['data']['type']=='builtin.number') {
            let lineNum = +dict['data']['args'];
            
            let currentLine = vscode.window.activeTextEditor.selection.active.line;
            console.log(currentLine);
            if (lineNum == currentLine) {
                return codeText;
            } else if (lineNum > currentLine) {
                // Move the cursor down by positions
                let positions = lineNum - currentLine + 1;
                console.log(positions);
                moveTheCursor(positions,"down");
            } else if (lineNum < currentLine) {
                // Move the cursor up by positions
                let positions = currentLine - lineNum - 1;
                console.log(positions);
                moveTheCursor(positions,"up");
            }

        }


    } else if (dict["action"] == "call_function") {

        var ars = "(";
        var fun = "";

        dict["data"]["args"].forEach(element => {
            if (element["type"] == "argument") {
                ars = ars + element["entity"] + ",";
            } else if (element["type"] == "function_name") {
                fun = fun + element["entity"];
            }
        });
        
        ars = ars.slice(0,-1);
        ars = ars + ")";
        codeText = fun+ars;

    } else if (dict["action"] == "add_variable") {
        var vrs = "";
        var inits = "";
        dict["data"]["args"].forEach(element => {
            vrs = vrs + element["entity"] + ",";
            inits = inits + "None,";
        });
        vrs = vrs.slice(0,-1);
        inits = inits.slice(0,-1);

        codeText = vrs+" = "+inits;
    } else if (dict["action"]=="add_breakpoint") {
        const line = vscode.window.activeTextEditor.selection.start.line;
        const uri = vscode.window.activeTextEditor.document.uri;
        const pos = new vscode.Position(line, 0);
        const loc = new vscode.Location(uri, pos);
        const breakpoint = new vscode.SourceBreakpoint(loc, true);
        vscode.debug.addBreakpoints([breakpoint]);
        codeText = "";
    } else if (dict["action"]=="add_class") {
        var cls:string = "class ";
        var ars: string= "(self,";
        var args : string[] = [];
        dict["data"]["args"].forEach(element => {
            if (element['type'] == "argument") {
                ars = ars + element["entity"] + ",";
                args.push(element["entity"]);
            } else {
                cls = cls + element["entity"] + ":"
                
            }
        });

        ars = ars.slice(0,-1) + "):";

        codeText = codeText + cls + "\n";
        codeText = codeText + ' '.repeat(num_spaces+4)
        codeText = codeText + "def __init__" + ars + ":\n";
        args.forEach(element => {
            codeText = codeText + ' '.repeat(num_spaces+8)
            codeText = codeText + "self."+element+" = "+element+"\n";
        });

        console.log(codeText);
    } else if (dict["action"]=="save_file"){
        vscode.window.activeTextEditor.document.save();
    } else if (dict["action"]=="add_try_catch") {
        codeText = codeText + "try:\n";
        codeText = codeText + ' '.repeat(num_spaces+4) + "pass\n";
        codeText = codeText + ' '.repeat(num_spaces) + "except Exception as e:\n";
        codeText = codeText + ' '.repeat(num_spaces+4) + "print(e)\n";
    } else if (dict["action"]=="add_newline") {
        codeText = codeText + "\n".repeat(parseInt( dict["data"]["args"]["entity"]));
    }
    return codeText;
}


export function terminalSetup() {
    let ter = vscode.window.createTerminal("myterminal","/bin/zsh")
    ter.show(true);
    ter.sendText("py");
}
// {'status': 'class added/created.', 'action': 'add_class', 'data': {'args': [{'entity': 'engine', 'type': 'argument'}, {'entity': 'wheels', 'type': 'argument'}, {'entity': 'car', 'type': 'class_name'}]}}

// {"status": "Function Creation Returned", "action": "add_fun", "data": {"func_name": "x", "args": ["alpha", "beta", "gamma"]}}