const mysql = require('mysql2')
const { v4: uuid } = require('uuid')

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true
}).promise();

function generateRoomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase()
    return result;
}

async function getUser(email) {
    const [rows] = await pool.query(`
    SELECT * FROM users
    WHERE email = ?
    `, [email])
    return rows[0]
}

async function getUsername(email) {
    const [rows] = await pool.query(`
    SELECT firstName, lastName, isTeacher, id, accessCode, showTutorial FROM users
    WHERE email = ?
    `, [email])
    return [rows[0].firstName, rows[0].lastName, rows[0].isTeacher, rows[0].id, rows[0].accessCode, rows[0].showTutorial]
}

async function setLastLoggedIn(email) {
    const [result] = await pool.query(`
        UPDATE users SET lastLoggedIn = SYSDATE()
        WHERE email = ? 
        `, [email])
}

async function setTutorialCompleted(email) {
    const [result] = await pool.query(`
        UPDATE users SET showTutorial = 0
        WHERE email = ? 
        `, [email])
}

async function getProfileImage(email) {
    const [rows] = await pool.query(`
    SELECT profileImage FROM users
    WHERE email = ?
    `, [email])
    return rows[0].profileImage
}

async function getUserId(email) {
    const [rows] = await pool.query(`
    SELECT id FROM users
    WHERE email = ?
    `, [email])
    return rows[0].id
}

async function getUserRoom(email) {
    const [roomStudent] = await pool.query(`
    SELECT id FROM rooms
    where userid = (
    select id from users where email = ?
    )
    and isActive = 1 and deletedDateUtc is null
    `, [email])


    const [roomTeacher] = await pool.query(`
    select roomId from invitations
    where teacherUserId = (
    select id from users where email = ?
    )
    and acceptedDateUtc is not null
    and id in (
    select invitationId from lessons 
    where completedDateUtc is null and resignedDateUtc is null
    )
    order by acceptedDateUtc desc
	LIMIT 1
    `, [email])

    if (roomStudent[0]) return roomStudent[0].id
    else if (roomTeacher[0]) return roomTeacher[0].roomId

    else return
}

async function getImagesDirectory(email) {
    const [roomStudent] = await pool.query(`
    SELECT id FROM rooms
    where userid = (
    select id from users where email = ?
    )
    and isActive = 1 and deletedDateUtc is null
    `, [email])


    const [userIdTeacher] = await pool.query(`
    select id from users
    where email = ?
	LIMIT 1
    `, [email])

    if (roomStudent[0]) return roomStudent[0].id
    else if (userIdTeacher[0]) return userIdTeacher[0].id

    else return
}

async function getPhoneNumber(email) {
    const [rows] = await pool.query(`
        SELECT phoneNumber FROM users
        WHERE email = ?
        `, [email])
    return rows[0].phoneNumber
}

async function phoneNumberExists(phoneNumber) {
    const [rows] = await pool.query(`
        SELECT COUNT(*) as count FROM users
        WHERE phoneNumber = ?
        AND phoneNumber <> '507936350' 
        AND phoneNumber <> '500600700'
    `, [phoneNumber]);
    return rows[0].count > 0;
    // duplicate allowed for the two numbers listed above
}

async function userExist(email) {
    const [rows] = await pool.query(`
    SELECT count(*) as count FROM users
    WHERE email = ?
    `, [email])
    return rows[0].count
}

async function getRoomByEmail(email) {
    if (!email) return
    const [userId] = await pool.query(`
    SELECT id FROM users
    WHERE email = ?
    `, [email])

    const [rows] = await pool.query(`
    SELECT id FROM rooms
    WHERE userId = ? and isActive = 1 and deletedDateUtc is null
    `, [userId[0].id])
    return rows[0].id
}

async function getBalance(email) {
    if (!email) return
    const [userId] = await pool.query(`
    SELECT id FROM users
    WHERE email = ?
    `, [email])

    const [rows] = await pool.query(`
    SELECT balance FROM balances
    WHERE userId = ?
    `, [userId[0].id])

    if (rows) {
        return rows[0]
    }
    z
}

async function getImagesDirectoryByCode(code) {
    if (!code) return

    const [roomCode] = await pool.query(`
    SELECT id FROM rooms
    WHERE roomCode = ?
    and deletedDateUtc is null
    `, [code])
    const [teacherCode] = await pool.query(`
    SELECT id FROM users
    WHERE accessCode = ?
    `, [code])
    if (roomCode[0]) {
        return { id: roomCode[0].id, teacherDir: false }
    }
    else if (teacherCode[0]) {
        return { id: teacherCode[0].id, teacherDir: true }
    }
    else return
}

async function getAccessCode(room) {
    if (!room) return

    const [rows] = await pool.query(`
    SELECT roomCode FROM rooms
    WHERE id = ?
    `, [room])
    if (rows[0]) {
        return rows[0].roomCode
    }
    else return
}

async function getHash(email) {
    const [rows] = await pool.query(`
    SELECT passwordHash FROM users
    WHERE email = ?
    `, [email])
    return rows[0].passwordHash || ''
}

async function createNewRoom(userId) {
    var roomCode
    const roomId = uuid();

    while (true) {
        roomCode = generateRoomCode(5)
        try {
            await pool.query(`
                INSERT INTO rooms (id, userId, roomCode, isActive, createdDateUtc)
                VALUES (?, ?, ?, ?, SYSDATE())
                `, [roomId, userId, roomCode, 1])
            break
        } catch (e) {
            console.log(e)
        }
    }
}


async function createUser(email, firstName, lastName, phone, passwordHash, isTeacher) {
    const userId = uuid();
    const balanceId = uuid();

    let accessCode;
    if (isTeacher) {
        // Generuj unikalny accessCode dla nauczyciela
        while (true) {
            accessCode = generateRoomCode(5);
            // Sprawdź czy taki accessCode już istnieje
            const [rows] = await pool.query(
                `SELECT COUNT(*) as count FROM users WHERE accessCode = ?`,
                [accessCode]
            );
            if (rows[0].count === 0) break;
        }
    }

    try {
        if (isTeacher) {
            // Jeśli nauczyciel, dodaj accessCode
            await pool.query(`
                INSERT INTO users (id, email, firstName, lastName, phoneNumber, passwordHash, isTeacher, accessCode)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [userId, email, firstName, lastName, phone, passwordHash, isTeacher, accessCode]);
        } else {
            // Jeśli nie nauczyciel, bez accessCode
            await pool.query(`
                INSERT INTO users (id, email, firstName, lastName, phoneNumber, passwordHash, isTeacher)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [userId, email, firstName, lastName, phone, passwordHash, isTeacher]);
        }
    } catch (err) {
        return err.code;
    }

    if (!isTeacher) {
        await createNewRoom(userId);
    }

    await pool.query(`
        INSERT INTO balances (id, userId, balance)
        VALUES (?, ?, ?)
    `, [balanceId, userId, 0]);
}

async function getPublication(teacherUserId) {
    const [rows] = await pool.query(`
                SELECT * from publications
                where teacherUserId = ?
                `, [teacherUserId])
    return rows[0]
}

async function upsertPublication(teacherUserId, description, aboutMe, isPublished) {
    const publicationId = uuid();
    if (description === "" || aboutMe === "") {
        isPublished = false;
    }

    try {
        await pool.query(`
            INSERT INTO publications  
            VALUES (?, ?, ?, ?, ?)
            `, [publicationId, teacherUserId, description, aboutMe, isPublished])
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            await pool.query(`
            UPDATE publications  SET description = IFNULL(?, description), aboutMe = IFNULL(?, aboutMe), isPublished = IFNULL(?, isPublished)
            where teacherUserId = ?
            `, [description, aboutMe, isPublished, teacherUserId])
        }
        else return err.code;
    }
}

async function updateTeacherSubject(teacherUserId, subjectId, level, price) {
    await pool.query(`
        DELETE from teacher_subjects  
        WHERE teacherUserId = ? AND subjectId = ? AND level = ?
        `, [teacherUserId, subjectId, level])
    if (level && price) {
        const rowId = uuid();
        await pool.query(`
            INSERT INTO teacher_subjects  
            VALUES (?, ?, ?, ?, ?)
            `, [rowId, teacherUserId, subjectId, level, price])
    }
}

async function deleteTeacherSubject(userId, subjectId, level) {
    await pool.query(
        'DELETE FROM teacher_subjects WHERE teacherUserId = ? AND subjectId = ? AND level = ?',
        [userId, subjectId, level]
    );
    // Return updated list
    return getTeacherSubjects(userId);
}


async function deletePublication(teacherUserId) {
    await pool.query(`
        DELETE from publications  
        WHERE teacherUserId = ? 
        `, [teacherUserId])

    await pool.query(`
        DELETE from teacher_subjects  
        WHERE teacherUserId = ? 
        `, [teacherUserId])

}

async function startLesson(userId) {
    const [result] = await pool.query(`
        select isTeacher from users where id = ?
        `, [userId])


    if (result[0].isTeacher) {
        const [invitation] = await pool.query(`
        select id from invitations
        where teacherUserId = (
        select id from users where id = ?
        )
        and acceptedDateUtc is not null
        and id in (
        select invitationId from lessons 
        where completedDateUtc is null and resignedDateUtc is null
        )
        order by acceptedDateUtc desc
        LIMIT 1
        `, [userId])

        await pool.query(`
            update lessons set teacherStartedDateUtc = SYSDATE()
            where invitationId = ?
            `, [invitation[0].id])
    }
    else {
        const [invitation] = await pool.query(`
        select id from invitations
        where roomId = (select id from rooms where userId = ? and isActive = 1 and deletedDateUtc is null)
        and isPending = 0 and acceptedDateUtc is not null and deletedDateUtc is null
        order by acceptedDateUtc desc
        LIMIT 1
        `, [userId]);

        await pool.query(`
            update lessons set userStartedDateUtc = SYSDATE()
            where invitationId = ?
            `, [invitation[0].id])
    }
}

async function getLessonsHistory(userId) {
    const [result] = await pool.query(`
        select isTeacher from users where id = ?
        `, [userId])

    if (result[0].isTeacher) {
        const [historyTeacher] = await pool.query(`
        select 
            l.id,
            l.invitationId,
            l.userStartedDateUtc,
            l.teacherStartedDateUtc,
            l.inProgress,
            l.completedDateUtc,
            l.resignedDateUtc,
            l.lessonSummaryPdf,
            i.subject,
            CONCAT(u.FirstName, " ", u.LastName) as studentFullName
        from users u
        inner join rooms r on u.id = r.userid
        inner join invitations i on r.id = i.roomId
        inner join lessons l on i.id = l.invitationId
        where i.TeacherUserId = ?
        order by l.teacherStartedDateUtc desc
        `, [userId])
        return historyTeacher
    }
    else {
        const [historyUser] = await pool.query(`
        select 
            l.id,
            l.invitationId,
            l.userStartedDateUtc,
            l.teacherStartedDateUtc,
            l.inProgress,
            l.completedDateUtc,
            l.resignedDateUtc,
            l.lessonSummaryPdf,
            i.subject,
            CONCAT(t.FirstName, " ", t.LastName) as teacherFullName
        from users u
        inner join rooms r on u.id = r.userid
        inner join invitations i on r.id = i.roomId
        inner join lessons l on i.id = l.invitationId
        inner join users t on t.id = i.teacherUserId
        where u.id = ?
        order by l.userStartedDateUtc desc
        `, [userId]);
        return historyUser
    }
}

async function finishLesson(userId) {
    const [result] = await pool.query(`
        select isTeacher from users where id = ?
        `, [userId])

    if (!result[0].isTeacher) { // if user is a student
        const [invitation] = await pool.query(`
        select id from invitations
        where roomId = (select id from rooms where userId = ? and isActive = 1 and deletedDateUtc is null)
         and isPending = 0 and acceptedDateUtc is not null 
         and deletedDateUtc is null
        order by acceptedDateUtc desc
        LIMIT 1
        `, [userId]);

        // complete lesson
        await pool.query(`
            update lessons set completedDateUtc = SYSDATE(), completedBy = 'student'
            where invitationId = ?
            and userStartedDateUtc is not null
            and teacherStartedDateUtc is not null
            `, [invitation[0].id])

        // deactivate existing room
        await pool.query(`
            update rooms set isActive = 0, deletedDateUtc = SYSDATE()
            where userId = ? and isActive = 1
            `, [userId])

        // create a new room
        createNewRoom(userId)
    }
    else { // if user is a teacher
        const [invitation] = await pool.query(`
            select id from invitations
            where teacherUserId = ?
            and isPending = 0
            and acceptedDateUtc is not null 
            and deletedDateUtc is null
            order by acceptedDateUtc desc
            LIMIT 1
            `, [userId]);
        // complete lesson
        await pool.query(`
            update lessons set completedDateUtc = SYSDATE(), completedBy = 'teacher'
            where invitationId = ?
            and userStartedDateUtc is not null
            and teacherStartedDateUtc is not null
            `, [invitation[0].id])

        // get userId of a student
        const [resultUserId] = await pool.query(`
            select userId from rooms where id in (
            select roomId from invitations
            where id = ?
            )
            `, [invitation[0].id])

        // deactivate existing room
        await pool.query(`
            update rooms set isActive = 0, deletedDateUtc = SYSDATE()
            where userId = ? and isActive = 1
            `, [resultUserId[0].userId])

        // create a new room
        createNewRoom([resultUserId[0].userId])

    }
}

async function resignLesson(userId) {
    const [result] = await pool.query(`
        select isTeacher from users where id = ?
        `, [userId])

    if (!result[0].isTeacher) {
        const [invitation] = await pool.query(`
        select id from invitations
        where roomId = (select id from rooms where userId = ? and isActive = 1 and deletedDateUtc is null)
         and isPending = 0 and acceptedDateUtc is not null 
         and deletedDateUtc is null
        order by acceptedDateUtc desc
        LIMIT 1
        `, [userId]);
        // set lesson status as resigned
        await pool.query(`
            update lessons set resignedDateUtc = SYSDATE()
            where invitationId = ?
            `, [invitation[0].id])
    }
    else {
        const [invitation] = await pool.query(`
			select id from invitations
            where teacherUserId = ?
			and isPending = 0 and acceptedDateUtc is not null 
			and deletedDateUtc is null
            order by acceptedDateUtc desc
            LIMIT 1
            `, [userId]);
        // set lesson status as resigned
        await pool.query(`
                update lessons set resignedDateUtc = SYSDATE()
                where invitationId = ?
                `, [invitation[0].id])
    }
}

async function getTeacherPanelInfo(userId) {
    const [result] = await pool.query(`
        select isTeacher from users where id = ?
        `, [userId])

    if (result[0].isTeacher) {
        const [activeLesson] = await pool.query(`
            SELECT u.FirstName, u.LastName, l.userStartedDateUtc, l.teacherStartedDateUtc FROM lessons l 
            inner join invitations i on i.id = l.invitationId
            inner join rooms r on r.id = i.roomId
            inner join users u on u.id = r.userId
            where l.completedDateUtc is null
            and l.resignedDateUtc is null 
            and i.teacherUserId = ?
        `, [userId]);

        const [activeInvitations] = await pool.query(`
            SELECT  i.isPending, i.createdDateUtc, i.acceptedDateUtc, u.FirstName, u.LastName, r.id as roomId, r.roomCode, i.subject, i.level, i.price FROM invitations i
            inner join rooms r on r.id = i.roomId
            inner join users u on u.id = r.userId
            where i.declinedDateUtc is null
            and i.expiredDateUtc is null
            and i.canceledDateUtc is null
            and i.deletedDateUtc is null
            and i.isPending = 1
            and i.teacherUserId = ?
        `, [userId]);
        return { activeLesson, activeInvitations }
    }
}

async function getTeacherSubjects(teacherUserId) {
    const [rows] = await pool.query(`
    select subject, s.id, level, price from teacher_subjects ts
    inner join subjects s on ts.subjectId = s.id
    where teacherUserId = ?
    `, [teacherUserId])

    // Group by subject
    const grouped = [];
    const map = {};

    rows.forEach(row => {
        if (!map[row.id]) {
            map[row.id] = {
                subject: row.subject,
                id: row.id,
                levels: []
            };
            grouped.push(map[row.id]);
        }
        map[row.id].levels.push({
            level: row.level,
            price: row.price
        });
    });

    // Sort levels in each subject by custom order
    const levelOrder = ["Szkoła podstawowa", "Szkoła średnia", "Matura - poziom podstawowy", "Matura - poziom rozszerzony", "Studia"];
    grouped.forEach(subject => {
        subject.levels.sort(
            (a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
        );
    });

    return grouped;
}

async function getSubjects() {
    const [rows] = await pool.query(`
    SELECT id, subject from subjects
            `)

    return rows
}

async function getRoomState(roomId) {
    var completedLesson;
    var lessonInProgress;
    var pendingInvitationDetails;
    var mostRecentAcceptedInvitationId;
    const [pendingInvitations] = await pool.query(`
        select count(*) as count from invitations 
        where roomId = ? and isPending = 1 and deletedDateUtc is null
            `, [roomId])
    const [acceptedAndNotResignedInvitations] = await pool.query(`
        select count(*) as count from invitations i
        inner join lessons l on i.id = l.invitationId
        where roomId = ? and isPending = 0 and acceptedDateUtc is not null and completedDateUtc is null and resignedDateUtc is null
            `, [roomId]);

    const [mostRecentAcceptedInvitationCount] = await pool.query(`
        select count(*) as count from invitations
        where roomId = ? and isPending = 0 and acceptedDateUtc is not null and deletedDateUtc is null
        order by acceptedDateUtc desc
            `, [roomId]);

    if (pendingInvitations[0].count > 0) {
        [pendingInvitationDetails] = await pool.query(`
            select id, createdDateUtc, teacherUserId from invitations 
            where roomId = ? and isPending = 1 and deletedDateUtc is null
            `, [roomId])
    }

    if (mostRecentAcceptedInvitationCount[0].count > 0) {
        //if at least one accepted invitation existslessonInProgress
        [mostRecentAcceptedInvitationId] = await pool.query(`
        select id, acceptedDateUtc from invitations
        where roomId = ? and isPending = 0 and acceptedDateUtc is not null and deletedDateUtc is null
        order by acceptedDateUtc desc
        LIMIT 1
            `, [roomId]);


        [completedLesson] = await pool.query(`
        select count(*) as count from lessons
        where invitationId = ? and completedDateUtc is not null
            `, [mostRecentAcceptedInvitationId[0].id]);

        [lessonInProgress] = await pool.query(`
        select count(*) as count, greatest(teacherStartedDateUtc, userStartedDateUtc) as lessonStarted from lessons
        where invitationId = ? and completedDateUtc is null and userStartedDateUtc is not null and teacherStartedDateUtc is not null
            `, [mostRecentAcceptedInvitationId[0].id]);

        [teacher] = await pool.query(`
        select CONCAT(firstName, " ", lastName) teacherName, id from users 
        where id in (
        select teacherUserId from invitations where id = ?
        )
             `, [mostRecentAcceptedInvitationId[0].id]);

    }

    if (pendingInvitations[0].count) {
        return { state: "pendingInvitation", invitiationCreated: pendingInvitationDetails[0].createdDateUtc, invitationId: pendingInvitationDetails[0].id, teacherUserId: pendingInvitationDetails[0].teacherUserId }
    }
    else if (!acceptedAndNotResignedInvitations[0].count) { // if there is no active invitation (accepted)
        return { state: "initialState" }
    }
    else if (completedLesson[0].count) {
        return { state: "lessonCompleted" }
    }
    else if (lessonInProgress[0].count) {
        return { state: "lessonInProgress", lessonStarted: lessonInProgress[0].lessonStarted, teacherUserId: teacher[0].id, teacher: teacher[0].teacherName }
    }
    else return { state: "introductionTalk", invitationAcceptedDate: mostRecentAcceptedInvitationId[0].acceptedDateUtc, invitationId: mostRecentAcceptedInvitationId[0].id, teacher: teacher[0].teacherName, teacherUserId: teacher[0].id }

}

async function sendInvitation(roomId, teacherId, subject, level, price) {
    const [pendingInvitations] = await pool.query(`
        SELECT count(*) as count from invitations 
        WHERE roomId = ? and isPending = 1
            `, [roomId])

    if (pendingInvitations[0].count) {
        return "PENDING INVITATION EXIST"
    }
    else {
        const invitationId = uuid();
        const [result] = await pool.query(`
        INSERT INTO invitations(id, roomId, teacherUserId, subject, level, price, isPending)
        VALUES(?, ?, ?, ?, ?, ?, ?)
            `, [invitationId, roomId, teacherId, subject, level, price, 1])
        return
    }
}

async function postOpinion(teacherUserId, studentUserId, rate, comment) {
    const [teacherStudentOpinion] = await pool.query(`
        SELECT count(*) as count from opinions 
        WHERE teacherUserId = ? and studentUserId = ? and (isDeleted is null or isDeleted = 0)
            `, [teacherUserId, studentUserId])
    if (teacherStudentOpinion[0].count) {
        return "OPINION ALREADY EXISTS"
    }
    else {
        const [result] = await pool.query(`
        INSERT INTO opinions(id, teacherUserId, studentUserId, rate, comment, createdDateUtc)
        VALUES(?, ?, ?, ?, ?, SYSDATE())
            `, [uuid(), teacherUserId, studentUserId, rate, comment])
        return
    }
}

async function cancelInvitation(roomId) {
    const [pendingInvitations] = await pool.query(`
        SELECT count(*) as count from invitations 
        WHERE roomId = ? and isPending = 1
            `, [roomId])

    if (!Number(pendingInvitations[0].count)) {
        return "NO PENDING INVITATIONS"
    }
    else {

        const [result] = await pool.query(`
        UPDATE invitations SET isPending = 0, canceledDateUtc = SYSDATE()
        WHERE roomId = ? and isPending = 1
            `, [roomId])
        return
    }
}



async function acceptInvitation(teacherUserId, roomId) {
    const lessonId = uuid();
    const [pendingInvitations] = await pool.query(`
        SELECT count(*) as count from invitations 
        WHERE teacherUserId = ? and roomId = ? and isPending = 1
            `, [teacherUserId, roomId])

    if (!Number(pendingInvitations[0].count)) {
        return "No invitations found"
    }
    else {

        const [invitationId] = await pool.query(`
        SELECT id from invitations 
        WHERE teacherUserId = ? and roomId = ? and isPending = 1
            `, [teacherUserId, roomId])


        const [acceptInvitation] = await pool.query(`
        UPDATE invitations SET isPending = 0, acceptedDateUtc = SYSDATE()
        WHERE id = ?
            `, [invitationId[0].id])

        const [createNewLesson] = await pool.query(`
        INSERT INTO lessons(id, invitationId)
        VALUES(?, ?)
            `, [lessonId, invitationId[0].id])

        return
    }
}

async function declineInvitation(teacherUserId, roomId) {
    const [pendingInvitations] = await pool.query(`
        SELECT count(*) as count from invitations 
        WHERE teacherUserId = ? and roomId = ? and isPending = 1
            `, [teacherUserId, roomId])


    if (!Number(pendingInvitations[0].count)) {
        return "NO INVITATIONS FOUND"
    }
    else {

        const [invitationId] = await pool.query(`
            SELECT id from invitations 
            WHERE teacherUserId = ? and roomId = ? and isPending = 1
            `, [teacherUserId, roomId])


        const [declineInvitation] = await pool.query(`
            UPDATE invitations SET isPending = 0, declinedDateUtc = SYSDATE()
            WHERE  id = ? and teacherUserId = ? and isPending = 1
            `, [invitationId[0].id, teacherUserId])

        return
    }
}

async function setInvitationExpired(roomId) {
    const [pendingInvitations] = await pool.query(`
        SELECT count(*) as count from invitations 
        WHERE roomId = ? and isPending = 1
            `, [roomId])

    if (!Number(pendingInvitations[0].count)) {
        return "NO PENDING INVITATIONS"
    }
    else {

        const [result] = await pool.query(`
        UPDATE invitations SET isPending = 0, expiredDateUtc = SYSDATE()
        WHERE roomId = ? and isPending = 1
            `, [roomId])
        return
    }
}

async function getTeachers(subject, level, priceFrom, priceTo, minRating) {
    let [rows] = await pool.query(
        `
        SELECT 
            u.id as teacherId,
            CONCAT(u.firstName, " ", u.lastName) as name,
            pub.aboutMe,
            pub.description,
            u.profileImage,
            u.createdDateUtc,
            u.lastLoggedIn,
            s.subject,
            tsub.level,
            tsub.price, 
            IFNULL(o.rate, 0) as rate,
            IFNULL(o.totalReviews, 0) as totalReviews
        FROM users u
        INNER JOIN teacher_subjects tsub ON u.id = tsub.teacherUserId
        INNER JOIN subjects s ON tsub.subjectId = s.id
        INNER JOIN publications pub ON u.id = pub.teacherUserId
        LEFT JOIN (
            SELECT teacherUserId, AVG(rate) AS rate, COUNT(id) AS totalReviews
            FROM opinions
            where studentUserId in (select id from users where isTeacher = 0)
            and (isDeleted is null or isDeleted = 0)
            GROUP BY teacherUserId
        ) o ON u.id = o.teacherUserId
        WHERE s.subject = IFNULL(?, s.subject)
          AND tsub.level = IFNULL(?, tsub.level)
          AND tsub.price >= IFNULL(?, tsub.price)
          AND tsub.price <= IFNULL(?, tsub.price)
          AND IFNULL(o.rate, 0) >= IFNULL(?, IFNULL(o.rate, 0))
          AND pub.isPublished = 1
        ORDER BY u.id, s.subject
        `,
        [subject, level, priceFrom, priceTo, minRating]
    );

    // Group by teacher, then by subject, then by level
    const teachersMap = {};

    for (const row of rows) {
        const teacherId = row.teacherId;
        if (!teachersMap[teacherId]) {
            teachersMap[teacherId] = {
                id: teacherId,
                name: row.name,
                aboutMe: row.aboutMe,
                description: row.description,
                profileImage: row.profileImage,
                createdDateUtc: row.createdDateUtc,
                lastLoggedIn: row.lastLoggedIn,
                rate: Number(row.rate),
                totalReviews: Number(row.totalReviews),
                subjects: [],
                prices: [] // zbieraj ceny
            };
        }

        // Find or add subject
        let subjectObj = teachersMap[teacherId].subjects.find(s => s.subject === row.subject);
        if (!subjectObj) {
            subjectObj = {
                subject: row.subject,
                levels: []
            };
            teachersMap[teacherId].subjects.push(subjectObj);
        }

        // Add level+price if not already present
        if (!subjectObj.levels.some(l => l.level === row.level)) {
            subjectObj.levels.push({
                level: row.level,
                price: Number(row.price)
            });
        }

        // Dodaj cenę do tablicy prices
        teachersMap[teacherId].prices.push(Number(row.price));
    }

    // Dodaj priceMin i priceMax do każdego nauczyciela
    Object.values(teachersMap).forEach(teacher => {
        if (teacher.prices.length > 0) {
            teacher.priceMin = Math.min(...teacher.prices);
            teacher.priceMax = Math.max(...teacher.prices);
        } else {
            teacher.priceMin = null;
            teacher.priceMax = null;
        }
        delete teacher.prices; // usuń tymczasową tablicę
    });

    // Return as array
    return Object.values(teachersMap);
}

async function getInvitationDatetime(teacherUserId, roomId) {
    let [rows] = await pool.query(
        `
        SELECT id, createdDateUtc from invitations
        where teacherUserId = ?
            and roomId = ?
                and isPending = 1
                    `
        , [teacherUserId, roomId])
    return rows
}

async function updateProfileImage(value, email) {
    let [rows] = await pool.query(`
    UPDATE users set profileImage = ?
            where email = ?
                `, [value, email])

    return rows
}

async function saveChatMessage(roomId, senderUserId, text, time) {
    const messageId = uuid();
    let [rows] = await pool.query(`
    INSERT INTO chat_messages (id, roomId, senderUserId, text, sentDateUtc)
    VALUES (?, ?, ?, ?, ?)
            `, [messageId, roomId, senderUserId, text, time])
}

async function setPhoneNumberConfirmed(email) {
    let [rows] = await pool.query(`
    UPDATE users set phoneNumberConfirmed = 1
            where email = ?
                `, [email])

    return rows
}

async function getChatMessages(roomId) {
    let [rows] = await pool.query(`
    SELECT *
    FROM chat_messages
    WHERE roomId = ?
    ORDER BY sentDateUtc ASC
    `, [roomId]);
    return rows;
}

async function isOpinionMissing(studentUserId, teacherUserId) {
    let [rows] = await pool.query(`
    SELECT count(*) as count
    FROM opinions
    WHERE studentUserId = ? AND teacherUserId = ? and (isDeleted is null or isDeleted = 0)
    `, [studentUserId, teacherUserId]);
    return rows[0].count === 0;
}

async function getMissingReviewsLastMonth(studentUserId) {
    let [rows] = await pool.query(`
        SELECT DISTINCT u.id, u.FirstName, u.LastName
        FROM lessons l
        INNER JOIN invitations i ON i.id = l.invitationId
        INNER JOIN rooms r       ON r.id = i.roomId
        INNER JOIN users u       ON u.id = i.teacherUserId
        WHERE r.userId = ?
          AND l.completedDateUtc IS NOT NULL
          AND l.completedDateUtc > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY)
          AND NOT EXISTS (
              SELECT 1
              FROM opinions o
              WHERE o.studentUserId = r.userId
                AND o.teacherUserId = i.teacherUserId
                AND (o.isDeleted IS NULL OR o.isDeleted = 0)
          )
    `, [studentUserId]);
    return rows;
}

async function getTeacherReviews(teacherUserId) {
    let [rows] = await pool.query(`
    SELECT o.rate, o.comment, o.createdDateUtc, u.FirstName, u.LastName from opinions o 
    inner join users u on o.studentUserId = u.id
    WHERE teacherUserId = ?
        and(o.isDeleted is null or o.isDeleted = 0)
    ORDER BY createdDateUtc DESC
        `, [teacherUserId]);
    return rows;
}


async function updateLessonSummaryPdf(roomId, pdfPath) {
    console.log('Updating lesson summary PDF for room:', roomId, 'with path:', pdfPath);
    // Find the latest lesson for the given roomId (by invitation)
    const [invitation] = await pool.query(`
        SELECT id FROM invitations
        WHERE roomId = ?
        ORDER BY acceptedDateUtc DESC
        LIMIT 1
        `, [roomId]);

    if (!invitation[0]) {
        throw new Error('No invitation found for this room');
    }

    await pool.query(`
        UPDATE lessons
        SET lessonSummaryPdf = ?
        WHERE invitationId = ?
            ORDER BY completedDateUtc DESC
        LIMIT 1
        `, [pdfPath, invitation[0].id]);
}

module.exports = {
    userExist, createUser, getHash, getRoomByEmail, getUser, getUsername, getUserRoom, getImagesDirectoryByCode: getImagesDirectoryByCode,
    getAccessCode, getSubjects, getTeachers, getProfileImage, getUserId, updateProfileImage, getBalance, getPhoneNumber,
    upsertPublication, getPublication, updateTeacherSubject, getTeacherSubjects, sendInvitation, cancelInvitation, declineInvitation, acceptInvitation,
    getRoomState, deletePublication, setLastLoggedIn, setInvitationExpired, getInvitationDatetime, startLesson, finishLesson, getLessonsHistory, resignLesson, getTeacherPanelInfo,
    deleteTeacherSubject, phoneNumberExists, updateLessonSummaryPdf, getImagesDirectory, setTutorialCompleted, setPhoneNumberConfirmed, saveChatMessage, getChatMessages, postOpinion,
    isOpinionMissing, getTeacherReviews, getMissingReviewsLastMonth
};
