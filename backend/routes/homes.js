var mongoose = require('mongoose');
var Home = require('./backend/models/home')
var Task = require('./backend/models/task')
var User = require('./backend/models/user')

module.exports = function (router) {
    router.post('/homes', async function (req, res) {
        // let new_username = req.body.assignedUserName && req.body.assignedUserName !== "unassigned"
        
        // if (req.body.completed==="true" && (req.body.assignedUser !== "" || new_username)) {
        //     res.status(400).json({
        //         message: "Error: cannot assign a completed task to a user's pendingTasks", data: {}})
        //     return;
        // }
        // if ((req.body.assignedUserName && req.body.assignedUserName !== "unassigned") && !req.body.assignedUser) {
        //     res.status(400).json({message: "Error: must provide assignedUser id", data:{}})
        //     return;
        // }
        const data = new Home({
            name: req.body.name,
            home: req.body.home,
            members: req.body.members,
            address: req.body.address,
            landlord: req.body.landlord,
            landlordPhoneNumber: req.body.landlordPhoneNumber,
            leaseLink: req.body.leaseLink,
            dateCreated: Date.now()
        })

        for (let i = 0; i < data.members.length; i++) {
            let user = await User.findById(data.members[i]);
            if (user) {
                user.home = data._id;
                try {
                    const userToSave = await user.save();
                } catch (error) {
                    // if (!data.name || !data.home) {
                    //     res.status(400).json({
                    //         message: "Error: missing name or home",
                    //         data: {name: data.name, deadline: data.home}})
                    // } else {
                    //     res.status(500).json({
                    //         message: "Error saving data",
                    //         data: {}})
                    // }
                }
            }
            
           
        }
        
        // let user;
        // let invalid_user;
        // if (data.assignedUser) {
        //     if (!mongoose.Types.ObjectId.isValid(data.assignedUser)) {
        //         res.status(400).json({message:"Error: invalid user id", data:{}});
        //         return;
        //     }
            
        //     if (user) {
        //         if (user.name !== data.assigneeName) {
        //             res.status(400).json({message: "Error: provided assigneeName does not match records for assignee", data:{}});
        //             return;
        //         } else {
        //             if (!data.assigneeName) data.assigneeName = user.name;
        //             user.pendingTasks.push(data._id);
        //         }
        //     } else {
        //         invalid_user = true;
        //     }
        // }
        
        // if (!invalid_user) {
        //     try {
        //         const dataToSave = await data.save();
        //         if (user) {
        //             const userToSave = await user.save();
        //         }
        //         res.status(201)
        //         res.json({
        //             message: "OK",
        //             data: dataToSave
        //         })
        //     } catch (error) {
        //         if (!data.name || !data.home) {
        //             res.status(400).json({
        //                 message: "Error: missing name or home",
        //                 data: {name: data.name, deadline: data.home}})
        //         } else {
        //             res.status(500).json({
        //                 message: "Error saving data",
        //                 data: {}})
        //         }
        //     }
        // } else {
        //     res.status(400).json({
        //         message: "Error: invalid assigned user",
        //         data: {}
        //     })
        // }
        
    })
 
    router.get('/homes', async function (req, res) { // to do
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

    router.get('/homes/:id', async function (req, res) { // to do
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

    router.delete('/homes/:id', async function (req, res) { // to do
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

    router.put('/homes/:id', async function (req, res) { // to do
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({message:"Error: invalid task id", data:{}});
			return;
		}
        const data = await Task.findById(req.params.id);
        if (data) {
            data.name = req.body.name;
            data.deadline = req.body.deadline;
            if (req.body.home) data.home = req.body.home;
            if (req.body.notes) data.notes = req.body.notes;
            // if (req.body.completed && (req.body.assignedUser || req.body.assignedUserName)) {
            //     res.status(400).json({
            //         message: "Error: cannot assign a completed task to a user's pendingTasks", data: {}})
            //     return;
            // }
            if (req.body.rotate) {
                // to do
            }

            if ((req.body.assignedUserName && req.body.assignedUserName !== "unassigned") && !req.body.assignedUser) { // if there is an assignedUserName but no assignedUser
                res.status(400).json({message: "Error: must provide assignedUser id", data:{}})
                return;
            }
            let new_user;
            if (req.body.assignee) { // if provided an assignee
                if (!mongoose.Types.ObjectId.isValid(req.body.assignedUser)) {
                    res.status(400).json({message:"Error: invalid user id", data:{}});
                    return;
                }
                new_user = await User.findById(req.body.assignee);
                if (new_user) {
                    if (req.body.assigneeName) { // if provided assignee AND assigneeName
                        if (new_user.name !== req.body.assigneeName) { // if assigneeName doesn't match name of assignee
                            res.status(400).json({message: "Error: provided assigneeName does not match records for assignee", data:{}});
                            return;
                        } else { // if assigneeName matches assignee
                            data.assigneeName = req.body.assigneeName;
                        }
                    }
                } else { // if user not found
                    res.status(404).json({message:"Error: assignee not found",data:{}})
                    return;
                }
            }
            
            
            data.completed = req.body.completed;
            let old_user;
            if (data.assignee) old_user = await User.findById(data.assignee);
            else {
                res.status(404).json({message:"Error: old assignee not found", data:{}});
                return;
            }
            if (req.body.completed && old_user) { // TO DO: IF TASK ROTATES, REASSIGN TASK EVEN AFTER IT'S COMPLETED
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
                data.assignee = "";
                data.assigneeName = "";
            }
            if (req.body.assignee && req.body.assignee !== data.assignee && !data.completed) { // if a new user is provided
                if (data.assignee) {
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
                data.assignee = req.body.assignee;
                if (new_user) {
                    data.assigneeName = new_user.name;
                    new_user.pendingTasks.push(data._id);
                    try {
                        let userToSave = await new_user.save();
                    } catch (error) {
                        res.status(500).json({message: "Error saving", data:{}})
                        return;
                    }
                } else {
                    res.status(404).json({message: "Error: assignee not found", data:{}})
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
            if (!data.name || !data.home) {
                res.status(400).json({
                    message: "Error: missing name or home",
                    data: {name: data.name, deadline: data.home}})
            } 
        }
    })

    return router;
}