const { MongoClient } = require('mongodb');
 
const uri = 'mongodb://127.0.0.1:27017';
const dbName = 'myProject';
 
let db;
 
async function connectDb() {
 const client = new MongoClient(uri, {
 useNewUrlParser: true,
 useUnifiedTopology: true,
 });
 
 try {
 await client.connect();
 console.log('Connected to database');
 db = client.db(dbName);

 } catch (err) {
 console.log(err);
 }
}
 
function getDb() {
 return db;
}
 
module.exports = { connectDb, getDb };



