const express = require('express');
const app = express();
const port = 3000;
const mariadb = require('mariadb');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'dbuser',
    password: 'pass.2021',
    database: 'sample',
    port: '3306',
    connectionLimit: 5
})

// cache setting
console.log('starting...');
app.use(function (req, res, next) {
    res.set('Cache-control', 'public, max-age=300');
    next();
});

// home endpoint
app.get('/', (req,res)=>{
    res.send("welcome!")
});

//----------------- Get end points start

//  to get every student present in student table
app.get('/student',(req,res)=>{
    pool.getConnection().then(conn =>{
            console.log("no filter requested");
            conn.query('select * from student')
            .then(rows => {
                conn.release();
                res.json(rows);
            })
            .catch(err => {
                conn.release();
                console.log('sending error');
                res.status(500).json(err);
            });
    })
    .catch(err =>{
        res.status(500).json(err);
    });
});


// to get student by name
app.get('/student/:name',(req,res)=>{
    if(req.params.name){
        console.log("req.params.name=>",req.params.name);
        pool.getConnection().then(conn =>{
            conn.query('select * from student where name=?',req.params.name)
            .then(rows => {
                conn.release();
                res.json(rows);
            })
            .catch(err => {
                conn.release();
                res.status(500).json(err);
            });
        })
        .catch(err =>{
            res.status(500).json(err);
        });
    }
    else{
        res.send('please specify student name after "/student/", example: /student/danny');
    }
});

// to get every agent in table
app.get('/agents',(req,res)=>{
    pool.getConnection().then(conn =>{
        conn.query('select * from agents')
        .then(rows => {
            conn.release();
            res.json(rows);
        })
        .catch(err => {
            conn.release();
            res.status(500).json(err);
        });
    })
    .catch(err =>{
        res.status(500).json(err);
    });
});

// to get every cutsomer present in table
app.get('/customer',(req,res)=>{
    pool.getConnection().then(conn =>{
        conn.query('select * from customer')
        .then(rows => {
            conn.release();
            res.json(rows);
        })
        .catch(err => {
            conn.release();
            res.status(500).json(err);
        });
    })
    .catch(err =>{
        res.status(500).json(err);
    });
});
//----------------- Get end points end


//----------------- General end point to get every table content
app.get('/api/table/:tab_name',(req,res)=>{
    pool.getConnection().then(conn =>{
        let query = 'select * from '+req.params.tab_name;
        conn.query(query)
        .then(rows => {
            conn.release();
            res.json(rows);
        })
        .catch(err => {
            conn.release();
            res.status(500).json(err);
        });
    })
    .catch(err =>{
        // res.status(500).json(err);
        error_res = {'error':{'msg':'failed to connect database'}};
        res.status(500).json(error_res);
    });
});


//----------------- PUT end points start



//----------------- Get end points end

app.listen(port, ()=>{
    console.log('Example app listening on',port);
});