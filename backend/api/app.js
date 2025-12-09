const path = require('path');
// wczytaj .env z tego samego folderu co app.js
require('dotenv').config({
    path: path.resolve(__dirname, '.env')
});


const express = require('express')
const fs = require('fs');
const { getUser, getHash, createUser, userExist, getRoomByEmail, getUsername, getUserRoom, getImagesDirectoryByCode: getImagesDirectoryByCode, getAccessCode, getSubjects, getTeachers, getProfileImage, getUserId, updateProfileImage, getBalance, getPhoneNumber,
    upsertPublication, getPublication, updateTeacherSubject, getTeacherSubjects, sendInvitation, cancelInvitation, declineInvitation, acceptInvitation,
    getRoomState, deletePublication, setLastLoggedIn, setInvitationExpired, getInvitationDatetime, startLesson, finishLesson, getLessonsHistory, resignLesson,
    getTeacherPanelInfo, deleteTeacherSubject, phoneNumberExists, updateLessonSummaryPdf, getImagesDirectory, setTutorialCompleted, setPhoneNumberConfirmed, saveChatMessage, getChatMessages, postOpinion, isOpinionMissing,
    getTeacherReviews, getMissingReviewsLastMonth } = require('./database/database.js')
const bcrypt = require('bcrypt')
const { expressjwt } = require('express-jwt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload');
const { promises } = require('fs')
const cors = require('cors')
const e = require('express');
const nodemailer = require('nodemailer');
const app = express()
const origin = process.env.ORIGIN
app.use(express.static('public'))
app.use(cors({
    credentials: true,
    origin: origin
}));

const access_token_secret = process.env.ACCESS_TOKEN_SECRET
const access_token_exp = process.env.ACCESS_TOKEN_EXPIRES_IN
const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET
const refresh_token_exp = process.env.REFRESH_TOKEN_EXPIRES_IN

const originDomain = process.env.ORIGIN_DOMAIN
const profileImagesPath = process.env.PROFILE_IMAGES_PATH
const profileImagesDir = process.env.PROFILE_IMAGES_DIR
const uploadedImagesPath = process.env.UPLOADED_IMAGES_PATH
const uploadedImagesDir = process.env.UPLOADED_IMAGES_DIR
const lessonImagesPath = process.env.LESSON_IMAGES_PATH
const lessonImagesDir = process.env.LESSON_IMAGES_DIR

app.use(cookieParser())

app.use(expressjwt({ secret: access_token_secret, credentialsRequired: true, algorithms: ["HS256"], getToken: req => req.cookies.accessToken })
    .unless(
        {
            path: [
                '/api/token', '/api/refresh-token', '/api/logout', '/api/signup', '/api/imagesDirectoryByCode', '/api/uploadMobile', '/api/subjects', '/api/teachers', '/api/contact', '/api/teacherRates'
            ]
        }
    ));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
}));

app.listen(8080, () => {
    console.log('Server is running on port 8080')
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ "title": "Unauthorized", "status": 401, "description": "Unauthorized error" })
    }
})

app.get("/api/user/info", async (req, res) => {
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email

    let [firstName, lastName, isTeacher, id, accessCode, showTutorial] = await getUsername(email)
    const roomId = await getUserRoom(email)

    if (!accessCode && roomId) {
        accessCode = await getAccessCode(roomId)
    }

    const phoneNumber = await getPhoneNumber(email)

    const profileImage = await getProfileImage(email)

    res.status(200).json({ email, firstName, lastName, "room": roomId, accessCode, profileImage, phoneNumber, isTeacher, id, showTutorial })
})

app.get("/api/user", async (req, res) => {
    const email = req.query.email
    const user = await getUser(email);
    res.send(user)
})

app.post('/api/signup', async (req, res) => {
    const { email, firstName, lastName, phoneNumber, password, isTeacher } = req.body

    if (await phoneNumberExists(phoneNumber)) {
        return res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Użytkownik z tym numerem telefonu już istnieje" });
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const exception = await createUser(email, firstName, lastName, phoneNumber, passwordHash, isTeacher)

    if (exception === 'ER_DUP_ENTRY') res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Użytkownik o podanym mailu już istnieje", "exception": exception })
    else if (exception) res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Skontaktuj się z nami (kod błędu: 20414)", "exception": exception })
    else {
        //send jwt 
        let accessToken = jwt.sign({ email: email }, access_token_secret, { expiresIn: access_token_exp })
        let refreshToken = jwt.sign({ email: email }, refresh_token_secret, { expiresIn: refresh_token_exp })
        res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 99999999 }).cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: "none", secure: true }).cookie('loggedIn', true, { domain: originDomain, sameSite: "none", secure: true })
        res.status(200).json({ "title": "Authorized", "status": 200, "accessToken": accessToken, "refreshToken": refreshToken })
    }
})

app.post("/api/token", async (req, res) => {

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
        res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Skontaktuj się z nami (kod błędu: 10412)" })
        return
    }
    if (!isValid) {
        res.status(401).json({ "title": "Unauthorized", "status": 401, "description": unauthorizedErrorMessage })
        return
    }
    setLastLoggedIn(email);
    //send jwt 
    let accessToken = jwt.sign({ email: email }, access_token_secret, { expiresIn: access_token_exp })
    let refreshToken = jwt.sign({ email: email }, refresh_token_secret, { expiresIn: refresh_token_exp })
    res.header('Access-Control-Expose-Headers', "Set-Cookie");
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 99999999 }).cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: "none", secure: true }).cookie('loggedIn', true, { domain: originDomain, sameSite: "none", secure: true })
    res.status(200).json({ "title": "Authorized", "status": 200, "accessToken": accessToken, "refreshToken": refreshToken })
})

app.post("/api/refresh-token", async (req, res) => {
    const { email } = req.body
    const refreshToken = req.cookies.refreshToken

    jwt.verify(refreshToken, refresh_token_secret,
        (err, decoded) => {
            if (err) {
                // Wrong Refesh Token
                console.log(err)
                res.cookie('accessToken', 'deleted', { httpOnly: true, maxAge: 0 }).cookie('refreshToken', 'deleted', { httpOnly: true, maxAge: 0 }).cookie('loggedIn', false, { domain: originDomain, sameSite: "none", secure: true, maxAge: 0 })
                return res.status(423).json({ message: 'Unauthorized' });
            }
            else if (decoded.email != email) // Local storage email must match token email
            {
                res.cookie('accessToken', 'deleted', { httpOnly: true, maxAge: 0 }).cookie('refreshToken', 'deleted', { httpOnly: true, maxAge: 0 }).cookie('loggedIn', false, { domain: originDomain, sameSite: "none", secure: true, maxAge: 0 })
                return res.status(423).json({ message: 'Unauthorized' });
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
    res.cookie('accessToken', 'deleted', { httpOnly: true, maxAge: 0 }).cookie('refreshToken', 'deleted', { httpOnly: true, maxAge: 0 }).cookie('loggedIn', false, { domain: originDomain, sameSite: "none", secure: true, maxAge: 0 })
    res.status(204).send()
})

app.get("/api/balance", async (req, res) => {
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const balance = await getBalance(email);

    res.status(200).json(balance)
})

app.get("/api/imagesDirectoryByCode", async (req, res) => {
    const code = req.query.code
    const directory = await getImagesDirectoryByCode(code);
    if (directory) { res.send(directory) }
    else res.status(403).json({ message: 'Forbidden' });
})

app.get("/api/roomState", async (req, res) => {
    // Get room
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const roomId = await getUserRoom(email)

    const roomState = await getRoomState(roomId)

    res.send(roomState)
})

app.get("/api/images", async (req, res) => {
    // Get room
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const imagesDirectory = await getImagesDirectory(email)
    const directory = uploadedImagesPath + imagesDirectory + '/'

    try {
        const files = await promises.readdir(directory);
        const filesWithTime = files.map(fileName => {
            const stat = fs.statSync(`${directory}/${fileName}`);
            return {
                name: fileName,
                createdDateTime: stat.ctime.toISOString()
            }
        })

        const response = filesWithTime.map(f => ({
            itemImageSrc: uploadedImagesDir + imagesDirectory + '/' + f.name,
            createdDateTime: f.createdDateTime
        }));
        res.status(200).json(response);
    } catch (err) {
        if (!fs.existsSync(directory)) {
            res.status(200).json([]);
        } else {
            console.log(err)
            res.status(500).json(err);
        }
    }
})

app.post("/api/copy-to-canvas-asset", async (req, res) => {
    const { filename } = req.body;
    const decodedFilename = decodeURIComponent(filename);
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const imagesDirectory = await getImagesDirectory(email)

    const originalPath = path.join(uploadedImagesPath, imagesDirectory, decodedFilename);
    const destDir = path.join(uploadedImagesPath, 'canvasAssets', imagesDirectory);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, decodedFilename);

    fs.copyFile(originalPath, destPath, (err) => {
        console.log(err)
        if (err) return res.status(500).json({ error: 'Copy failed' });
        res.json({ newPath: uploadedImagesDir + 'canvasAssets/' + imagesDirectory + '/' + decodedFilename });
    });
})

app.get("/api/lessonJsonFiles", async (req, res) => {
    // Get room
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const roomId = await getUserRoom(email)
    const directory = lessonImagesPath + roomId

    try {
        const files = await promises.readdir(directory);
        // Filter only JSON files
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        // Read the content of each JSON file
        const fileContents = await Promise.all(
            jsonFiles.map(async (file) => {
                const filePath = directory + '/' + file;
                const content = await fs.promises.readFile(filePath, 'utf8'); // Use fs.promises.readFile
                return {
                    name: file,
                    content: JSON.parse(content), // Parse JSON content
                };
            })
        );

        // Return the file names and their content
        res.status(200).json(fileContents);
    } catch (err) {
        //for first call, create a folder
        if (!fs.existsSync(directory)) {
            res.status(200).json([]);
        }
        else {
            console.log(err)
            res.status(500).json(err);
        }
    }
})

app.get("/api/lessons/history", async (req, res) => {
    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    const active = req.query.active
    const completed = req.query.completed

    // Get history
    var lessonsHistory = await getLessonsHistory(userId)

    if (active) lessonsHistory = lessonsHistory.filter((el) => el.userStartedDateUtc && el.teacherStartedDateUtc && !el.completedDateUtc)
    if (completed) lessonsHistory = lessonsHistory.filter((el) => el.completedDateUtc)
    res.send(lessonsHistory)
})


app.post('/api/upload', async function (req, res) {
    // Get room
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const imagesDirectory = await getImagesDirectory(email)

    // Compose upload path   
    const files = req.files.images
    let path = uploadedImagesPath + imagesDirectory + '/'

    // If not files return error
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('No files were uploaded')
        res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Brak załączonych plików" })
        return
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

app.post('/api/tab/save', async function (req, res) {
    // Get room
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const roomId = await getUserRoom(email)

    // Compose upload path   
    let path = lessonImagesPath + roomId + '/'

    //Get tab data
    const { file, canvasObject } = req.body


    // Create a room directory if it doesn't exist
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
    fs.writeFile(path + '/' + file,
        typeof canvasObject === 'string' ? canvasObject : JSON.stringify(canvasObject),
        'utf8',
        (err) => err && console.error(err)
    );
    res.status(201).send()
});

app.get('/api/publication', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    //Add publication
    const publication = await getPublication(userId)
    res.send(publication)
});

app.get('/api/numberOfTabs', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const roomId = await getUserRoom(email)

    let dir = lessonImagesPath + roomId + '/'

    fs.readdir(dir, (err, files) => {
        if (files && files.length > 0) {
            // Filtruj tylko pliki .json i usuń rozszerzenie
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            const tabFiles = jsonFiles
                .map(file => file.replace(/\.json$/, ''))
                .sort((a, b) => Number(a) - Number(b)); // sortuj numerycznie
            res.status(200).send({
                numberOfTabs: tabFiles.length,
                tabFiles: tabFiles
            });
        } else {
            res.status(200).send({
                numberOfTabs: 0,
                tabFiles: null
            });
        }
    });

});


app.delete('/api/publication', async function (req, res) {
    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    //Add publication
    const publication = await deletePublication(userId)

    res.status(200).send()
});

app.get('/api/teacherSubjects', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    const subjects = await getTeacherSubjects(userId)
    res.send(subjects)
});

app.delete('/api/teacherSubjects', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    const subjectId = req.query.subjectId
    const level = req.query.level

    const subjects = await deleteTeacherSubject(userId, subjectId, level)
    res.send(subjects)
});

app.get('/api/teacherPanelInfo', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    //Get teacher panel info
    const teacherPanelInfo = await getTeacherPanelInfo(userId)
    res.send(teacherPanelInfo)
});

app.put('/api/publication', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    //Get publications data
    const { description, aboutMe, isPublished } = req.body

    //Add publication
    const error = await upsertPublication(userId, description, aboutMe, isPublished)
    if (error) res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Skontaktuj się z nami (kod błędu: 10413)" })
    else res.status(204).send()
});

app.put('/api/lesson/start', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    // Start lesson
    await startLesson(userId)
    res.status(204).send()
});

app.put('/api/lesson/finish', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    // Finish lesson
    await finishLesson(userId)
    res.status(204).send()
});

app.put('/api/lesson/resign', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)


    // Finish lesson
    await resignLesson(userId)
    res.status(204).send()
});

app.post('/api/invitation', async function (req, res) {

    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const roomId = await getRoomByEmail(email);

    const { teacherId, selectedSubject, selectedLevel, selectedPrice } = req.body

    const exception = await sendInvitation(roomId, teacherId, selectedSubject, selectedLevel, selectedPrice)

    if (exception) res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Skontaktuj się z nami (kod błędu: 10414)", "exception": exception })
    else res.status(204).send()
});

app.post('/api/opinion', async function (req, res) {

    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const studentUserId = await getUserId(email)

    const { teacherUserId, rate, comment } = req.body

    const exception = await postOpinion(teacherUserId, studentUserId, rate, comment)

    if (exception) res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Skontaktuj się z nami (kod błędu: 9414)", "exception": exception })
    else res.status(204).send()
});

app.get('/api/shouldAddReview', async function (req, res) {

    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const studentUserId = await getUserId(email)

    //get teacherUserId from query param
    const teacherUserId = req.query.teacherUserId

    const response = await isOpinionMissing(studentUserId, teacherUserId)

    res.status(200).json({ "shouldAddReview": response })
});

app.get('/api/missingReviewsLastMonth', async function (req, res) {

    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const studentUserId = await getUserId(email)

    const response = await getMissingReviewsLastMonth(studentUserId)

    res.status(200).json({ response })
});

app.get('/api/teacherRates', async function (req, res) {

    //get teacherUserId from query param
    const teacherUserId = req.query.teacherUserId

    const response = await getTeacherReviews(teacherUserId)

    res.status(200).json(response)
});

app.get('/api/myReviews', async function (req, res) {

    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    //get teacherUserId from query param
    const teacherUserId = req.query.teacherUserId

    const response = await getTeacherReviews(userId)

    res.status(200).json(response)
});

app.post('/api/chatMessage', async function (req, res) {

    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    // const roomId = await getRoomByEmail(email);
    const userId = await getUserId(email)

    const { text, sentDateUtc, roomId } = req.body

    const exception = await saveChatMessage(roomId, userId, text, sentDateUtc)

    if (exception) res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Skontaktuj się z nami (kod błędu: 103432)", "exception": exception })
    else res.status(204).send()
});

app.get('/api/chatMessages', async function (req, res) {

    // const token = req.cookies.accessToken
    // const tokenPayload = atob(token.split('.')[1])
    // const email = JSON.parse(tokenPayload).email
    // const roomId = await getRoomByEmail(email);

    //get roomId from query param
    const roomId = req.query.roomId

    const response = await getChatMessages(roomId)

    res.status(200).json(response)
});

app.post('/api/contact', async function (req, res) {
    try {
        const { name, email, message, subject } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ title: 'Bad Request', status: 400, description: 'Brak wymaganych pól (name, email, message).' });
        }

        const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com';
        const mail = {
            from: `"Formularz kontaktowy" <${fromAddress}>`,
            to: process.env.MAIL_TO,
            replyTo: email,
            subject: `Nowa wiadomość z formularza – ${subject || 'Bez tematu'}`,
            headers: {
                'Content-Language': 'pl',
                'X-Locale': 'pl_PL'
            },
            text:
                `Imię i nazwisko: ${name}\n` +
                `Email: ${email}\n` +
                `Temat: ${subject || 'Bez tematu'}\n\n` +
                `Wiadomość:\n${message}`,
            html: `<!doctype html>
<html lang="pl">
<head><meta charset="utf-8" /></head>
<body style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#111;">
  <p><strong>Imię i nazwisko:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Temat:</strong> ${subject || 'Bez tematu'}</p>
  <hr/>
  <p style="white-space:pre-wrap;">${message}</p>
</body>
</html>`
        };

        await mailTransporter.sendMail(mail);
        res.status(204).send();
    } catch (err) {
        console.error('Contact mail error:', err?.message || err);
        res.status(500).json({ title: 'Unexpected Error', status: 500, description: 'Nie udało się wysłać wiadomości e-mail.' });
    }
});


app.post('/api/tutorialCompleted', async function (req, res) {

    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email

    const exception = await setTutorialCompleted(email)

    if (exception) res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Skontaktuj się z nami (kod błędu: 100105)", "exception": exception })
    else res.status(204).send()
});

app.get('/api/invitationDatetime', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    const roomId = req.query.roomId

    const invitationDateTime = await getInvitationDatetime(userId, roomId)

    res.status(200).json(invitationDateTime[0])
});

app.put('/api/invitation/cancel', async function (req, res) {

    // Get roomId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const roomId = await getRoomByEmail(email);

    //Cancel invitation
    const exception = await cancelInvitation(roomId)

    if (exception) res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Skontaktuj się z nami (kod błędu: 10419)", "exception": exception })
    else res.status(204).send()
});

app.put('/api/invitation/accept', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const teacherUserId = await getUserId(email);

    // Get invitationId
    const { roomId } = req.body

    //Accept invitation
    const exception = await acceptInvitation(teacherUserId, roomId)

    if (exception) res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Skontaktuj się z nami (kod błędu: 10415)", "exception": exception })
    else res.status(204).send()
});

app.put('/api/invitation/decline', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const teacherUserId = await getUserId(email);

    // Get invitationId
    const { roomId } = req.body

    //Decline invitation
    const exception = await declineInvitation(teacherUserId, roomId)

    if (exception) res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Skontaktuj się z nami (kod błędu: 10416)", "exception": exception })
    else res.status(204).send()
});

app.put('/api/invitation/expire', async function (req, res) {

    // Get roomId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const roomId = await getRoomByEmail(email);

    //Cancel invitation
    const exception = await setInvitationExpired(roomId)

    if (exception) res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Skontaktuj się z nami (kod błędu: 10420)", "exception": exception })
    else res.status(204).send()
});


app.put('/api/teacherSubjects', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    //Get publications data
    const { subjectId, level, price } = req.body

    //Add publication
    const exception = await updateTeacherSubject(userId, subjectId, level, price)
    if (exception) res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Skontaktuj się z nami (kod błędu: 10421)", "exception": exception })
    else res.status(204).send()
});


app.post('/api/upload/profileImage', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    // Compose upload path   
    const files = req.files.images
    const path = profileImagesPath

    // If not files return error
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Wystąpił błąd. Skontaktuj się z nami (kod błędu: 10417)" })
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
    await updateProfileImage(profileImagesDir + fileName, email)
    res.status(201).send()
});

app.put('/api/user/phoneNumberConfirmed', async function (req, res) {

    // Get roomId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email

    //Update users table
    await setPhoneNumberConfirmed(email)
    res.status(201).send()
});

app.post('/api/upload/removeProfileImage', async function (req, res) {
    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const userId = await getUserId(email)

    // Compose path to profile image
    const fileName = userId + ".jpeg"
    const filePath = profileImagesPath + fileName

    // Usuń plik jeśli istnieje
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath)
        } catch (err) {
            return res.status(500).json({ "title": "Unexpected Error", "status": 500, "description": "Nie udało się usunąć zdjęcia." })
        }
    }

    // Zaktualizuj bazę (np. ustaw pusty string lub null w kolumnie profileImage)
    await updateProfileImage('', email)

    res.status(200).send()
});


app.post('/api/upload/lessonSummary', async function (req, res) {

    // Get userId
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    //const roomId = await getRoomByEmail(email)

    // Compose upload path 
    const file = req.body.pdfFile
    const roomId = req.body.roomId
    const path = lessonImagesPath + roomId + "/summary"

    // Create a room directory if it doesn't exist
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }

    const pdfFilePath = path + '/Podsumowanie_spotkania.pdf';

    fs.writeFile(pdfFilePath, file, 'base64', async (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send();
        }
        // Update lessonSummaryPdf in lessons table
        try {
            const dir = lessonImagesDir + roomId + '/summary/Podsumowanie_spotkania.pdf';
            await updateLessonSummaryPdf(roomId, dir);
            res.status(200).send();
        } catch (dbErr) {
            console.error(dbErr);
            res.status(500).send();
        }
    });
});


app.post('/api/uploadMobile', async function (req, res) {
    // Get room
    const roomId = req.query.room

    // Compose upload path   
    const files = req.files.images
    let path = uploadedImagesPath + roomId + '/'

    // If not files return error
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ "title": "Unexpected Error", "status": 400, "description": "Skontaktuj się z nami (kod błędu: 10418)" })
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
    const imagesDirectory = await getImagesDirectory(email)

    // Compose path 
    const filename = req.query.filename
    const path = uploadedImagesPath + imagesDirectory + '/'
    const fileToBeDeleted = path + filename

    // Delete the file from the directory
    fs.unlink(fileToBeDeleted,
        (err => {
            if (err) console.log(err);
        }));

    res.status(200).send()
});

app.get("/api/subjects", async (req, res) => {
    const subjects = await getSubjects();
    res.send(subjects)
})

app.get("/api/teachers", async (req, res) => {
    const subject = req.query.subject
    const level = req.query.level
    const minRating = req.query.rate
    const priceFrom = req.query.priceFrom
    const priceTo = req.query.priceTo
    const teachers = await getTeachers(subject, level, priceFrom, priceTo, minRating);
    res.send(teachers)
})

app.delete('/api/tab/:tabId', async function (req, res) {
    // Get user room
    const token = req.cookies.accessToken
    const tokenPayload = atob(token.split('.')[1])
    const email = JSON.parse(tokenPayload).email
    const roomId = await getUserRoom(email)

    const tabId = req.params.tabId;
    const filePath = lessonImagesPath + roomId + '/' + tabId + '.json';

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Nie udało się usunąć pliku.' });
            }

            //To dodajemy - zmiana nazw pozostałych plików
            // const dir = lessonImagesPath + roomId + '/';
            // const allFiles = fs.readdirSync(dir);
            // console.log(allFiles);
            // const numbered = allFiles
            //     .filter(f => f.endsWith('.json'))
            //     .map(f => f.replace('.json', ''))
            //     .filter(n => /^\d+$/.test(n))
            //     .map(n => parseInt(n, 10))
            //     .sort((a, b) => a - b);

            // for (const currentNumber of numbered) {
            //     if (currentNumber > tabId) {
            //         const oldPath = path.join(dir, currentNumber + '.json');
            //         const newPath = path.join(dir, (currentNumber - 1) + '.json');
            //         // Bez kolizji, bo (currentNumber - 1).json nie istnieje (został usunięty lub przesunięty wcześniej)
            //         fs.renameSync(oldPath, newPath);
            //     }
            // }
            // Tu skonczylam - zwrocic zupdatowane nazwy plikow, a potem
            res.status(200).send();
        });
    } else {
        res.status(404).json({ error: 'Plik nie istnieje.' });
    }
});

// SMTP transporter for contact mail
const mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,

});

