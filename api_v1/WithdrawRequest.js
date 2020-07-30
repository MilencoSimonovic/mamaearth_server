const ObjectId = require('mongodb').ObjectID;
class WithdrawRequest {
    constructor(dbClient) {
        this.db=dbClient.db(process.env.DB_NAME)
    }
    async ReadData(req) {
        let query = req.body.query;
        let result = await this.db.collection('withdraw_requests').aggregate(query).toArray();
        return {
            status:0,
            result:result
        }
    }
    async SaveData(req) {
        let saveData=req.body;
        if (!saveData._id){
            saveData._id=ObjectId().toString();
        }
        await this.db.collection('withdraw_requests').save(saveData);
        return {
            status:0,
            msg:"Saved successfully"
        }
    }
}
module.exports = WithdrawRequest
