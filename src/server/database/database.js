//import mysql from 'mysql2'
//import {v4 as uuid} from 'uuid';

//import dotenv from 'dotenv'

const mysql = require('mysql2')
const { v4: uuid } = require('uuid')
const dotenv = require('dotenv')

dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();



function generateRoomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

async function getUsers() {
    const [rows] = await pool.query("SELECT * FROM Users");
    return rows;
}

async function getUser(email) {
    const [rows] = await pool.query(`
    SELECT * FROM Users
    WHERE Email = ?
    `, [email])
    return rows[0]
}

async function getUsername(email) {
    const [rows] = await pool.query(`
    SELECT Username FROM Users
    WHERE Email = ?
    `, [email])
    return rows[0].Username
}

async function getProfileImage(email) {
    const [rows] = await pool.query(`
    SELECT ProfileImage FROM Users
    WHERE Email = ?
    `, [email])
    return rows[0].ProfileImage
}

async function getUserId(email) {
    const [rows] = await pool.query(`
    SELECT Id FROM Users
    WHERE Email = ?
    `, [email])
    return rows[0].Id
}

async function getUserRoom(email) {
    const [rows] = await pool.query(`
    SELECT id FROM rooms
    where userid = (
    select id from users where email = ?
    )
    `, [email])
    if(rows[0].id) return rows[0].id
    else return
}

async function userExist(email) {
    const [rows] = await pool.query(`
    SELECT count(*) as count FROM Users
    WHERE Email = ?
    `, [email])
    return rows[0].count
}

async function getRoomByEmail(email) {
    if (!email) return
    const [userId] = await pool.query(`
    SELECT id FROM Users
    WHERE Email = ?
    `, [email])

    const [rows] = await pool.query(`
    SELECT id FROM Rooms
    WHERE userId = ?
    `, [userId[0].id])

    return rows[0].id
}

async function getRoomByCode(code) {
    if (!code) return

    const [rows] = await pool.query(`
    SELECT id FROM Rooms
    WHERE roomCode = ?
    `, [code])
    if (rows[0]) {
        return rows[0].id
    }
    else return
}

async function getAccessCode(room) {
    if (!room) return

    const [rows] = await pool.query(`
    SELECT roomCode FROM Rooms
    WHERE id = ?
    `, [room])
    if (rows[0]) {
        console.log(rows[0].roomCode)
        return rows[0].roomCode
    }
    else return
}

async function getHash(email) {
    const [rows] = await pool.query(`
    SELECT PasswordHash FROM Users
    WHERE Email = ?
    `, [email])
    return rows[0].PasswordHash || ''
}

async function createUser(email, username, phone, passwordHash) {
    const userId = uuid();
    //TODO: Dodac walidacje - Istniejacy email: Wyglada na to ze masz juz konto. Sprobuj sie zalogowac. Istniejacy telefon: ...
    const [user] = await pool.query(`
    INSERT INTO Users (id, email, username, phoneNumber, passwordHash)
    VALUES (?, ?, ?, ?, ?)
    `, [userId, email, username, phone, passwordHash])

    //TODO: Upewnić się że roomCode nie istnieje w bazie
    const roomCode = generateRoomCode(5)

    const [room] = await pool.query(`
    INSERT INTO Rooms (userId, roomCode, isActive)
    VALUES (?, ?, ?)
    `, [userId, roomCode, 0])
}

async function updateRoomSettings(roomId, subject, grade, section) {
    await pool.query(`
    UPDATE Rooms 
    SET Subject = ?, Grade = ?, Section = ?
    WHERE id = ?
    `, [subject, grade, section, roomId])
}

async function getSubjects() {
    const [rows] = await pool.query(`
    SELECT subject from SUBJECTS
    `)
    return rows
}

async function getTeachers(subject) {
    let [rows] = [] 
    if (!subject) {
        rows = await pool.query(`
        SELECT Username, Active, Subject, ProfileImage FROM users u
        inner join teacher_status tst on u.id = tst.userid
        inner join teacher_subject tsub on u.id = tsub.teacher_user_id
        inner join subjects s on tsub.subject_id = s.id
        `)
    }
    else {
        rows = await pool.query(`
        SELECT Username, Active, Subject, ProfileImage FROM users u
        inner join teacher_status tst on u.id = tst.userid
        inner join teacher_subject tsub on u.id = tsub.teacher_user_id
        inner join subjects s on tsub.subject_id = s.id
        where subject = ?
        `, [subject])
    }

    return rows[0]
}

async function getAllActiveTeachers() {
    let [rows] = await pool.query(`
        SELECT DISTINCT Username, ProfileImage FROM users u
        inner join teacher_status tst on u.id = tst.userid
        where Active = 1
        and isTeacher = 1
        order by ProfileImage
        `)

    return rows
}

async function updateProfileImage(value, email) {
    let [rows] = await pool.query(`
    UPDATE users set ProfileImage = ?
    where email = ?
    `, [value, email])

return rows
}

module.exports = { userExist, createUser, getHash, getRoomByEmail, getUser, getUser, getUsers, getUsername, getUserRoom, getRoomByCode, 
    getAccessCode, updateRoomSettings, getSubjects, getTeachers, getProfileImage, getAllActiveTeachers, getUserId, updateProfileImage };
