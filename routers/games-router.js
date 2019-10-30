var express = require('express')
var router = express.Router()
var admin = require('firebase-admin')

//GET all games information (GET method)
router.get('/', (req,res) => {
    var gamesReference = admin.database().ref('games')

    try{
        gamesReference.once('value')
        .then( (snapshot) => {
            const games = []

            snapshot.forEach(doc => {
                let game = doc.val()
                game.id = doc.key

                games.push(game)
            })

            res.status(200).json(games)
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
    var gamesReference = admin.database().ref('games')

    try {
        gamesReference.orderByKey().equalTo(req.params.id)
        .on('child_added', (snapshotGame) => {
            res.status(200).json({game: snapshotGame.val()})
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
    var gamesReference = admin.database().ref('games')

    //data to save a game
    var data = {
        owner: req.body.owner
    }

    try {
        var game = gamesReference.push(data, (err, result) => {
            if(err){
                res.status(400).json({message: 'An erro has ocurred'})
            }
            else{
                res.status(200).json({message: 'Game registered', id: game.key})
            }
        })
    } catch (error) {
        res.status(400).json({message: 'Error: ' + error})
    }
})

//Edit game
router.put('/edit/:id',  (req, res) => {
    var gamesReference = admin.database().ref('games')
    var guest = req.body.guest

    try {
        gamesReference.child(req.params.id + "/guest").set(guest, (err) => {
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