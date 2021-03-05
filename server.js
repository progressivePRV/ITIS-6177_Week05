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

//----------------- Get end points start

//  to get every student present in student table
app.get("/student", (req, res) => {
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

// to get student by name
app.get("/student/:name", (req, res) => {
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

// to get every agent in table
app.get("/agents", (req, res) => {
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

// to get every cutsomer present in table
app.get("/customer", (req, res) => {
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
        "post request should have Json body with 3 parameters, namely COMPANY_ID, COMPANY_NAME and COMPANY_CITY",
    });
  }

  // sum up all the errors
  if (errors.length) {
    res.status(400).json({ errors: errors });
  } else {
    next();
  }
}

app.post("/api/v1/company", san_val_post_company, (req, res) => {
    // let query = "insert into company(COMPANY_ID, COMPANY_NAME, COMPANY_CITY) values("+req.body.COMPANY_ID.trim()+","+req.body.COMPANY_NAME.trim()+","+req.body.COMPANY_CITY.trim()+")";
    // res.send(query);

    pool
    .getConnection()
    .then((conn) => {
        let query = "insert into company values("+req.body.COMPANY_ID.trim()+","+req.body.COMPANY_NAME.trim()+","+req.body.COMPANY_CITY.trim()+")";
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

//----------------------------------------------- POST end points end

//----------------------------------------------- PATCH end points end
// sanitaization and validation 
function san_val_patch_company(req, res, next) {
    let errors = [];
  
    // checking if request contains body and all necessary paramters
    if (
      req.body &&
      req.body.COMPANY_ID ||
      (req.body.COMPANY_NAME && req.body.COMPANY_CITY)
    ) {
      //checking if COMPANY_ID is number
      let i = req.body.COMPANY_ID.trim();
      i = parseInt(i);
      if (!i) {
        errors.push({ msg: "COMPANY_ID should be integer" });
      }
      
      if(req.body.COMPANY_CITY){
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
          "Ptach request should atleat have a Json body with 2 parameters, namely COMPANY_ID and (COMPANY_NAME or COMPANY_CITY)",
      });
    }
  
    // sum up all the errors
    if (errors.length) {
      res.status(400).json({ errors: errors });
    } else {
      next();
    }
}

app.patch("/api/v1/company", san_val_patch_company, (req, res) => {
    // res.send("you asked to delete company with id="+req.params.id);
    pool
      .getConnection()
      .then((conn) => {
        let query = "select * from COMPANY_ID=" + req.params.id.trim();
        conn
          .query(query)
          .then((rows) => {
            // id exists
            let query_update = "update company set ";
            if(req.body.COMPANY_NAME){
                query_update += "COMPANY_NAME="+req.body.COMPANY_NAME.trim()+" ";
            }
            if(req.body.COMPANY_CITY){
                query_update += "COMPANY_CITY="+req.body.COMPANY_CITY.trim()+" ";
            }
            query_update += "where COMPANY_ID="+req.body.COMPANY_ID.trim(); 
            conn.query(query_update)
            .then((rows)=>{
                conn.release();
                res.json(rows);
            })
            .catch((err) => {
                conn.release();
                res.status(500).json(err);
            });
            // as already above query will send the response
            // conn.release();
            // res.json(rows);
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

//----------------------------------------------- Delete end points end

app.listen(port, () => {
  console.log("Example app listening on", port);
});
