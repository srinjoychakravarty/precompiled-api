# Test Report for fix data testing

## Summary
* Test parsers file for fix data
* Test feeding parsed fix data to calculate derived results by algorithm tool for settlement & distribution
* Test process of exchange SST from fix data
* Test multiple rounds of SST exchange for fix data

Documentations: <br />

View contracts test report in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/delegator-contract-tests/TESTREPORT.md)

View contracts api test report in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/delegator-contract-tests/CONTRACT-API.md)

## Limitation
* Currently, due to the limitation of gas amount we can config in contract call, it only supports 20+ raw data process in a row. Make sure the obj number in pre_settle-data .json file doesn't over the up limit. 

>Max. gas in polkadot api is 1000000000000.

* In this demo, we don't have existed PWALs, cannot get existed SST for testing. So, we need to either register the SST of fix data in regtrSST_contract.js or create() SST in core_contract.js (we can just call create() to register SST and don't go settlement, distribution...)

* In this demo, we don't have a storage for each parent key, mnemonic phrases, last paths yet. So, we create pseudo data for testing. ```test_accounts_phrase_map.json``` for accounts-mnemonic map. ```last_paths.json``` for accounts-lastPath storage (can be updated after calculation in algorithm tool).

* Fields like ```trade_type``` in executeTrade obj are not yet defined. So, we assume it's '0' in this testing.

* In this demo, we don't have real data from ATS, so we create pseudo ```session_id``` in executeTrade obj for testing.

* In this demo, we don't have ```sst_class``` data from fix, only have ```sst_id```, So we create pseudo ```sst_class``` as 2 in this testing.

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
└───index
│   │
│   └───   fix_index.json  -> tag-field map from https://btobits.com/fixopaedia/fixdic44/fields_by_tag_.html
│   │
│   └───   fix_index.jsonc -> same as fix_index.json, in addition of sample raw fix data in comments
│   │
│   └───   partyId_test_accounts_map.json  -> partyId-testAccount map
│   │
│   └───   test_accounts_phrase_map.json   -> testAccount-mnemonicPhrase map
│
└───node_modules
│   │
│   └───   ...
│
└───output
│   │
│   └───   execute_trade_objs.json -> parsed result from prepare_execute_contract.js, ready for executeTrade() in contract
│   │
│   └───   parsed_data.json    -> parsed results from parse_fix_data.js
│   │
│   └───   raw_settle_data.json    -> parsed result from prepare_execute_contract.js, ready for feeding in algorithm tool
│   
└───parsers
│   │
│   └───   parse_fix_data.js   -> use to parse raw fix data, output as parsed_data.json in output folder
│   │
│   └───   prepare_execute_contract.js -> further parse fix data from parse_fix_data.js for contract & algorithm tool
│
└───settle-raw-data -> store raw settle data calculate from algorithm tool
│   │
│   └───   fix_sample1.txt -> raw fix data 1
│   │
│   └───   fix_sample2.txt -> raw fix data 2
│   │
│   └───   fix_sample3.txt -> raw fix data 3
│   │
│   └───   pre_settle-data_0.json  -> calculated derived results from algorithm tool for later settlement in core contract
│
└───temp    -> random thing, can be ignored
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
In order to simplify fix data settlement, We will settle each matching order at a time. Because each matching order involved 6 different parties, each party can either be seller or buyer and different matching order may have various symbol (SST id), to handle those issue would be more complex. In our case, we have 11 matching orders totally. 

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

0. **Generate pseudo fix data** </br >
    Move to ```./settle-raw-data```
    ```
    cd ./settle-raw-data
    ```
    Adjust the number of data you need to generate in:
    ```javascript
    // generate 25 pseudo fix data
    start_generate(25);
    ```
    Run: 
    ```
    node random_gen.js
    ```
    Generated data will be exported into ```out.csv``` file within the same folder, like this:
    ```
    8=FIX.4.4,9=181,35=8,49=UPROMETHEUM,56=UICSYSTEM,34=7928,52=2020930-15:38:21.186,37=1491716554364862,11=1473024196679935,453=10,448=TB,447=D,452=35,54=2,38=6,99=49.466,448=CLC,447=D,452=20,54=2,38=7,99=25.885,448=PROMC,447=D,452=8,54=2,38=1,99=15.578,448=PEATC,447=D,452=19,54=2,38=2,99=49.466,448=CLB,447=D,452=5,54=2,38=3,99=49.466,448=PEATB,447=D,452=8,54=2,38=10,99=25.885,448=CA,447=D,452=24,54=2,38=7,99=49.466,448=TA,447=D,452=29,54=1,38=18,99=49.466,448=000000000002A,447=D,452=25,54=1,38=1,99=15.578,448=PROMA,447=D,452=9,54=1,38=17,99=25.885,32=17,31=25.885,30=PROMA,151=0.000,14=36,6=37.389,17=1426879832717955,150=A,39=0,55=MBR,167=CMO,40=5,59=4,75=2020930,60=2020930-15:38:21.187,7937=00,7938=N0,7939=00,10=344"
    "8=FIX.4.4,9=745,35=8,49=UPROMETHEUM,56=UICSYSTEM,34=3667,52=2020930-16:38:22.191,37=1477956523608199,11=1464428225095246,453=10,448=CA,447=D,452=3,54=2,38=9,99=14.029,448=CLA,447=D,452=37,54=2,38=1,99=14.029,448=TC,447=D,452=25,54=2,38=9,99=14.029,448=PROMC,447=D,452=15,54=2,38=7,99=14.029,448=PROMB,447=D,452=24,54=2,38=3,99=14.029,448=PEATB,447=D,452=35,54=2,38=4,99=14.029,448=PEATC,447=D,452=16,54=2,38=7,99=14.029,448=CLC,447=D,452=20,54=2,38=4,99=14.029,448=TA,447=D,452=24,54=2,38=6,99=14.029,448=000000000002B,447=D,452=20,54=1,38=50,99=14.029,32=50,31=14.029,30=000000000002B,151=0.000,14=50,6=14.029,17=1492960923239003,150=1,39=2,55=MBR,167=FORWARD,40=4,59=7,75=2020930,60=2020930-16:38:22.191,7937=00,7938=N0,7939=00,10=677"
    "8=FIX.4.4,9=663,35=8,49=UPROMETHEUM,56=UICSYSTEM,34=9875,52=2020930-17:38:23.194,37=1468224489038462,11=1454977582340702,453=16,448=PROMB,447=D,452=9,54=1,38=1,99=37.554,448=000000000002B,447=D,452=21,54=1,38=9,99=33.848,448=PROMA,447=D,452=7,54=1,38=9,99=33.848,448=000000000002A,447=D,452=11,54=1,38=1,99=33.848,448=CLA,447=D,452=28,54=1,38=3,99=33.848,448=PEATB,447=D,452=26,54=1,38=9,99=33.848,448=CLC,447=D,452=33,54=1,38=3,99=37.554,448=CA,447=D,452=13,54=1,38=5,99=33.848,448=TB,447=D,452=12,54=1,38=10,99=33.848,448=PROMC,447=D,452=4,54=1,38=10,99=37.554,448=TC,447=D,452=8,54=1,38=5,99=33.848,448=PEATC,447=D,452=26,54=1,38=7,99=33.848,448=CC,447=D,452=23,54=1,38=6,99=37.554,448=CLB,447=D,452=7,54=1,38=4,99=33.848,448=PEATA,447=D,452=38,54=2,38=62,99=33.848,448=TA,447=D,452=30,54=2,38=20,99=37.554,32=20,31=37.554,30=TA,151=0.000,14=82,6=34.752,17=1420583722437565,150=E,39=0,55=MBR,167=DEFLTED,40=3,59=4,75=2020930,60=2020930-17:38:23.195,7937=00,7938=N0,7939=00,10=510"
    "8=FIX.4.4,9=957,35=8,49=UPROMETHEUM,56=UICSYSTEM,34=7652,52=2020930-18:38:24.197,37=1475943791227114,11=1433960465689814,453=12,448=CA,447=D,452=35,54=2,38=8,99=38.956,448=PEATC,447=D,452=5,54=2,38=5,99=45.234,448=CC,447=D,452=4,54=2,38=2,99=45.234,448=CLA,447=D,452=2,54=2,38=6,99=45.234,448=CB,447=D,452=6,54=2,38=2,99=45.234,448=PEATA,447=D,452=26,54=2,38=1,99=38.956,448=TA,447=D,452=20,54=2,38=7,99=45.234,448=CLB,447=D,452=29,54=2,38=10,99=38.956,448=PROMA,447=D,452=16,54=2,38=3,99=45.234,448=PROMB,447=D,452=27,54=2,38=5,99=38.956,448=PROMC,447=D,452=19,54=1,38=24,99=38.956,448=TC,447=D,452=39,54=1,38=25,99=45.234,32=25,31=45.234,30=TC,151=0.000,14=49,6=42.159,17=1419641781400991,150=0,39=8,55=MBR,167=BRANDY,40=P,59=1,75=2020930,60=2020930-18:38:24.197,7937=00,7938=N0,7939=00,10=503"
    ```

1. **Parse raw fix data** <br/>
    We're going to extract matching order with order id (37) in raw fix data,  here's the sample from ```./settle-raw-data/fix_sample3.txt```:
    >The raw fix data has been modified in some fields, added corresponding values for each party id instead of single value for all. Ex. Side(54), OrderQty(38), StopPx(99). And modified PartyID(448), PartyRole(452) in each matching order to get different parties in various matching orders
    ```
    20200824-19:08:37.341 : 8=FIX.4.49=9235=149=UPROMETHEUM56=UICSYSTEM34=181952=20200824-19:08:37.353112=20200824-19:08:37.35310=174

    20200824-19:08:37.341 : 8=FIX.4.49=9235=034=181649=UICSYSTEM52=20200824-19:08:37.34156=UPROMETHEUM112=20200824-19:08:37.35310=167

    20200824-19:08:43.686 : 8=FIX.4.49=42935=849=UPROMETHEUM56=UICSYSTEM34=182052=20200824-19:08:43.68537=148445689000001811=1484456890000018453=6448=PROMB447=D452=50448=CLB447=D452=51448=000000000002B447=D452=52448=CB447=D452=53448=PEATB447=D452=56448=TB447=D452=5417=1484456947000005150=F39=255=MBR167=CS54=138=5.00099=15.90054=138=5.00099=15.90054=238=7.00099=15.90054=238=1.00099=15.90054=238=1.00099=15.90054=238=1.00099=15.90040=259=032=1.00031=15.90030=PEAT151=0.00014=10.0006=15.90075=2020082460=20200824-19:08:43.6497937=007938=N07939=0010=141

    20200824-19:08:59.866 : 8=FIX.4.49=42935=849=UPROMETHEUM56=UICSYSTEM34=182152=20200824-19:08:59.87037=148445689000001911=1484456890000019453=6448=PROMB447=D452=50448=CLB447=D452=51448=000000000002B447=D452=52448=CB447=D452=53448=PEATB447=D452=56448=TB447=D452=5417=1484456947000006150=F39=255=MBR167=CS54=138=3.00099=10.01054=138=1.00099=10.01054=138=2.00099=7.20054=238=4.00099=10.01054=238=1.00099=7.20054=238=1.00099=7.20040=259=032=1.00031=7.20030=PEAT151=0.00014=6.0006=9.07375=2020082460=20200824-19:08:59.8347937=007938=N07939=0010=151

    20200824-19:09:07.382 : 8=FIX.4.49=9235=149=UPROMETHEUM56=UICSYSTEM34=182252=20200824-19:09:07.384112=20200824-19:09:07.38410=172

    20200824-19:09:07.382 : 8=FIX.4.49=9235=034=181749=UICSYSTEM52=20200824-19:09:07.38256=UPROMETHEUM112=20200824-19:09:07.38410=173

    20200824-19:09:33.671 : 8=FIX.4.49=42935=849=UPROMETHEUM56=UICSYSTEM34=182352=20200824-19:09:33.67137=148445689000002011=1484456890000020453=6448=PROMC447=D452=60448=CLC447=D452=61448=000000000002C447=D452=62448=CC447=D452=63448=PEATC447=D452=66448=TC447=D452=6417=1484456947000007150=F39=255=MBR167=CS54=138=20.00099=4.50054=138=10.00099=8.00054=138=2.00099=8.00054=238=12.00099=8.00054=238=10.00099=4.50054=238=10.00099=4.50040=259=032=10.00031=4.50030=PEAT151=0.00014=32.0006=5.812575=2020082460=20200824-19:09:33.6417937=007938=N07939=0010=119

    20200824-19:09:37.405 : 8=FIX.4.49=9235=149=UPROMETHEUM56=UICSYSTEM34=182452=20200824-19:09:37.413112=20200824-19:09:37.41310=166
    ```

    Move to ```./parsers/parse_fix_data.js```: 
    ``` javascript
    const paths = ["../settle-raw-data/fix_sample1.txt", "../settle-raw-data/fix_sample2.txt", "../settle-raw-data/fix_sample3.txt"];
    const index_path = "../index/fix_index.json";
    const map_path = "../index/partyId_test_accounts_map.json";
    const dest_path = "../output/parsed_data.json";
    const isCSV = false; // If your raw fix data file is .csv, set isCSV as true

    parseFixData(paths, index_path, map_path, dest_path, isCSV);
    ```
    Run:
    ```
    node parse_fix_data.js
    ```

    Ouput is exported to ```./output/parsed_data.json``` like this:
        
        [
            {
                "BeginString": "FIX.4.4",
                "BodyLength": "428",
                "MsgType": "8",
                "SenderCompID": "UPROMETHEUM",
                "TargetCompID": "UICSYSTEM",
                "MsgSeqNum": "385",
                "SendingTime": "20200819-13:49:22.108",
                "OrderID": "1484224595000004",
                "ClOrdID": "1484224595000004",
                "NoPartyIDs": "6",
                "PartyID": [
                    "00000001",
                    "00000003",
                    "00000002",
                    "00000004",
                    "00000005",
                    "00000006"
                ],
                "PartyIDSource": [
                    "D",
                    "D",
                    "D",
                    "D",
                    "D",
                    "D"
                ],
                "PartyRole": [
                    "40",
                    "41",
                    "42",
                    "43",
                    "46",
                    "44"
                ],
                "ExecID": "1484080956000003",
                "ExecType": "F",
                "OrdStatus": "2",
                "Symbol": "MBR",
                "SecurityType": "CS",
                "Side": [
                    "1",
                    "1",
                    "1",
                    "1",
                    "2",
                    "2"
                ],
                "OrderQty": [
                    "4.000",
                    "7.000",
                    "1.000",
                    "3.000",
                    "5.000",
                    "10.000"
                ],
                "StopPx": [
                    "2.300",
                    "3.140",
                    "2.300",
                    "3.140",
                    "2.300",
                    "3.140"
                ],
                "OrdType": "1",
                "TimeInForce": "3",
                "LastQty": "10.000",
                "LastPx": "3.140",
                "LastMkt": "PEAT",
                "LeavesQty": "0.000",
                "CumQty": "15.000",
                "AvgPx": "2.860",
                "TradeDate": "20200819",
                "TransactTime": "20200819-13:49:22.079",
                "Unknown1": "00",
                "Unknown2": "N0",
                "Unknown3": "00",
                "CheckSum": "079"
            },
            ...
            {
            "BeginString": "FIX.4.4",
            "BodyLength": "429",
            "MsgType": "8",
            "SenderCompID": "UPROMETHEUM",
            "TargetCompID": "UICSYSTEM",
            "MsgSeqNum": "1826",
            "SendingTime": "20200824-19:10:09.086",
            "OrderID": "1484456890000021",
            "ClOrdID": "1484456890000021",
            "NoPartyIDs": "6",
            "PartyID": [
                "00000001",
                "00000003",
                "00000002",
                "00000004",
                "00000005",
                "00000006"
            ],
            "PartyIDSource": [
                "D",
                "D",
                "D",
                "D",
                "D",
                "D"
            ],
            "PartyRole": [
                "40",
                "41",
                "42",
                "43",
                "46",
                "44"
            ],
            "ExecID": "1484456947000008",
            "ExecType": "F",
            "OrdStatus": "2",
            "Symbol": "MBR",
            "SecurityType": "CS",
            "Side": [
                "1",
                "1",
                "1",
                "1",
                "2",
                "2"
            ],
            "OrderQty": [
                "4.000",
                "7.000",
                "1.000",
                "3.000",
                "5.000",
                "10.000"
            ],
            "StopPx": [
                "2.300",
                "3.140",
                "2.300",
                "3.140",
                "2.300",
                "3.140"
            ],
            "OrdType": "2",
            "TimeInForce": "0",
            "LastQty": "10.000",
            "LastPx": "3.140",
            "LastMkt": "PEAT",
            "LeavesQty": "0.000",
            "CumQty": "15.000",
            "AvgPx": "2.860",
            "TradeDate": "20200824",
            "TransactTime": "20200824-19:10:09.067",
            "Unknown1": "00",
            "Unknown2": "N0",
            "Unknown3": "00",
            "CheckSum": "117"
            }
        ]

    >In this parsing, we extract all matching orders in raw fix data, replace tag number as field name, and use ```./index/partyId_test_accounts_map.json``` to map party id to test account

    Further parsing the output into two files for executeTrade() in contract and algorithm tool
    ``` javascript
    const data_path = "../output/parsed_data.json";
    const dest_path = "../output/execute_trade_objs.json";
    const dest_path2 = "../output/raw_settle_data.json";
    const map_path = "../index/test_accounts_phrase_map.json";

    // we set 10 as the session id will be written in executeTrade()
    // we set 8 as digits for getting precise decimal part during the calculation in here
    get_execute_data(data_path, map_path, dest_path, dest_path2, 10, 8);
    ```

    Run:
    ```
    node prepare_execute_contract.js
    ```

    >After second parsing, we'll get two output files in ```./output```. One is ```./output/execute_trade_objs.json```, which is ready for feed into executeTrade() in contract; another one is ```./ouput/raw_settle_data.json```, which will be used as source file to calculate derived results in algorithm tool. 

    Output of ```execute_trade_objs.json``` looks like:

    ```
    [
        {
            "session_id": 10,
            "sst_id": "MBR",
            "sst_class": 2,
            "amount": "42.90000000",
            "timestamp": "1597859362.079",
            "trade_type": 0
        },
        {
            "session_id": 11,
            "sst_id": "MBR",
            "sst_class": 2,
            "amount": "42.90000000",
            "timestamp": "1597859362.079",
            "trade_type": 0
        },
        ...
        {
            "session_id": 20,
            "sst_id": "MBR",
            "sst_class": 2,
            "amount": "42.90000000",
            "timestamp": "1598310609.067",
            "trade_type": 0
        }
    ]
    ```

    Output of ```raw_settle_data.json``` looks like:

    ```
    [
        {
            "phrase": [
                "muffin shift ocean sun monster mansion win favorite notable trial enter basic",
                "vivid seed busy client fabric salon ghost wise quarter exact frog attract",
                "elegant rib divorce document garlic wonder length maze carbon virus feed anxiety",
                "seat negative ramp dismiss heart indicate parent cargo spice recall local sting",
                "crawl quantum party guess final birth absent excuse offer light provide time",
                "clutch fork nation announce bag clump will cement stomach anxiety ready decorate"
            ],
            "balance": [
                "9.20000000",
                "21.98000000",
                "2.30000000",
                "9.42000000",
                "-11.5",
                "-31.4"
            ]
        },
        ...
        {
            "phrase": [
                "muffin shift ocean sun monster mansion win favorite notable trial enter basic",
                "vivid seed busy client fabric salon ghost wise quarter exact frog attract",
                "elegant rib divorce document garlic wonder length maze carbon virus feed anxiety",
                "seat negative ramp dismiss heart indicate parent cargo spice recall local sting",
                "crawl quantum party guess final birth absent excuse offer light provide time",
                "clutch fork nation announce bag clump will cement stomach anxiety ready decorate"
            ],
            "balance": [
                "9.20000000",
                "21.98000000",
                "2.30000000",
                "9.42000000",
                "-11.5",
                "-31.4"
            ]
        }
    ]
    ```

2. **<a name="algorithm-tool"></a>Calculate derived results** <br />
    Place ```raw_settle_data.json``` into folder ```/derived-addresses-substrate/```, move to ```derived-addresses-substrate/src/main.rs```

    ```
    cd ../../derived-addresses-substrate/src/main.rs
    ```

    Run:
    ```
    cargo run
    ```

    We'll get two parts of output, one for derived results store info such as last path and sub addresses for each parent address; the other part is pre-settle data which stores sub balance for each sub address <br />

    In ```../output/derived_results_0.json```, output is like this:

    ```
    [
        {
            "parentAddress": "5GriUUHY691o2jTpL3T4NdgxmmEnHdQbyG5NZtxuHwSJ7a6y",
            "lastPath": "//2",
            "subAddresses": [
                {
                    "address": "5F1M5p6eqAYDg7zpEA3cT6CnAGqbCRDw64hN96fyUr2BH3iv",
                    "path": "//1"
                },
                {
                    "address": "5DaESZJxhmrPGctfKcmzjC9FRnqPsMGc2Nn4soStvsfzEcwZ",
                    "path": "//2"
                }
            ]
        },
        ...
        {
            "parentAddress": "5CcTjtjLCz9JXXTP4rNBuEDmrXMRGug26ooLpXZAb2Ff3x4i",
            "lastPath": "//2",
            "subAddresses": [
                {
                    "address": "5DvuehHp9ZynHacqzdNf43M8nMY7gvPnf9989UxS35fJtFbP",
                    "path": "//1"
                },
                {
                    "address": "5G1WT3n6TzG7WFg6ASSdibaTsa1rF2ZLVWkjPU43BJMCmtQV",
                    "path": "//2"
                }
            ]
        }
    ]
    ```

    In ```../output/pre_settle_data_0.json```, output is like this:

    ```
    [
        {
            "address": "5CZo3TvLZoPZCyEjxqLYuZSYozwt3SypfxfdQZH1Vsa2uVUM",
            "balance": "12.55579034"
        },
        {
            "address": "5DPmpBvneY6aARxa1s5z1MdGZrpH1eyL5NvgE12rkR16EW3x",
            "balance": "0.55588141"
        },
        ...
        {
            "address": "5HMjAK6iAPZMJGwX6yehQ9ugyQZ1dGUVBMJokUWS7NLKZ9wx",
            "balance": "-4.50845281"
        }
    ]
    ```

    >When calculate derived results, we assume the last path for each test account is //0. Store and update the map of account-lastPath in ```../last_paths.json```

    Move all pre_settle_data .json files into ```./settle-raw-data``` folder
3. **Initialize all contracts** <br />
    ```
    cd contracts-api
    ```
    Run:
    ```
    node init.js
    ```

4. **Set account type & role**
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
    
5. **Call create() by Bob in core_contract.js or register sstID in regtrSST_contract.js**
    >Since our demo doesn't involve existed SST from PWAL of test accounts yet, in order to testing settle amount from buyers' accounts to sellers', we have to either create new SST for buyers or register SST specified as symbol in fix data. Otherwise, the following calls won't be passed validation and called successfully.

    ```javascript
    // set id, class & path
    const sstId = "MBR";
    const sstClass = 2;
    const rawdataPath = "../settle-raw-data/pre_settle_data_0.json";
    const isExchange = true;
    const digits = 8;

    // preprocess pre-settle data to get total amount, sellers part (all negative balances, neg) & buyers part (all positive balances, pos) for settlement & distribution 
    let {total, neg, pos} = preproccess(rawdataPath, sstClass, digits, isExchange);

    // create new SST 
    let createdObj = await call_create(sstId, sstClass, total, ALICE);
    ```
    createdObj is like this:
    ```javascript
    {
        caller: '5FE43cBHUf7yzu7ahkAKnEpbg59xndM5PCwLaoe6GodQjsqd',
        holding_addr: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        sst_class: 2,
        amount: '42.90000000'
    }
    ```

6. **Call reset()** </br >
    We don't need to walk through all SST creation process because we just wanna make sure the SST already registered.

    ``` javascript
    call_reset();
    ```
    >Check if state is reset to 0 by ```call_checkState();```

7. **Call preExchange()** </br >
    This function is used to transfer total amount to holdingGWAL. In later approval transfer, exchange amount will transfer corresponding sub balances from holdingGWAL to subMWALs. </br >

    The transfer way is: </br >
    sellers' sub balances -> holdingGWAL (Alice), </br >
    holdingGWAL (Alice) -> buyers' sub balances </br >

    ``` javascript
    let preExObj = await call_preExchange(sst_id, sst_class, total, holding_addr);
    ```

    Output is like:
    ``` javascript
    {
        holding_addr: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        sst_class: 2,
        amount: '42.90000000'
    }
    ```
    >You can check if holdingGWAL has correct total amount by ```call_getGwal(ALICE);```

8. **Call addSettleItem()** </br >
    In settlement, we still settle all data of sellers' (negative balances) & buyers' (positive balances)
    ```javascript
    // prepare a settle obj
    let settleArr = getSettleObjs(path, sst_class);
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
            sub_mwal: '5CZo3TvLZoPZCyEjxqLYuZSYozwt3SypfxfdQZH1Vsa2uVUM',
            amount: '12.55579034',
            sst_class: 2
        },
        {
            sub_mwal: '5DPmpBvneY6aARxa1s5z1MdGZrpH1eyL5NvgE12rkR16EW3x',
            amount: '0.55588141',
            sst_class: 2
        },
        {
            sub_mwal: '5DaESZJxhmrPGctfKcmzjC9FRnqPsMGc2Nn4soStvsfzEcwZ',
            amount: '1.94571185',
            sst_class: 2
        },
        .....
        {
            sub_mwal: '5HMjAK6iAPZMJGwX6yehQ9ugyQZ1dGUVBMJokUWS7NLKZ9wx',
            amount: '-4.50845281',
            sst_class: 2
        }
    ]
    ```

9. **Call settleMWALs() by Lucy**
    ```javascript
    let settlement = await call_settleMWALs(sst_id);
    // check all added items by:
    await call_getSettlements(sst_id);
    ```
    Print out like this:
    ```javascript
    [
        {
            session_id: 2,
            sub_mwal: '5CZo3TvLZoPZCyEjxqLYuZSYozwt3SypfxfdQZH1Vsa2uVUM',
            sst_class: 2,
            amount: '12.55579034'
        },
        {
            session_id: 2,
            sub_mwal: '5DPmpBvneY6aARxa1s5z1MdGZrpH1eyL5NvgE12rkR16EW3x',
            sst_class: 2,
            amount: '0.55588141'
        },
        {
            session_id: 2,
            sub_mwal: '5DaESZJxhmrPGctfKcmzjC9FRnqPsMGc2Nn4soStvsfzEcwZ',
            sst_class: 2,
            amount: '1.94571185'
        },
        .....
        {
            session_id: 2,
            sub_mwal: '5HMjAK6iAPZMJGwX6yehQ9ugyQZ1dGUVBMJokUWS7NLKZ9wx',
            sst_class: 2,
            amount: '-4.50845281'
        }
    ]
    ```

10. **Call distribute_exchange() by Charlie** </br >
    ```distribute_exchange()``` is similar to ```distribute()``` in SST creation, except the check condition of distribute over. In SST creation, we only have positive balances; in here, all sub balances (positive + negative) sum up will be 0.

    ```javascript
    let distributeObjs = await call_distribute_exchange(settleArr);
    // check all distributions by:
    await call_getDistribution();
    ```
    distributeObjs is like this:
    ```javascript
    [
        {
            sub_mwal: '5CZo3TvLZoPZCyEjxqLYuZSYozwt3SypfxfdQZH1Vsa2uVUM',
            sst_class: 2,
            amount: '12.55579034'
        },
        {
            sub_mwal: '5DPmpBvneY6aARxa1s5z1MdGZrpH1eyL5NvgE12rkR16EW3x',
            sst_class: 2,
            amount: '0.55588141'
        },
        {
            sub_mwal: '5DaESZJxhmrPGctfKcmzjC9FRnqPsMGc2Nn4soStvsfzEcwZ',
            sst_class: 2,
            amount: '1.94571185'
        },
        .....
        {
            sub_mwal: '5HMjAK6iAPZMJGwX6yehQ9ugyQZ1dGUVBMJokUWS7NLKZ9wx',
            sst_class: 2,
            amount: '-4.50845281'
        }
    ]
    ```

11. **Call transferToOther() by Eve and approveTransferToOther() by Eve, Ferdie, Dave** </br >
    In here, we only take buyers' part (all positive balances, pos) to approve and transfer amount from holdingGWAL to buyers' subMWALs. 

    ```javascript
    let settleArr = getSettleObjs(rawdataPath, sst_class);
    // get approvers 
    const { eve, ferdie, dave } = await base.connect(abiPaths);
    // prepare obj for transferToOther()
    let objArr = await getTransferToOtherObjs(sst_id, holding_addr, pos, 8);
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
            to: '5CZo3TvLZoPZCyEjxqLYuZSYozwt3SypfxfdQZH1Vsa2uVUM',
            from_amount: '30.34420966',
            to_amount: '12.55579034',
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
            to: '5DPmpBvneY6aARxa1s5z1MdGZrpH1eyL5NvgE12rkR16EW3x',
            from_amount: '29.78832825',
            to_amount: '0.55588141',
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
            to: '5DaESZJxhmrPGctfKcmzjC9FRnqPsMGc2Nn4soStvsfzEcwZ',
            from_amount: '27.84261640',
            to_amount: '1.94571185',
            pt_id: 2,
            func_name: 2010,
            stage: 2,
            state: '\u0000 complete'
            }
        },
        .....
        {
            ptId: 7,
            confirm_1: {
            pt_id: 7,
            func_name: 2008,
            stage: 0,
            state: '\u00008ready_for_next'
            },
            confirm_2: { pt_id: 7, func_name: 2009, stage: 1, state: '\u0000' },
            confirm_3: {
            from: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            to: '5HMex9yfgqJKz9Maav1JLbHeMBHUyK5LmBPHvzHhPPSJu1co',
            from_amount: '-0.00000000',
            to_amount: '8.10600999',
            pt_id: 7,
            func_name: 2010,
            stage: 2,
            state: '\u0000 complete'
            }
        }
    ]
    ```

#### 2nd matching order settlement
> Before 2nd rmatching order settlement, call reset() in coreContract

```javascript
    call_reset();
    // check state
    call_checkState();
    // check holding account balance
    call_getGwal(ALICE);
```

Follow the same process from **Step 5**, skip to the next step if the SST id already existed

12. **Call executeTrade() by Jane** </br >
    call executeTrade() after all matching orders are done in approval proccess. Each session corresponding to a matching order. 

    ```javascript
    /* sample of executeTradeObjs
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
    */
    var contents = fs.readFileSync("../output/execute_trade_objs.json");
    var executeTradeObjs = JSON.parse(contents);

    let etObjs = await call_executeTrade(executeTradeObjs);
    await call_getExecuteTrade(10);
    ```
    
    etObjs is like this:
    
    ```javascript
    [
        {
            session_id: 10,
            sst_class: 2,
            amount: '42.90000000',
            timestamp: '1597859362.079',
            trade_type: 0
        },
        {
            session_id: 11,
            sst_class: 2,
            amount: '42.90000000',
            timestamp: '1597859362.079',
            trade_type: 0
        },
        ...
        {
            session_id: 20,
            sst_class: 2,
            amount: '42.90000000',
            timestamp: '1598310609.067',
            trade_type: 0
        }
    ]
    ```

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
