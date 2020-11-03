/* You are given the following samples of HTTP requests
GET /weather/SIN
GET /trip/SIN-NRT
GET /weather/SIN,NRT
GET /trip/SIN-SFO
GET /trip/abc123
GET /weather/SIN?unit=imperial
GET /trip/NRT-SFO
GET /weather/SFO,LHR,LAX,BKK
Write an Express application to process the above sample. */


app.get("/weather/:cities", (req, resp) => {
    const cities = req.params.cities // string
    const listCities = cities.split(",")
    const unit = req.query["unit"] || 'metric' //contains "imperial"
    //above changes data to corresponding unit and return


})


app.get("/trip/:from-:to", (req, resp) => {
    const departingC = req.params["from"]
    const arrivingC = req.params["to"]

    //evaluate if departingC is valid

})