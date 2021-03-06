const express = require("express");
const app = express();
const port = 3000;
const mariadb = require("mariadb");
// const swaggerJsDoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");

const pool = mariadb.createPool({
    host: "localhost",
    user: "dbuser",
    password: "pass.2021",
    database: "sample",
    port: "3306",
    connectionLimit: 5,
});

// cache setting
console.log("starting...");
app.use(function (req, res, next) {
    res.set("Cache-control", "public, max-age=300");
    next();
});

// middleware for populating body
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());

// home endpoint
app.get("/", (req, res) => {
    res.send("welcome!");
});


//----------------------------------------------- PUT end points end
// sanitaization and validation 
function san_val_put_company(req, res, next) {
    let errors = [];

    // checking if request contains body and all necessary paramters
    if (
        req.body &&
        req.params.COMPANY_ID &&
        (req.body.COMPANY_NAME ||
             req.body.COMPANY_CITY)
    ) {
        //checking if COMPANY_ID is number
        let i = req.params.COMPANY_ID.trim();
        i = parseInt(i);
        if (!i) {
            errors.push({ msg: "COMPANY_ID should be integer" });
        }

        if (req.body.COMPANY_CITY) {
            // checking if city name contians numbers
            i = req.body.COMPANY_CITY.trim();
            regex_for_number = /\d/;
            if (regex_for_number.test(i)) {
                errors.push({ msg: "COMPANY_CITY should not contain integers" });
            }
        }
        // there is no need of validation on company name as it can have any thing in it.


    } else {
        errors.push({
            msg:
                "Patch request should atleat have a Json body with 2 parameters, namely COMPANY_ID and (COMPANY_NAME or COMPANY_CITY)",
        });
    }

    // sum up all the errors
    if (errors.length) {
        res.status(400).json({ errors: errors });
    } else {
        next();
    }
}

app.put("/api/v1/company/:COMPANY_ID",san_val_put_company, (req, res) => {
    // res.send("you asked to delete company with id="+req.params.id);
    pool
        .getConnection()
        .then((conn) => {
            // let query = "select * from company where COMPANY_ID=" + req.params.id.trim();
            let query = "select * from company where COMPANY_ID=" + req.params.COMPANY_ID;
            conn
                .query(query)
                .then((rows) => {
                    // conn.release();
                    let new_query = ""
                    if(rows.length > 0){
                        new_query += "update company set ";
                    if (req.body.COMPANY_NAME) {
                        new_query += "COMPANY_NAME='" + req.body.COMPANY_NAME.trim() + "', ";
                    }
                    if (req.body.COMPANY_CITY) {
                        new_query += "COMPANY_CITY='" + req.body.COMPANY_CITY.trim() + "' ";
                    }
                    new_query += "where COMPANY_ID='" + req.params.COMPANY_ID.trim()+"'";
                    }else{
                        new_query += "insert into company values('" + req.params.COMPANY_ID.trim() + "','" + req.body.COMPANY_NAME.trim() + "','" + req.body.COMPANY_CITY.trim() + "')";
                    }
                    
                    conn.query(new_query)
                        .then((rows) => {
                            conn.release();
                            let output = {}
                            if (rows.affectedRows > 0) {
                                output.msg = "Successful";
                            } else {
                                output.msg = "No change";
                            }
                            output.database_output = rows;
                            res.json(output);
                        })
                        .catch((err) => {
                            conn.release();
                            let output = {}
                            output.query_used=new_query;
                            output.msg = '(company with given id exists)for more information goto URL=>"https://dev.mysql.com/doc/connector-j/8.0/en/connector-j-reference-error-sqlstates.html#:~:text=mysql%20error%20number%20mysql%20error%20name%20sql%20standard,er_no_db_error%3A%203d000%3A%201047%3A%20er_unknown_com_error%3A%2008s01%3A%201048%3A%20er_bad_null_error%3A%2023000"';
                            output.database_output = err;
                            res.json({ errors: output });
                        });
                })
                .catch((err) => {
                    conn.release();
                    let output = {}
                    output.msg = 'for more information goto URL=>"https://dev.mysql.com/doc/connector-j/8.0/en/connector-j-reference-error-sqlstates.html#:~:text=mysql%20error%20number%20mysql%20error%20name%20sql%20standard,er_no_db_error%3A%203d000%3A%201047%3A%20er_unknown_com_error%3A%2008s01%3A%201048%3A%20er_bad_null_error%3A%2023000"'
                    output.database_output = err;
                    res.json({ errors: output });
                });
        })
        .catch((err) => {
            // res.status(500).json(err);
            error_res = { error: { msg: "failed to connect database" } };
            res.status(500).json(error_res);
        });
});

//----------------------------------------------- PUT end points end

app.listen(port, () => {
    console.log("Example app listening on", port);
});