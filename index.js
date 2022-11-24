const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();



app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send('Bikers Avenue API Running');
});





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.owkdqd3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const catagorycollection = client.db('bikersavenue').collection('catagories');

        app.get('/bikecategories', async (req, res) => {
            const query = {};
            const cursor = catagorycollection.find(query);
            const catagories = await cursor.toArray();
            res.send(catagories)
        })
        app.get('/bikecategories/:id',async(req,res)=>{
            console.log(req.params);
            const id =req.params.id;
            console.log(typeof id,id);
            const query= {_id: ObjectId(id)};
            const company =await catagorycollection.findOne(query);
            console.log(company);
            res.send(company)
        })
    }
    finally {

    }

}
run().catch(error => console.log(error));




app.listen(port, () => {
    console.log(`Bikers Avenue is running on port ${port}`);
})