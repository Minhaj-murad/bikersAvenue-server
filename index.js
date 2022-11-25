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
        const catagorycollection  = client.db('bikersavenue').collection('catagories');
        const customercollection  = client.db('bikersavenue').collection('customers');
        const allbikecollection  = client.db('bikersavenue').collection('allbikes');
        

        app.get('/bikecategories', async (req, res) => {
            const query = {};
            const cursor = catagorycollection.find(query);
            const catagories = await cursor.toArray();
            res.send(catagories)
        })
        // finding a bike by catagoryid
        app.get('/motorbikes/:id',async (req,res)=>{
            const id=req.params.id;
            const query ={catagoryid:id};
            console.log(query);
            const result=await allbikecollection.find(query).toArray();
            res.send(result);
            console.log(result);
        })

    //    finding all bikes
        app.get('/bikes', async (req, res) => {
            const query = {};
            const cursor = allbikecollection.find(query);
            const bikes = await cursor.toArray();
            res.send(bikes)
        })
        // posting a new bike
        app.post('/bikes',async(req,res)=>{
             const bike=req.body;
             const result=await allbikecollection.insertOne(bike);
             res.send(result)


        })
        
      
        

        // posting customer collection
        app.post('/customers', async (req, res) => {
            const customer = req.body;
            const query = {

                email: customer.email,
                name: customer.name

            }

            const result = await customercollection.insertOne(customer);
            res.send(result)
        })
        //   getting a customer 
        app.get('/customers', async (req, res) => {
            const query = {};
            const cursor = customercollection.find(query);
            const customers = await cursor.toArray();
            res.send(customers)
        })

      

    
       
    }
    finally {

    }

}
run().catch(error => console.log(error));




app.listen(port, () => {
    console.log(`Bikers Avenue is running on port ${port}`);
})