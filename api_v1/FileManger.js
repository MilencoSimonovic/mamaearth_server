let serverUrl="http://3.15.29.129:3000/resource/"
class FileManger {
    constructor(dbClient) {
        this.db=dbClient.db(process.env.DB_NAME)
    }
    async UploadFile(req){
        try {
            if (!req.files) {
                return {
                    state: false,
                    message: 'No file uploaded'
                }
            } else {
                let avatar = req.files.file;
                let filename = req.body.name || `${avatar.name}`
                avatar.mv(`./resource/${req.body.path || ''}${filename}`);
                return {
                    state: true,
                    message: 'File is uploaded',
                    data: {
                        name: avatar.name,
                        mimetype: avatar.mimetype,
                        size: avatar.size,
                        url: `${serverUrl}${req.body.path ? req.body.path : ''}${filename}`,
                        file_path: `${req.body.path ? req.body.path : ''}${filename}`
                    }
                }
            }
        } catch (err) {
            return err
        }
    }
}

module.exports = FileManger
