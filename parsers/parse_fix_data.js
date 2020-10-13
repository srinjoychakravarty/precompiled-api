var fs = require("fs");

function parseFixData(fixDataPaths, indexPath, mapPath, destPath, isCSV) {
    let results = [];
    fixDataPaths.forEach(path => {
        let result = parseSingleFile(path, indexPath, isCSV);
        results.push(result);
    });
    let temp = filterObjs(results);
    let final = partyId_to_test_account(temp, mapPath);
    console.log(final);
    console.log(`final number: ${final.length}`);
    let data = JSON.stringify(final);
    fs.writeFileSync(destPath, data);
    return final;
}

function parseSingleFile(path, indexPath, isCSV) {
    let rawData = fs.readFileSync(path, "utf-8");
    let buffer = fs.readFileSync(indexPath);
    let indexObj = JSON.parse(buffer);
    let rawDataByLines = isCSV ? rawData.split("\"") : rawData.split("\n");
    let arr = [];
    rawDataByLines.forEach((line) => {
        // console.log(line);
        parseSingleLine(arr, line, indexObj, isCSV);
    });
    return arr;
}

function parseSingleLine(array, line, indexObj, isCSV) {
    let fields = isCSV ? line.split(",") : line.split("\u0001");
    console.log(fields);
    let parsedData = {};
    for(let i = 0; i < fields.length; i++) {
        i == 0 ? fields[i] = fields[i].split(" ").pop() : null;
        let keyVal = fields[i].split("=");
        if(keyVal.length == 2) {
            let [key,val] = keyVal;
            let k = indexObj[key];
            if(k in parsedData) {
                let v = parsedData[k];
                Array.isArray(v) ? parsedData[k].push(val) : parsedData[k] = [v, val];
            } else {
                parsedData[k] = val;
            }
        }
    }
    array.push(parsedData);
}

function filterObjs(array) {
    let results = [];
    array.forEach((arr) => {
        let newArr = arr.filter((obj) => {
            return 'OrderID' in obj;
        });
        results.push(...newArr);
    });
    // console.log(results);
    return results;
}

function partyId_to_test_account(arr, mapPath) {
    let buffer = fs.readFileSync(mapPath);
    let mapObj = JSON.parse(buffer);

    arr.forEach((obj) => {
        let ids = obj["PartyID"];
        ids.forEach((id) => {
            let index = ids.indexOf(id);
            if(id in mapObj) {
                ids[index] = mapObj[id]
            } else {
                let newTestAcc = format_test_account(Object.keys(mapObj).length + 1);
                mapObj[id] = newTestAcc;
                ids[index] = newTestAcc;
            }
        });
    });

    let data = JSON.stringify(mapObj);
    fs.writeFileSync(mapPath, data);
    return arr;
}

function format_test_account(num) {
    var formattedNumber = ("0000000" + num).slice(-8);
    console.log(formattedNumber);
    return formattedNumber;
}

// const paths = ["../settle-raw-data/fix_sample1.txt", "../settle-raw-data/fix_sample2.txt", "../settle-raw-data/fix_sample3.txt"];
const paths = ["../settle-raw-data/out.csv"];
const index_path = "../index/fix_index.json";
const map_path = "../index/partyId_test_accounts_map.json";
const dest_path = "../output/parsed_data.json";

parseFixData(paths, index_path, map_path, dest_path, true);