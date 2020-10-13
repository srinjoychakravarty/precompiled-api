const async = require("async");
const fs = require("fs");
const { Keyring } = require('@polkadot/keyring');
var base = require('../base.js');

const abiPaths = ["../contracts/roleContract.json", "../contracts/accContract.json", "../contracts/regtrSSTContract.json", "../contracts/coreContract.json"];
const contractAddr = base.get_contract_addr('contractAddr_regtrC');

async function call_registerSST(id, addr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    const selector = abiArr[2].messages.registerSst(id, addr);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'registerSST()', selector);
        let hexArr = base.parse_event_data(temp)[0];
        // let byteArr = base.parse_event_data(temp)[1];
        let result = {};
        result.sst_id = hexArr[1] ? remove_prefix(base.convert_to_char(hexArr[1])) : "";
        result.core_addr = hexArr[2] ? keyring.encodeAddress(hexArr[2]) : "";
        console.log(result);
        resolve(result);
    });
}

// need add event data
async function call_getSSTcoreAddress(id) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    const selector = abiArr[2].messages.getSsTcoreAddress(id);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'getSSTcoreAddress()', selector);
        let hexArr = base.parse_event_data(temp)[0];
        let result = {};
        result.core_addr = hexArr[0] ? keyring.encodeAddress(hexArr[0]) : "";
        console.log(result);
        resolve(result);
    });
}

async function call_listSSTs() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[2].messages.listSsTs();
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'listSSTs()', selector);
        let hexArr = base.parse_event_data(temp)[0];
        // let byteArr = base.parse_event_data(temp)[1];
        console.log(hexArr);
        let results = [];
        for(let i = 0; i < hexArr.length; i++) {
            let result = {};
            result.sst_id = hexArr[i] ? remove_prefix(base.convert_to_char(hexArr[i])) : "";
            results.push(result);
        }
        console.log(results);
        resolve(results);
    });
}

async function call_isRegistered(id) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[2].messages.isRegistered(id);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'isRegistered()', selector);
        let byteArr = base.parse_event_data(temp)[1];
        let result = {};
        result.isRegistered = byteArr[0] == 1 ? true : false;
        console.log(result);
        resolve(result);
    });
}

function remove_prefix(str) {
    let temp = str.split("");
    temp.shift();
    temp.shift();
    return temp.join("");
}

let acc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// call_registerSST('EMB2', acc);

// call_getSSTcoreAddress('EMB2');

// call_listSSTs();

call_isRegistered(10);