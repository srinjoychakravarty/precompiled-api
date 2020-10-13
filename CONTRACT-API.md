# Test Report for ink! contracts (API Version)

## Summary
* Test individual function in roleContract, accContract, regtrSSTContract, coreContract via js api call
* Test write and get correct data via delegated way (call sub contracts by parent contract)
* Test process of new SST creation
* Test multiple rounds of new SST creation
* Test feeding sample derived result(sub-mwal + sub-balance) calculate from algorithm tool for settlement & distribution

Documentations: <br />

View contracts test report in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/delegator-contract-tests/TESTREPORT.md)

## Limitation
* Currently, due to the limitation of gas amount we can config in contract call, it only supports 20+ raw data process in a row. Make sure the obj number in raw settle .json file doesn't over the up limit. 

>Max. gas in polkadot api is 1000000000000.

## File structure
```
contracts-api
│
└───api -> main api functions location
│   │
│   └───   account_contract.js -> use for account type/ role/ approver registration, and accounts balance transfer
│   │
│   └───   core_contract.js    -> core functions for create SST/ settlement/ distribution/ execute trade on chain
│   │
│   └───   regtrSST_contract.js    -> use for register new SST (is delegated to call in core contract)/ check SST list
│   │
│   └───   role_contract.js    -> all functions are delegated to call in account_contract.js, except register system type account, shouldn't call it directly
│   │
│   └───   test-simple-contract.js -> only for testing purpose
│   
│   
└───contracts   -> store binary contract .wasm and corresponding metadata.json
│   │
│   └───   accContract.json
│   │
│   └───   accContract.wasm
│   │
│   └───   coreContract.json
│   │
│   └───   coreContract.wasm
│   │
│   └───   regtrSSTContract.json
│   │
│   └───   regtrSSTContract.wasm
│   │
│   └───   roleContract.json
│   │
│   └───   roleContract.wasm
│   │
│   └───   ...
│
└───   base.js -> polkadot js api template for contract deploy and contract call
│
└───   contract_id.js  -> store all codehash and contract addresses after init contracts
│
└───   CONTRACT-API.md -> test report for contract api
│
└───   FIX-DATA-TEST.md    -> test report for fix data
│
└───   init.js -> initialize all contracts in blockchain (put code + deploy)
│
└───   package-lock.json
```

## <a name="api-test"></a>Test flow via js api
### Role types
    - 1001 Call a system contract
    - ----
    - 2001 Call a GWAL contract
    - 2002 Receive SST issuance holding
    - 2003 Receive settle from other CF (not compatible with 2002)
    - 2004 Call execute
    - 2005 Call settleMWALs
    - 2006 Call distribute 
    - 2008 canTransferToOther (CF operations/interface)
    - 2009 CF GWAL cold storage
    - 2010 CF GWAL operations

### Test steps
**Installation** <br />

Run: 
```
npm i @polkadot/api@1.22.0-beta.5
```
```
npm i @polkadot/api-contract@1.22.0-beta.5
```
```
npm i async
```
Move pre_settle_data_i .json file into ```./settle-raw-data``` folder
1. **Initialize all contracts** <br />
    ```
    cd contracts-api
    ```
    Run:
    ```
    node init.js
    ```

2. **Set account type & role**
    >Bob is auto set as System type (1) after deploy roleContract. <br />
    
    *// call accContract to set* <br />
    * Alice -> holding_GWAL <br />
        - set type as 2 <br />
        - set role as 2002 <br />
    * Charlie -> distribute_GWAL <br />
        - set type as 2 <br />
        - set role as 2006 <br />
    * Eve -> canTransferToOther_GWAL <br />
        - set type as 2 <br />
        - set role as 2008 <br />
    * Ferdie -> coldStorage_GWAL <br />
        - set type as 2 <br />
        - set role as 2009 <br />
    * Dave -> operation_GWAL <br />
        - set type as 2  <br />
        - set role as 2010 <br />
    * Lucy -> settleMWALs_GWAL (add custom account in keyring by mnemonic in base.js) <br />
        - set type as 2  <br />
        - set role as 2005 <br />
    * Jane -> executeTrade_GWAL (add custom account in keyring by mnemonic in base.js) <br />
        - set type as 2 <br />
        - set role as 2004 <br />
    
    ```
    cd ./api
    ```
    ```javascript
    // in account_contract.js
    test_multiple_set();
    ```
    Run: 
    ```
    node account_contract.js
    ```

    *// call roleContract to set* <br />
    * CoreContract <br />
        - set type as 1  <br />
    
    Find core contract address in contract_id.json (look up 'contractAddr_coreC')
    ```javascript
    // in role_contract.js: 
    test_multi_steps("5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ");
    ```
    Run:
    ```
    node role_contract.js
    ```

    Some accounts may not have balance yet. Transfer few balance before using the account as caller. Check global default accounts in base.js
    ```javascript
    // example, in account_contract.js
    default_transfer(JANE);
    ```
    Run: 
    ```
    node account_contract.js
    ```
    
3. **Call create() by Bob**
    ```javascript
    // set id, class & path
    const sstId = 10;
    const sstClass = 2;
    const sessionId = 2;
    const rawdataPath = "../settle-raw-data/pre_settle_data_3.json";
    const isExchange = false;
    const digits = 8;

    // preprocess raw settle data to get total amount for settlement & distribution
    let total = preproccess(rawdataPath, sstClass, digits, isExchange);

    // create new SST 
    let createdObj = await call_create(sstId, sstClass, total, ALICE);
    ```
    createdObj is like this:
    ```javascript
    {
        caller: '5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ',
        holding_addr: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        sst_class: 2,
        amount: '1063.00000000'
    }
    ```

4. **Call addSettleItem()**
    ```javascript
    // prepare a settle obj
    let settleArr = getSettleObjs(rawdataPath, sst_class);
    /* sample settleArr is like:
        [{
            sub_mwal: SUB1,
            class: 2,
            amount: "2.78334518"
        },
        {
            sub_mwal: SUB2,
            class: 2,
            amount: "0.35026383"
        }];
    */
    let settleItems = await call_addSettleItem(settleArr);

    // check all added items by:
    await call_getSettleItems();
    ```
    settleItems is like this:
    ```javascript
    [
        {
            sub_mwal: '5CAmHCoVhFsPXqCTCGQdTY6cmVsE3HQoh7a7CUvykVZvrYMj',
            amount: '57.71810428',
            sst_class: 2
        },
        {
            sub_mwal: '5CDZ9H3nLJUzyeqWwfX3gG26urFLnaHf76ukkvKeeeuZPVMt',
            amount: '10.20499928',
            sst_class: 2
        },
        {
            sub_mwal: '5CDshLauuWmqPKFQWTWCuJNV1m4tZD5kRhKVycXd4iHUmBZX',
            amount: '2.26666186',
            sst_class: 2
        },
        .....
        {
            sub_mwal: '5HopNj2FkDiymgJCKD6vT6Yaa4a7w6NK6qw9TanW8ub7KoxF',
            amount: '175.91679591',
            sst_class: 2
        }
    ]
    ```

5. **Call settleMWALs() by Lucy**
    ```javascript
    let settlement = await call_settleMWALs(sst_id);
    // check all added items by:
    await call_getSettlements(sst_id);
    ```
    Print out like this:
    ```javascript
    [
        {
            session_id: 10,
            sub_mwal: '5CAmHCoVhFsPXqCTCGQdTY6cmVsE3HQoh7a7CUvykVZvrYMj',
            sst_class: 2,
            amount: '57.71810428'
        },
        {
            session_id: 10,
            sub_mwal: '5CDZ9H3nLJUzyeqWwfX3gG26urFLnaHf76ukkvKeeeuZPVMt',
            sst_class: 2,
            amount: '10.20499928'
        },
        {
            session_id: 10,
            sub_mwal: '5CDshLauuWmqPKFQWTWCuJNV1m4tZD5kRhKVycXd4iHUmBZX',
            sst_class: 2,
            amount: '2.26666186'
        },
        .....
        {
            session_id: 10,
            sub_mwal: '5HopNj2FkDiymgJCKD6vT6Yaa4a7w6NK6qw9TanW8ub7KoxF',
            sst_class: 2,
            amount: '175.91679591'
        }
    ]
    ```

6. **Call distribute() by Charlie**
    ```javascript
    let distributeObjs = await call_distribute(settleArr);
    // check all distributions by:
    await call_getDistribution();
    ```
    distributeObjs is like this:
    ```javascript
    [
        {
            sub_mwal: '5CAmHCoVhFsPXqCTCGQdTY6cmVsE3HQoh7a7CUvykVZvrYMj',
            amount: '57.71810428',
            sst_class: 2
        },
        {
            sub_mwal: '5CDZ9H3nLJUzyeqWwfX3gG26urFLnaHf76ukkvKeeeuZPVMt',
            amount: '10.20499928',
            sst_class: 2
        },
        {
            sub_mwal: '5CDshLauuWmqPKFQWTWCuJNV1m4tZD5kRhKVycXd4iHUmBZX',
            amount: '2.26666186',
            sst_class: 2
        },
        .....
        {
            sub_mwal: '5HopNj2FkDiymgJCKD6vT6Yaa4a7w6NK6qw9TanW8ub7KoxF',
            amount: '175.91679591',
            sst_class: 2
        }
    ]
    ```

7. **Call transferToOther() by Eve and approveTransferToOther() by Eve, Ferdie, Dave**
    ```javascript
    let settleArr = getSettleObjs(rawdataPath, sst_class);
    // get approvers 
    const { eve, ferdie, dave } = await base.connect(abiPaths);
    // prepare obj for transferToOther()
    let objArr = await getTransferToOtherObjs(sst_id, holding_addr, settleArr, 8);
    /* sample objArr is like:
        [{
            id: 10,
            from: ALICE,
            to: SUB1,
            class: 2,
            from_amount: "0.35026383",
            to_amount: "2.78334518",
        },
        {
            id: 10,
            from: ALICE,
            to: SUB2,
            class: 2,
            from_amount: "0.00000000",
            to_amount: "0.35026383"
        }];
    */
    let results = [];
    // do multiple rounds of transferToOther() & approveTransferToOther()
    for(let obj of objArr) {
        // call transferToOther(), return pt_id
        let pt_id = await call_transferToOther(obj.id, obj.sst_class, obj.from_amount, obj.balance, obj.address, obj.from);
        console.log("pt_id: " + pt_id);
        console.log("to: " + obj.address);
        console.log("balance: " + obj.balance);
        // call approveTransferToOther() by Eve
        let result_1 = await call_approveTransferToOther(pt_id, 2008, 0, eve, false);
        // call approveTransferToOther() by Ferdie
        let result_2 = await call_approveTransferToOther(pt_id, 2009, 1, ferdie, false);
        // call approveTransferToOther() by Dave
        let result_3 = await call_approveTransferToOther(pt_id, 2010, 2, dave, true);
        let result = {};
        result.ptId = pt_id;
        result.confirm_1 = result_1;
        result.confirm_2 = result_2;
        result.confirm_3 = result_3;
        results.push(result);
    }

    console.log(results);
    ```
    Results are like this:
    ```javascript
    [
        {
            ptId: 0,
            confirm_1: {
            pt_id: 0,
            func_name: 2008,
            stage: 0,
            state: '\u00008ready_for_next'
            },
            confirm_2: { pt_id: 0, func_name: 2009, stage: 1, state: '\u0000' },
            confirm_3: {
            from: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            to: '5CAmHCoVhFsPXqCTCGQdTY6cmVsE3HQoh7a7CUvykVZvrYMj',
            from_amount: '1005.28189572',
            to_amount: '57.71810428',
            pt_id: 0,
            func_name: 2010,
            stage: 2,
            state: '\u0000 complete'
            }
        },
        {
            ptId: 1,
            confirm_1: {
            pt_id: 1,
            func_name: 2008,
            stage: 0,
            state: '\u00008ready_for_next'
            },
            confirm_2: { pt_id: 1, func_name: 2009, stage: 1, state: '\u0000' },
            confirm_3: {
            from: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            to: '5CDZ9H3nLJUzyeqWwfX3gG26urFLnaHf76ukkvKeeeuZPVMt',
            from_amount: '995.07689644',
            to_amount: '10.20499928',
            pt_id: 1,
            func_name: 2010,
            stage: 2,
            state: '\u0000 complete'
            }
        },
        {
            ptId: 2,
            confirm_1: {
            pt_id: 2,
            func_name: 2008,
            stage: 0,
            state: '\u00008ready_for_next'
            },
            confirm_2: { pt_id: 2, func_name: 2009, stage: 1, state: '\u0000' },
            confirm_3: {
            from: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            to: '5CDshLauuWmqPKFQWTWCuJNV1m4tZD5kRhKVycXd4iHUmBZX',
            from_amount: '992.81023458',
            to_amount: '2.26666186',
            pt_id: 2,
            func_name: 2010,
            stage: 2,
            state: '\u0000 complete'
            }
        },
        .....
        {
            ptId: 20,
            confirm_1: {
            pt_id: 20,
            func_name: 2008,
            stage: 0,
            state: '\u00008ready_for_next'
            },
            confirm_2: { pt_id: 20, func_name: 2009, stage: 1, state: '\u0000' },
            confirm_3: {
            from: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            to: '5HopNj2FkDiymgJCKD6vT6Yaa4a7w6NK6qw9TanW8ub7KoxF',
            from_amount: '-0.00000000',
            to_amount: '175.91679591',
            pt_id: 20,
            func_name: 2010,
            stage: 2,
            state: '\u0000 complete'
            }
        }
    ]
    ```

13. **Call executeTrade() by Jane**
    ```javascript
    let executeTradeObjs = [{
            session_id: 5,
            sst_id: sstId,
            sst_class: sstClass,
            amount: 100,
            timestamp: Date.now(),
            trade_type: 0,
        },
        {
            session_id: 6,
            sst_id: sstId,
            sst_class: sstClass,
            amount: 50,
            timestamp: Date.now(),
            trade_type: 1,
        }]
    let etObjs = await call_executeTrade(executeTradeObjs);
    ```
    etObjs is like this:
    ```javascript
    [
        {
            session_id: 5,
            sst_class: 2,
            amount: '100',
            timestamp: 1599082957298,
            trade_type: 0
        },
        {
            session_id: 6,
            sst_class: 2,
            amount: '50',
            timestamp: 1599082957298,
            trade_type: 1
        }
    ]
    ```


#### 2nd round new SST creation
> Before 2nd round of new SST creation, call reset() in coreContract

```javascript
    call_reset();
    // check state
    call_checkState();
    // check holding account balance
    call_getGwal(ALICE);
```

Follow the same process from **Step 3**

#### Cancel transfer
cancelTransferToOther() can be called before all confirmations are approved
    
```javascript
    call_cancelTransferToOther(pt_id);
```

ex. After transferToOther(),  <br />
* 1st approveTransferToOther()  -> - [v] cancelTransferToOther()
* 2nd approveTransferToOther()  -> - [v] cancelTransferToOther()
* 3rd approveTransferToOther()  -> - [x] cancelTransferToOther() (Cannot cancel)

## FAQ
### Issue of "Return event data number is incorrect!":
This issue indicates you got incorrect results back from contract call, although contract call is successfully. It may happens when signer doesn't have valid permission, signer or approver doesn't have enough balance to sign a signature or the steps of create SST/ settle/ distribute is not as correct. 
