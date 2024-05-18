const express = require('express')
const { getUser, getUsers, getHash, createUser, userExist, getRoomByEmail, getUsername, getUserRoom, getRoomByCode, getAccessCode, 
    updateRoomSettings, getSubjects, getTeachers, getProfileImage, getAllActiveTeachers, getUserId, updateProfileImage } = require('../database/database.js')
const bcrypt = require('bcrypt')
const { expressjwt } = require('express-jwt')
const jwt = require('jsonwebtoken') 
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload');
const { promises } = require('fs')
var FileSaver = require('file-saver');

const fs = require('fs');
  
const app = express()
app.use(fileUpload());
app.use(express.static('public'))

const access_token_secret = process.env.ACCESS_TOKEN_SECRET
const access_token_exp = process.env.ACCESS_TOKEN_EXPIRES_IN
const refresh_token_secret = process.env.ACCESS_TOKEN_SECRET
const refresh_token_exp = process.env.REFRESH_TOKEN_EXPIRES_IN

app.use(cookieParser())

app.use(expressjwt({ secret: access_token_secret, credentialsRequired: true, algorithms: ["HS256"], getToken: req => req.cookies.accessToken })
    .unless(
        {
            path: [
                '/api/token', '/api/refresh-token', '/api/logout', '/api/signup', '/api/roomByCode', '/api/uploadMobile'
            ]
        }
    ));

app.use(express.json())

app.listen(8080, () => {
    console.log('Server is running on port 8080')
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ "title": "Unauthorized", "status": 401, "description": "Unauthorized error" })
    }
})


//TODO: This endpoint needs to be removed
app.get("/api/users", async (req, res) => {
    const users = await getUsers();
    res.send(users)
})

app.get("/api/user/info", async (req, res) => {
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email

    const username = await getUsername(email)
    const roomId = await getUserRoom(email)
    const accessCode = await getAccessCode(roomId)
    const profileImage = await getProfileImage(email)

    res.status(200).json({ email, username, "room": roomId, accessCode, profileImage })
})

app.get("/api/user", async (req, res) => {
    const email = req.query.email
    const user = await getUser(email);
    res.send(user)
})

app.post('/api/signup', async (req, res) => {
    const { email, username, phoneNumber, password } = req.body
    const passwordHash = await bcrypt.hash(password, 12)
    await createUser(email, username, phoneNumber, passwordHash)
    //send jwt 
    let accessToken = jwt.sign({ email: email }, access_token_secret, { expiresIn: access_token_exp })
    let refreshToken = jwt.sign({ email: email }, refresh_token_secret, { expiresIn: refresh_token_exp })
    res.cookie('accessToken', accessToken, { httpOnly: true }).cookie('refreshToken', refreshToken, { httpOnly: true }).cookie('loggedIn', true)
    res.status(200).json({ "title": "Authorized", "status": 200, "accessToken": accessToken, "refreshToken": refreshToken })
})
 
app.post("/api/token", async (req, res) => {
    //TODO: CurrentJwt nie jest zapisywany w bazie przy logowaniu i rejestracji
    const { email, password } = req.body
    const userExists = await userExist(email)
    const unauthorizedErrorMessage = 'Nieprawidłowy login lub hasło'
    if (!userExists) {
        res.status(401).json({ "title": "Unauthorized", "status": 401, "description": unauthorizedErrorMessage })
        return
    }
    const userPassword = await getHash(email)
    const isValid = await bcrypt.compare(password, userPassword)
    if (userExists > 1) {
        res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Please Contact Customer Support (error code: 10412)" })
        return
    }
    if (!isValid) {
        res.status(401).json({ "title": "Unauthorized", "status": 401, "description": unauthorizedErrorMessage })
        return
    }
    //send jwt 
    let accessToken = jwt.sign({ email: email }, access_token_secret, { expiresIn: access_token_exp })
    let refreshToken = jwt.sign({ email: email }, refresh_token_secret, { expiresIn: refresh_token_exp })
    res.header('Access-Control-Expose-Headers', "Set-Cookie");
    res.cookie('accessToken', accessToken, { httpOnly: true }).cookie('refreshToken', refreshToken, { httpOnly: true }).cookie('loggedIn', true)
    res.status(200).json({ "title": "Authorized", "status": 200, "accessToken": accessToken, "refreshToken": refreshToken })
})

app.post("/api/refresh-token", async (req, res) => {
    const { email } = req.body
    const refreshToken = req.cookies.refreshToken

    jwt.verify(refreshToken, refresh_token_secret,
        (err, decoded) => {
            if (err) {
                // Wrong Refesh Token
                return res.status(406).json({ message: 'Unauthorized' });
            }
            else if (decoded.email != email) // Local storage email must match token email
            {
                return res.status(406).json({ message: 'Unauthorized' });
            }
            else {
                // Correct token we send a new access token
                let accessToken = jwt.sign({ email: email }, access_token_secret, { expiresIn: access_token_exp })
                let refreshToken = jwt.sign({ email: email }, refresh_token_secret, { expiresIn: refresh_token_exp })
                res.cookie('accessToken', accessToken, { httpOnly: true }).cookie('refreshToken', refreshToken, { httpOnly: true })
                res.status(204).send()
            }
        })
})

app.post("/api/logout", async (req, res) => {
    res.cookie('accessToken', 'deleted', { httpOnly: true, maxAge: 0 }).cookie('refreshToken', 'deleted', { httpOnly: true, maxAge: 0 }).cookie('loggedIn', false, { maxAge: 0 })
    res.status(204).send()
})

app.get("/api/userRoom", async (req, res) => {
    const email = req.query.email
    const room = await getRoomByEmail(email);
    res.send(room)
})

app.get("/api/roomByCode", async (req, res) => {
    const code = req.query.code
    const room = await getRoomByCode(code);
    if (room) { res.send(room) }
    else res.status(401).json({ message: 'Unauthorized' });
})

app.get("/api/images", async (req, res) => {
    // Get room
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const roomId = await getUserRoom(email)

    try {
        const directory = 'C:\\Users\\MagdalenaPleban\\Desktop\\Magda\\KorepetycjeNaZadanie\\open-react-template-2.0.3\\public\\uploadedFiles\\' + roomId
        const files = await promises.readdir(directory);
        const itemImageSrc = files.map((files) => '\\uploadedFiles\\' + roomId + '\\' + files)
        //todo: Dodac nazwe pliku do odpowiedzi
        const response = itemImageSrc.map(itemImageSrc => ({ itemImageSrc }))
        res.status(200).json(response);
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
})

app.post('/api/upload', async function (req, res) {
    // Get room
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const roomId = await getUserRoom(email)

    // Compose upload path   
    const files = req.files.images
    let path = 'C:\\Users\\MagdalenaPleban\\Desktop\\Magda\\KorepetycjeNaZadanie\\open-react-template-2.0.3\\public\\uploadedFiles\\' + roomId + '\\'

    // If not files return error
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('No files were uploaded')
        return res.status(400).send('No files were uploaded.');
    }
    // Create a room directory if it doesn't exist
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
    // Move files to the directory
    if (Array.isArray(files)) {
        files.forEach((file) => {
            uploadPath = path + file.name;
            file.mv(uploadPath, function (err) {
                if (err)
                    console.log(err)
            });
        })
    }
    else {
        uploadPath = path + files.name;
        files.mv(uploadPath, function (err) {
            if (err)
                console.log(err)
        });
    }
    res.status(201).send()
});

app.post('/api/upload/profileImage', async function (req, res) {
    
    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    // Compose upload path   
    const files = req.files.images

    let pathPart1 = 'C:\\Users\\MagdalenaPleban\\Desktop\\Magda\\KorepetycjeNaZadanie\\open-react-template-2.0.3\\public'
    let pathPart2 = '\\profileImages\\'
    let path = pathPart1 + pathPart2

    // If not files return error
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('No files were uploaded')
        return res.status(400).send('No files were uploaded.');
    }
    // Create a room directory if it doesn't exist
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }

    const fileName = userId + ".jpeg"
    uploadPath = path + fileName;
    files.mv(uploadPath, function (err) {
        if (err)
            console.log(err)
    });

    // Update Users table
    await updateProfileImage('/profileImages/'+fileName, email)
    res.status(201).send()
});


app.post('/api/uploadMobile', async function (req, res) {
    // Get room
    const roomId = req.query.room

    // Compose upload path   
    const files = req.files.images
    let path = 'C:\\Users\\MagdalenaPleban\\Desktop\\Magda\\KorepetycjeNaZadanie\\open-react-template-2.0.3\\public\\uploadedFiles\\' + roomId + '\\'

    // If not files return error
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('No files were uploaded')
        return res.status(400).send('No files were uploaded.');
    }
    // Create a room directory if it doesn't exist
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
    // Move files to the directory
    if (Array.isArray(files)) {
        files.forEach((file) => {
            uploadPath = path + file.name;
            file.mv(uploadPath, function (err) {
                if (err)
                    console.log(err)
            });
        })
    }
    else {
        uploadPath = path + files.name;
        files.mv(uploadPath, function (err) {
            if (err)
                console.log(err)
        });
    }
    res.status(201).send()
});

app.delete('/api/image/', async function (req, res) {
    // Get room
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const roomId = await getUserRoom(email)

    // Compose path 
    const filename = req.query.filename
    const path = 'C:\\Users\\MagdalenaPleban\\Desktop\\Magda\\KorepetycjeNaZadanie\\open-react-template-2.0.3\\public\\uploadedFiles\\' + roomId + '\\'
    const fileToBeDeleted = path + filename

    // Delete the file from the directory
    fs.unlink(fileToBeDeleted,
        (err => {
            if (err) console.log(err);
        }));

    res.status(200).send()
});

app.patch("/api/roomSettings", async (req, res) => {
    const { subject, grade, section } = req.body
    // Get room
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const roomId = await getUserRoom(email)

    await updateRoomSettings(roomId, subject, grade, section)

    res.status(200).send()
})

app.get("/api/subjects", async (req, res) => {
    const subjects = await getSubjects();
    res.send(subjects)
})

app.get("/api/teachers", async (req, res) => {
    const subject = req.query.subject
    const teachers = await getTeachers(subject);
    res.send(teachers)
})

app.get("/api/allActiveTeachers", async (req, res) => {
    const teachers = await getAllActiveTeachers();
    res.send(teachers)
})