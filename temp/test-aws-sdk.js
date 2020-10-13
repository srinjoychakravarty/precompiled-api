var AWS = require("aws-sdk");
var fs = require("fs");
const async = require("async");

// Check credentials
AWS.config.getCredentials(function(err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("Access key:", AWS.config.credentials.accessKeyId);
  }
});

// Set the region 
AWS.config.update({region: 'REGION'});

// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2020-10-05'});

var queueURL = "https://sqs.us-east-1.amazonaws.com/372943446846/inteliclear-inbound-1.fifo";

var i = 0;
var numMsg = 2;
var deduplicationId = Date.now();

// test to receive messages, parse and delete messages
async function test_receive_message_from_sqs(i, num) {
    // parameters for receiving message
    var params = {
        AttributeNames: [
            "SentTimestamp",
            "MessageGroupId"
        ],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: [
            "All"
        ],
        QueueUrl: queueURL,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 0
    };

    sqs.receiveMessage(params, function(err, data) {
        if (err) {
            console.log("Receive Error", err);
        } else if (data.Messages) {
            //   console.log(data.Messages);
            let arr = [];
            data.Messages.forEach(async(msg) => {
                if(msg.Attributes.MessageGroupId == "rawGroup") {
                    // parse the message body
                    let line = msg.Body;
                    const index_path = "../index/fix_index.json";
                    let buffer = fs.readFileSync(index_path);
                    let indexObj = JSON.parse(buffer);
                    parseSingleLine(arr, line, indexObj, false);
    
                    // delete message
                    deleteMsg(sqs, msg.ReceiptHandle);
                }
            });
            
            // filter out messages with orderId
            const map_path = "../index/partyId_test_accounts_map.json";
            let temp = filterObjs(arr);
            let final = temp.length != 0 ? partyId_to_test_account(temp, map_path) : temp;
            console.log(final);

            // if has message after filter, send messages
            if(final.length != 0) {
                final.forEach((obj) => {
                    sendMsg(sqs, JSON.stringify(obj), deduplicationId.toString(), "parsedGroup");
                })
            }

            // write ouput to json file for check
            let output = JSON.stringify(final);
            fs.appendFileSync("./parsed_data.json", output);

            i++;
            console.log("i: " + i);
            i < num ? test_receive_message_from_sqs(i, num) : null;
        } else {
            console.log("No data.");
            test_receive_message_from_sqs(i, num);
        }
    });
}

function sendMsg(sqs, msgBody, ddId, gId) {
    var params = {
        // Remove DelaySeconds parameter and value for FIFO queues
       MessageAttributes: {
         "Title": {
           DataType: "String",
           StringValue: "Parsed fix data"
         },
         "Author": {
           DataType: "String",
           StringValue: "yunchen"
         },
         "Source": {
           DataType: "String",
           StringValue: "Inteliclear"
         }
       },
       MessageBody: msgBody,
       MessageDeduplicationId: ddId,  // Required for FIFO queues
       MessageGroupId: gId,  // Required for FIFO queues
       QueueUrl: queueURL
     };
     
    sqs.sendMessage(params, function(err, data) {
       if (err) {
         console.log("Error", err);
       } else {
         console.log("Success", data.MessageId);
       }
     });
}

function deleteMsg(sqs, receipt_handle) {
    var param = {
        QueueUrl: queueURL,
        ReceiptHandle: receipt_handle
    };

    sqs.deleteMessage(param, function(err, data) {
        if (err) {
            console.log("Delete Error", err);
            // reject(err);
        } else {
            console.log("Message Deleted", data);
            // resolve(data);
        }
    });
}

// test to receive message without parsing
function check_receivedMsg() {
    // parameters for receiving message
    var params = {
        AttributeNames: [
            "MessageGroupId"
        ],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: [
            "All"
        ],
        QueueUrl: queueURL,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 0
    };

    sqs.receiveMessage(params, function(err, data) {
        if (err) {
            console.log("Receive Error", err);
        } else if (data.Messages) {
            data.Messages.forEach((msg) => {
                let group_id = msg.Attributes.MessageGroupId;
                console.log(`MessageId: ${msg.MessageId}`);
                console.log(`ReceiptHandle: ${msg.ReceiptHandle}`);
                console.log(`MD5OfBody: ${msg.MD5OfBody}`);
                console.log(`Attributes: ${group_id}`);
                console.log(`MD5OfMessageAttributes: ${msg.MD5OfMessageAttributes}`);
                if(group_id == 'testGroup' || group_id == 'parsedGroup') {
                    // let arr = JSON.parse(JSON.stringify(msg.Body));
                    console.log(JSON.parse(msg.Body));
                } else {
                    console.log(`Body: ${msg.Body}`);
                }
                for(let p in msg.MessageAttributes) {
                    console.log(`${p}: ${JSON.stringify(msg.MessageAttributes[p]["StringValue"])}`);
                }
                console.log("---------------------------------");
            })
            // console.log(data.Messages);
        }
    });
}

// test to receive messages without parsing and delete those messages
function check_receivedAndDelMsg() {
    // parameters for receiving message
    var params = {
        AttributeNames: [
            "MessageGroupId"
        ],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: [
            "All"
        ],
        QueueUrl: queueURL,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 0
    };

    sqs.receiveMessage(params, function(err, data) {
        if (err) {
            console.log("Receive Error", err);
        } else if (data.Messages) {
            data.Messages.forEach((msg) => {
                let group_id = msg.Attributes.MessageGroupId;
                console.log(`MessageId: ${msg.MessageId}`);
                console.log(`ReceiptHandle: ${msg.ReceiptHandle}`);
                console.log(`MD5OfBody: ${msg.MD5OfBody}`);
                console.log(`Attributes: ${group_id}`);
                console.log(`MD5OfMessageAttributes: ${msg.MD5OfMessageAttributes}`);
                if(group_id == 'testGroup' || group_id == 'parsedGroup') {
                    // let arr = JSON.parse(JSON.stringify(msg.Body));
                    console.log(msg.Body);
                } else {
                    console.log(`Body: ${msg.Body}`);
                }
                for(let p in msg.MessageAttributes) {
                    console.log(`${p}: ${JSON.stringify(msg.MessageAttributes[p]["StringValue"])}`);
                }
                console.log("---------------------------------");
                deleteMsg(sqs, msg.ReceiptHandle);
            })
            // console.log(data.Messages);
        }
    });
}

// psuedo matching order data
let t = [
    {
        "BeginString": "FIX.4.4",
        "BodyLength": "433",
        "MsgType": "8",
        "SenderCompID": "UPROMETHEUM",
        "TargetCompID": "UICSYSTEM",
        "MsgSeqNum": "1157",
        "SendingTime": "20201005-16:35:56.837",
        "OrderID": "1488423421000117",
        "ClOrdID": "1488423421000117",
        "NoPartyIDs": "6",
        "PartyID": [
            "00000019",
            "00000020",
            "00000021",
            "00000022",
            "00000023",
            "00000024"
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
        "ExecID": "1488410206000098",
        "ExecType": "F",
        "OrdStatus": "1",
        "Symbol": "MBR.ST",
        "SecurityType": "CS",
        "Side": "1",
        "OrderQty": "10.000",
        "OrdType": "2",
        "TimeInForce": "0",
        "LastQty": "5.000",
        "LastPx": "10.000",
        "LastMkt": "PEAT",
        "LeavesQty": "0.000",
        "CumQty": "5.000",
        "AvgPx": "10.000",
        "TradeDate": "20201005",
        "TransactTime": "20201005-16:35:56.817",
        "Unknown1": "00",
        "Unknown2": "N0",
        "Unknown3": "00",
        "CheckSum": "094"
    },
    {
        "BeginString": "FIX.4.4",
        "BodyLength": "432",
        "MsgType": "8",
        "SenderCompID": "UPROMETHEUM",
        "TargetCompID": "UICSYSTEM",
        "MsgSeqNum": "1158",
        "SendingTime": "20201005-16:35:56.837",
        "OrderID": "1488423421000118",
        "ClOrdID": "1488423421000118",
        "NoPartyIDs": "6",
        "PartyID": [
            "00000019",
            "00000020",
            "00000025",
            "00000022",
            "00000023",
            "00000024"
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
        "ExecID": "1488410206000098",
        "ExecType": "F",
        "OrdStatus": "2",
        "Symbol": "MBR.ST",
        "SecurityType": "CS",
        "Side": "2",
        "OrderQty": "5.000",
        "OrdType": "2",
        "TimeInForce": "0",
        "LastQty": "5.000",
        "LastPx": "10.000",
        "LastMkt": "PEAT",
        "LeavesQty": "0.000",
        "CumQty": "5.000",
        "AvgPx": "10.000",
        "TradeDate": "20201005",
        "TransactTime": "20201005-16:35:56.817",
        "Unknown1": "00",
        "Unknown2": "N0",
        "Unknown3": "00",
        "CheckSum": "055"
    }
];

let r = "20201005-16:35:56.826 : 8=FIX.4.4|9=433|35=8|49=UPROMETHEUM|56=UICSYSTEM|34=1157|52=20201005-16:35:56.837|37=1488423421000117|11=1488423421000117|453=6|448=PROM|447=D|452=40|448=CL|447=D|452=41|448=000000000002|447=D|452=42|448=C|447=D|452=43|448=PEAT|447=D|452=46|448=T|447=D|452=44|17=1488410206000098|150=F|39=1|55=MBR.ST|167=CS|54=1|38=10.000|40=2|59=0|32=5.000|31=10.000|30=PEAT|151=0.000|14=5.000|6=10.000|75=20201005|60=20201005-16:35:56.817|7937=00|7938=N0|7939=00|10=094|";

// sendMsg(sqs, JSON.stringify(t[1]), "2", "testGroup");
// sendMsg(sqs, r, "4", "rawGroup");

// test_receive_message_from_sqs(i, numMsg);

check_receivedMsg();

// check_receivedAndDelMsg();



// <----- below are help functions ----->

function parseSingleLine(array, line, indexObj, isCSV) {
    let fields = isCSV ? line.split(",") : line.split(/["\u0001"|\/]/);
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
    // let results = [];
    let newArr = array.filter((obj) => {
        return 'OrderID' in obj;
    });
    // results.push(...newArr);
    // console.log(results);
    return newArr;
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