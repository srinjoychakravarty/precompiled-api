var fs = require("fs");
const { parse } = require("path");

// use pseudo session_id & sst_class & trade_type in here
function get_execute_data(path, mapPath, executeDestPath, settleDestPath, sessionId, digits) {
    let buffer = fs.readFileSync(path);
    let parsedData = JSON.parse(buffer);
    let mapBuffer = fs.readFileSync(mapPath);
    let map = JSON.parse(mapBuffer);

    let executeTradeObjs = [], rawSettleData = [];
    parsedData.forEach(data => {
        let executeTradeObj = get_execute_trade_obj(data, sessionId, 2, 0, digits);
        executeTradeObjs.push(executeTradeObj);

        let rawDataObj = get_settle_data_obj(data, map, digits);
        rawSettleData.push(rawDataObj);

        sessionId++;
    });
    
    console.log(executeTradeObjs);
    console.log(rawSettleData);

    let data = JSON.stringify(executeTradeObjs);
    fs.writeFileSync(executeDestPath, data);

    let data2 = JSON.stringify(rawSettleData);
    fs.writeFileSync(settleDestPath, data2);

    return {executeTradeObjs, rawSettleData};
}

function get_execute_trade_obj(data, sessionId, sstClass, tradeType, digits) {
    let executeTradeObj = {};
    executeTradeObj['session_id'] = sessionId;
    executeTradeObj['sst_id'] = data['Symbol'];
    executeTradeObj['sst_class'] = sstClass;
    executeTradeObj['amount'] = sum(data['OrderQty'], data['StopPx'], data['Side']).toFixed(digits).toString();
    executeTradeObj['timestamp'] = parse_to_timestamp(data['TransactTime']);
    executeTradeObj['trade_type'] = tradeType;
    return executeTradeObj;
}

function get_settle_data_obj(data, map, digits) {
    let resultObj = {};
    resultObj['phrase'] = [];
    resultObj['balance'] = [];
    let partyIdArr = data['PartyID'];
    partyIdArr.forEach((id) => {
        let index = partyIdArr.indexOf(id);
        let bal = data['OrderQty'][index] * data['StopPx'][index];
        // console.log("px: " + 3.14 * 10);
        resultObj['phrase'].push(map[id]);
        resultObj['balance'].push(assign_sign(bal.toFixed(digits), data['Side'][index]).toString());
    });
    return resultObj;
}

function assign_sign(number, side) {
    return side == 2 ? -number : number;
}

// pick up same side of qty & px to sum up 
function sum(qtyArr, pxArr, sideArr) {
    let total = 0;
    for(let i = 0; i < sideArr.length; i++) {
        if(sideArr[i] == 1) {
            total += qtyArr[i] * pxArr[i];
        }
    }
    return total;
}

function parse_to_timestamp(timeStr) {
    let t = timeStr.split('-');
    let formatted_date = t[0].slice(0, 4) + '/' + t[0].slice(4, 6) + '/' + t[0].slice(6);
    let formatted_time = [formatted_date, t[1]].join('-');
    let timestamp = Date.parse(formatted_time)/1000;
    return timestamp.toString();
}

const data_path = "../output/parsed_data.json";
const dest_path = "../output/execute_trade_objs.json";
const dest_path2 = "../output/raw_settle_data.json";
const map_path = "../index/test_accounts_phrase_map.json";
get_execute_data(data_path, map_path, dest_path, dest_path2, 10, 8);