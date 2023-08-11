const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');

const encoder = bodyParser.urlencoded({ extended: true });
const app = express();
const ejs = require('ejs');
const { dirs } = require('nodemon/lib/config');

port = 2000;

app.use("/assets", express.static("assets"));

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
});

connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Aakashisgood@123",
    database: "nodejs"
});
var db;
app.get('/dbsel', (req, res) => {
    db = req.query.db;
    var flag = 0;
    connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Aakashisgood@123",
        database: db
    });
    connection.connect(function (error) {
        if (error)
            throw error;
        else {
            console.log("listening to port 2000");
            console.log("DB " + db + " connected successfully");
            flag = 1;
        }
    });
    if (flag == 0) {
        res.render(__dirname + '/views/branch.ejs', { msg1: 'ERROR' });
    }
    else {
        res.render(__dirname + '/views/index.ejs', { msg1: 'ERROR' });
    }
});

app.set('view engine', 'ejs');



var u;
var p;

var selectedsection;
var sec;

app.post('/login', encoder, (req, res) => {
    u = req.body.username;
    p = req.body.password;
    connection.query("select * from loginuser where user_name = ? and user_passN = ?", [u, p], function (error, results, fields) {
        if (results.length > 0) {
            console.log(u);
            if (results[0].user_passO != results[0].user_passN && p == results[0].user_passN) {
                if (u == "admin" || u == "acadmin" || u=="director") {
                    res.redirect('/home');
                    u = results[0].name;
                    //console.log("here");
                } else {
                    u = results[0].name;
                    res.redirect('/home2');
                }
            }
            else if (results[0].user_passO != results[0].user_passN && p != results[0].user_passN) {
                res.render('index', { msg1: 'INCORRECT PASSWORD' });
            }
            else {
                res.redirect('/changepass');
            }
        }
        else {
            res.render('index', { msg1: 'INCORRECT PASSWORD OR USERNAME' });
        }
        res.end();
    });
})

app.get('/', (req, res) => {
    u=undefined;
    res.render('branch', { msg1: '' });
});

app.get('/index', (req, res) => {
    res.render('index', { msg1: '' });
});

app.get('/changepass', (req, res) => {
    res.render('changepass', { msg: '' });
});

app.get('/home', function (req, res,next) {
    res.render('home');
});
app.get('/home2', function (req, res) {
    res.render('home2');
});

app.post('/home/time_table/mon_morlab_tt', encoder, (req, res) => {
    selectedsection = req.body.Sec;
    connection.query('update ' + selectedsection + ' set type = "mor"', (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.render(__dirname + "/views/mon_morlab.ejs");
        }
    })
});

app.post('/home/time_table/mon_evelab_tt', encoder, (req, res) => {
    selectedsection = req.body.Sec1;
    connection.query('update ' + selectedsection + ' set type = "eve"', (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.render(__dirname + "/views/mon_eve.ejs");
        }
    })
});

app.get('/options', (req, res) => {
    const flags = req.query.flags;
    connection.query('SELECT name,value from teacher_avail where ' + flags[0] + '="0" and ' + flags[1] + '="0" and ' + flags[2] + '="0" and ' + flags[3] + '="0" and ' + flags[4] + '="0" and ' + flags[5] + '="0" and ' + flags[6] + '="0" and ' + flags[7] + '="0" and ' + flags[8] + '="0" and ' + flags[9] + '="0" and ' + flags[10] + '="0" and ' + flags[11] + '="0"', (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        } else {
            res.json(results);
        }
    });
});
app.post('/edit', encoder, (req, res) => {
    selectedsection = req.body.edit_section;
    if (selectedsection === undefined) {
        res.render(__dirname + "/views/edit_eve.ejs", { p1: 'PLEASE SELECT A SECTION TO VIEW TIMETABLE' });
    }
    else {
        connection.query('select type from ' + selectedsection + ' limit 1', function (error, results) {
            if (error) {
                console.error('Error: ', error);
                res.status(500).json({ error: 'An error occurred' });
            }
            else {
                if (results[0].type === 'eve') {
                    res.redirect("/home/time_table/edit_eve");
                }
                else if (results[0].type === 'mor') {
                    res.redirect("/home/time_table/edit_mor");
                }
                else {
                    res.render(__dirname + "/views/edit_eve.ejs", { p1: 'TIME TABLE HAS NOT BEEN MADE YET' });
                }
            }
        });
    }
});

app.get('/subs', (req, res) => {
    connection.query('select value,subject_name,credits from ' + selectedsection + ' where time_units=2', (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});
app.get('/settheory2', async (req, res) => {
    const subname = req.query.subname;
    const faculty = req.query.selected;
    const flags = req.query.flags;
    const sform = req.query.sform;
    const rom = req.query.room;
    const final = rom + " " + sform;
    try {
        console.log(faculty + flags + sform + rom);
        const q1 = connection.query('update teacher_avail set ' + flags[0] + '="Room ' + final + '",' + flags[1] + '="Room ' + final + '",' + flags[2] + '="Room ' + final + '",' + flags[3] + '="Room ' + final + '" where name=?', [faculty]);
        const q2 = connection.query('update ' + selectedsection + ' set ename =? where subject_name = ?', [faculty, subname]);
        const [result1, result2] = await Promise.all([q1, q2]);
        const data = {
            result1: result1.affectedRows,
            result2: result2.affectedRows
        }
        res.json(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/updateshort',(req,res)=>{
    const short = req.query.short;
    const sub = req.query.sub;
    connection.query('update '+selectedsection+' set '+sub+'="'+short+'"',(error,results)=>{
        if(error){
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else{
            res.render(__dirname+'/views/edit_eve.ejs',{p1:selectedsection});
        }
    })
});

app.get('/getpref', (req, res) => {
    connection.query('select distinct name from subject_avail where time_units=2', (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});

app.get('/getpreflab', (req, res) => {
    connection.query('select name from subject_avail where time_units=6', (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});

app.get('/labs', (req, res) => {
    connection.query('select value,subject_name from ' + selectedsection + ' where time_units=6', (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});

app.get('/resetlab', (req, res) => {
    const flags = req.query.flags;
    const faculty = req.query.selectedValue;
    connection.query('update teacher_avail set ' + flags[0] + '=0 where name=?', [faculty], (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});

app.get('/laboptions', (req, res) => {
    const flags = req.query.flags;
    connection.query('SELECT name,value FROM teacher_avail where ' + flags[0] + '="0" and ' + flags[1] + '="0" and ' + flags[2] + '="0" and ' + flags[3] + '="0" and ' + flags[4] + '="0" ', (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        } else {
            res.json(results);
        }
    });
});

app.get('/save', async (req, res) => {
    const faculty = req.query.faculty;
    const subs = req.query.subs;
    const sform = req.query.sform;
    const rooms = req.query.rooms;
    try {
        const q1 = connection.query('update ' + selectedsection + ' set ename = ? where subject_name = ?', [faculty[0], subs[0]]);
        const q1_1 = connection.query('update ' + selectedsection + ' set sub1 = ?', [sform[0]]);
        const q2 = connection.query('update ' + selectedsection + ' set ename = ?  where subject_name = ?', [faculty[1], subs[1]]);
        const q2_1 = connection.query('update ' + selectedsection + ' set sub2 = ?', [sform[1]]);
        const q3 = connection.query('update ' + selectedsection + ' set ename = ?  where subject_name = ?', [faculty[2], subs[2]]);
        const q3_1 = connection.query('update ' + selectedsection + ' set sub3 = ?', [sform[2]]);
        const q4 = connection.query('update ' + selectedsection + ' set ename = ?  where subject_name = ?', [faculty[3], subs[3]]);
        const q4_1 = connection.query('update ' + selectedsection + ' set sub4 = ?', [sform[3]]);
        const q5 = connection.query('update ' + selectedsection + ' set ename = ?  where subject_name = ?', [faculty[4], subs[4]]);
        const q5_1 = connection.query('update ' + selectedsection + ' set sub5 = ?', [sform[4]]);
        const q6 = connection.query('update ' + selectedsection + ' set ename = ?  where subject_name = ?', [faculty[5], subs[5]]);
        const q6_1 = connection.query('update ' + selectedsection + ' set sub6 = ?', [sform[5]]);

        const q7 = connection.query('update ' + selectedsection + ' set ename = ?,ename2 = ?,room_number = ? where subject_name = ? and batch like "%1%"', [faculty[6], faculty[18], rooms[1], subs[6]]);
        const q7_1 = connection.query('update ' + selectedsection + ' set lab11 = ?', [sform[6]]);
        const q9 = connection.query('update ' + selectedsection + ' set ename = ?,ename2 = ?,room_number = ? where subject_name = ? and batch like "%1%"', [faculty[7], faculty[19], rooms[2], subs[7]]);
        const q9_1 = connection.query('update ' + selectedsection + ' set lab21 = ?', [sform[7]]);
        const q11 = connection.query('update ' + selectedsection + ' set ename = ?,ename2 = ?,room_number = ? where subject_name = ? and batch like "%1%"', [faculty[8], faculty[20], rooms[3], subs[8]]);
        const q11_1 = connection.query('update ' + selectedsection + ' set lab31 = ?', [sform[8]]);
        const q13 = connection.query('update ' + selectedsection + ' set ename = ?,ename2 = ?,room_number = ? where subject_name = ? and batch like "%1%"', [faculty[9], faculty[21], rooms[4], subs[9]]);
        const q13_1 = connection.query('update ' + selectedsection + ' set lab41 = ?', [sform[9]]);
        const q15 = connection.query('update ' + selectedsection + ' set ename = ?,ename2 = ?,room_number = ? where subject_name = ? and batch like "%1%"', [faculty[10], faculty[22], rooms[5], subs[10]]);
        const q15_1 = connection.query('update ' + selectedsection + ' set lab51 = ?', [sform[10]]);
        const q17 = connection.query('update ' + selectedsection + ' set ename = ?,ename2 = ?,room_number = ? where subject_name = ? and batch like "%1%"', [faculty[11], faculty[23], rooms[6], subs[11]]);
        const q17_1 = connection.query('update ' + selectedsection + ' set lab61 = ?', [sform[11]]);
        const q8 = connection.query('update ' + selectedsection + ' set ename = ?,ename2 = ?,room_number = ? where subject_name = ? and batch like "%2%"', [faculty[12], faculty[24], rooms[7], subs[12]]);
        const q8_1 = connection.query('update ' + selectedsection + ' set lab12 = ?', [sform[12]]);
        const q10 = connection.query('update ' + selectedsection + ' set ename = ?,ename2 = ?,room_number = ? where subject_name = ? and batch like "%2%"', [faculty[13], faculty[25], rooms[8], subs[13]]);
        const q10_1 = connection.query('update ' + selectedsection + ' set lab22 = ?', [sform[13]]);
        const q12 = connection.query('update ' + selectedsection + ' set ename = ?,ename2 = ?,room_number = ? where subject_name = ? and batch like "%2%"', [faculty[14], faculty[26], rooms[9], subs[14]]);
        const q12_1 = connection.query('update ' + selectedsection + ' set lab32 = ?', [sform[14]]);
        const q14 = connection.query('update ' + selectedsection + ' set ename = ?,ename2 = ?,room_number = ? where subject_name = ? and batch like "%2%"', [faculty[15], faculty[27], rooms[10], subs[15]]);
        const q14_1 = connection.query('update ' + selectedsection + ' set lab42 = ?', [sform[15]]);
        const q16 = connection.query('update ' + selectedsection + ' set ename = ?,ename2 = ?,room_number = ? where subject_name = ? and batch like "%2%"', [faculty[16], faculty[28], rooms[11], subs[16]]);
        const q16_1 = connection.query('update ' + selectedsection + ' set lab52 = ?', [sform[16]]);
        const q18 = connection.query('update ' + selectedsection + ' set ename = ?,ename2 = ?,room_number = ? where subject_name = ? and batch like "%2%"', [faculty[17], faculty[29], rooms[12], subs[17]]);
        const q18_1 = connection.query('update ' + selectedsection + ' set lab62 = ?', [sform[17]]);
        const [result1, result2, result3, result4, result5, result6,
            result7, result8, result9, result10, result11, result12,
            result13, result14, result15, result16, result17, result18] = await Promise.all([q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16, q17, q18]);
        const data = {
            result1: result1.affectedRows,
            result2: result2.affectedRows,
            result3: result3.affectedRows,
            result4: result4.affectedRows,
            result5: result5.affectedRows,
            result6: result6.affectedRows,
            result7: result7.affectedRows,
            result8: result8.affectedRows,
            result9: result9.affectedRows,
            result10: result10.affectedRows,
            result11: result11.affectedRows,
            result12: result12.affectedRows,
            result13: result13.affectedRows,
            result14: result14.affectedRows,
            result15: result15.affectedRows,
            result16: result16.affectedRows,
            result17: result17.affectedRows,
            result18: result18.affectedRows
        }
        res.json(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});
app.get('/getroom', (req, res) => {
    connection.query('select room_number from ' + selectedsection, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal server error');
        }
        else {
            console.log(results);
            res.json(results);
        }
    });
});
app.get('/reset', (req, res) => {
    const flags = req.query.flags;
    const faculty = req.query.selectedValue;
    connection.query('update teacher_avail set ' + flags[0] + '=0,' + flags[1] + '=0,' + flags[2] + '=0,' + flags[3] + '=0 where name=?', [faculty], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal server error');
        }
        else {
            res.json(results);
        }
    });
});

app.get('/settheory', async (req, res) => {
    const faculty = req.query.selected;
    const flags = req.query.flags;
    const sform = req.query.sform;
    const rom = req.query.room;
    const final = rom + " " + sform;
    try {
        const q1 = connection.query('update teacher_avail set ' + flags[0] + '="Room ' + final + '",' + flags[1] + '="Room ' + final + '",' + flags[2] + '="Room ' + final + '",' + flags[3] + '="Room ' + final + '" where name=?', [faculty]);
        const q2 = connection.query('update room_avail set ' + flags[0] + '="' + sform + ' ' + selectedsection + '",' + flags[1] + '="' + sform + ' ' + selectedsection + '",' + flags[2] + '="' + sform + ' ' + selectedsection + '",' + flags[3] + '="' + sform + ' ' + selectedsection + '" where room = ?', [rom]);
        const [result1, result2] = await Promise.all([q1, q2]);
        const data = {
            result1: result1.affectedRows,
            result2: result2.affectedRows
        }
        res.json(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



app.get('/room', (req, res) => {
    const flags = req.query.flag;
    connection.query('select room from room_avail where ' + flags[0] + '="0" and ' + flags[1] + '="0" and ' + flags[2] + '="0" and ' + flags[3] + '="0" and ' + flags[4] + '="0" and ' + flags[5] + '="0" and ' + flags[6] + '="0" and ' + flags[7] + '="0" and ' + flags[8] + '="0" and ' + flags[9] + '="0" and ' + flags[10] + '="0" and ' + flags[11] + '="0" and ' + flags[12] + '="0" and ' + flags[13] + '="0" and ' + flags[14] + '="0" and ' + flags[15] + '="0" and ' + flags[16] + '="0" and ' + flags[17] + '="0" and ' + flags[18] + '="0" and ' + flags[19] + '="0" and ' + flags[20] + '="0" and ' + flags[21] + '="0" and ' + flags[22] + '="0" and ' + flags[23] + '="0" and ' + flags[24] + '="0" and ' + flags[25] + '="0" and ' + flags[26] + '="0" and ' + flags[27] + '="0" and ' + flags[28] + '="0" and ' + flags[29] + '="0"', (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    })
});

app.get('/Notes', function (req, res) {
    res.render(__dirname + "/views/notes.ejs");
});

app.get('/labroom', (req, res) => {
    const flag = req.query.flag;
    connection.query('select room from labroom_avail where ' + flag + '="0"', (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});

app.get('/conv', (req, res) => {
    const name = req.query.teacher;
    connection.query('select value from teacher_avail where name = ?', [name], (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});

app.get('/setlab', async (req, res) => {
    const flags = req.query.flags;
    const faculty = req.query.selected;
    const sform = req.query.sform;
    const room = req.query.room;
    const shor = req.query.short;
    const final = room + " " + sform + " " + shor;
    console.log(flags + " " + room);
    try {
        const q1 = connection.query('update teacher_avail set ' + flags + '="' + final + '" where name = ?', [faculty[0]]);
        const q2 = connection.query('update teacher_avail set ' + flags + '="' + final + '" where name = ?', [faculty[1]]);
        var q3 = 0;
        if (flags == 'ml2') {
            q3 = connection.query('update labroom_avail set ml2="' + sform + ' ' + selectedsection + ' ' + shor + '" where room = ?', [room]);
        }
        else if (flags == 'ml1') {
            q3 = connection.query('update labroom_avail set ml1="' + sform + ' ' + selectedsection + ' ' + shor + '" where room = ?', [room]);
        }
        else if (flags == 'tl1') {
            q3 = connection.query('update labroom_avail set tl1="' + sform + ' ' + selectedsection + ' ' + shor + '" where room = ?', [room]);
        }
        else if (flags == 'tl2') {
            q3 = connection.query('update labroom_avail set tl2="' + sform + ' ' + selectedsection + ' ' + shor + '" where room = ?', [room]);
        }
        else if (flags == 'wl1') {
            q3 = connection.query('update labroom_avail set wl1="' + sform + ' ' + selectedsection + ' ' + shor + '" where room = ?', [room]);
        }
        else if (flags == 'wl2') {
            q3 = connection.query('update labroom_avail set wl2="' + sform + ' ' + selectedsection + ' ' + shor + '" where room = ?', [room]);
        }
        else if (flags == 'thl1') {
            q3 = connection.query('update labroom_avail set thl1="' + sform + ' ' + selectedsection + ' ' + shor + '" where room = ?', [room]);
        }
        else if (flags == 'thl2') {
            q3 = connection.query('update labroom_avail set thl2="' + sform + ' ' + selectedsection + ' ' + shor + '" where room = ?', [room]);
        }
        else if (flags == 'fl1') {
            q3 = connection.query('update labroom_avail set fl1="' + sform + ' ' + selectedsection + ' ' + shor + '" where room = ?', [room]);
        }
        else if (flags == 'fl2') {
            q3 = connection.query('update labroom_avail set fl2="' + sform + ' ' + selectedsection + ' ' + shor + '" where room = ?', [room]);
        }
        else if (flags == 'sl1') {
            q3 = connection.query('update labroom_avail set sl1="' + sform + ' ' + selectedsection + ' ' + shor + '" where room = ?', [room]);
        }
        else if (flags == 'sl2') {
            q3 = connection.query('update labroom_avail set sl2="' + sform + ' ' + selectedsection + ' ' + shor + '" where room = ?', [room]);
        }
        const [result1, result2, result3] = await Promise.all([q1, q2, q3]);
        const data = {
            result1: result1.affectedRows,
            result2: result2.affectedRows,
            result3: result3.affectedRows
        }
        res.json(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

app.get('/faclist', (req, res) => {
    connection.query("select name,value from teacher_avail", (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});
var selectedfaculty;

app.get('/fac_check', encoder, (req, res) => {
    var selectedfaculty = req.query.faculty;
    selectedfaculty = selectedfaculty.trim();
    console.log(selectedfaculty + u);
    if (u == "admin" || u=="acadmin" || u=="director") {
        connection.query("select * from teacher_avail where value = '" + selectedfaculty + "'", function (error, results) {
            if (error) {
                console.error('Error: ', error);
                res.status(500).json({ error: 'An error occurred' });
            }
            else {
                console.log(results);
                res.json(results);

            }
        })
    }
    else {
        connection.query("select * from teacher_avail where name = '" + u + "'", function (error, results) {
            if (error) {
                console.error('Error: ', error);
                res.status(500).json({ error: 'An error occurred' });
            }
            else {
                res.json(results);
            }
        })
    }
})




app.get('/sec', (req, res) => {
    connection.query('SELECT table_name FROM information_schema.tables WHERE table_schema ="'+db+'" and table_name like "%sem%" ', (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});
// app.get('/secmor', (req, res) => {
//     connection.query('SELECT table_name FROM information_schema.tables WHERE table_schema = "newp" and table_name like "%sem%" and type = "mor" ', (error, results) => {
//         if (error) {
//             console.error('Error: ', error);
//             res.status(500).json({ error: 'An error occurred' });
//         }
//         else {
//             res.json(results);
//         }
//     });
// });
// app.get('/secmor', (req, res) => {
//     connection.query('SELECT table_name FROM information_schema.tables WHERE table_schema = "newp" and table_name like "%sem%" and type = "mor" ', (error, results) => {
//         if (error) {
//             console.error('Error: ', error);
//             res.status(500).json({ error: 'An error occurred' });
//         }
//         else {
//             res.json(results);
//         }
//     });
// });
app.get('/ret', (req, res) => {
    const secti = req.query.secti;
    connection.query('SELECT * from ' + secti, (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});
app.post('/change', encoder, (req, res) => {
    var pass1 = req.body.cnfpass1;
    var pass2 = req.body.cnfpass2;
    connection.query("select * from loginuser where user_name = ?", [u], function (error, result, fields) {
        var passkey = result[0].user_passN;
        if (pass1 == pass2 && (pass1 != passkey) && pass1.length >= 8) {
            u = result[0].name;
            connection.query("update loginuser set user_passN = ? where user_name = ?", [pass1, u], function (error, result, fields) {
                if (result.affectedRows == 1) {
                    if (u == "admin" || u == "acadmin" || u=="director") {
                        res.redirect('/home');
                    }
                    else {
                        res.redirect('/home2');
                    }
                }
            });
        }
        else {
            res.render('changepass', { msg: 'FIELDS DO NOT MATCH OR ENTER DIFFERENT PASSKEY' });
        }
    });
});

app.post('/sec_check', encoder, (req, res) => {
    sec = req.body.section;
    if (sec === undefined) {
        res.render(__dirname + "/views/eveshowtt.ejs", { p1: 'PLEASE SELECT A SECTION TO VIEW TIMETABLE' });
    }
    else {
        connection.query('select type from ' + sec + ' limit 1', function (error, results) {
            if (error) {
                console.error('Error: ', error);
                res.status(500).json({ error: 'An error occurred' });
            }
            else {
                if (results[0].type === 'eve') {
                    res.redirect("/home/time_table/eveshowtt");
                }
                else if (results[0].type === 'mor') {
                    res.redirect("/home/time_table/morshowtt");
                }
                else {
                    res.render(__dirname + "/views/eveshowtt.ejs", { p1: 'TIME TABLE HAS NOT BEEN MADE YET' });
                }
            }
        });
    }
});

app.get('/fetch', function (req, res) {
    const sec1 = req.query.section;
    connection.query('select sub1,sub2,sub3,sub4,sub5,sub6,lab11,lab12,lab21,lab22,lab31,lab32,lab41,lab42,lab51,lab52,lab61,lab62,room_number from ' + sec1, function (error, results) {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    })
});

app.get('/tcsub', (req, res) => {

    connection.query('select subject_name,ename,ename2,room_number,time_units from ' + sec, (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});
app.get('/tcsub2', (req, res) => {
    const section = req.query.section;
    //console.log(section);
    connection.query('select subject_name,ename,ename2,room_number,time_units from ' + section, (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});
app.get('/getnotes', (req, res) => {
    connection.query('select notes from teacher_avail where name ="' + u + '"', (error, results) => {
        if (error) {
            console.error('error', error);
        }
        else {
            res.json(results);
        }
    })
})

app.get('/sendnotes', encoder, function (req, res) {
    const text = req.query.text;
    connection.query('update teacher_avail set notes=? where name="' + u + '"', [text], (error, results) => {
        if (error) {
            console.error('error', error);
        }
        else {
            res.json(results);
        }
    });
});

app.get('/sendpref', encoder, function (req, res) {
    const t1 = req.query.a1;
    const t2 = req.query.a2;
    const t3 = req.query.a3;
    const t4 = req.query.a4;
    const t5 = req.query.a5;
    const tl1 = req.query.al1;
    const tl2 = req.query.al2;
    const tl3 = req.query.al3;
    const tl4 = req.query.al4;
    const tl5 = req.query.al5;
    connection.query('update teacher_avail set pref1=?,pref2=?,pref3=?,pref4=?,pref5=?,labpref1=?,labpref2=?,labpref3=?,labpref4=?,labpref5=? where name="' + u + '"', [t1, t2, t3, t4, t5, tl1, tl2, tl3, tl4, tl5], (error, results) => {
        if (error) {
            console.error('error', error);
        }
        else {
            res.json(results);
        }
    });
});

app.get('/addsub', encoder, (req, res) => {
    const branch = req.query.branch;
    const name = req.query.name;
    const creds = req.query.creds;
    const code = req.query.code;
    const short = req.query.short;
    const sems = req.query.semester;
    const t_units = req.query.t_units;
    const batch = req.query.batch;
    connection.query("insert into subject_avail values (?,?,?,?,?,?,?,?)", [name, short, branch, t_units, batch, code, creds, sems], (error, results) => {
        if (error) {
            console.error('error', error);
        }
        else {
            res.json(results);
        }
    })
});

app.get('/delsubfetch', (req, res) => {
    connection.query("select short_form,name from subject_avail", (error, results) => {
        if (error) {
            console.error('error', error);
        }
        else {
            res.json(results);
        }
    })
});

app.get('/addlab', (req, res) => {
    const lab = req.query.lab;
    connection.query('insert into labroom_avail(room) values ("' + lab + '")', (error, results) => {
        if (error) {
            console.error('error', error);
        }
        else {
            res.json(results);
        }
    });
});

app.get('/dellabavail', (req, res) => {
    connection.query('select room from labroom_avail where ml1="0" and ml2="0" and tl1="0" and tl2="0" and wl1="0" and wl2="0" and thl1="0" and thl2="0" and fl1="0" and fl2="0" and sl1="0" and sl2="0"', (error, results) => {
        if (error) {
            console.error('error', error);
        }
        else {
            res.json(results);
        }
    });
});

app.get('/dellab', (req, res) => {
    const lab = req.query.lab;
    connection.query('delete from labroom_avail where room = "' + lab + '"', (error, results) => {
        if (error) {
            console.error('error', error);
        }
        else {
            res.json(results);
        }
    });
});

app.get('/delsub', (req, res) => {
    const name = req.query.name;
    connection.query('delete from subject_avail where name = ?', [name], (error, results) => {
        if (error) {
            console.error('error', error);
        }
        else {
            res.json(results);
        }
    });
});

app.get('/delclass', (req, res) => {
    const class1 = req.query.class1;
    connection.query('drop table ' + class1, (error, results) => {
        if (error) {
            console.error('error', error);
        }
        else {
            res.json(results);
        }
    });
});
app.get('/addclass', (req, res) => {
    const b = req.query.b;
    const s = req.query.s;
    const sem = req.query.sem;
    const year = req.query.year;
    connection.query('create table ' + b + '_sec' + s + '_sem' + sem + '_' + year + '(subject_code varchar(200),subject_name varchar(400),empid varchar(200),ename varchar(200),ename2 varchar(200),type varchar(50),value varchar(200),credits int,time_units varchar(10),batch varchar(5), room_number varchar(10),semester varchar(10),section varchar(10) default "' + b + '-' + s + '",sub1 varchar(50),sub2 varchar(50),sub3 varchar(50),sub4 varchar(50),sub5 varchar(50),sub6 varchar(50),lab11 varchar(50),lab12 varchar(50),lab21 varchar(50),lab22 varchar(50),lab31 varchar(50),lab32 varchar(50),lab41 varchar(50),lab42 varchar(50),lab51 varchar(50),lab52 varchar(50),lab61 varchar(50),lab62 varchar(50),primary key(subject_name, value,section,time_units, batch, semester) ,foreign key(subject_name, value,section,time_units, batch, semester) references subject_avail(Name,Short_form,Branch,time_units,batch,Semester)on delete cascade ON UPDATE CASCADE)', (error, results) => {
        if (error) {
            console.error('error', error);
        }
        else {
            res.json(results);
        }
    });
});

app.get('/insertclass', (req, res) => {
    const b = req.query.b;
    const s = req.query.s;
    const sem = req.query.sem;
    const year = req.query.year;
    connection.query('insert into ' + b + '_sec' + s + '_sem' + sem + '_' + year + '(subject_name,value,section,time_units,batch,semester,subject_code,credits) select Name,Short_form,Branch,time_units,batch,Semester,Subject_code,Credits from subject_avail where Semester="' + sem + '" and Branch="' + b + '"', (error, results) => {
        if (error) {
            console.error('error', error);
        }
        else {
            res.json(results);
        }
    });
});


app.get('/addroom', (req, res) => {
    const room = req.query.room;
    if (room != "") {
        const data = {
            result1: "ADDED",
        }
        connection.query('insert into room_avail(room) values("' + room + '")', (error, results) => {
            if (error) {
                console.error('Error: ', error);
                res.status(500).json({ error: 'An error occurred' });
            }
            else {
                res.json(data);
            }
        });
    } else {
        const data = {
            result1: "empty fields",
        }
        res.json(data);
    }
});

app.get('/add', async (req, res) => {
    const name = req.query.name;
    const short = req.query.short;
    const email = req.query.email;
    const id = req.query.fid;
    if (name != "" && short != "" && email != "" && id != "") {
        try {
            const q1 = connection.query('insert into teacher_avail(name,value) values("' + name + '","' + short + '")');
            const q2 = connection.query('insert into loginuser values("' + id + '","' + id + '","' + email + '","' + name + '")');
            const [result1, result2] = await Promise.all([q1, q2]);
            const data = {
                result1: "ADDED",
            }
            res.json(data);
        }
        catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        const data = {
            result1: "Do not leave fields empty",
        }

        res.json(data);
    }
});
app.get('/clearRom', (req, res) => {
    const clas = req.query.clas;
    connection.query('UPDATE ' + clas + ' SET ename = NULL, ename2 = NULL, type = NULL, room_number = null, sub1 = null, sub2 = null, sub3 = null,sub4 = null, sub5 = null, sub6 = null, lab11 = null, lab12 = null, lab21 = null, lab22 = null, lab31 = null, lab32 = null,lab41 = null, lab42 = null, lab51 = null, lab52 = null, lab61 = null, lab62 = null; ', (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});

app.get('/clearall', async (req, res) => {
    try {
        const q1 = connection.query('UPDATE teacher_avail SET mc1 = "0", mc2 = "0", mc3 = "0", mc4 = "0", mc5 = "0", mc6 = "0", mc7 = "0", ml1 = "0", ml2 = "0", tc1 = "0", tc2 = "0", tc3 = "0", tc4 = "0", tc5 = "0", tc6 = "0", tc7 = "0", tl1 = "0", tl2 = "0",wc1 = "0", wc2 = "0", wc3 = "0", wc4 = "0", wc5 = "0", wc6 = "0", wc7 = "0", wl1 = "0", wl2 = "0", thc1 = "0", thc2 = "0", thc3 = "0", thc4 = "0", thc5 = "0", thc6 = "0", thc7 = "0", thl1 = "0", thl2 = "0",fc1 = "0", fc2 = "0", fc3 = "0", fc4 = "0", fc5 = "0", fc6 = "0", fc7 = "0", fl1 = "0", fl2 = "0", sc1 = "0", sc2 = "0", sc3 = "0", sc4 = "0", sc5 = "0", sc6 = "0", sc7 = "0", sl1 = "0", sl2 = "0"');
        const q2 = connection.query('UPDATE labroom_avail SET ml1 = "0", ml2 = "0", tl1 = "0", tl2 = "0", wl1 = "0", wl2 = "0", thl1 = "0", thl2 = "0", fl1 = "0", fl2 = "0", sl1 = "0", sl2 = "0"; ');
        const q3 = connection.query('UPDATE room_avail SET mc1 = "0", mc2 = "0", mc3 = "0", mc4 = "0", mc5 = "0", mc6 = "0", mc7 = "0", ml1 = "0", ml2 = "0", tc1 = "0", tc2 = "0", tc3 = "0", tc4 = "0", tc5 = "0", tc6 = "0", tc7 = "0", tl1 = "0", tl2 = "0",wc1 = "0", wc2 = "0", wc3 = "0", wc4 = "0", wc5 = "0", wc6 = "0", wc7 = "0", wl1 = "0", wl2 = "0", thc1 = "0", thc2 = "0", thc3 = "0", thc4 = "0", thc5 = "0", thc6 = "0", thc7 = "0", thl1 = "0", thl2 = "0",fc1 = "0", fc2 = "0", fc3 = "0", fc4 = "0", fc5 = "0", fc6 = "0", fc7 = "0", fl1 = "0", fl2 = "0", sc1 = "0", sc2 = "0", sc3 = "0", sc4 = "0", sc5 = "0", sc6 = "0", sc7 = "0", sl1 = "0", sl2 = "0",mor="0",eve="0"');
        const [result1, result2, result3] = await Promise.all([q1, q2, q3]);
        const data = {
            result1: "DELETED",
        }
        res.json(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/del', async (req, res) => {
    const name = req.query.name;
    const email = req.query.email;
    if (name != "Teachers" && email != "emails") {
        try {
            const q1 = connection.query('DELETE FROM loginuser WHERE user_name = "' + email + '";');
            const q2 = connection.query('DELETE FROM teacher_avail WHERE name = "' + name + '";');
            const [result1, result2] = await Promise.all([q1, q2]);
            const data = {
                result1: "DELETED",
            }
            res.json(data);
        }
        catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        const data = {
            result1: "do not leave fields empty",
        }

        res.json(data);
    }
});

app.get('/delrom', function (req, res) {
    const room1 = req.query.room1;
    if (room1 != "rooms") {
        connection.query('delete from room_avail where room = "' + room1 + '"', function (error, results) {
            const data = {
                result1: "DELETED",
            }
            if (error) {
                console.error('Error: ', error);
                res.status(500).json({ error: 'An error occurred' });
            }
            else {
                res.json(data);
            }
        })
    } else {
        const data = {
            result1: "do not leave fields empty",
        }
        res.json(data);
    }
});
app.get('/roms', (req, res) => {
    connection.query('select room from room_avail where mc1="0" and mc2="0" and mc3="0" and mc4="0" and mc5="0" and mc6="0" and mc7="0" and tc1="0" and tc2="0" and tc3="0" and tc4="0" and tc5="0" and tc6="0" and tc7="0" and wc1="0" and wc2="0" and wc3="0" and wc4="0" and wc5="0" and wc6="0" and wc7="0" and thc1="0" and thc2="0" and thc3="0" and thc4="0" and thc5="0" and thc6="0" and thc7="0" and fc1="0" and fc2="0" and fc3="0" and fc4="0" and fc5="0" and fc6="0" and fc7="0" and sc1="0" and sc2="0" and sc3="0" and sc4="0" and sc5="0" and sc6="0" and sc7="0"', (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});

app.get('/emlist', (req, res) => {
    connection.query("select user_name from loginuser", (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});

app.get('/facloaddisp', (req, res) => {
    connection.query('select * from teacher_avail', (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});

app.get('/facloaddisp_custom', (req, res) => {
    connection.query('select name,value,mc1,mc2,mc3,mc4,mc5,mc6,mc7,ml1,ml2,tc1,tc2,tc3,tc4,tc5,tc6,tc7,tl1,tl2,wc1,wc2,wc3,wc4,wc5,wc6,wc7,wl1,wl2,thc1,thc2,thc3,thc4,thc5,thc6,thc7,thl1,thl2,fc1,fc2,fc3,fc4,fc5,fc6,fc7,fl1,fl2,sc1,sc2,sc3,sc4,sc5,sc6,sc7,sl1,sl2 from teacher_avail where value = ?',[selectedfaculty], (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            console.log(selectedfaculty);
            res.json(results);
        }
    });
});

app.get('/freefac1', (req, res) => {
    const flags = req.query.flags;
    connection.query('SELECT name,value FROM teacher_avail where ' + flags[0] + '="0" and ' + flags[1] + '="0" and ' + flags[2] + '="0" and ' + flags[3] + '="0" and ' + flags[4] + '="0" and ' + flags[5] + '="0" and ' + flags[6] + '="0" and ' + flags[7] + '="0" and ' + flags[8] + '="0" and ' + flags[9] + '="0" and ' + flags[10] + '="0" and ' + flags[11] + '="0" and ' + flags[12] + '="0" and ' + flags[13] + '="0" and ' + flags[14] + '="0" and ' + flags[15] + '="0" and ' + flags[16] + '="0" and ' + flags[17] + '="0" and '  + flags[18] + '="0" and ' + flags[19] + '="0" and ' + flags[20] + '="0" and ' + flags[21] + '="0" and '  + flags[22] + '="0" and ' + flags[23] + '="0" and ' + flags[24] + '="0" and ' + flags[25] + '="0" and ' + flags[26] + '="0" and ' + flags[27] + '="0" and ' + flags[28] + '="0" and ' + flags[29] + '="0" and ' + flags[30] + '="0" and ' + flags[31] + '="0"', (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        } else {
            res.json(results);
        }
    });
});

app.get('/thprefdisp', (req, res) => {
    connection.query('select * from teacher_avail', (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});

app.get('/labfree', (req, res) => {
    connection.query('select * from labroom_avail', (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});

app.get('/facultyfree', (req, res) => {
    connection.query('select * from teacher_avail', (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            console.log(results);
            res.json(results);
        }
    });
});

app.get('/dispfact', (req, res) => {
    connection.query('select * from loginuser', (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
});

app.get('/grpfindfac',(req,res)=>{
    connection.query('select name,mc1,mc2,mc3,mc4,mc5,mc6,mc7,ml1,ml2,tc1,tc2,tc3,tc4,tc5,tc6,tc7,tl1,tl2,wc1,wc2,wc3,wc4,wc5,wc6,wc7,wl1,wl2,thc1,thc2,thc3,thc4,thc5,thc6,thc7,thl1,thl2,fc1,fc2,fc3,fc4,fc5,fc6,fc7,fl1,fl2,sc1,sc2,sc3,sc4,sc5,sc6,sc7,sl1,sl2 from teacher_avail',(error,results)=>{
        if(error){
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else{
            res.json(results);
        }
    })
});

app.get('/dispsubs', (req, res) => {
    connection.query('select * from subject_avail', (error, results) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
})
app.get('/seteve', (req, res) => {
    const sect = req.query.sect;
    connection.query('update ' + sect + ' set type = "eve"', (error, result) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(result);
        }
    })
})
app.get('/setrom', async(req, res) => {
    const secto = req.query.sect;
    const rn = req.query.room;
    const type = req.query.type;
    try {
        console.log(type);
        const q1 = connection.query('update ' + secto + ' set room_number = ?', [rn]);
        const q2 = connection.query('update room_avail set '+type+' ="1" where room = ?',[rn]);
        const [res1, res2] = await Promise.all([q1, q2]);
        const data = {
            result1: res1.affectedRows,
            result2: res2.affectedRows
        }
        res.json(data);
    }
    catch (error) {
        console.log(error);
    }
});

app.get('/room_custom_fetch',(req,res)=>{
    const type = req.query.type;
    connection.query('select room from room_avail where '+type+'="0"', (error, results) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(results);
        }
    });
})

app.get('/fetchtype',(req,res)=>{
    const sec = req.query.sec;
    connection.query('select type from '+sec,(error,result)=>{
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(result);
        }
    })
});

app.get('/setmor', (req, res) => {
    const sect = req.query.sect;
    connection.query('update ' + sect + ' set type = "mor"', (error, result) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(result);
        }
    })
})
app.get('/findfac', (req, res) => {
    const subname = req.query.subname;
    connection.query('select ename from ' + selectedsection + ' where subject_name = ?', [subname], (error, result) => {
        if (error) {
            console.error('Error: ', error);
            res.status(500).json({ error: 'An error occurred' });
        }
        else {
            res.json(result);
        }
    })
})
app.get('/clear', async (req, res) => {
    const subname = req.query.subname;
    const facname = req.query.facname;
    const arr = req.query.arr;
    console.log(selectedsection);
    console.log(facname);
    try {
        const q1 = connection.query('update ' + selectedsection + ' set ename = NULL where subject_name = ?', [subname]);
        const q2 = connection.query('update teacher_avail set ' + arr[0] + '="0",' + arr[1] + '="0",' + arr[2] + '="0",' + arr[3] + '="0" where name = ?', [facname]);
        const [res1, res2] = await Promise.all([q1, q2]);
        const data = {
            result1: res1.affectedRows,
            result2: res2.affectedRows
        }
        res.json(data);
    }
    catch (error) {
        console.log(error);
    }
});

app.post('/home/time_table/factt', encoder, function (req, res) {
    selectedfaculty = req.body.faculty;
    res.render(__dirname + "/views/factt.ejs", { p1: selectedfaculty });
});

app.get('/home/time_table/eveshowtt', function (req, res) {
    res.render(__dirname + "/views/eveshowtt.ejs", { p1: sec });
});

app.get('/home/time_table/morshowtt', function (req, res) {
    res.render(__dirname + "/views/morshowtt.ejs", { p1: sec });
});

app.get('/downloadevett', (req, res) => {
    res.render(__dirname + "/views/downloadevett.ejs", { p1: sec });
});

app.get('/labfreedisp', function (req, res) {
    res.render(__dirname + "/views/labfree.ejs");
});

app.get('/facfree', function (req, res) {
    res.render(__dirname + "/views/showfacfree.ejs");
});

app.get('/facload', (req, res) => {
    res.render(__dirname + "/views/facload.ejs");
});

app.get('/tprefcheck', (req, res) => {
    res.render(__dirname + "/views/theoryprefcheck.ejs");
});

app.get('/lprefcheck', (req, res) => {
    res.render(__dirname + "/views/labprefcheck.ejs");
});

app.get('/home/time_table/edit_eve', (req, res) => {
    res.render(__dirname + "/views/edit_eve.ejs", { p1: selectedsection });
});
app.get('/home/time_table/edit_mor', (req, res) => {
    res.render(__dirname + "/views/edit_mor.ejs", { p1: selectedsection });
});
app.get('/home/time_table/mor_eve', (req, res) => {
    res.render(__dirname + "/views/edit_.ejs", { p1: selectedsection });
});

app.get('/downloadmortt', (req, res) => {
    res.render(__dirname + "/views/downloadmortt.ejs", { p1: sec });
});

app.get('/home/time_table', function (req, res) {
    if(u=="admin" || u=="director"){
        res.render(__dirname + '/views/askfortt.ejs');
    }
    else if(u=="acadmin"){
        res.render(__dirname + '/views/askfortt2.ejs');
    }
});

app.get('/sectionmod', function (req, res) {
    res.render(__dirname + '/views/sectionmodify.ejs');
});

app.get('/sectionmod1', function (req, res) {
    res.render(__dirname + '/views/sectionmodify1.ejs');
});
app.get('/subjectmod', function (req, res) {
    res.render(__dirname + '/views/subjectmodify.ejs');
});

app.get('/roomlabmod', function (req, res) {
    if(u=="acadmin" || u=="director"){
        res.render(__dirname + '/views/roomlabmodify.ejs');     //only rooms
    }
    else{
        res.render(__dirname + '/views/roomlabmodify2.ejs');
    }
});

app.get('/facultymod', function (req, res) {
    res.render(__dirname + '/views/facultymodify.ejs');
});

app.get('/addsec',(req,res)=>{
    res.render(__dirname+'/views/addsec.ejs');
});  

app.get('/allot_reg_mir',(req,res)=>{
    res.render(__dirname+'/views/allotment.ejs');
});  

app.get('/allot_rooms',(req,res)=>{
    res.render(__dirname+'/views/allot_room.ejs');
});  

app.get('/del_sec',(req,res)=>{
    res.render(__dirname+'/views/del_sec.ejs');
}); 

app.get('/grpfacfree',(req,res)=>{
    res.render(__dirname+"/views/grpfacfree.ejs");
});

app.get('/showfac', function (req, res) {
    res.render(__dirname + '/views/dispfac.ejs');
});

app.get('/showsub', function (req, res) {
    res.render(__dirname + '/views/dispsub.ejs');
});

app.get('/Preferences', function (req, res) {
    res.render(__dirname + '/views/pref.ejs');
});

app.get('/load', function (req, res) {
    if(u=="acadmin" || u=="admin"){
        res.render(__dirname + '/views/load.ejs');
    }
    else if(u=="director"){
        res.render(__dirname + '/views/load_dir.ejs');
    }
});

app.get('/home2/time_table', function (req, res) {
    const fac = u;
    res.render(__dirname + '/views/teacher_table.ejs', { p1: fac, fac: fac });
});

app.get('/home/time_table/askfortt', function (req, res) {
    res.render(__dirname + '/views/askfortt.ejs');
});
app.get('/Admin', function (req, res) {
    if (u == "admin") {
        res.render(__dirname + '/views/admin.ejs');
    }
    else if(u=="acadmin"){
        res.render(__dirname + '/views/acadmin.ejs');
    }
    else if(u=="director"){
        res.render(__dirname + '/views/directoradmin.ejs');
    }
});

app.get('/req_status',(req,res)=>{
    res.json({name:u});
})

app.use('/', (req, res) => {
    res.render(__dirname + "/views/404");
});

app.listen(port,()=>{
    console.log("server started at port: "+port);
});