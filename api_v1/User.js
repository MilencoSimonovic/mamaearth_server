const ObjectId = require('mongodb').ObjectID;
var bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
class User {
    constructor(dbClient) {
        this.db=dbClient.db(process.env.DB_NAME)
    }
    async GetUser() {
        var result = await this.db.collection('users').find().toArray()
        return result
    }
    async UserSignUp(req){
        let data=req.body
        if (await this.isDuplicateUserByEmail(data.email)){
            return {
                state:-1,
                msg:"Email duplicated, Please use another email"
            }
        }
        let apiToken = uuidv4();
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        let user={
            _id:ObjectId().toString(),
            auth:{
                email:data.email,
                password:bcrypt.hashSync(data.password),
                apiToken,
                uid:uuidv4(),
                level:0,
                isEnable:true,
                authProvider:[
                    {
                        name:'google',
                        id:'',
                    },
                    {
                        name:'facebook',
                        id:'',
                    }
                ],
            },
            info:{
                email:data.email,
                name:data.name||"",
                photoUrl:"",
            },
            created_at:new Date().toISOString(),
            updated_at:new Date().toISOString(),
        }
        await this.db.collection('users').insertOne(user)
        await this.db.collection('login_history').insertOne({
            _id:ObjectId().toString(),
            uid: user.auth.uid,
            apiToken: apiToken,
            created_at: new Date().toISOString(),
            ip
        })
        return {
            state:0,
            msg:"Created successfully"
        }
    }
    async UserSignIn(req){
        let email = req.body.email;
        let password = req.body.password;
        let user = await this.db.collection('users').findOne({'auth.email': email,'auth.level':0});
        if (user === null) {
            return {
                state: -1,
                error: "Does not exist your account."
            }
        }
        if (user.auth.isEnable === false || user.auth.level !== 0) {
            return {
                state: -2,
                error: "Does not exist your account or closed."
            }
        }
        let isCheck = bcrypt.compareSync(password, user.auth.password);
        if (!isCheck) {
            return {
                state: -1,
                error: "Does not match email and password."
            }
        }
        let apiToken = uuidv4();;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        await this.db.collection('login_history').insertOne({
            _id:ObjectId().toString(),
            uid: user.auth.uid,
            apiToken: apiToken,
            created_at: new Date().toISOString(),
            ip
        })
        await this.db.collection('users').updateOne({"auth.uid": user.auth.uid}, {$set: {"auth.apiToken": apiToken}})
        user = await this.db.collection('users').findOne({'auth.email': email}, {_id: 0});
        let data=await this.GetInitData(user.auth.uid);
        return {
            state:0,
            user,
            data
        }
    }
    async GetInitData(uid){
       return{
           test:"test"
       }
    }
    async isDuplicateUserByEmail(email){
        let user = await this.db.collection('users').findOne({'auth.email': email});
        if (user===null) {
            return false
        }else{
            return true
        }
    }
    async LoginCheck(req){
        let apiToken=req.body.apiToken
        let uid=req.body.uid
        let isCheck=await this.db.collection('login_history').find({uid,apiToken}).toArray();
        if (isCheck.length==0){
            return {
                state:-1
            }
        }else{
            let user=await this.GetUserByUID(uid)
            return {
                state:0,
                user
            }
        }
    }
    async Logout(req){
        let apiToken=req.body.apiToken
        let uid=req.body.uid
        await this.db.collection('login_history').removeMany({uid,apiToken});
        return {
            state:0
        }
    }
    async GetUserByEmail(email){
        let users = await this.db.collection('users').aggregate([
            {
                $match:{'auth.email': email}
            },
            {
                $project:{_id: 0}
            }
        ]).toArray();
        return users[0]
    }
    async GetUserByUID(uid){
        let users = await this.db.collection('users').aggregate([
            {
                $match:{'auth.uid': uid}
            },
            {
                $project:{_id: 0}
            }
        ]).toArray();
        return users[0]
    }
}
module.exports = User
