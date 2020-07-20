const ObjectId = require('mongodb').ObjectID;
class Campaigns {
    constructor(dbClient) {
        this.db=dbClient.db(process.env.DB_NAME)
    }
    async ReadData(req) {
        let query = req.query;
        let result = await this.db.collection('campaigns').aggregate(query);
        return {
            status:0,
            result:result
        }
    }
    async SaveData(req) {
        let saveData=req.saveData;
        if (!saveData._id){
            saveData._id=ObjectId().toString();
        }
        await this.db.save(saveData);
        return {
            status:0,
            msg:"Saved successfully"
        }
    }
}
module.exports = Campaigns
