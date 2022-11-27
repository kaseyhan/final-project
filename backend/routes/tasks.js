var mongoose = require('mongoose');
var Task = require('../models/task')
var User = require('../models/user')

module.exports = function (router) {
    router.post('/tasks', async function (req, res) {
        // let new_username = req.body.assignedUserName && req.body.assignedUserName !== "unassigned"
        
        // if (req.body.completed==="true" && (req.body.assignedUser !== "" || new_username)) {
        //     res.status(400).json({
        //         message: "Error: cannot assign a completed task to a user's pendingTasks", data: {}})
        //     return;
        // }
        if ((req.body.assignedUserName && req.body.assignedUserName !== "unassigned") && !req.body.assignedUser) {
            res.status(400).json({message: "Error: must provide assignedUser id", data:{}})
            return;
        }
        const data = new Task({
            name: req.body.name,
            description: req.body.description,
            deadline: req.body.deadline,
            completed: req.body.completed,
            assignedUser: req.body.assignedUser,
            assignedUserName: req.body.assignedUserName,
            dateCreated: Date.now()
        })
        
        
        let user;
        let invalid_user;
        if (data.assignedUser) {
            if (!mongoose.Types.ObjectId.isValid(data.assignedUser)) {
                res.status(400).json({message:"Error: invalid user id", data:{}});
                return;
            }
            user = await User.findById(data.assignedUser);
            if (user) {
                if (user.name !== data.assignedUserName) {
                    res.status(400).json({message: "Error: provided assignedUserName does not match records for assignedUser", data:{}});
                    return;
                } else {
                    if (!data.assignedUserName) data.assignedUserName = user.name;
                    user.pendingTasks.push(data._id);
                }
            } else {
                invalid_user = true;
            }
        }
        
        if (!invalid_user) {
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
                if (!data.name || !data.deadline) {
                    res.status(400).json({
                        message: "Error: missing name or deadline",
                        data: {name: data.name, deadline: data.deadline}})
                } else {
                    res.status(500).json({
                        message: "Error saving data",
                        data: {}})
                }
            }
        } else {
            res.status(400).json({
                message: "Error: invalid assigned user",
                data: {}
            })
        }
        
    })

    router.get('/tasks', async function (req, res) {
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
            let data = await Task.find(query, select, other);
            if (count) data = {count: data.length};
            res.status(200)
            res.json({
                message: "OK",
                data: data})
        }
        catch(error){
            res.status(500).json({message: "Error: couldn't get tasks", data: {}});
        }
    })

    router.get('/tasks/:id', async function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({message:"Error: invalid task id", data:{}});
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
            const data = await Task.findById(req.params.id, select);
            if (data) {
                res.status(200)
                res.json({
                    message: "OK",
                    data: data})
            } else {
                res.status(404).json({message: "Error: task not found", data:{}})
            }
        }
        catch(error){
            res.status(404).json({message: "Error: task not found", data:{}})
        }
    })

    router.delete('/tasks/:id', async function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({message:"Error: invalid task id", data:{}});
			return;
		}
        try{
            const data = await Task.findByIdAndDelete(req.params.id);
            if (data) {
                if (data.assignedUser) {
                    let user = await User.findById(data.assignedUser);
                    for (let i = 0; i < user.pendingTasks.length; i++) {
                        if (user.pendingTasks[i] === req.params.id) {
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
                
                res.status(200)
                res.json({
                    message: "OK",
                    data: data})
            } else {
                res.status(404).json({message: "Error: task not found", data:{}})
                return;
            }
            
        }
        catch(error){
            res.status(404).json({message: "Error: task not found", data:{}})
        }
    })

    router.put('/tasks/:id', async function (req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({message:"Error: invalid task id", data:{}});
			return;
		}
        const data = await Task.findById(req.params.id);
        if (data) {
            data.name = req.body.name;
            data.deadline = req.body.deadline;
            if (req.body.description) data.description = req.body.description;
            // if (req.body.completed && (req.body.assignedUser || req.body.assignedUserName)) {
            //     res.status(400).json({
            //         message: "Error: cannot assign a completed task to a user's pendingTasks", data: {}})
            //     return;
            // }
            if ((req.body.assignedUserName && req.body.assignedUserName !== "unassigned") && !req.body.assignedUser) { // if there is an assignedUserName but no assignedUser
                res.status(400).json({message: "Error: must provide assignedUser id", data:{}})
                return;
            }
            let new_user;
            if (req.body.assignedUser) { // if provided an assignedUser
                if (!mongoose.Types.ObjectId.isValid(req.body.assignedUser)) {
                    res.status(400).json({message:"Error: invalid user id", data:{}});
                    return;
                }
                new_user = await User.findById(req.body.assignedUser);
                if (new_user) {
                    if (req.body.assignedUserName) { // if provided assignedUser AND assignedUserName
                        if (new_user.name !== req.body.assignedUserName) { // if assignedUserName doesn't match name of assignedUser
                            res.status(400).json({message: "Error: provided assignedUserName does not match records for assignedUser", data:{}});
                            return;
                        } else { // if assignedUserName matches assignedUser
                            data.assignedUserName = req.body.assignedUserName;
                        }
                    }
                } else { // if user not found
                    res.status(404).json({message:"Error: assignedUser not found",data:{}})
                    return;
                }
            }
            
            
            data.completed = req.body.completed;
            let old_user;
            if (data.assignedUser) old_user = await User.findById(data.assignedUser);
            else {
                res.status(404).json({message:"Error: old assignedUser not found", data:{}});
                return;
            }
            if (req.body.completed && old_user) {
                for (let i = 0; i < old_user.pendingTasks.length; i++) {
                    if (old_user.pendingTasks[i] === req.params.id) {
                        old_user.pendingTasks.splice(i,1);
                        break;
                    }
                }
                try {
                    let userToSave = await old_user.save();
                } catch (error) {
                    res.status(500).json({message: "Error saving", data:{}})
                    return;
                }
                data.assignedUser = "";
                data.assignedUserName = "";
            }
            if (req.body.assignedUser && req.body.assignedUser !== data.assignedUser && !data.completed) { // if a new user is provided
                if (data.assignedUser) {
                    // let old_user = await User.findById(data.assignedUser);
                    for (let i = 0; i < old_user.pendingTasks.length; i++) { // delete this task from the old user
                        if (old_user.pendingTasks[i] === req.params.id) {
                            old_user.pendingTasks.splice(i,1);
                            break;
                        }
                    }
                    try {
                        let userToSave = await old_user.save();
                    } catch (error) {
                        res.status(500).json({message: "Error saving", data:{}})
                        return;
                    }
                }
                data.assignedUser = req.body.assignedUser;
                if (new_user) {
                    data.assignedUserName = new_user.name;
                    new_user.pendingTasks.push(data._id);
                    try {
                        let userToSave = await new_user.save();
                    } catch (error) {
                        res.status(500).json({message: "Error saving", data:{}})
                        return;
                    }
                } else {
                    res.status(404).json({message: "Error: assignedUser not found", data:{}})
                    return;
                }
            }
            
        } else {
            res.status(404).json({
                message: "Error: task not found",
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
            if (!data.name || !data.deadline) {
                res.status(400).json({
                    message: "Error: missing name or deadline",
                    data: {name: data.name, deadline: data.deadline}})
            } 
        }
    })

    return router;
}