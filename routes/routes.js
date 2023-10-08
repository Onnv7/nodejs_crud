const express = require('express');
const router = express.Router();
const User = require("../models/users.js");
const multer = require("multer");
const fs = require("fs");

// image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single('image');

// insert an user into database

router.post('/add', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });

    user.save()
        .then(() => {
            req.session.message = {
                type: 'success',
                message: 'User added successfully'
            };
            res.redirect('/');
        })
        .catch((err) => {
            res.json({ message: err.message, type: 'danger' });
        });

})

// Get all users
router.get('/', (req, res) => {
    User.find()
        .then((data) => {
            res.render('index', {
                title: "Home page",
                users: data,
            })
        })
        .catch((err) => {
            res.json({ message: err.message, type: 'danger' });
        });
});

router.get('/', (req, res) => {
    res.render('index', { title: 'Home page' });
})

router.get('/add', (req, res) => {
    res.render('add_user', { title: 'Add user page' });
})
router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    User.findById(id)
        .then((data) => {
            if (data == null) {
                res.redirect('/');
            }
            res.render('edit_user', { title: 'Update user page', user: data });

        })
        .catch((err) => {
            res.redirect('/');
        });
})

// update

router.post('/update/:id', upload, (req, res) => {
    var id = req.params.id;
    let { old_image, ...data } = { ...req.body };

    let new_image = "";
    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        }
        catch (e) {
            console.log(e);
        }
    } else {
        new_image = req.body.old_image;
    }

    User.updateOne(
        { _id: id },
        { ...data, image: new_image },
    ).then(data => {
        req.session.message = {
            type: 'success',
            message: 'User updated successfully!',
        }
        res.redirect('/');
    })
        .catch((err) => {
            res.json({ message: err.message, type: 'danger' })
        });
})


router.get('/delete/:id', (req, res) => {
    User.findOneAndDelete({ _id: req.params.id })
        .then((data) => {
            if (data.image != '') {
                try {
                    fs.unlinkSync('./uploads/' + data.image);
                }
                catch (e) {
                    console.log(e);
                }
            }
            req.session.message = {
                type: 'success',
                message: 'User deleted successfully!'
            }
            res.redirect('/');
        }).catch((err) => {
            res.json({ message: err.message, type: 'danger' })
        });;
});
module.exports = router;