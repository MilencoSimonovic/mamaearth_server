let express = require('express');
const cors = require('cors')
express.application["prefix"] = express.Router.prefix = function (path, configure) {
    let router = express.Router();
    this.use(path, router);
    configure(router);
    return router;
};
const app = express();
require('dotenv').config();
const PORT = process.env.PORT;
app.listen(PORT, function () {
    console.log('Server is running on PORT:', PORT);
});
const bodyParser = require('body-parser')
app.use(bodyParser.json({limit: '500mb'})); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));
const fileUpload = require('express-fileupload');
app.use(cors())
app.use(fileUpload({
    createParentPath: true
}));
const {MongoClient} = require('mongodb');
const db_url = process.env.DB_URL;
app.get('/', function (req, res) {
    res.status(200).send('You can not get any data (xd)');
});
app.get('/resource/:filename', function (req, res) {
    let fileName = req.params.filename
    return res.sendFile(__dirname + "/resource/" + fileName)
});
app.get('/resource/:path/:filename', function (req, res) {
    let fileName = req.params.filename
    let path = req.params.path
    return res.sendFile(__dirname + `/resource/${path}/` + fileName)
});
let dbClient=null
let db=null;
async function Db_connection(){
    dbClient = new  MongoClient(db_url, { useUnifiedTopology: true })
    await dbClient.connect();
    console.log('connected db')
    db=dbClient.db(process.env.DB_NAME)
    let User=require('./api_v1/User')
    let user=new User(dbClient)
    let FileManager=require('./api_v1/FileManger')
    let file_manager=new FileManager(dbClient)
    let PaymentHistory=require('./api_v1/PaymentHistory')
    let payment_history=new PaymentHistory(dbClient)
    let Videos=require('./api_v1/Videos')
    let videos=new Videos(dbClient)
    let Campaigns=require('./api_v1/Campaigns')
    let campaigns=new Campaigns(dbClient)
    let WithdrawRequest=require('./api_v1/WithdrawRequest')
    let withdraw_request=new WithdrawRequest(dbClient)
    app.get('/',async (req,res)=>{
        res.send("Go away")
    })
    app.prefix('/api/v1',function(v1){
        v1.route('/test').get(async (req,res)=>{
            res.send("it is api version 1.0")
        })
        v1.post("/signup", async (req,res)=>{
            res.send(await user.UserSignUp(req))
        })
        v1.post("/account/update", async (req,res)=>{
            res.send(await user.UpdateUser(req))
        })
        v1.post("/signin", async (req,res)=>{
            res.send(await user.UserSignIn(req))
        })
        v1.post("/user/read", async (req,res)=>{
            res.send(await user.ReadUsers(req))
        })
        v1.post("/LoginCheck", async (req,res)=>{
            res.send(await user.LoginCheck(req))
        })
        v1.post("/Logout", async (req,res)=>{
            res.send(await user.Logout(req))
        })
        v1.post("/upload-file", async (req,res)=>{
            console.log('test')
            res.send(await file_manager.UploadFile(req))
        })
        v1.post("/payment_history/read", async (req,res)=>{
            res.send(await payment_history.ReadData(req))
        })
        v1.post("/payment_history/save", async (req,res)=>{
            res.send(await payment_history.SaveData(req))
        })
        v1.post("/withdraw_request/read", async (req,res)=>{
            res.send(await withdraw_request.ReadData(req))
        })
        v1.post("/withdraw_request/save", async (req,res)=>{
            res.send(await withdraw_request.SaveData(req))
        })
        v1.post("/campaigns/save", async (req,res)=>{
            res.send(await campaigns.SaveData(req))
        })
        v1.post("/campaigns/read", async (req,res)=>{
            res.send(await campaigns.ReadData(req))
        })
        v1.post("/videos/read", async (req,res)=>{
            res.send(await videos.ReadData(req))
        })
        v1.post("/videos/save", async (req,res)=>{
            res.send(await videos.SaveData(req))
        })
    })
    app.get('/resource/:filename', function (req, res) {
        let fileName = req.params.filename
        console.log(fileName)
        return res.sendFile(__dirname + "/uploads/" + fileName)
    });
    app.get('/resource/:path/:filename', function (req, res) {
        let fileName = req.params.filename
        let path = req.params.path
        console.log(fileName)
        return res.sendFile(__dirname + `/uploads/${path}/` + fileName)
    });
}
Db_connection().catch(console.error);


