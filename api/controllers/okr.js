var mongoose = require('mongoose');
var User = mongoose.model('User');
var Okr = mongoose.model('Okr');

module.exports.create = (req, res) => {
    if (!req.payload._id) {
        res.status(401).json({ 'message': 'UnauthorizedError: User does not seem to be logged in.' });
    } else if (!req.body.okr) {
        res.status(400).json('No OKR received by the server.');
    } else {
        User.findById(req.payload._id)
            .exec((err, user) => {
                if (err) {
                    res.status(401).json({ 'message': 'UnauthorizedError: User does not seem to be logged in.' });
                } else {
                    if(!req.body.okr.parent || req.body.okr.parent === '' ) delete req.body.okr.parent;
                    if(!req.body.okr.userId || req.body.okr.userId === '') delete req.body.okr.userId;
                    var okr = new Okr(req.body.okr);
                    okr.company = user.company;
                    okr.save((err) => {
                        if (err) {
                            res.status(400).json(err);
                        } else {
                            res.status(200).json(okr);
                        }
                    });
                }
            });
    }
}

module.exports.updateOkr = (req, res) => {
    if (!req.payload._id) {
        res.status(401).json({ 'message': 'UnauthorizedError: User does not seem to be logged in.' });
    } else if (!req.body.okr || !req.body.okr._id || !req.body.okr.objective) {
        res.status(400).json('No valid OKR received by the server.');
    } else {
        User.findById(req.payload._id)
            .exec((err, user) => {
                if (err) {
                    res.status(401).json('User not found');
                } else {
                    Okr.findById(req.body.okr._id, (err, okr) => {
                        if (err) {
                            res.status(400).json('Could not find OKR');
                        } else {
                            okr.objective = req.body.okr.objective;
                            if (req.body.okr.keyResults) okr.keyResults = req.body.okr.keyResults;
                            if (req.body.okr.parent) okr.parent = req.body.okr.parent;
                            if (req.body.okr.children) okr.children = req.body.okr.children;
                            if (req.body.okr.userId) okr.userId = mongoose.Types.ObjectId(req.body.okr.userId);
                            okr.company = user.company;
                            okr.save((err) => {
                                if (err) {
                                    res.status(400).json(err);
                                } else {
                                    res.status(200).json(okr);
                                }
                            });
                        }
                    });
                }
            });
    }
}

module.exports.addChild = (req, res) => {
    if (!req.payload._id) {
        res.status(401).json({ 'message': 'UnauthorizedError: User does not seem to be logged in.' });
    } else if (!req.body.parentId || !req.body.childId) {
        res.status(400).json('parentId and/or childId not received by the server.');
    } else {
        User.findById(req.payload._id)
            .exec((err, user) => {
                if (err) {
                    res.status(401).json('User not found');
                } else {
                    Okr.findByIdAndUpdate(
                        mongoose.Types.ObjectId(req.body.parentId),
                        { $addToSet: { children: mongoose.Types.ObjectId(req.body.childId) } },
                        { new: true },
                        (err, okr) => {
                            if (err) {
                                res.status(400).json(err);
                            } else {
                                res.status(200).json('Added child to parent');
                            }
                        });
                }
            });
    }
}

module.exports.getById = (req, res) => {
    if (!req.payload._id) {
        res.status(401).json({ 'message': 'UnauthorizedError: User does not seem to be logged in.' })
    } else if (!req.params.id) {
        res.status(400).json('No OKR id received by the server.')
    } else {
        User.findById(req.payload._id)
            .exec((err, user) => {
                if (err) {
                    res.status(401).json('User not found');
                } else {
                    Okr.findOne({ _id: req.params.id }, (err, okr) => {
                        if (err) {
                            res.status(400).json('Could not get okr');
                        } else {
                            res.status(200).json(okr);
                        }
                    });
                }
            });
    }
}

module.exports.getOkrs = (req, res) => {
    if (!req.payload._id) {
        res.status(401).json({ 'message': 'UnauthorizedError: User does not seem to be logged in.' });
    } else {
        User.findById(req.payload._id)
            .exec((err, user) => {
                if (err) {
                    res.status(401).json('User not found');
                } else {
                    Okr.find({
                        company: user.company
                    }, (err, okrs) => {
                        if (err) {
                            res.status(400).json({ 'Could not get okrs': err });
                        } else {
                            res.status(200).json(okrs);
                        }
                    });
                }
            });
    }
}

module.exports.getCompanyOkrs = (req, res) => {
    if (!req.payload._id) {
        res.status(401).json({ 'message': 'UnauthorizedError: User does not seem to be logged in.' })
    } else {
        User.findById(req.payload._id)
            .exec((err, user) => {
                if (err) {
                    res.status(401).json('User not found');
                } else {
                    Okr.find({
                        company: user.company,
                        parent: null
                    }, (err, okrs) => {
                        if (err) {
                            res.status(400).json({ 'Could not get okrs': err });
                        } else {
                            res.status(200).json(okrs);
                        }
                    });
                }
            });
    }
}

module.exports.getOkrsByObjective = (req, res) => {
    if (!req.payload._id) {
        res.status(401).json({ 'message': 'UnauthorizedError: User does not seem to be logged in.' })
    } else if (!req.params.term) {
        res.status(400).json('No search term received by the server.');
    } else {
        User.findById(req.payload._id)
            .exec((err, user) => {
                if (err) {
                    res.status(401).json('User not found');
                } else {
                    Okr.find({
                        objective: { "$regex": req.params.term, "$options": "i" },
                        company: decodeURIComponent(req.payload.company)
                    }, (err, okrs) => {
                        if (err) {
                            res.status(400).json('Could not get okrs');
                        } else {
                            res.status(200).json(okrs);
                        }
                    });
                }
            });
    }
}

module.exports.getChildren = (req, res) => {
    if (!req.params.id) {
        res.status(400).json({ 'message': 'InputError: No OKR id received by the api.' })
    } else if (!req.payload._id) {
        res.status(401).json({ 'message': 'UnauthorizedError: User does not seem to be logged in.' })
    } else {
        User.findById(req.payload._id)
            .exec((err, user) => {
                if (err) {
                    res.status(401).json('User not found');
                } else {
                    Okr.find({
                        company: user.company,
                        parent: req.params.id
                    }, (err, okrs) => {
                        if (err) {
                            res.status(400).json(err);
                        } else {
                            res.status(200).json(okrs);
                        }
                    });
                }
            });
    }
}

module.exports.deleteOkr = (req, res) => {
    if (!req.params.id) {
        res.status(400).json({ 'message': 'No OKR id received by api' });
    } else if (!req.payload._id) {
        res.status(401).json({ 'message': 'UnauthorizedError: User does not seem to be logged in.' })
    } else {
        Okr.findByIdAndRemove(req.params.id, (err, doc) => {
            if (err) {
                res.status(400).json('Could not delete OKR w id', req.params.id);
            } else {
                Okr.updateMany(
                    { parent: req.params.id },
                    { $set: { 'parent': undefined } }, (err, doc3) => {
                        if (err) {
                            res.status(400).json({ 'message': 'Could not delete children references' })
                        } else {
                            Okr.updateOne(
                                { children: req.params.id },
                                { $pull: { children: req.params.id } }, (err, doc4) => {
                                    if (err) {
                                        res.status.json('Could not delete the reference of parent');
                                    } else {
                                        res.status(200).json(doc4);
                                    }
                                });
                        }
                    });
            }
        });
    }
}