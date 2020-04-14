const router = require('express').Router();

router.get('/', (req, res) => {
    res.send("you are logged in - " + req.user.username);
})

module.exports = router;