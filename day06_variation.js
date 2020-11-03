//load express handlebars mysql2

const express = require('express')
const handlebars = require('express-handlebars')
const mysql = require('mysql2/promise') //we want the driver with promise
//normal mysql2 calling doesnt have promise

const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

//create instance of appn
const app = express()

//configure handlebars
app.engine('hbs', handlebars({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')  //set appn props settings, defaults to the views dir in the appn root dir


const pool = mysql.createPool({

    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'playstore',
    user: process.env.DB_USER, //DO NOT HAVE DEFAULT USER
    password: process.env.DB_PASSWORD,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 4,
    //other attributes we need include timezone and connectionTimeOut
    timezone: '+08:00'


})



//SQL
const SQL_GET_APP_CATEGORIES = "select distinct(category) from apps"
//selects unique values from category

//to add pagination to search results ie page 1,2,etc
//add offset to each of those buttons

const SQL_COUNT_Q = 'select count(*) as q_count from apps where name like ? limit ? offset ?'


/*
starting the server w/o async

pool.getConnection() // when promise resolves, it gives us a connection, 
    .then(conn => {
        console.info('Pinging database...)
        return conn.ping()

        // xx cannot use "return [conn, conn.ping]" as conn is not a promise, but conn.ping is xx
        // xx have to convert conn into a promise as well so that code can read an array of promises instead xx
        // xx const p0 = Promise.resolve(conn) //changing conn into a promise
        // xx const p1 = conn.ping()
        // xx return Promise.all([p0, p1]) // promise.all waits for all promises to return before returning

    }) //ping returns promise as well
    .then(() => {    // xx for promise.all case ==> .then(results => {const conn = results[0]; conn.release()}
        
        //release connection 
        this.conn.release() //must use this else cannt access the conn from above

        //start server
        app.listen(PORT, () => {
            console.info(`Appn started on port ${PORT} at ${new Date()}`)
        }).catch(e => console.info('Cannot start server', e))
    })

//functions should nvr access global variables - bad practice!


//since JS is single-threaded, the only way to run parallel actions is to use Promise.all
in promise.all results are returned in order of how fast each Promise within returns the results (ie fastest returned first)
because we are unsure which one returns first, we do not access global variables when dealing with promises

*/




app.get("/", async (req, resp)=> {
    const conn = await pool.getConnection()

    try {
        const results = await conn.query(SQL_GET_APP_CATEGORIES)//array returned in [results, metadata]
        const cats = results[0].map(v => v.category)
        let result = await conn.query(SQL_COUNT_Q, [`${searchTerm}`, limit, offset])
        const queryCount = result[0][0].q_count
        resp.status(200).type('text/html')
        resp.render('index', {category: cats})
        
    }catch(e) {
        resp.status(500)
        resp.type('text/html')
        resp.send(JSON.stringify(e))
        
    }finally{
        conn.release()
    }

}


)