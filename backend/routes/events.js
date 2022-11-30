var mongoose = require('mongoose');
var Event = require('../models/event')
var User = require('../models/user')
var Home = require('../models/home')

module.exports = function (router) {
    router.post('/events', async function (req, res) {
        if (!req.body.name || !req.body.start || !req.body.end) {
            res.status(400).json({message: "Error: missing name, start time, or end time",
            data:{name: req.body.name, start: req.body.start, end: req.body.end}})
            return;
        }
        if (!req.body.home || !mongoose.Types.ObjectId.isValid(req.body.home)) {
            res.status(400).json({message: "Error: must provide valid home id", data:{}})
            return;
        }
        if ((req.body.hostName && req.body.hostName !== "none") && !req.body.host) {
            res.status(400).json({message: "Error: must provide host id", data:{}})
            return;
        }
        // console.log(req.body.guests);
        // g = JSON.parse(req.body.guests);

        const data = new Event({
            name: req.body.name,
            home: req.body.home,
            repeat: req.body.repeat,
            notes: req.body.notes,
            start: req.body.start,
            end: req.body.end,
            host: req.body.host,
            hostName: req.body.hostName,
            location: req.body.location,
            guests: req.body.guests,
            dateCreated: Date.now()
        })
        
        let home = await Home.findById(data.home);
        if (home) {
            home.events.push(data._id);
            try {
                let homeToSave = await home.save();
            } catch (error) {
                res.status(500).json({message: "Error saving data", data: {}});
                return;
            }
        } else {
            res.status(404).json({message: "Error: home not found", data:{}})
            return;
        }

        // do something with repeat??
        
        
        let user;
        if (data.host) {
            if (!mongoose.Types.ObjectId.isValid(data.host)) {
                res.status(400).json({message:"Error: invalid user id", data:{}});
                return;
            }
            user = await User.findById(data.host);
            if (user) {
                if (user.name !== data.hostName) {
                    res.status(400).json({message: "Error: provided hostName does not match records for host", data:{}});
                    return;
                } else if (user.home !== req.body.home) {
                    res.status(400).json({message:"Error: cannot assign events to a user from a different home",data:{}});
                    return;
                } else {
                    if (!data.hostName) data.hostName = user.name;
                    user.events.push(data._id);
                }
            } else {
                res.status(400).json({message: "Error: invalid assigned user", data: {}});
                return;
            }
        }

        try {
            const dataToSave = await data.save();
            if (user) {
                const userToSave = await user.save();
            }
            res.status(201)
            res.json({
                message: "OK",
                data: dataToSave
            })
        } catch (error) {
            res.status(500).json({message: "Error saving data", data: {}});
        }
    })

    router.get('/events', async function (req, res) {
        try{
            let query = {};
			let select = {};
			let other = {};
            let count = false;
			for (var key of Object.keys(req.query)) {
				switch(key) {
					case "where":
						query = JSON.parse(req.query[key]);
						break;
					case "sort":
						other["sort"] = JSON.parse(req.query[key]);
						break;
					case "select":
						select = JSON.parse(req.query[key])
						break;
					case "skip":
						other["skip"] = JSON.parse(req.query[key]);
						break;
					case "limit":
						other["limit"] = JSON.parse(req.query[key]);
						break;
					case "count":
						if (req.query[key] === "true") count = true;
						break;
					default:
						res.status(400).json({message: "Error: invalid query", data:{}})
						return;
				  }
				
			}
            let data = await Event.find(query, select, other);
            if (count) data = {count: data.length};
            res.status(200)
            res.json({
                message: "OK",
                data: data})
        }
        catch(error){
            res.status(500).json({message: "Error: couldn't get events", data: {}});
        }
    })

    router.get('/events/:id', async function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({message:"Error: invalid event id", data:{}});
			return;
		}
        try{
            let select = {};
			for (var key of Object.keys(req.query)) {
				switch(key) {
					case "select":
						select = JSON.parse(req.query[key])
						break;
					default:
						res.status(400).json({message: "Error: invalid query", data:{}})
						return;
				  }
			}
            const data = await Event.findById(req.params.id, select);
            if (data) {
                res.status(200)
                res.json({
                    message: "OK",
                    data: data})
            } else {
                res.status(404).json({message: "Error: event not found", data:{}})
            }
        }
        catch(error){
            res.status(404).json({message: "Error: event not found", data:{}})
        }
    })

    router.delete('/events/:id', async function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({message:"Error: invalid event id", data:{}});
			return;
		}
        try{
            const data = await Event.findByIdAndDelete(req.params.id);
            if (data) {
                let home = await Home.findById(data.home);
                for (let i = 0; i < home.events.length; i++) {
                    if (home.events[i] === req.params.id) {
                        home.events.splice(i,1);
                        break;
                    }
                }
                try {
                    let homeToSave = await home.save();
                } catch (error) {
                    res.status(500).json({message: "Error saving", data:{}})
                    return;
                }

                if (data.host) {
                    let user = await User.findById(data.host);
                    for (let i = 0; i < user.events.length; i++) {
                        if (user.events[i] === req.params.id) {
                            user.events.splice(i,1);
                            break;
                        }
                    }
                    try {
                        let userToSave = await user.save();
                    } catch (error) {
                        res.status(500).json({message: "Error saving", data:{}})
                        return;
                    }
                }
                
                res.status(200)
                res.json({
                    message: "OK",
                    data: data})
            } else {
                res.status(404).json({message: "Error: event not found", data:{}})
                return;
            }
            
        }
        catch(error){
            res.status(404).json({message: "Error: event not found", data:{}})
        }
    })

    router.put('/events/:id', async function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({message:"Error: invalid event id", data:{}});
			return;
		}
        if (!req.body.name || !req.body.home || !req.body.start || !req.body.end) {
            res.status(400).json({message:"Error: missing name, home, start time, or end time",
            data:{name:req.body.name,home:req.body.home,start:req.body.start,end:req.body.end}});
            return;
        }
        // if (req.body.completed && (req.body.host || req.body.hostName)) {
        //     res.status(400).json({
        //         message: "Error: cannot assign a completed event to a user's events", data: {}})
        //     return;
        // }
        if ((req.body.hostName && req.body.hostName !== "none") && !req.body.host) { // if there is an hostName but no host
            res.status(400).json({message: "Error: must provide host id", data:{}})
            return;
        }

        const data = await Event.findById(req.params.id);
        if (data) {
            data.name = req.body.name;
            data.start = req.body.start; // ?
            data.end = req.body.end;
            if (req.body.notes) data.notes = req.body.notes;
            if (req.body.home !== data.home) {
                let old_home = await Home.findById(data.home);
                for (let i = 0; i < old_home.events.length; i++) {
                    if (old_home.events[i] === req.params.id) {
                        old_events.events.splice(i,1);
                        break;
                    }
                }
                try {
                    let homeToSave = await old_home.save();
                } catch (error) {
                    res.status(500).json({message: "Error saving", data:{}})
                    return;
                }
                let new_home = await Home.findById(req.body.home);
                if (new_home) {
                    new_home.events.push(data._id);
                    try {
                        let homeToSave = await new_home.save();
                    } catch (error) {
                        res.status(500).json({message: "Error saving", data:{}})
                        return;
                    }
                } else {
                    res.status(404).json({message:"Error: new home not found",data:{}})
                    return;
                }
                data.home = req.body.home;
            }

            let new_user;
            if (req.body.host) { // if provided an host
                
            }
            
            
            // data.completed = req.body.completed;

            // TO DO: REPEAT
            // WHEN AN EVENT REPEATS, LEAVE THAT EVENT AS COMPLETED WITH ITS HOST AND CREATE A DUPLICATE OF IT AND ASSIGN IT TO THE NEXT USER IN THE ROTATION, SET DATECREATED=OLD_EVENT.DATECREATED
            // if (req.body.rotate && )

            if (req.body.host && req.body.host !== data.host/* && !data.completed*/) { // if a new user is provided
                if (data.host) {
                    old_user = await User.findById(data.host);
                    for (let i = 0; i < old_user.events.length; i++) {
                        if (old_user.events[i] === req.params.id) {
                            old_user.events.splice(i,1);
                            break;
                        }
                    }
                    try {
                        let userToSave = await old_user.save();
                    } catch (error) {
                        res.status(500).json({message: "Error saving", data:{}})
                        return;
                    }
                    data.host = "";
                    data.hostName = "";
                } //else {
                //     res.status(404).json({message:"Error: old host not found", data:{}});
                //     return;
                // }
                if (!mongoose.Types.ObjectId.isValid(req.body.host)) {
                    res.status(400).json({message:"Error: invalid user id", data:{}});
                    return;
                }
                new_user = await User.findById(req.body.host);
                if (new_user) {
                    if (req.body.hostName) { // if provided host AND hostName
                        if (new_user.name !== req.body.hostName) { // if hostName doesn't match name of host
                            res.status(400).json({message: "Error: provided hostName does not match records for host", data:{}});
                            return;
                        } else if (new_user.home !== req.body.home) {
                            res.status(400).json({message:"Error: cannot assign events to a user from a different home",data:{}});
                            return;
                        } else { // if hostName matches host
                            data.hostName = req.body.hostName;
                        }
                    }
                    data.host = req.body.host;
                    new_user.events.push(data._id);
                    try {
                        let userToSave = await new_user.save();
                    } catch (error) {
                        res.status(500).json({message: "Error saving", data:{}})
                        return;
                    }
                } else { // if user not found
                    res.status(404).json({message:"Error: host not found",data:{}})
                    return;
                }
            }
        } else {
            res.status(404).json({
                message: "Error: event not found",
                data: {}})
            return;
        }
        
    
        try {
            const dataToSave = await data.save();
            res.status(200)
            res.json({
                message: "OK",
                data: dataToSave
            })
        }
        catch (error) {
            res.status(500).json({message:"Error",data:{}});
        }
    })

    return router;
}