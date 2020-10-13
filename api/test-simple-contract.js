const async = require("async");
const fs = require("fs");
var base = require('../base.js');
const { config } = require('process');
const { indexToId } = require("@polkadot/api-derive/accounts");
const { Bytes, Text, u32, u64 } = require('@polkadot/types/primitive');
const { parse } = require("path");
const { time } = require("console");
const BN = require('bn.js');
const { createType } =require('@polkadot/types');
const { asyncScheduler } = require("rxjs");
const { stringToU8a, u8aToHex, numberToU8a, u8aToBn, u8aToString } =require('@polkadot/util');

const abiPaths = ["../contracts/simple_contract.json"];
const wasmPaths = ["../contracts/simple_contract.wasm"];

async function init() {
    // Deploy all contracts and save into contract_id.json
    const { api, abiArr, bob } = await base.connect(abiPaths);
    let c1 = await base.deploy_contract(api, wasmPaths[0], bob, 'codehash_simpleC', 'contractAddr_simpleC', "0x5EBD88D6");
    
    return c1;
}

async function call_addItem() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const contractAddr = getContractAddr('contractAddr_simpleC');
    const selector = abiArr[0].messages.addItem([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 1, "-1.56");
    let results = await base.call_contract(api, contractAddr, bob, 'addItem()', selector);
    console.log(hex2a(results));
    return results;
}

async function call_getItems() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const contractAddr = getContractAddr('contractAddr_simpleC');
    const selector = abiArr[0].messages.getItems();
    let results = await base.call_contract(api, contractAddr, bob, 'getItems()', selector);
    console.log(results);
    return results;
}

async function call_add_test_u128() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const contractAddr = getContractAddr('contractAddr_simpleC');
    const selector = abiArr[0].messages.addTestU128();
    let temp = await base.call_contract(api, contractAddr, bob, 'addTestU128()', selector);
    // console.log(temp);
    let results = [];
    for(let i = 1; i < temp.length - 1;) {
        let [e1, e2] = temp[i];
        let byteArr = [e1, e2].reverse();
        // console.log(temp[i]);
        // console.log(u8aToHex(byteArr));
        results.push(Number(u8aToHex(byteArr)));
        console.log(Number(u8aToHex(byteArr)));
        i += 2;
    }
    // let t = await call_get_u128_store();
    // let t2 = t.replace(/\0/g, '').replace('\u0004', '');
    // let currentVal = Number(t2)
    // console.log(t.replace(/\0/g, '').replace('\u0004', '').split(''));
    // console.log("currentVal: " + currentVal);

    // return new Promise((resolve, reject) => {
    //     base.call_contract(api, contractAddr, bob, 'addTestU128()', selector)
    //     .then((temp) => {
    //         let results = [];
    //         let indice = [];
    //         let times = 300;
    //         // console.log(temp[0]);
    //         // console.log(hexStr_to_str(temp[0]));
    //         for(let i = currentVal; i < times; i++) {
    //             let parsed_temp = hexStr_to_num(temp[i], i);
    //             console.log("parsed_temp: " + parsed_temp);
    //             if(parsed_temp != i+1) {
    //                 console.log(temp[i]);
    //                 // console.log(parsed_temp);
    //                 results.push(temp[i]);
    //                 indice.push(i);
    //             }
    //             if(i == times -1) call_set_u128_store(parsed_temp.toString());
    //         }
    //         console.log("1st mis: " + results[0]);
    //         console.log("1st mis index: " + indice[0]);
    //         console.log("total: " + results.length);

    //         resolve(results);
    //     });
    // });
}

async function call_set_test_u128(i) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const contractAddr = getContractAddr('contractAddr_simpleC');
    const selector = abiArr[0].messages.setTestU128(i);
    let results = await base.call_contract(api, contractAddr, bob, 'set_test_u128()', selector);
    // let byteArr = results[1].slice(0, 2).reverse();
    let [e1, e2] = results[1];
    let byteArr = [e1, e2].reverse();
    console.log(Number(u8aToHex(byteArr)));
    // console.log(results);
    return results;
}

async function call_set_test_u32(i) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const contractAddr = getContractAddr('contractAddr_simpleC');
    const selector = abiArr[0].messages.setTestU32(i);
    let results = await base.call_contract(api, contractAddr, bob, 'set_test_u32()', selector);
    console.log(results);
    return results;
}

async function call_get_test_u128() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const contractAddr = getContractAddr('contractAddr_simpleC');
    const selector = abiArr[0].messages.getTestU128();
    return new Promise((resolve, reject) => {
        base.call_contract(api, contractAddr, bob, 'getTestU128()', selector)
        .then((results) => {
            // console.log(hexStr_to_str(results[0]));
            console.log(results);
            resolve(results);
        });
    });
}

async function call_set_u128_store(i) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const contractAddr = getContractAddr('contractAddr_simpleC');
    const selector = abiArr[0].messages.setU128Store(i);
    return new Promise((resolve, reject) => {
        base.call_contract(api, contractAddr, bob, 'set_u128_store()', selector)
        .then((results) => {
            // console.log(hexStr_to_str(results[0]));
            console.log(remove_prefix(base.convert_to_char(results[0])));
            resolve(remove_prefix(base.convert_to_char(results[0])));
        });
    });
}

async function call_get_u128_store() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const contractAddr = getContractAddr('contractAddr_simpleC');
    const selector = abiArr[0].messages.getU128Store();
    return new Promise((resolve, reject) => {
        base.call_contract(api, contractAddr, bob, 'get_u128_store()', selector)
        .then((results) => {
            // console.log(hexStr_to_str(results[0]));
            // console.log(base.convert_to_char(results[0]));
            console.log(base.convert_to_char(results[0]));
            resolve(base.convert_to_char(results[0]));
        });
    });
}

async function test_type() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    let t = api.registry.createType('u128', '0x11010000000000000000000000000000');
    console.log(t);
}

async function test_transfer_bal(addr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    // transfer() accepts max 16 digits as value
    const txHash = await api.tx.balances
        .transfer(addr, 1000000000000000)
        .signAndSend(bob);

    // return new Promise((resolve, reject) => {
    //     api.tx.balances
    //     .transfer(addr, 1000000000000000)
    //     .signAndSend(bob)
    //     .then(async (txHash) => {
    //         console.log(`Submitted with hash ${txHash}`);
    //         const { nonce, data: balance } = await api.query.system.account(addr);
    //         console.log(`${addr}'s balance of ${balance.free} and a nonce of ${nonce}`);
    //         resolve(balance.free);
    //     })
    // });
    
    // Show the hash
    console.log(`Submitted with hash ${txHash}`);
}

async function get_bal(addr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const { nonce, data: balance } = await api.query.system.account(addr);
    console.log(`${addr}'s balance of ${balance.free} and a nonce of ${nonce}`);
}

function getContractAddr(addrName) {
    if(fs.existsSync('contract_id.json')) {
        var data = fs.readFileSync('contract_id.json');
        var json = JSON.parse(data);
        return json[addrName];
    } else {
        console.log('No contract id json file!');
    }
}

function remove_prefix(str) {
    let temp = str.split("");
    temp.shift();
    temp.shift();
    return temp.join("");
}

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function hexStr_to_num(str, currentValNum) {
    // var repl = str.replace(/^0+(\d)|(\d.)0+$/gm, '$1$2');
    // if(repl == '0x') return '0';
    // let string = Number(repl).toString();
    // console.log("currentVal: " + currentVal);
    // let currentValNum = Number(currentVal[0]);
    console.log("currentValNum: " + currentValNum);
    console.log("str: " + str.split(""));

    let temp = str.slice(0, 4);
    let tempNum = Number(temp);
    console.log("tempNum: " + tempNum);

    if(tempNum != currentValNum + 1) {
        let arr = str.split('');
        [arr[3], arr[5]] = [arr[5], arr[3]];
        str = arr.join('');
        console.log(str);
        temp = str.slice(0, 6);
        tempNum = Number(temp);
        console.log("new tempNum: " + tempNum);

        // let string = tempNum == currentValNum ? tempNum.toString() : "Failed to parse hex string!";
        let num = tempNum == currentValNum + 1 ? tempNum : "Failed to parse hex string!";
        return num;
    }
    // let string = tempNum.toString();
    return tempNum;
}

async function test() {
    await call_add_test_u128();
}

// init();
// call_addItem();
// call_getItems();
// let res = hex2a('0x08142d322e332c182d312e35362c');
// console.log(res);
call_add_test_u128();
// call_get_test_u128();
// call_set_u128_store();
// call_get_u128_store();
// call_set_test_u128(2010);
// call_set_test_u32(5);

// test();
// console.log(hexStr_to_str("0xa0"));
// console.log(parseInt("0xa0000000000000000000000000000000", 16));
// let n = new Text("0x01").eq('1');
// console.log(n);
// let a = new BN('1101', "hex");
// console.log(a.toString(10));
// test_type();
const addrs = [
    CHARLIE,
    DAVE,
    EVE,
    FERDIE
];

// test_transfer_bal('5ERMVgM4QhaDuks9dKGANz7Pu9aFWMYKrnuv1bZ3TFbwq4te');
// get_bal('5ERMVgM4QhaDuks9dKGANz7Pu9aFWMYKrnuv1bZ3TFbwq4te');
// const message = u8aToHex([1, 17]);
// const message2 = numberToU8a(2010);
// console.log(message2);