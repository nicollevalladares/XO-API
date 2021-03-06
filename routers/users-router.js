var express = require('express')
var router = express.Router()
var admin = require('firebase-admin')

//GET all users information (GET method)
router.get('/', (req,res) => {
    var usersReference = admin.database().ref('users')

    try{
        usersReference.once('value')
        .then( (snapshot) => {
            const users = []

            snapshot.forEach(doc => {
                let user = doc.val()
                user.id = doc.key

                users.push(user)
            })

            res.status(200).json(users)
        },
        (err) => {
            res.status(400).send(err.code)
        })
    }
    catch (error) {
        res.status(400).send({message: 'Error: ' + error})
    }
})

// get a user information (GET method)
router.get('/:id', (req, res) => {
    var usersReference = admin.database().ref('users')

    try {
        usersReference.orderByKey().equalTo(req.params.id)
        .on('child_added', (snapshotUser) => {
            res.status(200).json({user: snapshotUser.val()})
        },
        (err) => {
            res.status(400).send(err.code)
        })
    } catch (error) {
        res.status(400).send({message: 'Error: ' + error})
    }
})

//Save a new user (POST method)
router.post('/', (req, res) => {
    var usersReference = admin.database().ref('users')

    //data to save a user
    var data = {
        name: req.body.name,
        username: req.body.username
    }

    try {
        var user = usersReference.push(data, (err, result) => {
            if(err){
                res.status(400).json({message: 'An erro has ocurred'})
            }
            else{
                res.status(200).json({message: 'User registered', id: user.key})
            }
        })
    } catch (error) {
        res.status(400).json({message: 'Error: ' + error})
    }
})

module.exports = router;