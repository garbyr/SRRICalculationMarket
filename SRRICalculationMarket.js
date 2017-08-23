// dependencies
const aws = require('aws-sdk');
aws.config.update({ region: 'eu-west-1' });
//globals
var error = false;
var errorMessage = [];
var functionName;

exports.handler = (event, context, callback) => {
    var rSquaredSum = 0;
    var riskScore = 0;
    var volatility = 0;
    var arrayLength = event.navArray.length;      
    var sumNav = 0;
    functionName = context.functionName;    
    //calculate the average - loop through array sum and divide by count
    for (var i = 0; i < arrayLength; i++) {
        sumNav += event.navArrary[i].NAV;
        count += 1;
    }    
    var navAverage = sumNav / count;


    //loop through the navArray and calculate the r-rbar squared
    for (var i = 0; i < arrayLength; i++) {
        console.log(message.navArray[i]);
        console.log(parseFloat(message.navArray[i]));
        var tempminusaverage = (parseFloat(message.navArray[i]) - parseFloat(navAverage));
        var temprSquared = parseFloat(Math.pow(tempminusaverage, 2).toFixed(4));
        var tempSum = parseFloat(Math.addfloats(rSquaredSum, temprSquared).toFixed(4));
        rSquaredSum = tempSum;
        console.log("Total r Squared " + rSquaredSum);
    }
    //risk score
    if((event.frequency != 'Weekly') || (event.frequency != 'Monthly')){
        console.log("ERROR: Invlaid frequency, could not calculate SRRI");
        error = true;
        errorMessage.push("Invalid frequency, could not calculate SRRI");
        raiseError(event.ISIN, event.sequence, event.requestUUID, event.user, callback);
    } else {
    
    if(event.frequency == 'Monthly'){
        volatility = (Math.sqrt(rSquaredSum * (12 / 59))).toFixed(1);
    } else{
        //some other calculation based on weeks
        volatility = (Math.sqrt(rSquaredSum * (12 / 59))).toFixed(1);
    }
    riskScore = getRiskScore(volatility);
    console.log("your risk score is " + riskScore);
    var response = {
        riskScore: riskScore,
        volatility: volatility,
        sequence: event.sequence,
        ISIN: event.ISIN,
        user: event.user,
        requestUUID: event.requestUUID,
        category: event.category,
        frequency: event.frequency,
    };
     var output = {
                status: "200",
                response: response
            }
        callback(null, { response });
    }
}

Math.addfloats = function (f1, f2) {
    return (parseFloat(f1) + parseFloat(f2));
}

getRiskScore = function (volatility) {
    var riskScore;
    if (volatility >= 0 && volatility < 0.5) {
        riskScore = 1;
    } else if (volatility < 2) {
        riskScore = 2;
    } else if (volatility < 5) {
        riskScore = 3;
    } else if (volatility < 10) {
        riskScore = 4;
    } else if (volatility < 15) {
        riskScore = 5;
    } else if (volatility < 25) {
        riskScore = 6;
    } else if (volatility > 25) {
        riskScore = 7;
    }
    return riskScore;
}

RaiseError = function (ISIN, sequence, requestUUID, user, callback) {
    //write to the database
    var errorObj = {
        requestUUID: requestUUID,
        ISIN:ISIN,
        sequence: sequence,
        user: user,
        function: functionName,
        messages: errorMessage,
    }
    //reset error details just in case container is reused!!
    error = false;
    errorMessage = [];
    callback(errorObj);
}
