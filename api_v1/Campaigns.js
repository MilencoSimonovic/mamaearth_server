const ObjectId = require('mongodb').ObjectID;
class Campaigns {
    constructor(dbClient) {
        this.db=dbClient.db(process.env.DB_NAME)
    }
    async ReadData(req) {
        let query = req.body.query;
        console.log()
        let result = await this.db.collection('campaigns').aggregate(query).toArray();
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
        await this.db.collection('campaigns').save(saveData);
        return {
            status:0,
            msg:"Saved successfully"
        }
    }
}
module.exports = Campaigns
