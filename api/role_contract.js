const async = require("async");
const fs = require("fs");
var base = require('../base.js');
const { Keyring } = require('@polkadot/keyring');
const { assert } = require("console");

const abiPaths = ["../contracts/roleContract.json", "../contracts/accContract.json", "../contracts/regtrSSTContract.json", "../contracts/coreContract.json"];
const contractAddr = base.get_contract_addr('contractAddr_roleC');

async function call_addRoleType(addr, value) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    const selector = abiArr[0].messages.addRoleType(addr, value);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'addRoleType()', selector);
        let byteArr = base.parse_event_data(temp)[1];
        let results = {};
        results.register_account = keyring.encodeAddress(byteArr[0]);
        results.register_type = base.u8a_to_number(byteArr[1]);
        console.log(results);
        resolve(results);
    });
}

async function call_getRoleType(addr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.getRoleType(addr);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'getRoleType()', selector);
        let byteArr = base.parse_event_data(temp)[1];
        let results = {};
        results.address = addr;
        results.roleType = base.u8a_to_number(byteArr[0]);
        console.log(results);
        resolve(results);
    });
}

async function call_addRole(addr, func_name, permission) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.addRole(addr, func_name, permission);
    let temp = await base.call_contract(api, contractAddr, bob, 'addRole()', selector);
    let byteArr = base.parse_event_data(temp)[1];
    let results = {};
    results.func_name = base.u8a_to_number(byteArr[0]);
    results.permission = base.u8a_to_number(byteArr[1]);
    console.log(results);
    return results;
}

async function call_getRole(addr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.getRole(addr);
    let temp = await base.call_contract(api, contractAddr, bob, 'getRole()', selector);
    let byteArr = base.parse_event_data(temp)[1];
    let results = {};
    results.func_name = base.u8a_to_number(byteArr[0]);
    console.log(results);
    return results;
}

async function call_removeRole(addr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.removeRole(addr);
    let temp = await base.call_contract(api, contractAddr, bob, 'removeRole()', selector);
    let byteArr = base.parse_event_data(temp)[1];
    let results = {};
    results.func_name = base.u8a_to_number(byteArr[0]);
    console.log(results);
    return results;
}

// need to add event data in roleContract
async function call_hasRole(addr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.hasRole(addr);
    let temp = await base.call_contract(api, contractAddr, bob, 'hasRole()', selector);
    let byteArr = base.parse_event_data(temp)[1];
    let results = {};
    results.permission = base.u8a_to_number(byteArr[0]);
    console.log(results);
    return results;
}

async function call_addApprover(addr, func_name, stage) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.addApprover(addr, func_name, stage);
    let temp = await base.call_contract(api, contractAddr, bob, 'addApprover()', selector);
    let byteArr = base.parse_event_data(temp)[1];
    let results = {};
    results.func_name = base.u8a_to_number(byteArr[0]);
    results.stage = base.u8a_to_number(byteArr[1]);
    console.log(results);
    return results;
}

// need to add event data in roleContract
async function call_isApprover(addr, func_name, stage) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.isApprover(addr, func_name, stage);
    let temp = await base.call_contract(api, contractAddr, bob, 'isApprover()', selector);
    let byteArr = base.parse_event_data(temp)[1];
    let results = {};
    results.permission = base.u8a_to_number(byteArr[0]);
    console.log(results);
    return results;
}

async function call_addParent(addr, parentAddr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    const selector = abiArr[0].messages.addParent(addr, parentAddr);
    let temp = await base.call_contract(api, contractAddr, bob, 'addParent()', selector);
    let byteArr = base.parse_event_data(temp)[1];
    let results = {};
    results.parent_address = keyring.encodeAddress(byteArr[0]);
    console.log(results);
    return results;
}

async function call_getParent(addr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    const selector = abiArr[0].messages.getParent(addr);
    let temp = await base.call_contract(api, contractAddr, bob, 'getParent()', selector);
    let byteArr = base.parse_event_data(temp)[1];
    let results = {};
    results.parent_address = keyring.encodeAddress(byteArr[0]);
    console.log(results);
    return results;
}

async function call_getBalance() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.getBalance();
    let temp = await base.call_contract(api, contractAddr, bob, 'getBalance()', selector);
    let byteArr = base.parse_event_data(temp)[1];
    let results = {};
    results.balance = base.u8a_to_number(byteArr[0]);
    console.log(results);
    return results;
}

let acc = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let parent = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// call_addRoleType("5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ", 1);

// call_getRoleType("5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ");

// call_addRole(acc, 2005, 1);

// call_getRole(acc);

// call_removeRole(acc);

// call_hasRole(acc);

// call_addApprover(acc, 2005, 1);

// call_isApprover(acc, 2005, 1);

// call_addParent(acc, parent);

// call_getParent(acc);

call_getBalance();

// call_getCaller();

async function test_multi_steps(contractAddr) {
    let typeObjs = await call_addRoleType(contractAddr, 1);
    await call_getRoleType(contractAddr);
}

// test_multi_steps("5FE43cBHUf7yzu7ahkAKnEpbg59xndM5PCwLaoe6GodQjsqd");