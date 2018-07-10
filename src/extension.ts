'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as HttpClient from 'typed-rest-client/HttpClient';

let connection = {
    url: '',
    apikey: ''
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "azure-search-for-vscode" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let sayHelloCommand = vscode.commands.registerCommand('extension.sayHello', () => {
        vscode.window.showInformationMessage('Hello World!');
    });

    let addSearchConnectionCommand = vscode.commands.registerCommand('extension.addSearchConnection', () => {
        addConnection();
        vscode.window.showInformationMessage('Successfully added Azure Search connection');
    });

    let listIndexesCommand = vscode.commands.registerCommand('extension.listIndexes', () => {
        listIndexes();
    });

    let searchWholeIndexCommand = vscode.commands.registerCommand('extension.searchWholeIndex', () => {
        searchWholeIndex();
    });

    context.subscriptions.push(listIndexesCommand);
    context.subscriptions.push(sayHelloCommand);
    context.subscriptions.push(addSearchConnectionCommand);
    context.subscriptions.push(searchWholeIndexCommand);
}

function addConnection() {
    vscode.window.showInputBox({ prompt: "Enter your server name:", placeHolder: "https://acmecompany.search.windows.net" }).then(host => {
        if (!host) {
            return;
        }
            vscode.window.showInputBox({ prompt: "Api Key:", placeHolder: "D6702A743E22F9111D284D06FAF88251" }).then(password => {
                if (!password) {
                    return;
                }

                connection = {
                    url: host,
                    apikey: password
                };

                console.info('Here is your connection', connection);
            });
    });
}

function searchWholeIndex(){

    vscode.window.showInputBox({ prompt: "Enter index name:", placeHolder: "real-estate" }).then(indexName => {
        if (!indexName) {
            return;
        }

        vscode.window.showInputBox({ prompt: "Enter search term:", placeHolder: "beautiful" }).then(searchTerm => {
            if (!searchTerm) {
                return;
            }

            let searchInfo = {
                indexName: indexName,
                searchTerm: searchTerm
            }

            let client = new HttpClient.HttpClient('');
        
            
            

            console.info('searchInfo', searchInfo)
            
            const url = "https://" + connection.url + ".search.windows.net/indexes/" + searchInfo.indexName + "/docs?api-version=2017-11-11&search=" + searchInfo.searchTerm + "&%24top=1";
            const headers = { 'api-key': connection.apikey };
        
            client.get(url, headers).then(res => {
                res.readBody().then(body => {
                    let channel = vscode.window.createOutputChannel("search-output");
                    channel.append(body);
                });                
            });
        });
    });
}

async function listIndexes(){
    let client = new HttpClient.HttpClient('');
    
    const url = "https://" + connection.url + ".search.windows.net/indexes?api-version=2017-11-11";
    const headers = { 'api-key': connection.apikey };

    let res: HttpClient.HttpClientResponse = await client.get(url, headers);
    let body = await res.readBody();

    let json = JSON.parse(body);

    if(json && json.value){
        json.value.forEach((index: any) => {
            console.info(index.name)
        })
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}