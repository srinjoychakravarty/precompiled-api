const async = require("async");
const fs = require("fs");
var base = require('./base.js');
const { config } = require('process');

const abiPaths = ["./contracts/roleContract.json", "./contracts/accContract.json", "./contracts/regtrSSTContract.json", "./contracts/coreContract.json"];
const wasmPaths = ["./contracts/roleContract.wasm", "./contracts/accContract.wasm", "./contracts/regtrSSTContract.wasm", "./contracts/coreContract.wasm"];

async function init() {
    // Deploy all contracts and save into contract_id.json
    const { api, abiArr, bob } = await base.connect(abiPaths);
    let c1 = await base.deploy_contract(api, wasmPaths[0], bob, 'codehash_roleC', 'contractAddr_roleC', "0x5EBD88D6");
    let c2 = await base.deploy_contract(api, wasmPaths[1], bob, 'codehash_accountC', 'contractAddr_accountC', "0x5EBD88D6");
    let c3 = await base.deploy_contract(api, wasmPaths[2], bob, 'codehash_regtrC', 'contractAddr_regtrC', "0x5EBD88D6");
    let c4 = await base.deploy_contract(api, wasmPaths[3], bob, 'codehash_coreC', 'contractAddr_coreC', "0x5EBD88D6");
    
    return { c1, c2, c3, c4 };
}

async function call_addRoleType() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const contractAddr = getContractAddr('contractAddr_roleC');
    const selector = abiArr[0].messages.addRoleType([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 1);
    let results = await base.call_contract(api, contractAddr, bob, 'addRoleType()', selector);
    // console.log(results);
    return results;
}

async function call_getRoleType() {
    const { api, abiArr, bob } = await base.connect(abiPaths);
    const contractAddr = getContractAddr('contractAddr_roleC');
    const selector = abiArr[0].messages.getRoleType([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    let results = await base.call_contract(api, contractAddr, bob, 'getRoleType()', selector);
    console.log(results);
    return results;
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

init();

// call_addRoleType();
// call_getRoleType();
// console.log(getContractAddr('contractAddr_regtrC'));