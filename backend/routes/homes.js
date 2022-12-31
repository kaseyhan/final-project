var mongoose = require('mongoose');
var Home = require('../models/home')
var Task = require('../models/task')
var User = require('../models/user')
var Event = require('../models/event')

module.exports = function (router) {
    router.post('/homes', async function (req, res) {
        if (!req.body.name) {
            res.status(400).json({message: "Error: missing name", data:{}});
            return;
        }
        if (!req.body.password) {
            res.status(400).json({message: "Error: missing password", data:{}});
            return;
        }
        const data = new Home({
            name: req.body.name,
            password: req.body.password,
            home: req.body.home,
            members: req.body.members,
            tasks: req.body.tasks,
            events: req.body.events,
            address: req.body.address,
            landlordName: req.body.landlordName,
            landlordPhoneNumber: req.body.landlordPhoneNumber,
            leaseLink: req.body.leaseLink,
            announcements: req.body.announcements,
            dateCreated: Date.now()
        })

        for (let i = 0; i < data.members.length; i++) {
            if (!mongoose.Types.ObjectId.isValid(data.members[i])) {
                res.status(400).json({message: "Error: invalid user id", data:{}});
                return;
            }
            let user = await User.findById(data.members[i]);
            if (user) {
                user.home = data._id;
                try {
                    const userToSave = await user.save();
                } catch (error) {
                    res.status(500).json({message: "Error saving data",data: {}});
                }
            } else {
                res.status(404).json({message: "Error: user not found", data:{user: data.members[i]}});
                return;
            }
        }
        
        // modify tasks and events to point to this home? or unnecessary bc they can't exist without a home

        try {
			const dataToSave = await data.save();
			res.status(200)
			res.json({
				message: "OK",
				data: dataToSave
			})
		} catch (error) {
			res.status(500).json({message: "Error saving",data: {}});
		}
        return router;
    })
 
    router.get('/homes', async function (req, res) {
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
            let data = await Home.find(query, select, other);
            if (count) data = {count: data.length};
            res.status(200)
            res.json({
                message: "OK",
                data: data})
        }
        catch(error){
            res.status(500).json({message: "Error: couldn't get homes", data: {}});
        }
    })

    router.get('/homes/:id', async function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({message:"Error: invalid home id", data:{}});
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
            const data = await Home.findById(req.params.id, select);
            if (data) {
                res.status(200)
                res.json({
                    message: "OK",
                    data: data})
            } else {
                res.status(404).json({message: "Error: home not found", data:{}})
            }
        }
        catch(error){
            res.status(404).json({message: "Error: home not found", data:{}})
        }
    })

    router.delete('/homes/:id', async function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({message:"Error: invalid home id", data:{}});
			return;
		}
        try{
            const data = await Home.findByIdAndDelete(req.params.id);
            if (data) {
                // if (data.members && data.members.length > 0) await User.updateMany({home: data._id}, {home: "none"});
                if (data.members) { // unassign users and delete those users' tasks and events (DO WE NEED TO DELETE THEIR TASKS/EVENTS??)
                    for (let i = 0; i < data.members.length; i++) { // may be redundant bc we go through all the home's tasks and events later
                        let user = await User.findById(data.members[i]);
                        await Task.deleteMany({assignee: user._id});
                        await Event.deleteMany({host: user._id});
                        user.home = "none";
                        try {
                            let userToSave = await user.save();
                        } catch (error) {
                            res.status(500).json({message:"Error saving",data:{}});
                            return;
                        }
                    }
                }
                // if (data.tasks && data.tasks.length > 0) await Task.deleteMany({home: data._id}); // a task cannot exist without a home
                // if (data.events && data.events.length > 0) await Event.deleteMany({home: data._id}); // same ^
                if (data.tasks && data.tasks.length > 0) {
                    for (let i = 0; i < data.tasks.length; i++) {
                        let task = await Task.findByIdAndDelete(data.tasks[i]);
                        if (task.assignee) {
                            let user = await User.findById(task.assignee);
                            for (let i = 0; i < user.pendingTasks.length; i++) {
                                if (user.pendingTasks[i] === task._id) {
                                    user.pendingTasks.splice(i,1);
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
                    }
                }

                if (data.events && data.events.length > 0) {
                    for (let i = 0; i < data.events.length; i++) {
                        let event = await Event.findByIdAndDelete(data.events[i]);
                        if (event.host) {
                            let user = await User.findById(event.host);
                            for (let i = 0; i < user.events.length; i++) {
                                if (user.events[i] === event._id) {
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
                    }
                }

                res.status(200)
                res.json({
                    message: "OK",
                    data: data})
            } else {
                res.status(404).json({message: "Error: home not found", data:{}})
                return;
            }
            
        }
        catch(error){
            res.status(404).json({message: "Error: home not found", data:{}})
        }
    })

    router.put('/homes/:id', async function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({message:"Error: invalid home id", data:{}});
			return;
		}
        if (!req.body.name) {
            res.status(400).json({message:"Error: missing name", data:{}});
			return;
        }
        if (!req.body.password) {
            res.status(400).json({message:"Error: missing password", data:{}});
			return;
        }
        const data = await Home.findById(req.params.id);
        if (data) {
            data.name = req.body.name;
            data.password = req.body.password;
            data.address = req.body.address;
            data.landlordName = req.body.landlordName;
            data.landlordPhoneNumber = req.body.landlordPhoneNumber;
            data.leaseLink = req.body.leaseLink;
            // if (req.body.address) data.address = req.body.address;
            // if (req.body.landlordName) data.landlordName = req.body.landlordName;
            // if (req.body.landlordPhoneNumber) data.landlordPhoneNumber = req.body.landlordPhoneNumber;
            // if (req.body.leaseLink) data.leaseLink = req.body.leaseLink;
            if (req.body.announcements) data.announcements = req.body.announcements;

            if (req.body.members) {
                // await User.updateMany({home: data._id},{home:"none"});
                if (data.members) { // unassign old users and delete those users' tasks and events (DO WE NEED TO DELETE THEIR TASKS/EVENTS??)
                    for (let i = 0; i < data.members.length; i++) {
                        let user = await User.findById(data.members[i]);
                        await Task.deleteMany({assignee: user._id});
                        await Event.deleteMany({host: user._id});
                        user.home = "none";
                        try {
                            let userToSave = await user.save();
                        } catch (error) {
                            res.status(500).json({message:"Error saving",data:{}});
                            return;
                        }
                    }
                }
                for (let i = 0; i < req.body.members.length; i++) {
                    let user = await User.findById(req.body.members[i]);
                    user.home = data._id;
                    try {
                        let userToSave = await user.save();
                    } catch (error) {
                        res.status(500).json({message:"Error saving",data:{}});
                        return;
                    }
                }
                data.members = req.body.members;
            }

            if (req.body.tasks && req.body.tasks.length > 0) {
                let tasksToDelete = data.tasks.filter(x => !req.body.tasks.includes(x));
                for (let i = 0; i < tasksToDelete.length; i++) {
                    let task = await Task.findByIdAndDelete(tasksToDelete[i]);
                    if (task.assignee) {
                        let user = await User.findById(task.assignee);
                        for (let i = 0; i < user.pendingTasks.length; i++) {
                            if (user.pendingTasks[i] === task._id) {
                                user.pendingTasks.splice(i,1);
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
                }
                // let tasksToAdd = req.body.tasks.filter(x => !data.tasks.includes(x));
                for (let i = 0; i < req.body.tasks.length; i++) { // do we need to do this? if tasks cannot exist without being tied to a home
                    let task = await Task.findById(req.body.tasks[i]);
                    if (task) {
                        if (task.home !== data._id) {
                            let old_home = await Home.findById(task.home);
                                for (let i = 0; i < old_home.events.length; i++) {
                                    if (old_home.events[i] === task._id) {
                                        old_home.events.splice(i,1);
                                        break;
                                    }
                                }
                            task.home = data._id;
                            try {
                                let taskToSave = await task.save();
                            } catch (error) {
                                res.status(500).json({message: "Error saving", data:{}})
                                    return;
                            }
                        }
                    } else {
                        res.status(404).json({message: "Error: task not found", data:{}});
                        return;
                    }
                    
                }
                data.tasks = req.body.tasks;
            }

            if (req.body.events && req.body.events.length > 0) {
                let eventsToDelete = data.events.filter(x => !req.body.events.includes(x));
                for (let i = 0; i < eventsToDelete.length; i++) {
                    let event = await Event.findByIdAndDelete(eventsToDelete[i]);
                    if (event.host) {
                        let user = await User.findById(event.host);
                        for (let i = 0; i < user.events.length; i++) {
                            if (user.events[i] === event._id) {
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
                }
                for (let i = 0; i < req.body.events.length; i++) { // do we need to do this? if events cannot exist without being tied to a home
                    let event = await Event.findById(req.body.events[i]);
                    if (event.home !== data._id) {
                        let old_home = await Home.findById(event.home);
                        for (let i = 0; i < old_home.events.length; i++) {
                            if (old_home.events[i] === event._id) {
                                old_home.events.splice(i,1);
                                break;
                            }
                        }
                        event.home = data._id;

                        try {
                            let eventToSave = await event.save();
                        } catch (error) {
                            res.status(500).json({message: "Error saving", data:{}});
                            return;
                        }
                    }
                }
                data.events = req.body.events;
            }
        } else {
            res.status(404).json({
                message: "Error: home not found",
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
            if (!data.name || !data.home) {
                res.status(400).json({
                    message: "Error: missing name or home",
                    data: {name: data.name, deadline: data.home}})
            } 
        }
    })

    return router;
}