const ObjectId = require('mongodb').ObjectID;
class PaymentHistory {
    constructor(dbClient) {
        this.db=dbClient.db(process.env.DB_NAME)
    }
    async ReadData(req) {
        let query = req.body.query;
        let result = await this.db.collection('videos').aggregate(query).toArray();
        return {
            status:0,
            result:result
        }
    }
    async SaveData(req) {
        let saveData=req.body;
        if (!saveData._id){
            saveData._id=ObjectId().toString();
            saveData.created_at=new Date();
        }
        await this.db.collection('videos').save(saveData);
        return {
            status:0,
            msg:"Saved successfully"
        }
    }
}
module.exports = PaymentHistory
