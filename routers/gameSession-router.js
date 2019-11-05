var express = require('express')
var router = express.Router()
var admin = require('firebase-admin')

//GET all games information (GET method)
router.get('/', (req,res) => {
    var gameSessionsReference = admin.database().ref('gameSessions')

    try{
        gameSessionsReference.once('value')
        .then( (snapshot) => {
            const gameSessions = []

            snapshot.forEach(doc => {
                let gameSession = doc.val()
                gameSession.id = doc.key

                gameSessions.push(gameSession)
            })

            res.status(200).json(gameSessions)
        },
        (err) => {
            res.status(400).send(err.code)
        })
    }
    catch (error) {
        res.status(400).send({message: 'Error: ' + error})
    }
})

// get a game information (GET method)
router.get('/:id', (req, res) => {
    var gameSessionsReference = admin.database().ref('gameSessions')

    try {
        gameSessionsReference.orderByKey().equalTo(req.params.id)
        .on('child_added', (snapshotGameSession) => {
            res.status(200).json({gameSession: snapshotGameSession.val()})
        },
        (err) => {
            res.status(400).send(err.code)
        })
    } catch (error) {
        res.status(400).send({message: 'Error: ' + error})
    }
})

//Save a new game (POST method)
router.post('/', (req, res) => {
    var gameSessionsReference = admin.database().ref('gameSessions')

    //data to save a game
    var data = {
        idGame: req.body.idGame,
        number: req.body.number,
        matrix: req.body.matrix,
        currentPlayer: req.body.currentPlayer,
        owner: req.body.owner,
        guest: req.body.guest
    }

    try {
        var gameSession = gameSessionsReference.push(data, (err, result) => {
            if(err){
                res.status(400).json({message: 'An erro has ocurred'})
            }
            else{
                res.status(200).json({message: 'Game session registered', id: gameSession.key})
            }
        })
    } catch (error) {
        res.status(400).json({message: 'Error: ' + error})
    }
})

//Edit game
router.put('/edit/:id',  (req, res) => {
    var gameSessionsReference = admin.database().ref('gameSessions')
    var data = req.body.data

    try {
        gameSessionsReference.child(`${req.params.id}/matrix`).set(data, (err) => {
            if(err){
                res.send(err);
            }
            else{
                res.send("game changed");
            }
        });
    } 
    catch (error) {
        res.send({status : 0, message:'Error: '+ error})
    }
});

//Change currentPlayer
router.put('/currentPlayer/:id',  (req, res) => {
    var gameSessionsReference = admin.database().ref('gameSessions')
    var currentPlayer = req.body.currentPlayer

    try {
        gameSessionsReference.child(`${req.params.id}/currentPlayer`).set(currentPlayer, (err) => {
            if(err){
                res.send(err);
            }
            else{
                res.send("game changed");
            }
        });
    } 
    catch (error) {
        res.send({status : 0, message:'Error: '+ error})
    }
});

//Update positions owner
router.put('/owner/:id',  (req, res) => {
    var gameSessionsReference = admin.database().ref('gameSessions')
    var positions = req.body.positions

    try {
        gameSessionsReference.child(`${req.params.id}/owner`).set(positions, (err) => {
            if(err){
                res.send(err);
            }
            else{
                res.send("owner positions changed");
            }
        });
    } 
    catch (error) {
        res.send({status : 0, message:'Error: '+ error})
    }
});

//Update positions guest
router.put('/guest/:id',  (req, res) => {
    var gameSessionsReference = admin.database().ref('gameSessions')
    var positions = req.body.positions

    try {
        gameSessionsReference.child(`${req.params.id}/guest`).set(positions, (err) => {
            if(err){
                res.send(err);
            }
            else{
                res.send("guest positions changed");
            }
        });
    } 
    catch (error) {
        res.send({status : 0, message:'Error: '+ error})
    }
});


//Save session winner
router.put('/winner/:id',  (req, res) => {
    var gameSessionsReference = admin.database().ref('gameSessions')
    var winner = req.body.winner

    try {
        gameSessionsReference.child(`${req.params.id}/winner`).set(winner, (err) => {
            if(err){
                res.send(err);
            }
            else{
                res.send("game changed");
            }
        });
    } 
    catch (error) {
        res.send({status : 0, message:'Error: '+ error})
    }
});

module.exports = router;