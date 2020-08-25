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
    let params = [];
    let search = false;

    if (req.query.checkId && req.query.id) {
        params.push(`id = ${req.query.id}`);
        search = true;
    }

    if (req.query.checkString && req.query.string) {
        params.push(`string = "${req.query.string}"`);
        search = true;
    }

    if (req.query.checkInteger && req.query.integer) {
        params.push(`integer = "${req.query.integer}"`);
        search = true;
    }

    if (req.query.checkFloat && req.query.float) {
        params.push(`float = "${req.query.float}"`);
        search = true;
    }

    if (req.query.checkDate && req.query.startDate && req.query.endDate) {
        params.push(`date BETWEEN "${req.query.startDate}" AND "${req.query.endDate}"`);
        search = true;
    }

    if (req.query.checkBoolean && req.query.boolean) {
        params.push(`boolean = "${req.query.boolean}"`);
        search = true;
    }

    let dataSearch = ""
    if (search) {
        dataSearch += `WHERE ${params.join(' AND ')}`
    }

    const page = req.query.page || 1;
    const limit = 3;
    const offset = (page - 1) * limit;

    //db.serialize(() => {
        let sql = "SELECT COUNT(id) AS total FROM test";
        db.all(sql, (err, rows) => {
            if (err) {
                return res.send(err);
            } else if (rows == 0) {
                return res.send('Sorry, data not found')
            } else {
                const total = rows[0].total;
                const pages = Math.ceil(total / limit);

                sql = `SELECT * FROM test ${dataSearch} LIMIT ? OFFSET ?`;
                db.all(sql, [limit, offset], (err, rows) => {
                    if (err) {
                        return res.send(err);
                    } else if (rows == 0) {
                        return res.send('Sorry, data not found')
                    } else {
                        let data = [];
                        rows.forEach(result => {
                            data.push(result);
                        });
                        res.render('list', { data, page, pages });
                    }
                })

            }
        })
    //})

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
    let id = req.body.id;
    let edit = [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean, id]
    let sql = `UPDATE test SET string = ? , integer = ? , float = ? , date = ? , boolean = ? WHERE id = ?`
    db.run(sql, edit, (err) => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect('/');
    })
});

app.listen(3000, () => {
    console.log('This web is working on port 3000!');
}) 