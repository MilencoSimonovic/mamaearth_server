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
    db=dbClient.db('tocyn')
}
Db_connection().catch(console.error);
let User=require('./api_v1/User')
let user=new User(dbClient)
let FileManager=require('./api_v1/FileManger')
let file_manager=new FileManager(dbClient)

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
    v1.post("/signin", async (req,res)=>{
        res.send(await user.UserSignIn(req))
    })
    v1.post("/LoginCheck", async (req,res)=>{
        res.send(await user.LoginCheck(req))
    })
    v1.post("/Logout", async (req,res)=>{
        res.send(await user.Logout(req))
    })
    v1.post("/upload-file", async (req,res)=>{
        res.send(await file_manager.UploadFile(req))
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

