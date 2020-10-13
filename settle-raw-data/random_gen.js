const generate = require('csv-generate');
const fastcsv = require('fast-csv');
var fs = require('fs');
const { time } = require('console');
const { send } = require('process');
const { start } = require('repl');

// Set const index for some fields
const index = [...range(0, 9), "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
const order_type_index = [...range(1, 9), "D", "E", "G", "I", "J", "K", "L", "M", "P"];
const security_index = [
    'TREASURY', 'PROVINCE', 'AGENCY', 'MORTGAGE', 'EQUITY', 'CASH', 'EUSUPRA',
    'FAC', 'FADN', 'PEF', 'SUPRA', 'CORP', 'CPP', 'CB', 'DUAL', 'EUCORP',
    'XLINKD', 'STRUCT', 'YANK', 'FOR', 'CS', 'PS', 'BRANDY', 'EUSOV', 'TBOND',
    'TINT', 'TIPS', 'TCAL', 'TPRN', 'UST', 'USTB', 'TNOTE', 'TBILL', 'REPO',
    'FORWARD', 'BUYSELL', 'SECLOAN', 'SECPLEDGE', 'TERM', 'RVLV', 'RVLVTRM',
    'BRIDGE', 'LOFC', 'SWING', 'DINP', 'DEFLTED', 'WITHDRN', 'REPLACD', 'MATURED',
    'AMENDED', 'RETIRED', 'BA', 'BN', 'BOX', 'CD', 'CL', 'CP', 'DN', 'EUCD',
    'EUCP', 'LQN', 'MTN', 'ONITE', 'PN', 'PZFJ', 'STN', 'TD', 'XCN', 'YCD',
    'ABS', 'CMBS', 'CMO', 'IET', 'MBS', 'MIO', 'MPO', 'MPP', 'MPT', 'PFAND',
    'TBA', 'AN', 'COFO', 'COFP', 'GO', 'MT', 'RAN', 'REV', 'SPCLA', 'SPCLO',
    'SPCLT', 'TAN', 'TAXA', 'TECP', 'TRAN', 'VRDN', 'WAR', 'MF', 'MLEG', 'NONE', '?'
];

function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx);
}

function get_random_num(min, max, isInt, digits) {
    if (isInt) {
        min = Math.ceil(min);
        max = Math.floor(max);
        // Returns a random number between min (inclusive) and max (exclusive)
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Returns a random integer between min (inclusive) and max (inclusive)
    return (Math.random() * (max - min) + min).toFixed(digits);
}

function get_random_even(min, max, isInt, digits) {
    let num = get_random_num(min, max, isInt, digits);
    while(num % 2 != 0) {
        num = get_random_num(min, max, isInt, digits);
    }
    return num;
}

function get_formated_time(addMin) {
    var o = new Date();
    var d = new Date(o.getTime() + addMin*60000);
    let dateStr = [d.getFullYear(), (d.getMonth() + 1), d.getDate()].join('');
    let timeStr = [d.getHours(), d.getMinutes(), d.getSeconds()].join(':') + '.' + d.getMilliseconds();
    console.log("timeStr: " + timeStr);

    let obj = {};
    obj['formated_time'] = [dateStr, timeStr].join('-');
    obj['date'] = dateStr;
    obj['time'] = timeStr;
    return obj;
}

function get_random_parties_info(num) {
    const partyIds = ["PROMA", "000000000002A", "CLA", "CA", "PEATA", "TA", "PROMB", "CLB", "000000000002B", "CB", "PEATB", "TB", "PROMC", "CLC", "000000000002C", "CC", "PEATC", "TC"];
    let selected_partyIds = [];
    let party_sources = [];
    let party_roles = [];
    let sides = [];
    let qty = [];
    let price = [];
    let total_qty = 0;
    let total_px = 0;
    let qp_map = {};
    let buyer_no = get_random_num(1, num - 1, true, 0);
    let seller_no = num - buyer_no;
    console.log(`buyer_no: ${buyer_no}`);
    let i = 0;
    while(i < num) {
        let ranIndex = get_random_num(0, partyIds.length - 1, true, 0);
        let role = get_random_num(1, 39, true, 0);
        let selected_id = partyIds[ranIndex];
        selected_partyIds.push(selected_id);
        party_sources.push("D");
        party_roles.push(role);
        partyIds.splice(ranIndex, 1);

        // Buyer: 1, seller: 2
        let max = Math.max(buyer_no, seller_no);
        let max_side = max == buyer_no ? "1" : "2";
        let min_side = max == buyer_no ? "2" : "1";
        
        i + 1 <= max ? sides.push(max_side) : sides.push(min_side);
        if(i + 1 <= max) {
            let q = get_random_num(1, 10, true, 0);
            let p;
            qty.push(q);
            if(i + 1 <= Math.min(buyer_no, seller_no)) {
                p = get_random_num(1, 50, false, 3);
            } else {
                let index_p = get_random_num(0, price.length - 1, true, 0);
                p = price[index_p];
            }
            // console.log("p: " + p);
            price.push(p);
            total_qty += q;
            total_px += p * q;
            qp_map[p] == null ? qp_map[p] = q : qp_map[p] += q;
            
        } else {
            // console.log(qp_map);
            let size = Object.keys(qp_map).length;
            let index_p = get_random_num(0, size -1, true, 0);
            let key = Object.keys(qp_map)[index_p];
            price.push(key);
            qty.push(qp_map[key]);
            delete qp_map[key];
        }
        i++;
    }

    console.log(`selected_partyIds: ${selected_partyIds}`);
    console.log(`party_sources: ${party_sources}`);
    console.log(`party_roles: ${party_roles}`);
    console.log(`sides: ${sides}`);
    console.log(`qty: ${qty}`);
    console.log(`price: ${price}`);
    console.log(`total_qty: ${total_qty}`);
    console.log(`total_px: ${total_px}`);

    let parties_info = {};
    parties_info['selected_partyIds'] = selected_partyIds;
    parties_info['party_sources'] = party_sources;
    parties_info['party_roles'] = party_roles;
    parties_info['sides'] = sides;
    parties_info['qty'] = qty;
    parties_info['price'] = price;
    parties_info['total_qty'] = total_qty;
    parties_info['total_px'] = total_px;

    return parties_info;
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function random_gen_single_obj(addMin) {
    let objVal = {};
    // "BeginString": "FIX.4.4"
    objVal['BeginString'] = "8=FIX.4.4"
    // "BodyLength": "428",
    let body_len = get_random_num(100, 999, true, 0);
    objVal['BodyLength'] = `9=${body_len}`;
    // "MsgType": "8",
    objVal['MsgType'] = "35=8";
    // "SenderCompID": "UPROMETHEUM",
    objVal['SenderCompID'] = "49=UPROMETHEUM";
    // "TargetCompID": "UICSYSTEM",
    objVal['TargetCompID'] = "56=UICSYSTEM";
    // "MsgSeqNum": "385",
    let msg_seq_num = get_random_num(0, 10000, true, 0);
    objVal['MsgSeqNum'] = `34=${msg_seq_num}`;
    // "SendingTime": "20200819-13:49:22.108",
    let sending_time = get_formated_time(addMin).formated_time;
    objVal['SendingTime'] = `52=${sending_time}`;
    // "OrderID": "1484224595000003",
    let orderid = get_random_num(1400000000000000, 1500000000000000, true, 0);
    objVal['OrderID'] = `37=${orderid}`;
    // "ClOrdID": "1484224595000004",
    let cl_orderid = get_random_num(1400000000000000, 1500000000000000, true, 0);
    objVal['ClOrdID'] = `11=${cl_orderid}`;
    // "NoPartyIDs": "6",
    let num_parties = get_random_even(2, 18, true, 0);
    objVal['NoPartyIDs'] = `453=${num_parties}`;
    // Random generate all parties info
    let partyObj = get_random_parties_info(num_parties);
    
    for(let i = 0; i < num_parties; i++) {
        // "PartyID": "PROMA"
        objVal[`PartyID${i}`] = `448=${partyObj['selected_partyIds'][i]}`;
        // "PartyIDSource": "D"
        objVal[`PartyIDSource${i}`] = `447=${partyObj['party_sources'][i]}`;
        // "PartyRole": "38"
        objVal[`PartyRole${i}`] = `452=${partyObj['party_roles'][i]}`;
        // "Side": "1"
        objVal[`Side${i}`] = `54=${partyObj['sides'][i]}`;
        // "OrderQty": "5"
        objVal[`OrderQty${i}`] = `38=${partyObj['qty'][i]}`;
        // "StopPx": "3.123"
        objVal[`StopPx${i}`] = `99=${partyObj['price'][i]}`;

        if(i == num_parties - 1) {
            // "LastQty": "10.000",
            objVal['LastQty'] = `32=${partyObj['qty'][i]}`;
            // "LastPx": "3.140",
            objVal['LastPx'] = `31=${partyObj['price'][i]}`;
            // "LastMkt": "PEAT",
            objVal['LastMkt'] = `30=${partyObj['selected_partyIds'][i]}`;
            // "LeavesQty": "0.000",
            objVal['LeavesQty'] = "151=0.000";
            // "CumQty": "15.000",
            objVal['CumQty'] = `14=${partyObj['total_qty']}`;
            // "AvgPx": "2.860",
            let avgPx = (partyObj['total_px']/partyObj['total_qty']).toFixed(3);
            objVal['AvgPx'] = `6=${avgPx}`;
        }

    }

    // "ExecID": "1484080956000003",
    let exec_id = get_random_num(1400000000000000, 1500000000000000, true, 0);
    objVal['ExecID'] = `17=${exec_id}`;
    // "ExecType": "F",
    let exec_type = index[get_random_num(0, 19, true, 0)];
    objVal['ExecType'] = `150=${exec_type}`;
    // "OrdStatus": "2",
    let order_status = index[get_random_num(0, 15, true, 0)];
    objVal['OrdStatus'] = `39=${order_status}`;
    // "Symbol": "MBR",
    objVal['Symbol'] = "55=MBR";
    // "SecurityType": "CS",
    let sec_type = security_index[get_random_num(0, 99, true, 0)];
    objVal['SecurityType'] = `167=${sec_type}`;
    // "OrdType": "1",
    let order_type = order_type_index[get_random_num(0, 17, true, 0)];
    objVal['OrdType'] = `40=${order_type}`;
    // "TimeInForce": "3",
    let time_in_force = index[get_random_num(0, 7, true, 0)];
    objVal['TimeInForce'] = `59=${time_in_force}`;
    // "TradeDate": "20200819",
    let trade_time = get_formated_time(addMin);
    objVal['TradeDate'] = `75=${trade_time.date}`;
    // "TransactTime": "20200819-13:49:22.079",
    objVal['TransactTime'] = `60=${trade_time.formated_time}`;
    // "Unknown1": "00",
    objVal['Unknown1'] = "7937=00";
    // "Unknown2": "N0",
    objVal['Unknown2'] = "7938=N0";
    // "Unknown3": "00",
    objVal['Unknown3'] = "7939=00";
    // "CheckSum": "079"
    let checksum = get_random_num(0, 999, true, 0);
    objVal['CheckSum'] = `10=${checksum}`;

    return objVal;
}

function random_gen(len, addMin) {
    let data = [];
    for(let i = 0; i < len; i++) {
        let obj = random_gen_single_obj(addMin);
        data.push(obj);
    }
    return data;
}

function write_output(data, filename) {
    // let data = random_gen(len, addMin);
    const ws = fs.createWriteStream(filename, { 'flags': 'a', 'encoding': null});
    fastcsv
    .write(data)
    .pipe(ws);
}

async function start_generate(num) {
    for(let i = 0; i < (num * 2 + 1);) {
        console.log(`---------------${i}th------------------`);
        if((i+1) % 23 != 0) {
            let data = random_gen(1, i*30);
            write_output(data, "out.csv");

            let newline = ['\n'];
            write_output(newline, "out.csv");
            await sleep(1000);
            i += 2;
        } else {
            i ++;
        }
    }
}

start_generate(25);

// async function start_generate(num) {

//     for(let i = 0; i < num;) {
//         console.log(`---------------${i}th------------------`);
//         if((i+1) % 23 != 0) {
//             let data = random_gen(1, i*30);
//             write_output(data, "out.csv");

//             let newline = ['\n'];
//             write_output(newline, "out.csv");
//             // await sleep(5000);
//             i += 2;
//         } else {
//             i ++;
//         }
//     }

//     // start_generate(obj_gen, 5, './output.csv');

//     // await sleep(5000);

//     // start_generate(line_break, 1, './output.csv');

//     // start_generate(obj_gen_after_break, 5, './output.csv');

//     // let data = random_gen(5);
//     // const ws = fs.createWriteStream("out.csv");
//     // fastcsv
//     // .write(data)
//     // .pipe(ws);
// }

// start_generate(51);

// function obj_gen() {
//     let objVal = [];
//     // "BeginString": "FIX.4.4"
//     objVal.push("8=FIX.4.4");
//     // "BodyLength": "428",
//     let body_len = get_random_num(100, 999, true, 0);
//     objVal.push(`9=${body_len}`);
//     // "MsgType": "8",
//     objVal.push("35=8");
//     // "SenderCompID": "UPROMETHEUM",
//     objVal.push("49=UPROMETHEUM");
//     // "TargetCompID": "UICSYSTEM",
//     objVal.push("56=UICSYSTEM");
//     // "MsgSeqNum": "385",
//     let msg_seq_num = get_random_num(0, 10000, true, 0);
//     objVal.push(`34=${msg_seq_num}`);
//     // "SendingTime": "20200819-13:49:22.108",
//     let sending_time = get_formated_time(0).formated_time;
//     objVal.push(`52=${sending_time}`);
//     // "OrderID": "1484224595000003",
//     let orderid = get_random_num(1400000000000000, 1500000000000000, true, 0);
//     objVal.push(`37=${orderid}`);
//     // "ClOrdID": "1484224595000004",
//     let cl_orderid = get_random_num(1400000000000000, 1500000000000000, true, 0);
//     objVal.push(`11=${cl_orderid}`);
//     // "NoPartyIDs": "6",
//     let num_parties = get_random_even(2, 18, true, 0);
//     objVal.push(`453=${num_parties}`);
//     // Random generate all parties info
//     let partyObj = get_random_parties_info(num_parties);
    
//     for(let i = 0; i < num_parties; i++) {
//         // "PartyID": "PROMA"
//         objVal.push(`448=${partyObj['selected_partyIds'][i]}`);
//         // "PartyIDSource": "D"
//         objVal.push(`447=${partyObj['party_sources'][i]}`);
//         // "PartyRole": "38"
//         objVal.push(`452=${partyObj['party_roles'][i]}`);
//         // "Side": "1"
//         objVal.push(`54=${partyObj['sides'][i]}`);
//         // "OrderQty": "5"
//         objVal.push(`38=${partyObj['qty'][i]}`);
//         // "StopPx": "3.123"
//         objVal.push(`99=${partyObj['price'][i]}`);

//         if(i == num_parties - 1) {
//             // "LastQty": "10.000",
//             objVal.push(`32=${partyObj['qty'][i]}`);
//             // "LastPx": "3.140",
//             objVal.push(`31=${partyObj['price'][i]}`);
//             // "LastMkt": "PEAT",
//             objVal.push(`30=${partyObj['selected_partyIds'][i]}`);
//             // "LeavesQty": "0.000",
//             objVal.push("151=0.000");
//             // "CumQty": "15.000",
//             objVal.push(`14=${partyObj['total_qty']}`);
//             // "AvgPx": "2.860",
//             let avgPx = (partyObj['total_px']/partyObj['total_qty']).toFixed(3);
//             objVal.push(`6=${avgPx}`);
//         }

//     }

//     // "ExecID": "1484080956000003",
//     let exec_id = get_random_num(1400000000000000, 1500000000000000, true, 0);
//     objVal.push(`17=${exec_id}`);
//     // "ExecType": "F",
//     let exec_type = index[get_random_num(0, 19, true, 0)];
//     objVal.push(`150=${exec_type}`);
//     // "OrdStatus": "2",
//     let order_status = index[get_random_num(0, 15, true, 0)];
//     objVal.push(`39=${order_status}`);
//     // "Symbol": "MBR",
//     objVal.push("55=MBR");
//     // "SecurityType": "CS",
//     let sec_type = security_index[get_random_num(0, 99, true, 0)];
//     objVal.push(`167=${sec_type}`);
//     // "OrdType": "1",
//     let order_type = order_type_index[get_random_num(0, 17, true, 0)];
//     objVal.push(`40=${order_type}`);
//     // "TimeInForce": "3",
//     let time_in_force = index[get_random_num(0, 7, true, 0)];
//     objVal.push(`59=${time_in_force}`);
//     // "TradeDate": "20200819",
//     let trade_time = get_formated_time(0);
//     objVal.push(`75=${trade_time.date}`);
//     // "TransactTime": "20200819-13:49:22.079",
//     objVal.push(`60=${trade_time.formated_time}`);
//     // "Unknown1": "00",
//     objVal.push("7937=00");
//     // "Unknown2": "N0",
//     objVal.push("7938=N0");
//     // "Unknown3": "00",
//     objVal.push("7939=00");
//     // "CheckSum": "079"
//     let checksum = get_random_num(0, 999, true, 0);
//     objVal.push(`10=${checksum}`);

//     return objVal;
// }

// function obj_gen_after_break() {
//     let objVal = [];
//     // "BeginString": "FIX.4.4"
//     objVal.push("8=FIX.4.4");
//     // "BodyLength": "428",
//     let body_len = get_random_num(100, 999, true, 0);
//     objVal.push(`9=${body_len}`);
//     // "MsgType": "8",
//     objVal.push("35=8");
//     // "SenderCompID": "UPROMETHEUM",
//     objVal.push("49=UPROMETHEUM");
//     // "TargetCompID": "UICSYSTEM",
//     objVal.push("56=UICSYSTEM");
//     // "MsgSeqNum": "385",
//     let msg_seq_num = get_random_num(0, 10000, true, 0);
//     objVal.push(`34=${msg_seq_num}`);
//     // "SendingTime": "20200819-13:49:22.108",
//     let sending_time = get_formated_time(30).formated_time;
//     objVal.push(`52=${sending_time}`);
//     // "OrderID": "1484224595000003",
//     let orderid = get_random_num(1400000000000000, 1500000000000000, true, 0);
//     objVal.push(`37=${orderid}`);
//     // "ClOrdID": "1484224595000004",
//     let cl_orderid = get_random_num(1400000000000000, 1500000000000000, true, 0);
//     objVal.push(`11=${cl_orderid}`);
//     // "NoPartyIDs": "6",
//     let num_parties = get_random_even(2, 18, true, 0);
//     objVal.push(`453=${num_parties}`);
//     // Random generate all parties info
//     let partyObj = get_random_parties_info(num_parties);
    
//     for(let i = 0; i < num_parties; i++) {
//         // "PartyID": "PROMA"
//         objVal.push(`448=${partyObj['selected_partyIds'][i]}`);
//         // "PartyIDSource": "D"
//         objVal.push(`447=${partyObj['party_sources'][i]}`);
//         // "PartyRole": "38"
//         objVal.push(`452=${partyObj['party_roles'][i]}`);
//         // "Side": "1"
//         objVal.push(`54=${partyObj['sides'][i]}`);
//         // "OrderQty": "5"
//         objVal.push(`38=${partyObj['qty'][i]}`);
//         // "StopPx": "3.123"
//         objVal.push(`99=${partyObj['price'][i]}`);

//         if(i == num_parties - 1) {
//             // "LastQty": "10.000",
//             objVal.push(`32=${partyObj['qty'][i]}`);
//             // "LastPx": "3.140",
//             objVal.push(`31=${partyObj['price'][i]}`);
//             // "LastMkt": "PEAT",
//             objVal.push(`30=${partyObj['selected_partyIds'][i]}`);
//             // "LeavesQty": "0.000",
//             objVal.push("151=0.000");
//             // "CumQty": "15.000",
//             objVal.push(`14=${partyObj['total_qty']}`);
//             // "AvgPx": "2.860",
//             let avgPx = (partyObj['total_px']/partyObj['total_qty']).toFixed(3);
//             objVal.push(`6=${avgPx}`);
//         }

//     }

//     // "ExecID": "1484080956000003",
//     let exec_id = get_random_num(1400000000000000, 1500000000000000, true, 0);
//     objVal.push(`17=${exec_id}`);
//     // "ExecType": "F",
//     let exec_type = index[get_random_num(0, 19, true, 0)];
//     objVal.push(`150=${exec_type}`);
//     // "OrdStatus": "2",
//     let order_status = index[get_random_num(0, 15, true, 0)];
//     objVal.push(`39=${order_status}`);
//     // "Symbol": "MBR",
//     objVal.push("55=MBR");
//     // "SecurityType": "CS",
//     let sec_type = security_index[get_random_num(0, 99, true, 0)];
//     objVal.push(`167=${sec_type}`);
//     // "OrdType": "1",
//     let order_type = order_type_index[get_random_num(0, 17, true, 0)];
//     objVal.push(`40=${order_type}`);
//     // "TimeInForce": "3",
//     let time_in_force = index[get_random_num(0, 7, true, 0)];
//     objVal.push(`59=${time_in_force}`);
//     // "TradeDate": "20200819",
//     let trade_time = get_formated_time(30);
//     objVal.push(`75=${trade_time.date}`);
//     // "TransactTime": "20200819-13:49:22.079",
//     objVal.push(`60=${trade_time.formated_time}`);
//     // "Unknown1": "00",
//     objVal.push("7937=00");
//     // "Unknown2": "N0",
//     objVal.push("7938=N0");
//     // "Unknown3": "00",
//     objVal.push("7939=00");
//     // "CheckSum": "079"
//     let checksum = get_random_num(0, 999, true, 0);
//     objVal.push(`10=${checksum}`);

//     return objVal;
// }

// function start_generate(colFunc, len, filename) {
//     var writeStream = fs.createWriteStream(filename, { 'flags': 'a', 'encoding': null});
//     generate({
//       columns: [colFunc],
//       length: len,
//     //   rowDelimiter: '\n\r'
//     })
//     .pipe(writeStream, {end: false});
// }