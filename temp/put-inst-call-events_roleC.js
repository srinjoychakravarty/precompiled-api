// Required imports
const ATTACH_BLOCK_LOGGING=true;
const ATTACH_EVENTS_LOGGING=false;

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { Abi, PromiseContract } = require('@polkadot/api-contract');
const { Bytes } = require("@polkadot/types");
const { compactAddLength, bnFromHex, bnToBn } = require("@polkadot/util");
const fs = require("fs");
const async=require("async");

// const flipperAbi=require("./roleContract.json");

async function main() {

  // Initialise the provider to connect to the local node
  const provider = new WsProvider('ws://127.0.0.1:9944');

  const BOB="5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider: provider, types: {
      "Address": "AccountId",
      "LookupSource": "AccountId"
    } });

  const keyring = new Keyring({ type: 'sr25519' });
  let pubkey = keyring.decodeAddress('5FrTWBjQq12aFxZNj58anGgv62qTygDKW7rr5QMQRJxtK1xh');
  console.log(pubkey);
  let addr = keyring.encodeAddress("0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d");
  console.log(addr);
  // let bal = "0x00008a5d784563010000000000000000";
  // console.log(parseInt(Number(bal), 10));
  const alice=keyring.addFromUri("//Alice");
  console.log(`alice's address: ${alice.address}`);
  console.log(`alice's pub key: ${alice.publicKey}`);
  // console.log(parseInt(Number("0xe903000000000000000000000000000001000000"), 10));

  var contents = fs.readFileSync("../contracts/roleContract.json");
  var jsonContent = JSON.parse(contents);
  const abi = new Abi(api.registry, jsonContent);

  // Retrieve the chain & node information information via rpc calls
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version()
  ]);

  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);

  if(ATTACH_BLOCK_LOGGING) {
    const unsubscribe = await api.rpc.chain.subscribeNewHeads((header) => {
      console.log(`Chain is at block: #${header.number}`);
    });
  }

  if(ATTACH_EVENTS_LOGGING) {
    api.query.system.events((events) => {
      console.log(`\nReceived ${events.length} events:`);

      // Loop through the Vec<EventRecord>
      events.forEach((record) => {
        // Extract the phase, event and the event types
        const { event, phase } = record;
        const types = event.typeDef;

        // Show what we are busy with
        console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
        console.log(`\t\t${event.meta.documentation.toString()}`);

        // Loop through each of the parameters, displaying the type and data
        event.data.forEach((data, index) => {
          console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
        });
      });
    });
  }


  var deployedCodeHash=null;
  var contractAddress=null;

  async.series([
      // put code
      s_callback => {
        //load flipper wasm
        buffer=fs.readFileSync("../contracts/roleContract.wasm");
        flipperBytes=new Bytes(api.registry, [...buffer]);

        // console.log(abi.messages.hasRole([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

        //put flipper wasm
        const putTx = api.tx.contracts.putCode(flipperBytes);

        putTx.signAndSend(alice, ({events=[], status}) => {
          if(status.isInBlock) {
            console.log("putTx is in block");

            events.forEach(({event, phase}) => {
              if(event.section=="contracts" && event.method=="CodeStored") {
                deployedCodeHash=event.data[0];
                console.log("code stored with hash", deployedCodeHash.toHex());
              }
            });

            s_callback(null);

          } else {
            console.log('\n', "putTx waiting to be in block");
          }
        });

      },

      //instantiate code
      s_callback => {
        const constructorSelector="0x5EBD88D6"; //from abi - contract>constructors[1]>selector

        // console.log(api.tx.contracts);
        instTx=api.tx.contracts.instantiate(bnToBn("2000000000000000"), 100000000000, deployedCodeHash, constructorSelector);

        instTx.signAndSend(alice, ({events=[], status}) => {
          if(status.isInBlock) {
            console.log("instTx is in block");
            events.forEach(({event, phase}) => {
              console.log(phase.toString());
              console.log(event.meta.documentation.toString());
              console.log(event.toString());
              if(event.section=="contracts" && event.method=="Instantiated") {
                contractAddress=event.data[1];
                console.log("contract deployed at", contractAddress.toHex());
              }
            });

            s_callback(null);

          } else {
            console.log("instTx waiting to be in block");
          }
        });
      },

      //cal code -- call to set caller's role
      s_callback => {
        const setTypeSelector="0x21ADB894"; //from abi

        const callTx=api.tx.contracts.call(contractAddress, 0, 100000000000, abi.messages.getRole([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

        callTx.signAndSend(alice, ({events=[], status}) => {
          if(status.isInBlock) {
            console.log("callTx (set caller's role) is in block");
            events.forEach(({event, phase}) => {
              console.log(phase.toString());
              console.log(event.meta.documentation.toString());
              console.log(event.toString());
              if(event.section=="contracts" && event.method=="ContractExecution") {
                console.log("contract returned from", event.data[0].toHex(), "with pub key value", event.data[1].toString());
              }
            });

            s_callback(null);
          } else {
            console.log('\n', "callTx (set caller's role) waiting to be in block");
          }
        });

      },

      //cal code -- get return value (test)
      s_callback => {
        const setTypeSelector="0x21ADB894"; //from abi

        const callTx=api.tx.contracts.call(contractAddress, 0, 100000000000, abi.messages.getRole([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

        callTx.signAndSend(alice, (result) => {
          console.log(result);
        });

      },

    //   //cal code -- test to get caller type
    //   s_callback => {
    //     const getCallerSelector="0x3604D0C5"; //from abi

    //     const callTx=api.tx.contracts.call(contractAddress, 0, 10000000000, getCallerSelector);

    //     callTx.signAndSend(alice, ({events=[], status}) => {
    //       if(status.isInBlock) {
    //         console.log("callTx (get test caller type) is in block");
    //         events.forEach(({event, phase}) => {
    //           console.log(phase.toString());
    //           console.log(event.meta.documentation.toString());
    //           console.log(event.toString());
    //           if(event.section=="contracts" && event.method=="ContractExecution") {
    //             console.log("contract returned from", event.data[0].toHex(), "with pub key value", event.data[1]);
    //           }
    //         });

    //         s_callback(null);
    //       } else {
    //         console.log('\n', "callTx (get test caller type) waiting to be in block");
    //       }
    //     });

    //   },

      // //call code - get codehash of roleContract
      // s_callback => {
      //   const getCodehashSelector="0x4F32C40B"; //from abi

      //   // const roleContract_codehash = "0xc084c0d8c9d8f1807ac51a4612b182a424ad54b7ec405a828a679abe8d61cbef";
      //   // const accContract_codehash = "0x1c9b3e75064c78cc46ca6b4b4fab04d01acfbbdbd020df3ab7116b9abcc353bb";
      //   // const accContract_address = "0xe88e05e883e684d07f3d1a7197f6256d07d50ed4b5c6510459a9033b1e1f6af4";

      //   var contents = fs.readFileSync("./metadata.json");
      //   var jsonContent = JSON.parse(contents);
      //   const abi = new Abi(api.registry, jsonContent);

      //   const callTx=api.tx.contracts.call(contractAddress, 0, 10000000000, getCodehashSelector);

      //   callTx.signAndSend(alice, ({events=[], status}) => {
      //     if(status.isInBlock) {
      //       console.log("callTx (get codehash of roleContract) is in block");
      //       events.forEach(({event, phase}) => {
      //         console.log(phase.toString());
      //         console.log(event.meta.documentation.toString());
      //         console.log(event.toString());
      //         if(event.section=="contracts" && event.method=="ContractExecution") {
      //           console.log("contract returned from", event.data[0].toHex(), "with value", event.data[1]);
      //         }
      //       });

      //       s_callback(null);
      //     } else {
      //       console.log('\n', "callTx (get codehash of roleContract) waiting to be in block");
      //     }
      //   });
      // },

      // //cal code -- get caller's address
      // s_callback => {
      //   const getCallerSelector="0x77AFCBB5"; //from abi

      //   const callTx=api.tx.contracts.call(contractAddress, 0, 10000000000, getCallerSelector);

      //   callTx.signAndSend(alice, ({events=[], status}) => {
      //     if(status.isInBlock) {
      //       console.log("callTx (get caller's address) is in block");
      //       events.forEach(({event, phase}) => {
      //         console.log(phase.toString());
      //         console.log(event.meta.documentation.toString());
      //         console.log(event.toString());
      //         if(event.section=="contracts" && event.method=="ContractExecution") {
      //           console.log("contract returned from", event.data[0].toHex(), "with value", event.data[1]);
      //         }
      //       });

      //       s_callback(null);
      //     } else {
      //       console.log('\n', "callTx (get caller's address) waiting to be in block");
      //     }
      //   });

      // },

      // // //cal code -- call roleContract to get caller's role type
      // // s_callback => {
      // //   const roleTypeSelector="0x45F077B1"; //from abi

      // //   const callTx=api.tx.contracts.call(contractAddress, 0, 10000000000, roleTypeSelector);

      // //   callTx.signAndSend(alice, ({events=[], status}) => {
      // //     if(status.isInBlock) {
      // //       console.log("callTx (caller's role type) is in block");
      // //       events.forEach(({event, phase}) => {
      // //         if(event.section=="contracts" && event.method=="ContractExecution") {
      // //           console.log("contract returned from", event.data[0].toHex(), "with pub key value", event.data[1]);
      // //         }
      // //       });

      // //       s_callback(null);
      // //     } else {
      // //       console.log('\n', "callTx (caller's role type) waiting to be in block");
      // //     }
      // //   });

      // // }
    ], err => {
      process.exit();
    });
}

main()