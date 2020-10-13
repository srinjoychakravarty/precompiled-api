const async = require("async");
const { Keyring } = require('@polkadot/keyring');
const fs = require("fs");
var base = require('../base.js');
const { config } = require('process');
const { parse, join } = require("path");
const { tmpdir } = require("os");
const { SSL_OP_ALL } = require("constants");

const abiPaths = ["../contracts/coreContract.json"];
const contractAddr = base.get_contract_addr('contractAddr_coreC');

async function call_create(sst_id, sst_class, amount, holding_addr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    const selector = abiArr[0].messages.create(sst_id, sst_class, amount, holding_addr);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'create()', selector);
        console.log(temp);
        let hexArr = base.parse_event_data(temp)[0];
        let byteArr = base.parse_event_data(temp)[1];
        
        let results = {};
        if(hexArr.length == 10) {
            results.caller = hexArr[6] ? keyring.encodeAddress(hexArr[6]) : "";
            results.holding_addr = hexArr[7] ? keyring.encodeAddress(hexArr[7]) : "";
            results.sst_class = byteArr[8] ? base.u8a_to_number(byteArr[8]) : "";
            results.amount = hexArr[9] ? remove_prefix(base.convert_to_char(hexArr[9])) : "";
        } else {
            console.log("Return event data number is incorrect!");
        }
        console.log(results);
        resolve(results);
    });
}

async function call_preExchange(sst_id, sst_class, amount, holding_addr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    const selector = abiArr[0].messages.preExchange(sst_id, sst_class, amount, holding_addr);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'preExchange()', selector);
        let hexArr = base.parse_event_data(temp)[0];
        let byteArr = base.parse_event_data(temp)[1];
        
        let results = {};
        if(hexArr.length == 7) {
            // results.caller = hexArr[6] ? keyring.encodeAddress(hexArr[6]) : "";
            results.holding_addr = hexArr[4] ? keyring.encodeAddress(hexArr[4]) : "";
            results.sst_class = byteArr[5] ? base.u8a_to_number(byteArr[5]) : "";
            results.amount = hexArr[6] ? remove_prefix(base.convert_to_char(hexArr[6])) : "";
        } else {
            console.log("Return event data number is incorrect!");
        }
        console.log(results);
        resolve(results);
    });
}

async function call_distribute(objArr) {
    const { api, abiArr, charlie } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    return new Promise(async(resolve, reject) => {
        let results = [];
        let sub_total = 0;
        for(let obj of objArr) {
            sub_total += parseFloat(obj.balance);
            console.log(sub_total);
            const selector = abiArr[0].messages.distribute(obj.address, obj.sst_class, obj.balance, sub_total);
            let temp = await base.call_contract(api, contractAddr, charlie, 'distribute()', selector);
            let hexArr = base.parse_event_data(temp)[0];
            let byteArr = base.parse_event_data(temp)[1];
            let result = {};
            if(hexArr.length == 7) {
                result.sub_mwal = hexArr[4] ? keyring.encodeAddress(hexArr[4]) : "";
                result.amount = hexArr[5] ? remove_prefix(base.convert_to_char(hexArr[5])) : "";
                result.sst_class = byteArr[6] ? base.u8a_to_number(byteArr[6]) : "";
                results.push(result);
            } else {
                console.log("Return event data number is incorrect!");
                return;
            }
        }
        console.log(results);
        resolve(results);
    });
}

async function call_distribute_exchange(objArr) {
    const { api, abiArr, charlie } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    return new Promise(async(resolve, reject) => {
        let results = [];
        let sub_total = 0;
        for(let obj of objArr) {
            sub_total += parseFloat(obj.balance);
            console.log(sub_total);
            const selector = abiArr[0].messages.distributeExchange(obj.address, obj.sst_class, obj.balance, sub_total);
            let temp = await base.call_contract(api, contractAddr, charlie, 'distribute_exchange()', selector);
            // console.log(temp);
            let hexArr = base.parse_event_data(temp)[0];
            let byteArr = base.parse_event_data(temp)[1];
            let result = {};
            if(hexArr.length == 3) {
                result.sub_mwal = hexArr[0] ? keyring.encodeAddress(hexArr[0]) : "";
                result.amount = hexArr[1] ? remove_prefix(base.convert_to_char(hexArr[1])) : "";
                result.sst_class = byteArr[2] ? base.u8a_to_number(byteArr[2]) : "";
                results.push(result);
            } else {
                console.log("Return event data number is incorrect!");
                return;
            }
        }
        console.log(results);
        resolve(results);
    });
}

async function call_executeTrade(objArr) {
    const { api, abiArr, jane } = await base.connect(abiPaths);
    return new Promise(async(resolve, reject) => {
        let results = [];
        for(let obj of objArr) {
            const selector = abiArr[0].messages.executeTrade(obj.session_id, obj.sst_id, obj.sst_class, obj.amount, obj.timestamp, obj.trade_type);
            let temp = await base.call_contract(api, contractAddr, jane, 'executeTrade()', selector);
            let hexArr = base.parse_event_data(temp)[0];
            let byteArr = base.parse_event_data(temp)[1];
            let result = {};
            if(hexArr.length == 8) {
                result.session_id = byteArr[3] ? base.u8a_to_number(byteArr[3]) : "";
                result.sst_class = byteArr[4] ? base.u8a_to_number(byteArr[4]) : "";
                result.amount = hexArr[5] ? remove_prefix(base.convert_to_char(hexArr[5])) : "";
                result.timestamp = hexArr[6] ? remove_prefix(base.convert_to_char(hexArr[6])) : "";
                result.trade_type = byteArr[7] ? base.u8a_to_number(byteArr[7]) : "";
                results.push(result);
            } else {
                console.log("Return event data number is incorrect!");
                return;
            }
        }
        console.log(results);
        resolve(results);
    });
}

async function call_addSettleItem(objArr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    return new Promise(async(resolve, reject) => {
        let results = [];
        let last = false;
        for(let obj of objArr) {
            if (obj == objArr[objArr.length - 1]) last = true;
            console.log(last);
            const selector = abiArr[0].messages.addSettleItem(obj.address, obj.sst_class, obj.balance, last);
            let temp = await base.call_contract(api, contractAddr, bob, 'addSettleItem()', selector);
            let hexArr = base.parse_event_data(temp)[0];
            let byteArr = base.parse_event_data(temp)[1];
            let result = {};
            if(hexArr.length == 3) {
                result.sub_mwal = hexArr[0] ? keyring.encodeAddress(hexArr[0]) : "";
                result.amount = hexArr[1] ? remove_prefix(base.convert_to_char(hexArr[1])) : "";
                result.sst_class = byteArr[2] ? base.u8a_to_number(byteArr[2]) : "";
                results.push(result);
            } else {
                console.log("Return event data number is incorrect!");
                return;
            }
        }
        console.log(results);
        resolve(results);
    });
}

async function call_settleMWALs(session_id) {
    const { api, abiArr, lucy } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.settleMwaLs(session_id);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, lucy, 'settleMWALs()', selector);
        const keyring = new Keyring({ type: 'sr25519' });
        let hexArr = base.parse_event_data(temp)[0];
        let byteArr = base.parse_event_data(temp)[1];
        let results = [];
        for(let i = 3; i < hexArr.length - 1;) {
            let result = {};
            result.session_id = byteArr[i] ? base.u8a_to_number(byteArr[i]) : "";
            result.sub_mwal = hexArr[i+1] ? keyring.encodeAddress(hexArr[i+1]) : "";
            result.sst_class = byteArr[i+2] ? base.u8a_to_number(byteArr[i+2]) : "";
            result.amount = hexArr[i+3] ? remove_prefix(base.convert_to_char(hexArr[i+3])) : "";
            results.push(result);
            i += 4;
        }
        console.log(results);
        resolve(results);
    });
}

async function call_transferToOther(sst_id, sst_class, from_amount, to_amount, to, from) {
    const { api, abiArr, eve } = await base.connect(abiPaths);
    console.log(eve.address);
    const selector = abiArr[0].messages.transferToOther(sst_id, sst_class, from_amount, to_amount, to, from);
    return new Promise((resolve, reject) => {
        base.call_contract(api, contractAddr, eve, 'transferToOther()', selector)
        .then((temp) => {
            console.log(temp);
            let byteArr = base.parse_event_data(temp)[1];

            if(byteArr.length == 5) {
                let pt_id = byteArr[4] ? base.u8a_to_number(byteArr[4]) : "";
                resolve(pt_id);
            } else {
                console.log("Return event data number is incorrect!");
                return;
            }
        });
    });
}

async function call_cancelTransferToOther(pt_id) {
    const { api, abiArr, eve } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.cancelTransferToOther(pt_id);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, eve, 'cancelTransferToOther()', selector);
        let byteArr = base.parse_event_data(temp)[1];
        let result = {};
        if(byteArr.length == 4) {
            result.cancel_ptId = byteArr[3] ? base.u8a_to_number(byteArr[3]) : "";
        } else {
            console.log("Return event data number is incorrect!");
            return;
        }
        console.log(result);
        resolve(result);
    });
}

async function call_approveTransferToOther(pt_id, func_name, stage, approver, last) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    const selector = abiArr[0].messages.approveTransferToOther(pt_id, func_name, stage);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, approver, 'approveTransferToOther()', selector);
        let hexArr = base.parse_event_data(temp)[0];
        let byteArr = base.parse_event_data(temp)[1];
        let results = {};

        if(!last) {
            results.pt_id = byteArr[4] ? base.u8a_to_number(byteArr[4]) : "";
            results.func_name = byteArr[5] ? base.u8a_to_number(byteArr[5]) : "";
            results.stage = byteArr[6] ? base.u8a_to_number(byteArr[6]) : "";
            results.state = hexArr[7] ? base.convert_to_char(hexArr[7]) : "";
            console.log(results);
        } else {
            results.from = keyring.encodeAddress(hexArr[4]);
            results.to = keyring.encodeAddress(hexArr[5]);
            results.from_amount = hexArr[6] ? remove_prefix(base.convert_to_char(hexArr[6])) : "";
            results.to_amount = hexArr[7] ? remove_prefix(base.convert_to_char(hexArr[7])) : "";
            results.pt_id = byteArr[9] ? base.u8a_to_number(byteArr[9]) : "";
            results.func_name = byteArr[10] ? base.u8a_to_number(byteArr[10]) : "";
            results.stage = byteArr[11] ? base.u8a_to_number(byteArr[11]) : "";
            results.state = hexArr[12] ? base.convert_to_char(hexArr[12]) : "";
            console.log(results);
        }

        resolve(results);
    });
}

async function call_getDistribution() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    const selector = abiArr[0].messages.getDistribution();
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'getDistribution()', selector);
        let hexArr = base.parse_event_data(temp)[0];
        let byteArr = base.parse_event_data(temp)[1];
        let results = [];
        for(let i = 0; i < hexArr.length - 1;) {
            let result = {};
            result.sub_mwal = hexArr[i] ? keyring.encodeAddress(hexArr[i]) : "";
            result.sst_class = byteArr[i+1] ? base.u8a_to_number(byteArr[i+1]) : "";
            result.amount = hexArr[i+2] ? remove_prefix(base.convert_to_char(hexArr[i+2])) : "";
            results.push(result);
            i += 3;
        }
        console.log(results);
        resolve(results);
    });
}

async function call_getSettleItems() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    const selector = abiArr[0].messages.getSettleItems();
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'getSettleItems()', selector);
        let hexArr = base.parse_event_data(temp)[0];
        let byteArr = base.parse_event_data(temp)[1];
        let results = [];
        for(let i = 0; i < hexArr.length - 1;) {
            let result = {};
            result.sub_mwal = hexArr[i] ? keyring.encodeAddress(hexArr[i]) : "";
            result.sst_class = byteArr[i+1] ? base.u8a_to_number(byteArr[i+1]) : "";
            result.amount = hexArr[i+2] ? remove_prefix(base.convert_to_char(hexArr[i+2])) : "";
            results.push(result);
            i += 3;
        }
    
        console.log(results);
        resolve(results);
    });
}

async function call_getSettlements(session_id) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    const selector = abiArr[0].messages.getSettlements(session_id);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'getSettlements()', selector);
        let hexArr = base.parse_event_data(temp)[0];
        let results = [];
        for(let i = 0; i < hexArr.length - 1;) {
            let result = {};
            result.sub_mwal = hexArr[i] ? keyring.encodeAddress(hexArr[i]) : "";
            result.amount = hexArr[i+1] ? remove_prefix(base.convert_to_char(hexArr[i+1])) : "";
            results.push(result);
            i += 2;
        }
        console.log(results);
        resolve(results);
    });
}

async function call_getPendingTransfer(pt_id) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    const selector = abiArr[0].messages.getPendingTransfer(pt_id);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'getPendingTransfer()', selector);
        console.log(temp);
        let hexArr = base.parse_event_data(temp)[0];
        let byteArr = base.parse_event_data(temp)[1];
        let results = {};
        if(hexArr.length == 5) {
            results.pt_id = byteArr[0] ? base.u8a_to_number(byteArr[0]) : "";
            results.to = hexArr[1] ? keyring.encodeAddress(hexArr[1]) : "";
            results.from = hexArr[2] ? keyring.encodeAddress(hexArr[2]) : "";
            results.from_amount = hexArr[3] ? remove_prefix(base.convert_to_char(hexArr[3])) : "";
            results.to_amount = hexArr[4] ? remove_prefix(base.convert_to_char(hexArr[4])) : "";
        } else {
            console.log("Return event data number is incorrect!");
            return;
        }
        console.log(results);
        resolve(results);
    });
}

async function call_getExecuteTrade(session_id) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.getExecuteTrade(session_id);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'getExecuteTrade()', selector);
        console.log(temp);
        let hexArr = base.parse_event_data(temp)[0];
        let byteArr = base.parse_event_data(temp)[1];
        let results = {};
        if(hexArr.length == 6) {
            results.session_id = byteArr[0] ? base.u8a_to_number(byteArr[0]) : "";
            results.sst_id = hexArr[1] ? remove_prefix(base.convert_to_char(hexArr[1])) : "";
            results.sst_class = byteArr[2] ? base.u8a_to_number(byteArr[2]) : "";
            results.amount = hexArr[3] ? remove_prefix(base.convert_to_char(hexArr[3])) : "";
            results.timestamp = hexArr[4] ? remove_prefix(base.convert_to_char(hexArr[4])) : "";
            results.trade_type = byteArr[5] ? base.u8a_to_number(byteArr[5]) : "";
        } else {
            console.log("Return event data number is incorrect!");
            return;
        }
        console.log(results);
        resolve(results);
    });
}

async function call_checkPendingConfirmations(pt_id) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.checkPendingConfirmations(pt_id);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'checkPendingConfirmations()', selector);
        let byteArr = base.parse_event_data(temp)[1];
        let result = {};
        if(byteArr.length == 1) {
            result.pending_confirms = byteArr[0] ? base.u8a_to_number(byteArr[0]) : "";
            console.log(result);
            resolve(result);
        } else {
            console.log("Return event data number is incorrect!");
            return;
        }
    });
}

async function call_checkConfirmation(pt_id) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    const selector = abiArr[0].messages.checkConfirmation(pt_id);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'checkConfirmation()', selector);
        let hexArr = base.parse_event_data(temp)[0];
        let byteArr = base.parse_event_data(temp)[1];
        let results = [];
        for(let i = 0; i < hexArr.length - 1;) {
            let result = {};
            result.func_name = byteArr[i] ? base.u8a_to_number(byteArr[i]) : "";
            result.stage = byteArr[i+1] ? base.u8a_to_number(byteArr[i+1]) : "";
            result.approver = hexArr[i+2] ? keyring.encodeAddress(hexArr[i+2]) : "";
            results.push(result);
            i += 3;
        }
        console.log(results);
        resolve(results);
    });
}

async function call_getGwal(addr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.getGwal(addr);
    
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'getGwal()', selector);
        let hexArr = base.parse_event_data(temp)[0];
        let result = hexArr[0] ? remove_prefix(base.convert_to_char(hexArr[0])) : "";
        console.log(result);
        resolve(result);
    });
}

async function call_get_len(array_name) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.getLen(array_name);
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'get_len()', selector);
        let byteArr = base.parse_event_data(temp)[1];
        let result = {};
        if(byteArr.length == 1) {
            result.length = byteArr[0] ? base.u8a_to_number(byteArr[0]) : "";
        } else {
            console.log("Return event data number is incorrect!");
            return;
        }
        console.log(result);
        resolve(result);
    });
}

async function call_checkState() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.checkState();
    return new Promise(async(resolve, reject) => {
        let temp = await base.call_contract(api, contractAddr, bob, 'checkState()', selector);
        let hexArr = base.parse_event_data(temp)[0];
        let byteArr = base.parse_event_data(temp)[1];
        let results = {};
        if(hexArr.length == 3) {
            results.state = byteArr[0] ? base.u8a_to_number(byteArr[0]) : "";
            results.symbol = hexArr[1] ? remove_prefix(base.convert_to_char(hexArr[1])) : "";
            results.pt_id = byteArr[2] ? base.u8a_to_number(byteArr[2]) : "";
        } else {
            console.log("Return event data number is incorrect!");
            return;
        }
        console.log(results);
        resolve(results);
    });
}

async function call_reset() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[0].messages.reset();
    let results = await base.call_contract(api, contractAddr, bob, 'reset()', selector);
    console.log(results);
    return results;
}

function preproccess(path, sstClass, digits, isExchange) {
    var contents = fs.readFileSync(path);
    var jsonContent = JSON.parse(contents);
    jsonContent.forEach((obj) => {
        obj.sst_class = sstClass;
    });
    str_to_float(jsonContent);
    if(isExchange) {
        let neg = jsonContent.filter((obj) => {
            return obj.balance < 0;
        });
        let pos = jsonContent.filter((obj) => {
            return obj.balance >= 0;
        });

        console.log(neg);
        console.log(pos);
        let total = Math.abs(sum(neg)).toFixed(digits);
        console.log("Total amount to sell: " + total);

        return {total, neg, pos};
    }
    console.log(jsonContent);
    let total = sum(jsonContent).toFixed(digits);
    console.log("Total amount to create: " + total);

    return total;
}

function getSettleObjs(path, sstClass) {
    var contents = fs.readFileSync(path);
    var jsonContent = JSON.parse(contents);
    jsonContent.forEach((obj) => {
        obj.sst_class = sstClass;
    });
    
    return jsonContent;
}

async function getTransferToOtherObjs(sst_id, holding_addr, settleObjs, digits) {
    return new Promise(async(resolve, reject) => {
        let holding_amount = await call_getGwal(holding_addr);
        // let pro = holding_amount.split("");
        // pro.shift();
        // pro.shift();
        // let new_pro = pro.join("");
        let parsed_holding_amount = parseFloat(holding_amount);
        console.log("parsed_holding_amount: " + parsed_holding_amount);
        
        settleObjs.forEach((obj) => {
            let amount = parseFloat(obj.balance);
            parsed_holding_amount -= amount;
            obj.id = sst_id;
            obj.from = holding_addr;
            obj.from_amount = parsed_holding_amount.toFixed(digits).toString();
        });

        console.log(settleObjs);
    
        resolve(settleObjs);
    });
}

function remove_prefix(str) {
    let temp = str.split("");
    temp.shift();
    temp.shift();
    return temp.join("");
}

function str_to_float(arr) {
    arr.forEach(obj => {
        obj.balance = parseFloat(obj.balance);
    });
}

function float_to_str(arr) {
    arr.forEach(obj => {
        obj.balance = obj.balance.toString();
    });
}

function sum(arr) {
    let sum = 0;
    arr.forEach(obj => {
        sum += obj.balance;
    });
    return sum;
}

// let settleObjs = [{
//         sub_mwal: SUB1,
//         class: 2,
//         amount: "2.78334518"
//     },
//     {
//         sub_mwal: SUB2,
//         class: 2,
//         amount: "0.35026383"
//     }];

// let objs = [{
//         id: 10,
//         from: ALICE,
//         to: SUB1,
//         class: 2,
//         from_amount: "0.35026383",
//         to_amount: "2.78334518",
//     },
//     {
//         id: 10,
//         from: ALICE,
//         to: SUB2,
//         class: 2,
//         from_amount: "0.00000000",
//         to_amount: "0.35026383"
//     }];

// Test functions

const sstId = "MBR";
const sstClass = 2;
const sessionId = 3;
const rawdataPath = "../settle-raw-data/pre_settle_data_1.json";

// let executeTradeObjs = [{
//     session_id: 7,
//     sst_id: sstId,
//     sst_class: sstClass,
//     amount: 100,
//     timestamp: Date.now(),
//     trade_type: 0,
// },
// {
//     session_id: 8,
//     sst_id: sstId,
//     sst_class: sstClass,
//     amount: 50,
//     timestamp: Date.now(),
//     trade_type: 1,
// }]

async function test_multiple_transferToOther() {
    let settleArr = getSettleObjs(rawdataPath, sstClass);
    let tranObjArr = await getTransferToOtherObjs(sstId, ALICE, settleArr, 8);
    console.log(tranObjArr);

    let results = [];
    for(let obj of tranObjArr) {
        let result = await call_transferToOther(obj.id, obj.sst_class, obj.from_amount, obj.balance, obj.address, obj.from);
        results.push(result);
    }

    console.log(results);
}

async function test_single_transferToOther() {
    // let results = [];
    // let result = await call_transferToOther(obj.id, obj.class, obj.from_amount, obj.to_amount, obj.to, obj.from);
    const { api, abiArr, eve, ferdie, alice } = await base.connect(abiPaths);
    let settleArr = getSettleObjs(rawdataPath, sstClass);
    let obj = await getTransferToOtherObjs(sstId, ALICE, settleArr, 8);
    // console.log(obj[0].id, obj[0].sst_class, obj[0].from_amount, obj[0].balance, obj[0].address, obj[0].from);
    let result = await call_transferToOther(obj[0].id, obj[0].sst_class, obj[0].from_amount, obj[0].balance, obj[0].address, obj[0].from);
    // let result = await call_approveTransferToOther(2, 2008, 0, eve);
    // let result = await call_approveTransferToOther(0, 2009, 1, ferdie);
    // let result = await call_approveTransferToOther(0, 2010, 2, alice);
    
    // let result = await call_getGwal(ALICE);
    // let result = await call_getSettleItems();
    console.log(result);
    
}

async function test_single_round() {
    // test single round of transferToOther and approvals process
    const { api, abiArr, eve, ferdie, dave } = await base.connect(abiPaths);
    let settleArr = getSettleObjs(rawdataPath, sstClass);
    let obj = await getTransferToOtherObjs(sstId, ALICE, settleArr, 8);
    let index = 10;
    let results = {};
    let pt_id = await call_transferToOther(obj[index].id, obj[index].sst_class, obj[index].from_amount, obj[index].balance, obj[index].address, obj[index].from);
    // console.log("new pt_id: " + pt_id);
    // pt_id -= 1;
    console.log("pt_id: " + pt_id);
    console.log("to: " + obj[index].address);
    console.log("balance: " + obj[index].balance);
    let result_1 = await call_approveTransferToOther(pt_id, 2008, 0, eve, false);
    let result_2 = await call_approveTransferToOther(pt_id, 2009, 1, ferdie, false);
    let result_3 = await call_approveTransferToOther(pt_id, 2010, 2, dave, true);
    results.ptId = pt_id;
    results.confirm_1 = result_1;
    results.confirm_2 = result_2;
    results.confirm_3 = result_3;

    console.log(results);
}

async function test_multiple_rounds() {
    // test multiple rounds of transferToOther and approvals process
    const { api, abiArr, eve, ferdie, dave } = await base.connect(abiPaths);
    let settleArr = getSettleObjs(rawdataPath, sstClass);
    let objArr = await getTransferToOtherObjs(sstId, ALICE, settleArr, 8);
    let results = [];
    for(let obj of objArr) {
        let pt_id = await call_transferToOther(obj.id, obj.sst_class, obj.from_amount, obj.balance, obj.address, obj.from);
        // var repl = temp.replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
        // let pt_id = Number(repl).toString();
        console.log("pt_id: " + pt_id);
        console.log("to: " + obj.address);
        console.log("balance: " + obj.balance);
        let result_1 = await call_approveTransferToOther(pt_id, 2008, 0, eve, false);
        let result_2 = await call_approveTransferToOther(pt_id, 2009, 1, ferdie, false);
        let result_3 = await call_approveTransferToOther(pt_id, 2010, 2, dave, true);
        let result = {};
        result.ptId = pt_id;
        result.confirm_1 = result_1;
        result.confirm_2 = result_2;
        result.confirm_3 = result_3;
        results.push(result);
    }

    console.log(results);
}

async function test_full_steps(path, session_id, sst_id, sst_class, holding_addr) {
    let total = preproccess(path, sst_class, 8, false);
    // let {total, neg, pos} = preproccess(path, sst_class, 8, true);
    // console.log(total);
    let createdObj = await call_create(sst_id, sst_class, total, holding_addr);
    let settleArr = getSettleObjs(path, sst_class);
    console.log(settleArr.length);
    let settleObjs = await call_addSettleItem(settleArr);
    let settlement = await call_settleMWALs(session_id);
    await call_getSettleItems();
    await call_getSettlements(session_id);
    let distributeObjs = await call_distribute(settleArr);
    await call_getDistribution();

    const { eve, ferdie, dave } = await base.connect(abiPaths);
    let objArr = await getTransferToOtherObjs(sst_id, holding_addr, settleArr, 8);
    let results = [];
    for(let obj of objArr) {
        let pt_id = await call_transferToOther(obj.id, obj.sst_class, obj.from_amount, obj.balance, obj.address, obj.from);
        console.log("pt_id: " + pt_id);
        console.log("to: " + obj.address);
        console.log("balance: " + obj.balance);
        let result_1 = await call_approveTransferToOther(pt_id, 2008, 0, eve, false);
        let result_2 = await call_approveTransferToOther(pt_id, 2009, 1, ferdie, false);
        let result_3 = await call_approveTransferToOther(pt_id, 2010, 2, dave, true);
        let result = {};
        result.ptId = pt_id;
        result.confirm_1 = result_1;
        result.confirm_2 = result_2;
        result.confirm_3 = result_3;
        results.push(result);
    }

    console.log(results);

    var contents = fs.readFileSync("../output/execute_trade_objs.json");
    var executeTradeObjs = JSON.parse(contents);
    console.log(executeTradeObjs);
    let etObjs = await call_executeTrade(executeTradeObjs);
    await call_getExecuteTrade(10);
}

async function test_exchange_steps(path, session_id, sst_id, sst_class, holding_addr) {
    let {total, neg, pos} = preproccess(path, sst_class, 8, true);
    // let createdObj = await call_create(sst_id, sst_class, total, holding_addr);
    // call_reset();
    // let preExObj = await call_preExchange(sst_id, sst_class, total, holding_addr);
    let settleArr = getSettleObjs(path, sst_class);

    console.log(settleArr.length);
    // let settleObjs = await call_addSettleItem(settleArr);
    // let settlement = await call_settleMWALs(session_id);
    // await call_getSettleItems();
    // await call_getSettlements(session_id);

    // let distributeObjs = await call_distribute_exchange(settleArr);
    // await call_getDistribution();

    const { eve, ferdie, dave } = await base.connect(abiPaths);
    let objArr = await getTransferToOtherObjs(sst_id, holding_addr, pos, 8);
    let results = [];
    for(let obj of objArr) {
        let pt_id = await call_transferToOther(obj.id, obj.sst_class, obj.from_amount, obj.balance, obj.address, obj.from);
        console.log("pt_id: " + pt_id);
        console.log("to: " + obj.address);
        console.log("balance: " + obj.balance);
        let result_1 = await call_approveTransferToOther(pt_id, 2008, 0, eve, false);
        let result_2 = await call_approveTransferToOther(pt_id, 2009, 1, ferdie, false);
        let result_3 = await call_approveTransferToOther(pt_id, 2010, 2, dave, true);
        let result = {};
        result.ptId = pt_id;
        result.confirm_1 = result_1;
        result.confirm_2 = result_2;
        result.confirm_3 = result_3;
        results.push(result);
    }

    console.log(results);

    // var contents = fs.readFileSync("../output/execute_trade_objs.json");
    // var executeTradeObjs = JSON.parse(contents);
    // // console.log(executeTradeObjs);
    // let etObjs = await call_executeTrade(executeTradeObjs);
    // await call_getExecuteTrade(10);
}

// call_reset();
// test_single_transferToOther();
// test_single_round();
// call_cancelTransferToOther(1);
// test_multiple_rounds();
// test_full_steps(rawdataPath, sessionId, sstId, sstClass, ALICE);
test_exchange_steps(rawdataPath, sessionId, sstId, sstClass, ALICE);
// test_multiple_transferToOther();

// let total = preproccess("../settle-raw-data/pre_settle_data_2.json", 8);
// console.log(total);
// call_create(sstId, sstClass, total, ALICE);
// console.log(base.convert_to_char("0x303132382e3030303130303030"));
// console.log(parseInt("0x02"));

// console.log(base.convert_to_char("0x303132382e3030303130303030"));

// let settleArr = getSettleObjs("./settle-raw-data/pre_settle_data_2.json", sstClass);
// let tranObjArr = getTransferToOtherObjs(sstId, ALICE, settleArr, 8);
// console.log(tranObjArr);

// call_addSettleItem(settleArr);
// console.log(remove_prefix("\u0000(0.56297803"));

// console.log(base.convert_to_char("0x28322e3639373231383534"));

// call_getSettleItems();
// call_get_len("settle_items");

// call_settleMWALs(sessionId);

// call_getSettlements(sessionId);

// call_distribute(settleArr);
// call_getDistribution();
// console.log(base.convert_to_char("0x4c28332e323238363130353228312e353030313238383028302e313130393736363728332e38303736373034312c34342e323437343935353428312e373731333839343828312e393731353935313228302e303238343034383854302e3030303034333331303030303030303030303028302e383839303233333328302e303030303536363928312e323738303135333528322e343939383731323028362e39353037313933372c34382e383031373835303928312e373231393834363528332e313932333239353928352e343337303231393728302e3536323937383033"));

// call_getPendingTransfer(0);

// call_checkPendingConfirmations(0);

// call_checkConfirmation(0);

// call_executeTrade(executeTradeObjs);
// console.log(Date.now());

// call_getGwal(ALICE);

// call_checkState();
// console.log(parseInt("0x7da"));
// console.log(Number(2008).toString(16));