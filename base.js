// import polkadot api & libraries
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { Abi } = require('@polkadot/api-contract');
const { Bytes } = require("@polkadot/types");
const { bnToBn } = require("@polkadot/util");
const fs = require("fs");
const async = require("async");
const { resolve } = require('path');
const { stringToU8a, u8aToHex, numberToU8a, u8aToBn, u8aToString } =require('@polkadot/util');
const { Console } = require('console');
const { mnemonicGenerate } =require('@polkadot/util-crypto');

// Default accounts
global.ALICE = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
global.BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
global.CHARLIE = "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y";
global.EVE = "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw";
global.FERDIE = "5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL";
global.DAVE = "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy";
global.LUCY = "5G6qfLfLmYzDHQSysrCEPmpdsHFRq6TNUeonGpLnncgqey48";
global.JANE = "5GxJ7K3G4jo7kGhsvqeXhATPA55gRH7JQocD258yyAKuudqB";

// import contract abi
// const roleContractAbi=require("./roleContract.json");

// ex. abiPaths = ["./roleContract.json"]
exports.connect = async function(abiPaths) {
    // Initialise the provider to connect to the local node
    const provider = new WsProvider('ws://127.0.0.1:9944');

    // Create the API and wait until ready
    const api = await ApiPromise.create({ provider: provider, types: {
        "Address": "AccountId",
        "LookupSource": "AccountId",
        } 
    });

    // Init keyring for signing
    const keyring = new Keyring({ type: 'sr25519' });
    const bob=keyring.addFromUri("//Bob");
    const alice=keyring.addFromUri("//Alice");
    const charlie=keyring.addFromUri("//Charlie");
    const eve=keyring.addFromUri("//Eve");
    const ferdie=keyring.addFromUri("//Ferdie");
    const dave=keyring.addFromUri("//Dave");
    const lucy=keyring.addFromUri("trip page end true envelope armed grow swift balance excess swim kangaroo");
    const jane=keyring.addFromUri("tuition later long plastic jump churn avocado little venue truck tree rebel");

    // Create ABI obj.
    var abiArr = [];
    abiPaths.forEach((path) => {
        var contents = fs.readFileSync(path);
        var jsonContent = JSON.parse(contents);
        const abi = new Abi(api.registry, jsonContent);
        abiArr.push(abi);
    })

    // console.log(abiArr);

    return { api, abiArr, bob, alice, charlie, eve, ferdie, dave, lucy, jane };

    // let leo = keyring.addFromMnemonic("luggage group wreck cherry kiss side labor little broken little immense lottery");
    // let leo = keyring.addFromSeed([
    //   80, 228, 231,  87, 153, 203,  53,
    //   30,  75, 187, 231, 201, 221, 108,
    //  172, 241, 210, 203, 170, 194,  83,
    //  178, 197, 176,  13, 102,  36, 237,
    //  177, 247,  69, 139
    // ]);
    // console.log(jane.isLocked);
    // const pair = keyring.getPairs();
    // console.log(pair.forEach((obj) => console.log(obj.address)));

    // const mnemonic = mnemonicGenerate(12);
    // console.log(mnemonic);
    
    // Leo (name & password)
    // address: 5FWFccimrZhZW9Ex5mns3bjivGQg8FgMfjjr7GuK7QCxTaVQ
    // mnemonic: luggage group wreck cherry kiss side labor little broken little immense lottery
    // raw seed: 0x50e4e75799cb351e4bbbe7c9dd6cacf1d2cbaac253b2c5b00d6624edb1f7458b
    // const k=keyring.getPairs();
    // k.forEach((r) => {
    //   console.log(r.address);
    // })
    // const settlemwal=keyring.addFromMnemonic("someone drum rookie puzzle alone trust infant floor celery punch violin wood");
}

exports.deploy_contract = async function(api, wasmPath, deployer, codehash, addr, selector) {
    var deployedCodeHash=null;
    var contractAddress=null;
    var endowment = null;
    var from = null;

    return new Promise((resolve, reject) => {
        async.series([
            // put code
            s_callback => {
              //load wasm
              buffer=fs.readFileSync(wasmPath);
              wasmBytes=new Bytes(api.registry, [...buffer]);
      
              //put wasm
              const putTx = api.tx.contracts.putCode(wasmBytes);
      
              putTx.signAndSend(deployer, ({events=[], status}) => {
                if(status.isInBlock) {
                  console.log("putTx is in block");
      
                  events.forEach(({event, phase}) => {
                    if(event.section=="contracts" && event.method=="CodeStored") {
                      deployedCodeHash=event.data[0].toHex();
                      console.log("code stored with hash", deployedCodeHash);
                    }
                  });
      
                  s_callback(null, deployedCodeHash);
      
                } else {
                  console.log('\n', "putTx waiting to be in block");
                }
              });
      
            },
      
            //instantiate code
            s_callback => {
            //   const constructorSelector="0x5EBD88D6"; //from abi - contract>constructors[1]>selector
      
              instTx=api.tx.contracts.instantiate(bnToBn("100000000000000000"), 100000000000, deployedCodeHash, selector);
      
              instTx.signAndSend(deployer, ({events=[], status}) => {
                if(status.isInBlock) {
                  console.log("instTx is in block");
                  events.forEach(({event, phase}) => {
                    if(event.section=="contracts" && event.method=="Instantiated") {
                      contractAddress=event.data[1].toString();
                      console.log("contract deployed at ", contractAddress);
                      let returnObj = { deployedCodeHash, contractAddress }
                      resolve(returnObj);
                    }
    
                    if(event.section=="balances" && event.method=="Transfer") {
                        from=event.data[0];
                        endowment=event.data[2];
                        console.log(`contract endowment is ${endowment.toString()}`);
                        console.log(`endowment is transferred from ${from.toString()}`);
                    }
                  });
      
                  s_callback(null, contractAddress);
      
                } else {
                  console.log("instTx waiting to be in block");
                }
              });
            }
        ], (err, res) => {
            console.log(res);
            try {
                if(fs.existsSync('contract_id.json')) {
                    var data = fs.readFileSync('contract_id.json');
                    var readjson = JSON.parse(data);
                    readjson[codehash] = res[0];
                    readjson[addr] = res[1];
                    fs.writeFileSync("contract_id.json", JSON.stringify(readjson), 'utf8');
                } else {
                    var obj = {};
                    obj[codehash] = res[0];
                    obj[addr] = res[1];
    
                    var json = JSON.stringify(obj);
                    fs.writeFileSync('contract_id.json', json, 'utf8');
                }
            } catch (error) {
                console.log(error);
            }
            // process.exit();
        });
    });
}

exports.call_contract = async function(api, contract_addr, caller, method_name, selectorData) {
    const callTx=api.tx.contracts.call(contract_addr, 0, 1000000000000, selectorData);

    return new Promise((resolve, reject) => {
        let returnArr = [];
        callTx.signAndSend(caller, ({events=[], status}) => {
            if(status.isInBlock) {
            console.log(`callTx (${method_name}) is in block`);
            events.forEach(({event, phase}) => {
                console.log(phase.toString());
                console.log(event.meta.documentation.toString());
                console.log(event.toString());
                if(event.section=="contracts" && event.method=="ContractExecution") {
                    console.log("call from", event.data[0].toString(), "with event data", event.data[1].toString());
                    console.log("raw event data: ", event.data[1]);
                    returnArr.push(event.data[1].toString());
                    returnArr.push(event.data[1]);
                }
            });
            resolve(returnArr);

            } else {
            console.log('\n', `callTx (${method_name}) waiting to be in block`);
            }
        });
    });
}

exports.get_contract_addr = function getContractAddr(addrName) {
  if(fs.existsSync('../contract_id.json')) {
      var data = fs.readFileSync('../contract_id.json');
      var json = JSON.parse(data);
      return json[addrName];
  } else {
      console.log('No contract id json file!');
  }
}

exports.convert_to_char = function getChar(hexx) {
  var hex = hexx.toString();//force conversion
  var str = '';
  // Convert a Unicode number into a character
  for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

exports.u8a_to_number = function to_number(arr) {
  // let [e1,...last] = arr;
  // arr.pop();
  console.log(arr);
  let byteArr = arr.reverse();
  // console.log(Number(u8aToHex(byteArr)));
  return Number(u8aToHex(byteArr));
}

exports.parse_event_data = function parse(arr) {
  let hexStrArr = [];
  let u8aArr = [];
  for(let i = 0; i < arr.length; i++) {
    if(i % 2 == 0) {
      hexStrArr.push(arr[i]);
    } else {
      u8aArr.push(arr[i]);
    }
  }

  return [hexStrArr, u8aArr];
}