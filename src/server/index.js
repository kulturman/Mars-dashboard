require('dotenv').config()
const express = require('express')
const axios = require('axios')
const path = require('path')

const app = express()
const port = 3000

app.use(express.json())

app.use('/', express.static(path.join(__dirname, '../public')))

app.get('/:rover', async (req, res) => {
    /*
        NASA API is pretty strange, and we don't get latest photos for completed missions, so I only query last_photos for curiosity which is still active
    */
    const roverDates = {
        'opportunity': '2018-06-04',
        'spirit': '2010-02-01'
    };

    try {
        const { rover } = req.params;
        const url = 
            rover === 'curiosity' ? `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${process.env.API_KEY}`
            : `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${roverDates[rover]}&api_key=${process.env.API_KEY}`;
        const { data } = await axios.get(url);
        return res.send({ data })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))