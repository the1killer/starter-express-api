import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { decrypt } from "./stfccrypto.mjs";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
  
const getTokens = async (key = "0") => {
    const command = new GetCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            myKey: key,
        },
    });

    const response = await docClient.send(command);
    // console.log(response);
    var tokens = response.Item?.tokens;
    if(tokens != undefined) {
        tokens = JSON.parse(tokens);
        var decrypted = [];
        for(var i in tokens) {
            decrypted[i] = decrypt(tokens[i]);
        }
        return decrypted;
    }
    else return [];
};

const updateTokens = async (tokens, key = "0") => {
    var record = JSON.stringify(tokens);
    const command = new UpdateCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            myKey: key,
        },
        UpdateExpression: "set tokens = :t",
        ExpressionAttributeValues: {
            ":t": record,
        },
        ReturnValues: "ALL_NEW",
    });
    const response = await docClient.send(command);
    // console.log(response);
    return response.Attributes?.tokens;
};

export { getTokens, updateTokens };