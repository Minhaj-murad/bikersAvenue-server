const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
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
        const customercollection = client.db('bikersavenue').collection('customers');
        const allbikecollection = client.db('bikersavenue').collection('allbikes');

        const usercollection = client.db('bikersavenue').collection('users');
        const buyercollection = client.db('bikersavenue').collection('buyers');
        const advertisecollection = client.db('bikersavenue').collection('advertises');

        //  Verifying JWT

        function verfiyJWT(req, res, next) {
            console.log('token inside VerifyJWT', req.headers.authorization);
            const authHeader = req.headers.authorization;
            // console.log(authHeader);
            if (!authHeader) {
                return res.status(401).send('Unauthorized access 1')
            }
            const token = authHeader.split(' ')[1];

            jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
                if (err) {
                    // console.log(err);
                    return res.status(403).send({ message: 'Unauthorized access 2' })
                }
                req.decoded = decoded;
                next();
            })
        }
        // verify admin should be after verify JWT
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usercollection.findOne(query);
            if (user.role !== 'admin') {
                return res.status(401).send({ message: 'Forbidden access' })
            }
            next()
        }

        //   getting all catagories
        app.get('/bikecategories', async (req, res) => {
            const query = {};
            const cursor = catagorycollection.find(query);
            const catagories = await cursor.toArray();
            res.send(catagories)
        })
        // finding a bike by catagoryid
        app.get('/motorbikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { catagoryid: id };
            console.log(query);
            const result = await allbikecollection.find(query).toArray();
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
        app.post('/bikes', async (req, res) => {
            const bike = req.body;
            const result = await allbikecollection.insertOne(bike);
            res.send(result)


        })

        app.get('/sellerbikes', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = allbikecollection.find(query);
            const bikes = await cursor.toArray();
            res.send(bikes)
        })


        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usercollection.find(query).toArray();
            res.send(users);
        });

        // posting advertise in advertisecollection
        app.post('/users/advertise', async (req, res) => {
            const advertise = req.body;
            const result = await advertisecollection.insertOne(advertise);
            res.send(result)
        })


        //  How to use JWT server 
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usercollection.findOne(query)
            console.log(user)
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: 'token not found' })
        })

        // inserting users in database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usercollection.insertOne(user);
            res.send(result)
        })

        //    getting sellers


        // app.get('/users',async(req,res)=>{
        //     // const role=req.query.role;
        //     let query ={};
        //     if(req.query.role){
        //       query={role:req.query.role}
        //     }
        //     else{
        //         query={email:req.query.email}
        //     }
        //     const result = await usercollection.find(query).toArray();
        //     res.send(result)
        // })

        //   deleting a seller
        app.delete('/users/seller/:id',async(req,res)=>{
        
        const id = req.params.id;
        const filter = { _id: ObjectId(id) }
        const result = await usercollection.deleteOne(filter);
        res.send(result);
    })

    // making any users admin
    app.put('/users/admin/:id', verfiyJWT, async (req, res) => {
        const decodedEmail = req.decoded.email;
        const query = { email: decodedEmail };
        const user = await usercollection.findOne(query);
        if (user.role !== 'admin') {
            return res.status(401).send({ message: 'Forbidden access' })
        }
        const id = req.params.id;
        const filter = { _id: ObjectId(id) }
        const options = { upsert: true };
        const updatedDoc = {
            $set: {
                role: 'admin'
            }
        }
        const result = await usercollection.updateOne(filter, updatedDoc, options);
        res.send(result);
    })

    //   checking admin 
    app.get('/users/admin/:email', async (req, res) => {
        const email = req.params.email;

        const query = { email };

        //  const user = await userCollection.findOne(query);
        const users = await usercollection.find({}).toArray();

        const user = users.find(admin => admin.email.toLowerCase() === email.toLowerCase());

        res.send({ isAdmin: user?.role === 'admin' });
    })

    //   checking seller 
    app.get('/users/seller/:email', async (req, res) => {
        const email = req.params.email;

        const query = { email };

        //  const user = await userCollection.findOne(query);
        const users = await usercollection.find({}).toArray();

        const user = users.find(seller => seller.email.toLowerCase() === email.toLowerCase());

        res.send({ isSeller: user?.role === 'seller' });
    })


    //   verifying seller
    app.put('/users/seller/:id',  async (req, res) => {
        // const decodedEmail = req.decoded.email;
        // const query = { email: decodedEmail };
        // const email=req.params.id;
        // console.log(email);
        // const user = await usercollection.findOne(email);
        // if (user.role !== 'seller') {
        //     return res.status(401).send({ message: 'Forbidden access' })
        // }
        const id = req.params.id;
        const filter = { _id: ObjectId(id) }
        console.log(filter);
        const options = { upsert: true };
        const updatedDoc = {
            $set: {
                type: 'verified'
            }
        }
        console.log(updatedDoc);
        const result = await usercollection.updateOne(filter, updatedDoc,options);
        res.send(result);
    })


    app.post('/buyers', async (req, res) => {
        const buyer = req.body;
        const result = await buyercollection.insertOne(buyer);
        res.send(result)
    })

    //  getting advertised products
    app.post('/advertises', async (req, res) => {
        const product = req.body;
        const advertise = await advertisecollection.insertOne(product)
        res.send(advertise);
    })
    app.get('/advertises', async (req, res) => {
        const query = {};
        const advertise = await advertisecollection.find(query).toArray();
        res.send(advertise);
    })

    //  deleteing a buyer
    app.delete('/users/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        const filter = { _id: ObjectId(id) };
        const result = await usercollection.deleteOne(filter);
        res.send(result);
    })


    // posting customer collection
    app.post('/bookings', async (req, res) => {
        const booking = req.body;
        const query = {
            bikeName: booking.bikeName,
            email: booking.email,
            name: booking.name

        }
        const alreadybooked = await customercollection.find(query).toArray();
        if (alreadybooked.length) {
            const message = `you already have a booking on ${booking.bikeName}`;
            return res.send({ acknowledged: false, message })
        }
        const result = await customercollection.insertOne(booking);
        res.send(result)
    })
    //   getting all buyers 
    app.get('/customers', async (req, res) => {
        const query = {};
        const cursor = customercollection.find(query);
        const customers = await cursor.toArray();
        res.send(customers)
    })
    // getting a user
    app.get('/bookings', verfiyJWT, async (req, res) => {
        const email = req.query.email;
        // by doing these one cant get data without authantiaction
        const decodedemail = req.decoded.email;
        if (email !== decodedemail) {
            return res.status(403).send({ message: "forbidden access" })
        }
        // console.log('token',req.headers.authorization);
        const query = { email: email }
        const myorders = await customercollection.find(query).toArray();
        res.send(myorders)
    })




}
    finally {

}

}
run().catch(error => console.log(error));




app.listen(port, () => {
    console.log(`Bikers Avenue is running on port ${port}`);
})