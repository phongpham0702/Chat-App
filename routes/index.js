const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    if(!req.session.username || req.session.username === "")
    {
        return res.redirect("/login")
    }
    res.render("index", { layout: 'chatLayout' })
})

router.get("/login", (req, res) => {
    res.render("login")
})

router.post('/login', (req, res) => {
    req.session.username = req.body.username
    req.session.useravatar = req.body.userAvatar
    return res.redirect("/")
});

router.get("/error", (req, res) => {
    res.render("error", { layout: null })
})

module.exports = router