const Users = require('../models').Users;
const { findUserByUsername } = require('../services/users');
const secret = require('../configuration.json').token_secret;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    if (req.body.username === "" || req.body.password === "") {
        return res.status(500).send({ message: "User or password empty" });
    }
    let userFound = await findUserByUsername(req.body.username);

    if (userFound) {
        return res.status(409).send({ message: "User already exists" });
    }

    const salt = bcrypt.genSaltSync(10);
    let ePassword = bcrypt.hashSync(req.body.password, salt);

    try {
        Users.create({
            username: req.body.username,
            password: ePassword
        });
    } catch (err) {
        return res.send(err);
    }

    res.status(201).send({ message: `User created` });
};

const login = async (req, res) => {
    if (req.body.username === "" || req.body.password === "") {
        return res.status(500).send({ message: "User or password empty" });
    }
    let userFound = await findUserByUsername(req.body.username);

    if (!userFound) {
        return res.status(404)
            .send({ message: "No email related to an accout was found" });
    }

    const validPass = bcrypt.compareSync(req.body.password, userFound.password);
    if (!validPass) {
        return res.status(400).send({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: userFound.id }, secret,
        {
            expiresIn: "3h"
        });
        
    res.send({userId: userFound.id, token: "Bearer " + token, message: "V-ati logat cu success" })
};

module.exports = {
    registerUser,
    login,
}
