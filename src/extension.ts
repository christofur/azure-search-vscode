'use strict';
import * as vscode from 'vscode';
import * as clientlib from 'typed-rest-client/HttpClient';

let connection = {
    url: '',
    apikey: '',
    scheme: 'https://',
    host: '.search.windows.net/',
    apiVersion: 'api-version=2017-11-11'
};

let headers = {
    'api-key': ''
};

const commands = {
    indexes: 'indexes'
};

const urlParts = {
    querystringStart: '?',
    querystringAppend: '&'
};


let client: clientlib.HttpClient;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {

    //Setup
    outputChannel = vscode.window.createOutputChannel("Azure Search");
    client = new clientlib.HttpClient('');

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
    context.subscriptions.push(addSearchConnectionCommand);
    context.subscriptions.push(searchWholeIndexCommand);
}


function addConnection() {
    vscode.window.showInputBox({ prompt: "Enter your server name:", placeHolder: "https://acmecompany.search.windows.net" }).then(host => {
        if (!host) {
            return;
        }
            vscode.window.showInputBox({ prompt: "Api Key:", placeHolder: "D6702A743E22F9111D284D06FAF88251" }).then(apiKey => {
                if (!apiKey) {
                    return;
                }

                connection.url = host;
                connection.apikey = apiKey;
                outputChannel.appendLine('Connection added for host ' + host);
            });
    });
}

function checkForConnection(){
    if(!connection || !connection.host || !connection.apikey){
        throw new Error("Connection not found - please use Add Connection command to add a connection");
    }

}

function searchWholeIndex(){

    checkForConnection();

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

            const url = "https://" + connection.url + ".search.windows.net/indexes/" + searchInfo.indexName + "/docs?api-version=2017-11-11&search=" + searchInfo.searchTerm + "&%24top=1";
        
            client.get(url, headers).then(res => {
                res.readBody().then(body => {
                    outputChannel.append(body);
                });                
            });
        });
    });
}

async function listIndexes(){
    
    checkForConnection();

    const url = buildUrl(commands.indexes);

    let json = await apiGetJson(url);

    // let res: clientlib.HttpClientResponse = await securedGet(url);
    // let body = await res.readBody();

    // let json = JSON.parse(body);

    if(json && json.value){
        json.value.forEach((index: any) => {
            outputChannel.appendLine(index.name);
        });
    }
}

function buildUrl(command: string){
    return connection.scheme + connection.url + connection.host + command + urlParts.querystringStart + connection.apiVersion;
}

async function apiGetJson(url: string){
    let res: clientlib.HttpClientResponse = await securedGet(url);
    let body = await res.readBody();
    return JSON.parse(body);
}

async function securedGet(url: string){
    return client.get(url, headers);
}

// this method is called when your extension is deactivated
export function deactivate() {
}