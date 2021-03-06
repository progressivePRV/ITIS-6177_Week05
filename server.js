const express = require("express");
const app = express();
const port = 3000;
const mariadb = require("mariadb");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require('cors');
const e = require("express");
const axios = require('axios').default;

const pool = mariadb.createPool({
    host: "localhost",
    user: "dbuser",
    password: "pass.2021",
    database: "sample",
    port: "3306",
    connectionLimit: 5,
});

//setting up the swagger
const SwaggerOptions = {
    swaggerDefinition:{
        info: {
            title: 'Practice APIs',
            version: '1.0.0',
            description: 'This are REST like apis. This still does not have HATEOAS. APIs decscription is generated using swagger'
        },
        host: '162.243.171.55:3000',
        basePath: '/',
    },
    apis:['./server.js']
};

const specs = swaggerJsDoc(SwaggerOptions);
app.use('/docs',swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());


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


/**
 * @swagger
 * /:
 *     get:
 *      description: This is just home endpoint to check wheather server is running or not. 
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: It will just return "Welcome!"
 *          500:
 *              description: Internal server error. Most commonly occurs when server fails to connect the database.
 */
// home endpoint
app.get("/", (req, res) => {
    res.send("Welcome!");
});

//----------------- Get end points start

/**
 * @swagger
 * /api/v1/student:
 *     get:
 *      description: This will retrive every student information from the student Table. (try giving name danny) 
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: It will return json array of student object. If there is no student with the given name, it will return empty array.
 *          500:
 *              description: Internal server error. Most commonly occurs when server fails to connect the database.
 */
//  to get every student present in student table
app.get("/api/v1/student", (req, res) => {
    pool
        .getConnection()
        .then((conn) => {
            console.log("no filter requested");
            conn
                .query("select * from student")
                .then((rows) => {
                    conn.release();
                    res.json(rows);
                })
                .catch((err) => {
                    conn.release();
                    console.log("sending error");
                    res.status(500).json(err);
                });
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});


/**
 * @swagger
 * /api/v1/student/{name}:
 *     get:
 *      description: This will retrive student information of the student with the name={name} from the student Table. 
 *      produces:
 *          - application/json
 *      parameters:
 *       - name: name
 *         in: path
 *         description: Name of the student. 
 *         required: true
 *         type: string
 *      responses:
 *          200:
 *              description: It will return json array of student object, if there is no student with given name then it will return empty array.
 *          500:
 *              description: Internal server error. Most commonly occurs when server fails to connect the database.
 *
 */
// to get student by name
app.get("/api/v1/student/:name", (req, res) => {
    if (req.params.name) {
        console.log("req.params.name=>", req.params.name);
        pool
            .getConnection()
            .then((conn) => {
                conn
                    .query("select * from student where name=?", req.params.name)
                    .then((rows) => {
                        conn.release();
                        res.json(rows);
                    })
                    .catch((err) => {
                        conn.release();
                        res.status(500).json(err);
                    });
            })
            .catch((err) => {
                res.status(500).json(err);
            });
    } else {
        res.send(
            'please specify student name after "/student/", example: /student/danny'
        );
    }
});


/**
 * @swagger
 * /api/v1/company/{id}:
 *     get:
 *      description: This will retrive company information of specific company with id={id} from the company Table. 
 *      produces:
 *          - application/json
 *      parameters:
 *       - name: id  
 *         in: path
 *         description: Company id (integer greater than 0). 
 *         required: true
 *         type: string
 *      responses:
 *          200:
 *              description: It will return json array of company object, if there is no company with given id then it will return empty array.
 *          500:
 *              description: Internal server error. Most commonly occurs when server fails to connect the database.
 *
 */
//get company by id
app.get("/api/v1/company/:id", (req, res) => {
    if (req.params.id) {
        //   console.log("req.params.name=>", req.params.name);
        pool
            .getConnection()
            .then((conn) => {
                conn
                    .query("select * from company where COMPANY_ID=?", req.params.id)
                    .then((rows) => {
                        conn.release();
                        res.json(rows);
                    })
                    .catch((err) => {
                        conn.release();
                        res.status(500).json(err);
                    });
            })
            .catch((err) => {
                res.status(500).json(err);
            });
    } else {
        res.send(
            'please specify company id, example: /api/v1/company/10'
        );
    }
});

/**
 * @swagger
 * /api/v1/agents:
 *     get:
 *      description: This will retrive every agents information from the agent Table. 
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: It will return json array of agent objects.
 *          500:
 *              description: Internal server error. Most commonly occurs when server fails to connect the database.
 */
// to get every agent in table
app.get("/api/v1/agents", (req, res) => {
    pool
        .getConnection()
        .then((conn) => {
            conn
                .query("select * from agents")
                .then((rows) => {
                    conn.release();
                    res.json(rows);
                })
                .catch((err) => {
                    conn.release();
                    res.status(500).json(err);
                });
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

/**
 * @swagger
 * /api/v1/customer:
 *     get:
 *      description: This will retrive every customer information from the customer Table. 
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: It will return json array of customer objects
 *          500:
 *              description: Internal server error. Most commonly occurs when server fails to connect the database.
 */
// to get every cutsomer present in table
app.get("/api/v1/customer", (req, res) => {
    pool
        .getConnection()
        .then((conn) => {
            conn
                .query("select * from customer")
                .then((rows) => {
                    conn.release();
                    res.json(rows);
                })
                .catch((err) => {
                    conn.release();
                    res.status(500).json(err);
                });
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});
//----------------- Get end points end


//----------------- General end point to get every table content
/**
 * @swagger
 * /api/table/{tab_name}:
 *     get:
 *      description: This will retrive information from the given table name={tab_name} Table. 
 *      produces:
 *          - application/json
 *      parameters:
 *       - name: tab_name  
 *         in: path
 *         description: Name of the table. 
 *         required: true
 *         type: string
 *      responses:
 *          200:
 *              description: It will return json array of rows as json objects from the given table name.
 *          500:
 *              description: Internal server error. Most commonly occurs when server fails to connect the database. <br> OR <br> when there exist no such table with the given table name; 
 *
 */
app.get("/api/table/:tab_name", (req, res) => {
    pool
        .getConnection()
        .then((conn) => {
            let query = "select * from " + req.params.tab_name;
            conn
                .query(query)
                .then((rows) => {
                    conn.release();
                    res.json(rows);
                })
                .catch((err) => {
                    conn.release();
                    res.status(500).json(err);
                });
        })
        .catch((err) => {
            // res.status(500).json(err);
            error_res = { error: { msg: "failed to connect database" } };
            res.status(500).json(error_res);
        });
});

//----------------------------------------------- Post end points start
// sanitaization and validation
function san_val_post_company(req, res, next) {
    let errors = [];

    // checking if request contains body and all necessary paramters
    if (
        req.body &&
        req.body.COMPANY_ID &&
        req.body.COMPANY_NAME &&
        req.body.COMPANY_CITY
    ) {
        //checking if COMPANY_ID is number
        let i = req.body.COMPANY_ID.trim();
        i = parseInt(i);
        if (!i) {
            errors.push({ msg: "COMPANY_ID should be integer" });
        }

        // checking if city name contians numbers
        i = req.body.COMPANY_CITY.trim();
        regex_for_number = /\d/;
        if (regex_for_number.test(i)) {
            errors.push({ msg: "COMPANY_CITY should not contain integers" });
        }
    } else {
        errors.push({
            msg:
                "post request should have Json body with 3 parameters with their valuse, namely COMPANY_ID, COMPANY_NAME and COMPANY_CITY",
        });
    }

    // sum up all the errors
    if (errors.length) {
        res.status(400).json({ errors: errors });
    } else {
        next();
    }
}



/**
 * @swagger
 * /api/v1/company:
 *     post:
 *          description: This will insert company data into the company table. i.e It will inset a new row. It also has two Sanitization/Validation check:> 1)COMPANY_ID should be integer. 2)COMPANY_CITY should not contain number.  
 *          produces:
 *              - application/json
 *          parameters:
 *              - in: body
 *                name: company
 *                description: The company to create
 *                schema:
 *                   type: object
 *                   required: 
 *                       - COMPANY_ID
 *                       - COMPANY_NAME
 *                       - COMPANY_CITY
 *                   properties:
 *                       COMPANY_ID:
 *                          type: string
 *                       COMPANY_NAME:
 *                          type: string
 *                       COMPANY_CITY:
 *                          type: string
 *          responses:
 *              200:
 *                  description: returns Json object with msg ("successful or No change") and json object received from database.
 *              500:
 *                  description: Internal server error. Most commonly occurs when server fails to connect the database.
 *              400: 
 *                  description: returns Json object with error msg and json object received from database. It occurs beacuse of duplicate entry.
 */
app.post("/api/v1/company", san_val_post_company, (req, res) => {
    // let query = "insert into company(COMPANY_ID, COMPANY_NAME, COMPANY_CITY) values('"+req.body.COMPANY_ID.trim()+"','"+req.body.COMPANY_NAME.trim()+"','"+req.body.COMPANY_CITY.trim()+"')";
    // res.send(query);

    pool
        .getConnection()
        .then((conn) => {
            let query = "insert into company values('" + req.body.COMPANY_ID.trim() + "','" + req.body.COMPANY_NAME.trim() + "','" + req.body.COMPANY_CITY.trim() + "')";
            conn
                .query(query)
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
                    output.msg = 'for more information goto URL=>"https://dev.mysql.com/doc/connector-j/8.0/en/connector-j-reference-error-sqlstates.html#:~:text=mysql%20error%20number%20mysql%20error%20name%20sql%20standard,er_no_db_error%3A%203d000%3A%201047%3A%20er_unknown_com_error%3A%2008s01%3A%201048%3A%20er_bad_null_error%3A%2023000"'
                    output.database_output = err;
                    res.status(409).json({ errors: output });
                });
        })
        .catch((err) => {
            // res.status(500).json(err);
            error_res = { error: { msg: "failed to connect database" } };
            res.status(500).json(error_res);
        });
});

//----------------------------------------------- POST end points end

//----------------------------------------------- PATCH end points end
// sanitaization and validation 
function san_val_patch_company(req, res, next) {
    let errors = [];

    // checking if request contains body and all necessary paramters
    if (
        req.body &&
        req.body.COMPANY_ID &&
        (req.body.COMPANY_NAME || req.body.COMPANY_CITY)
    ) {
        //checking if COMPANY_ID is number
        let i = req.body.COMPANY_ID.trim();
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
                "Patch request should atleat have a Json body with 2 parameters and there values, namely COMPANY_ID and (COMPANY_NAME or COMPANY_CITY)",
        });
    }

    // sum up all the errors
    if (errors.length) {
        res.status(400).json({ errors: errors });
    } else {
        next();
    }
}


/**
 * @swagger
 * /api/v1/company:
 *     patch:
 *          description: Update company data into the company table. It also has two Sanitization/Validation check:> 1)COMPANY_ID should be integer. 2)COMPANY_CITY should not contain number. Update is only successfult if company with the given id is already present in the table otherwise it will return No change.
 *          produces:
 *              - application/json
 *          parameters:
 *              - in: body
 *                name: company
 *                description: the company to create
 *                schema:
 *                   type: object
 *                   required: 
 *                       - COMPANY_ID
 *                   properties:
 *                       COMPANY_ID:
 *                          type: string
 *                       COMPANY_NAME:
 *                          type: string
 *                       COMPANY_CITY:
 *                          type: string
 *          responses:
 *              200:
 *                  description: returns Json object with msg ("successful or No change") and json object received from database.
 *              500:
 *                  description: Internal server error. Most commonly occurs when server fails to connect the database.
 */
app.patch("/api/v1/company",san_val_patch_company, (req, res) => {
    // res.send("you asked to delete company with id="+req.params.id);
    pool
        .getConnection()
        .then((conn) => {
            // let query = "select * from company where COMPANY_ID=" + req.params.id.trim();
            let query = "select * from company where COMPANY_ID=" + req.body.COMPANY_ID;
            conn
                .query(query)
                .then((rows) => {
                    // conn.release();
                    // id exists
                    let query_update = "update company set ";
                    if (req.body.COMPANY_NAME) {
                        query_update += "COMPANY_NAME='" + req.body.COMPANY_NAME.trim() + "', ";
                    }
                    if (req.body.COMPANY_CITY) {
                        query_update += "COMPANY_CITY='" + req.body.COMPANY_CITY.trim() + "' ";
                    }
                    query_update += "where COMPANY_ID='" + req.body.COMPANY_ID.trim()+"'";
                    conn.query(query_update)
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
                            // output.query_used=query_update;
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

//----------------------------------------------- PATCH end points end


//----------------------------------------------- Delete  end points start
// sanitaization and validation
function san_val_del_company(req, res, next) {
    let errors = [];

    // check if parameter is passed
    if (req.params) {
        var i = req.params.id;
        i = parseInt(i);
        if (i) {
            console.log("it is an integer");
        } else {
            //
            errors.push({
                msg:
                    "last thing should be integer except 0, which represents company id",
            });
        }
    } else {
        errors.push({
            msg:
                'Request should of type "http://162.243.171.55:3000/api/v1/company/12", (last thing should be integer except 0, which represents company id)',
        });
    }
    if (errors.length) {
        res.status(400).json({ errors: errors });
    } else {
        next();
    }
    //   res.status(400).json(err_res);
}

/**
 * @swagger
 * /api/v1/company/{id}:
 *     delete:
 *      description: This will delete the company's information with id={id} from the company Table. 
 *      produces:
 *          - application/json
 *      parameters:
 *       - name: id  
 *         in: path
 *         description: Company id 
 *         required: true
 *         type: string
 *      responses:
 *          200:
 *              description:  returns Json object with msg ("successful or No change") and json object received from database. It will return empty array if there exist no company with the given id.
 *          500:
 *              description: Internal server error. Most commonly occurs when server fails to connect the database.
 *
 */
app.delete("/api/v1/company/:id", san_val_del_company, (req, res) => {
    // res.send("you asked to delete company with id="+req.params.id);
    pool
        .getConnection()
        .then((conn) => {
            let query = "DELETE FROM company WHERE COMPANY_ID=" + req.params.id;
            conn
                .query(query)
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

//----------------------------------------------- Delete end points end

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


/**
 * @swagger
 * /api/v1/company/{id}:
 *     put:
 *          description: If company with given id is present it will update the company information or else it will insert new row with companies information. It also has two Sanitization/Validation check:> 1)COMPANY_ID should be integer.  2)COMPANY_CITY should not contain number.
 *          produces:
 *              - application/json
 *          parameters:
 *              - in: path
 *                name: id
 *                description: The company_id to be update/inserted
 *                required: true
 *              - in: body
 *                name: company
 *                description: the company to create
 *                schema:
 *                   type: object
 *                   required: 
 *                       - COMPANY_NAME
 *                       - COMPANY_CITY
 *                   properties:
 *                       COMPANY_NAME:
 *                          type: string
 *                       COMPANY_CITY:
 *                          type: string
 *          responses:
 *              200:
 *                  description: It returns Json object with msg ("successful or No change") and json object received from database.
 *              500:
 *                  description: Internal server error. Most commonly occurs when server fails to connect the database.
 */
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

//----------------------------------------------- Addition of Assignment6 start
/**
 * @swagger
 * /say:
 *     get:
 *          description: Internally it check if query paramters is provided or not. If provided, it will send the request to the googl cloud function. which will add prefix "Prabhav says " to the query string(keyword).  
 *          produces:
 *              - application/text
 *          parameters:
 *              - in: query
 *                name: keyword
 *                description: The keyword can take string values.
 *                required: true
 *              
 *          responses:
 *              200:
 *                  description: It will returns newly generated text with prefix "Prabhav says " added to the query value.
 *              400:
 *                  description: It will send the error message describing query parameter is missing.
 *              500:
 *                  description: Internal server error. Most commonly occurs when server fails to connect the cloud function.
 */

app.get("/say",(req,res)=>{
    let errors = [];
    let err_bool = false;
    let result = '';
    if(req.query.keyword){
        let query = "https://us-east1-gcp-experiments-302102.cloudfunctions.net/Say_keyword?keyword="+req.query.keyword
        axios.get(query)
        .then(response =>{
            console.log('cloud function call successful.');
            res.send(response.data);
        })
        .catch(err =>{
            err_bool = true;
            console.log('got an error while calling google cloud function (doing a cloud function call).');
            console.log("err =>"+err);
            res.statusCode = 500;
            errors.push({'msg':'some error occurred wil calling the google cloud function.'})
        }).then(()=>{
            console.log('end of axios request.')
        });
    }else{
        errors.push({'msg':'Please provide the query parameter "keyword" and its value.'})
        res.statusCode = 400;
        res.status(400).json({errors:errors});
    }
    if(err_bool){
        res.json({errors:errors});
    }
    
});

//----------------------------------------------- Addition of Assignment6 end

app.listen(port, () => {
    console.log("Example app listening on", port);
});
