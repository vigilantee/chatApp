




const mongoclient = require("mongodb").MongoClient;
const db_uri = "mongodb+srv://Pratik123:test123@cluster0-c6prt.mongodb.net/test?retryWrites=true&w=majority";

mongoclient.connect(db_uri, (error, dbclient) => {
    if(error){
        console.log("some error while connecting to mongo db");
        throw error;
    }
    console.log("connection successful");
});

module.exports = mongoclient;
