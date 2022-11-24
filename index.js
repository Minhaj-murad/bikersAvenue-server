const express =require('express');
const app=express();
const cors =require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();



app.use(cors());
app.use(express.json());

const bikecategories = require('./data/catagories.json');

app.get('/', (req, res) => {
    res.send('Bikers Avenue API Running');
});

app.get('/bikecategories', (req, res) => {
    res.send(bikecategories)
});

app.get('/bikecategories/:id', (req, res) => {
    const id = req.params.id;
    const selectedcatgories = bikecategories.find(n => n.id === id);
    res.send(selectedcatgories);
});
app.listen(port, ()=>{
    console.log(`Bikers Avenue is running on port ${port}`);
})