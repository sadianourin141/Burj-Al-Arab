const express = require('express')

const bodyParser=require('body-parser');
const cors=require('cors');
 const admin = require("firebase-admin");
 require('dotenv').config()
 
const port = 5000

const app = express()

app.use(cors());
app.use(bodyParser.json());




var serviceAccount = require("./configs/burj-al-arab-mim-firebase-adminsdk-1oqup-710b3e3ff1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkczg.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings= client.db("burjAlArab").collection("bookings");
  // perform actions on the collection object
  app.post('/addBooking',(req,res)=>{
      const newBooking=req.body;
      bookings.insertOne(newBooking)
      .then(result=>{
          res.send(result.insertedCount>0);
      })
      console.log(newBooking);
  })
  app.get('/bookings',(req,res)=>{
      const  bearer =req.headers.authorization;
      if(bearer&&bearer.startsWith('Bearer ')){
        const idToken=bearer.split(' ')[1];
        console.log({idToken});
        admin.auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail=req.query.email;
          console.log(tokenEmail,queryEmail);
          if(tokenEmail==queryEmail){
            bookings.find({email:queryEmail})
            .toArray((err,documents)=>{
             res.status(200).send(documents);
            })
      
          }
          else{
            res.status(401).send('unauthorized access')
          }
        })
        .catch((error) => {
          res.status(401).send('unauthorized access')
        });
      }
      else{
        res.status(401).send('unauthorized access')
      }
     
  })
  
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
