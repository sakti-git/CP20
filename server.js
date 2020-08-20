const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db_config');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const result = req.body;
    db.serialize(() => {
        const sql = "SELECT * FROM test";
        db.all(sql, (err, rows) => {
            if (err) throw err;

            if (rows) {
                let data = [];
                rows.forEach(result => {
                    data.push(result);
                });
                res.render('list', { data });
            } else {
                console.log("No result");
            }
        });
    });
});


app.get('/add', (req, res) => res.render('add'));

app.post('/add', (req, res) => {
    let result = req.body;
    db.serialize(() => {
        let sql = `INSERT INTO test (string, integer, float, date, boolean) VALUES 
        ("${result.string}", "${result.integer}", "${result.float}", "${result.date}", "${result.boolean}")`;
        db.run(sql, (err) => {
            if (err) {
                throw err;
            }
            res.redirect('/');
        });
    });
});

app.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    let sql = `DELETE FROM test WHERE id = ?`;
    db.run(sql, id, (err) => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect('/');
    })
});

app.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT * FROM test WHERE id = ?`
    db.get(sql, id, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        res.render('edit', { row })
    })
})

app.post('/edit/:id', (req, res) => {
    let id = (req.body.id) - 1;
    let edit = [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean, id]
    let sql = `UPDATE test SET string = ? , integer = ? , float = ? , date = ? , boolean = ? WHERE id = ?`

    db.run(sql, edit, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log(edit);
        res.redirect('/');
    })
});

app.listen(3000, () => {
    console.log('This web is working on port 3000!');
}) 