//load libraries
const express = require('express')
const handlebars = require('express-handlebars')
const mysql = require('mysql2/promise')

//config port
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;
//create instance of express
const app = express()

//SQL
const SQL_SORT_DES_BY_NAME_20 = 'select tvid, name from tv_shows order by name desc limit 20'
const SQL_GET_SHOW_BY_ID = 'select * from tv_shows where tvid = ?'


//config handlebars
app.engine('hbs', handlebars({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')



//create database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'leisure',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 4,
    timezone: '+08:00'
})


//ping our database and make sure its there before starting up server
const startApp = async (app, pool) => {
    try {
        const conn = await pool.getConnection()

        console.info('Pinging database...')
        await conn.ping()

        //release connection
        conn.release()

        //start server
        app.listen(PORT, () => {
        console.info(`Application started on port ${PORT} at ${new Date()}`)
        })
    } catch(e) {
        console.info(`Cannot ping database: `, e)
    }
}

app.get("/:id", async (req, resp) => {
    const tvid = req.params.id

    const conn = await pool.getConnection()

    try{
        const results = await conn.query(SQL_GET_SHOW_BY_ID, [tvid])
        const show = results[0][0] //results are in nested arr
        

        resp.status(200)
        resp.type('text/html')
        resp.render('details', { show })

    }catch(e){
        console.info(`Error was detected: `, e)
    }finally{
        await conn.release()
    } 
})




//initial set up
app.get("/", async (req, resp) => {
    //get connection and show my list of tv shows 
    const conn = await pool.getConnection()

    try {
        const results = await conn.query(SQL_SORT_DES_BY_NAME_20)
        const tvShows = results[0]

        resp.status(200)
        resp.type('text/html')
        resp.render('index', { tvShows })

    } catch(e) {
        console.info(`Error was detected: `, e)
    } finally {
        //always rmb to close connection
        await conn.release()
    }
})

startApp(app, pool)