require('dotenv').config()
const express = require('express')
const axios = require('axios')
const path = require('path')

const app = express()
const port = 3000

app.use(express.json())

app.use('/', express.static(path.join(__dirname, '../public')))

app.get('/:rover', async (req, res) => {
    try {
        let { data } = await axios.get(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.rover}/latest_photos?api_key=${process.env.API_KEY}`);
        return res.send({ data })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))