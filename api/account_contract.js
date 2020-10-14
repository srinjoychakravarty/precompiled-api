const async = require("async");
const fs = require("fs");
var base = require('../base.js');
const { Console } = require("console");
const { Keyring } = require('@polkadot/keyring');

const abiPaths = ["../contracts/roleContract.json", "../contracts/accContract.json", "../contracts/regtrSSTContract.json", "../contracts/coreContract.json"];
const contractAddr = base.get_contract_addr('contractAddr_accountC');

async function call_grantAccountType(objArr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    return new Promise(async(resolve, reject) => {
        let results = [];
        for(let obj of objArr) {
            const selector = abiArr[1].messages.grantAccountType(obj.addr, obj.type);
            let temp = await base.call_contract(api, contractAddr, bob, 'grantAccountType()', selector);
            let hexArr = base.parse_event_data(temp)[0];
            let byteArr = base.parse_event_data(temp)[1];
            let result = {};
            result.caller = keyring.encodeAddress(hexArr[4]);
            result.register_account = keyring.encodeAddress(hexArr[2]);
            result.register_type = base.u8a_to_number(byteArr[3]);
            results.push(result);
        }
        console.log(results);
        resolve(results);
    });
}

async function call_getAccountType(objArr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    return new Promise(async(resolve, reject) => {
        let results = [];
        for(let obj of objArr) {
            const selector = abiArr[1].messages.getAccountType(obj.addr);
            let temp = await base.call_contract(api, contractAddr, bob, 'getAccountType()', selector);
            let result = {};
            result.address = obj.addr;
            result.roleType = base.u8a_to_number(temp[1]);
            results.push(result);
        }
        console.log(results);
        resolve(results);
    });
}

// Need to parse result data
async function call_grantAddressRole(objArr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    return new Promise(async(resolve, reject) => {
        let results = [];
        for(let obj of objArr) {
            const selector = abiArr[1].messages.grantAddressRole(obj.addr, obj.func_name, obj.permission);
            let temp = await base.call_contract(api, contractAddr, bob, 'grantAddressRole()', selector);
            let hexArr = base.parse_event_data(temp)[0];
            let byteArr = base.parse_event_data(temp)[1];
            let result = {};
            result.func_name = base.u8a_to_number(byteArr[2]);
            result.permission = base.u8a_to_number(byteArr[3]);
            results.push(result);
        }
        console.log(results);
        resolve(results);
    });
}

// Need to parse result data
async function call_getAccountRole(objArr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    return new Promise(async(resolve, reject) => {
        let results = [];
        for(let obj of objArr) {
            const selector = abiArr[1].messages.getAccountRole(obj.addr);
            let temp = await base.call_contract(api, contractAddr, bob, 'getAccountRole()', selector);
            let hexArr = base.parse_event_data(temp)[0];
            let byteArr = base.parse_event_data(temp)[1];
            let result = {};
            result.func_name = base.u8a_to_number(byteArr[0]);
            result.permission = base.u8a_to_number(byteArr[1]);
            results.push(result);
        }
        console.log(results);
        resolve(results);
    });
}

async function call_removeAddressRole(objArr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    let results = [];
    for(let obj of objArr) {
        const selector = abiArr[1].messages.removeAddressRole(obj.addr);
        let temp = await base.call_contract(api, contractAddr, bob, 'removeAddressRole()', selector);
        let byteArr = base.parse_event_data(temp)[1];
        let result = {};
        result.address = obj.addr;
        result.func_name = base.u8a_to_number(byteArr[0]);
        results.push(result);
    }
    console.log(results);
    return results;
}

async function call_doesAccountHaveRole(objArr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    return new Promise(async(resolve, reject) => {
        let results = [];
        for(let obj of objArr) {
            const selector = abiArr[1].messages.doesAccountHaveRole(obj.addr);
            let temp = await base.call_contract(api, contractAddr, bob, 'doesAccountHaveRole()', selector);
            let byteArr = base.parse_event_data(temp)[1];
            let result = {};
            result.address = obj.addr;
            result.hasRole = base.u8a_to_number(byteArr[0]) == 1 ? true : false;
            results.push(result);
        }
        console.log(results);
        resolve(results);
    });
}

// Need to parse result data
async function call_registerRoleApprovalAddress(objArr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    return new Promise(async(resolve, reject) => {
        let results = [];
        for(let obj of objArr) {
            const selector = abiArr[1].messages.registerRoleApprovalAddress(obj.addr, obj.func_name, obj.stage);
            let temp = await base.call_contract(api, contractAddr, bob, 'registerRoleApprovalAddress()', selector);
            let hexArr = base.parse_event_data(temp)[0];
            let byteArr = base.parse_event_data(temp)[1];
            let result = {};
            result.func_name = base.u8a_to_number(byteArr[1]);
            result.stage = base.u8a_to_number(byteArr[2]);
            results.push(result);
        }
        console.log(results);
        resolve(results);
    });
}

async function call_isApprovalAddress(objArr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    return new Promise(async(resolve, reject) => {
        let results = [];
        for(let obj of objArr) {
            const selector = abiArr[1].messages.isApprovalAddress(obj.addr, obj.func_name, obj.stage);
            let temp = await base.call_contract(api, contractAddr, bob, 'isApprovalAddress()', selector);
            let byteArr = base.parse_event_data(temp)[1];
            let result = {};
            result.address = obj.addr;
            result.func_name = obj.func_name;
            result.stage = obj.stage;
            result.isApprover = base.u8a_to_number(byteArr[0]) == 1 ? true : false;
            results.push(result);
        }
        console.log(results);
        resolve(results);
    });
}

async function call_getAccountParent(objArr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const keyring = new Keyring({ type: 'sr25519' });
    return new Promise(async(resolve, reject) => {
        let results = [];
        for(let obj of objArr) {
            const selector = abiArr[1].messages.getAccountParent(obj.addr);
            let temp = await base.call_contract(api, contractAddr, bob, 'getAccountParent()', selector);
            let byteArr = base.parse_event_data(temp)[1];
            let result = {};
            result.address = obj.addr;
            result.parentAddr = keyring.encodeAddress(byteArr[0]);
            results.push(result);
        }
        console.log(results);
        resolve(results);
    });
}

async function call_getBalance() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const selector = abiArr[1].messages.getBalance();
    let temp = await base.call_contract(api, contractAddr, bob, 'getBalance()', selector);
    let byteArr = base.parse_event_data(temp)[1];
    let results = {};
    results.balance = base.u8a_to_number(byteArr[0]);
    console.log(results);
    return results;
}

// Transfer 1 unit coin to default accounts
async function default_transfer(addr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);

    // transfer() accepts max 16 digits as value
    const txHash = await api.tx.balances
        .transfer(addr, 1000000000000000)
        .signAndSend(bob);
    
    // Show the hash
    console.log(`Submitted with hash ${txHash}`);
    return txHash;
}

// Check balance of default accounts
async function get_account_balance(addr) {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const { nonce, data: balance } = await api.query.system.account(addr);
    console.log(`${addr}'s balance of ${balance.free} and a nonce of ${nonce}`);
}

let roleObjs = [{
        addr: ALICE,
        type: 2,
        func_name: 2002,
        permission: 1
    },
    {
        addr: CHARLIE,
        type: 2,
        func_name: 2006,
        permission: 1
    },
    {
        addr: EVE,
        type: 2,
        func_name: 2008,
        permission: 1
    },
    {
        addr: FERDIE,
        type: 2,
        func_name: 2009,
        permission: 1
    },
    {
        addr: DAVE,
        type: 2,
        func_name: 2010,
        permission: 1
    },
    {
        addr: LUCY,
        type: 2, 
        func_name: 2005,
        permission: 1
    },
    {
        addr: JANE,
        type: 2, 
        func_name: 2004,
        permission: 1
    }];

let roleObjs2 = [{
    addr: ALICE,
    type: 2,
    func_name: 2004,
    permission: 1
}];

let approverObjs = [{
        addr: EVE,
        func_name: 2008,
        stage: 0,
    },
    {
        addr: FERDIE,
        func_name: 2009,
        stage: 1,
    },
    {
        addr: DAVE,
        func_name: 2010,
        stage: 2,
    }];

async function test_multiple_set() {
    let typeObjs = await call_grantAccountType(roleObjs);
    await call_getAccountType(roleObjs);

    let role_objs = await call_grantAddressRole(roleObjs);
    await call_getAccountRole(roleObjs);

    let apprvObjs = await call_registerRoleApprovalAddress(approverObjs);
    await call_isApprovalAddress(approverObjs);
    await call_getAccountParent(approverObjs);
}

async function test_change_role() {
    let removeObjs = await call_removeAddressRole(roleObjs2);
    let roleObjs = await call_grantAddressRole(roleObjs2);
}

//test_multiple_set();

// test_change_role();

// default_transfer(JANE);
get_account_balance(ALICE);
get_account_balance(BOB);

// call_removeAddressRole(roleObjs2);

// call_grantAccountType(roleObjs);
// call_grantAccountType(roleObjs2);

// call_getAccountType(roleObjs);
// call_getAccountType(roleObjs2);

// call_grantAddressRole(roleObjs);
// call_grantAddressRole(roleObjs2);

// need to convert event data to correct number
// call_getAccountRole(roleObjs);

// call_registerRoleApprovalAddress(approverObjs);
// call_registerRoleApprovalAddress(approverObjs2);

// need to add event data in role contract
// call_doesAccountHaveRole(roleObjs);
// call_doesAccountHaveRole(roleObjs2);

// need to add event data in role contract
// call_isApprovalAddress(approverObjs);
// call_isApprovalAddress(approverObjs2);
