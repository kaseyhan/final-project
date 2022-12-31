var mongoose = require('mongoose');
var Task = require('../models/task')
var User = require('../models/user')
var Home = require('../models/home')

module.exports = function (router) {
    router.post('/tasks', async function (req, res) {
        let new_username = req.body.assigneeName && req.body.assigneeName !== "unassigned"
        
        if (req.body.completed==="true" && (req.body.assignee !== "" || new_username)) {
            res.status(401).json({
                message: "Error: cannot assign a completed task to a user's pendingTasks", data: {}})
            return;
        }
        if ((req.body.assigneeName && req.body.assigneeName !== "unassigned") && !req.body.assignee) {
            res.status(402).json({message: "Error: must provide assignee id", data:{}})
            return;
        }
        if (!req.body.home || !mongoose.Types.ObjectId.isValid(req.body.home)) {
            res.status(403).json({message: "Error: must provide valid home id", data:{}})
            return;
        }
        let data;
        if (req.body.deadline) {
            data = new Task({
                name: req.body.name,
                home: req.body.home,
                deadline: req.body.deadline,
                completed: req.body.completed,
                assignee: req.body.assignee,
                assigneeName: req.body.assigneeName,
                rotate: req.body.rotate,
                notes: req.body.notes,
                dateCreated: Date.now()
            })
        } else {
            data = new Task({
                name: req.body.name,
                home: req.body.home,
                completed: req.body.completed,
                assignee: req.body.assignee,
                assigneeName: req.body.assigneeName,
                rotate: req.body.rotate,
                notes: req.body.notes,
                dateCreated: Date.now()
            })
        }
        
        
        let home = await Home.findById(data.home);
        if (home) {
            home.tasks.push(data._id);
            try {
                let homeToSave = await home.save();
            } catch (error) {
                res.status(500).json({message: "Error saving home", data: {}});
                return;
            }
        } else {
            res.status(404).json({message: "Error: home not found", data:{}})
            return;
        }

        // do something with rotate??
        
        
        let user;
        if (data.assignee) {
            if (!mongoose.Types.ObjectId.isValid(data.assignee)) {
                res.status(404).json({message:"Error: invalid user id", data:{}});
                return;
            }
            user = await User.findById(data.assignee);
            if (user) {
                if (data.assigneeName && data.assigneeName !== "unassigned" && user.name !== data.assigneeName) {
                    res.status(405).json({message: "Error: provided assigneeName does not match records for assignee", data:{}});
                    return;
                } else if (user.home !== req.body.home) {
                    res.status(406).json({message:"Error: cannot assign tasks to a user from a different home",data:{}});
                    return;
                } else {
                    if (!req.body.assigneeName) data.assigneeName = user.name;
                    user.pendingTasks.push(data._id);
                }
            } else {
                res.status(407).json({message: "Error: invalid assigned user", data: {}});
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
            if (!data.name || !data.home) {
                res.status(408).json({
                    message: "Error: missing name or home",
                    data: {name: data.name, deadline: data.home}})
            } else {
                res.status(500).json({message: "Error saving task", data: {}});
            }
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
            // console.log(data)     

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
			res.status(400).json({message:"Error: invalid task id", data:{id: req.params.id}});
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
                let home = await Home.findById(data.home);
                for (let i = 0; i < home.tasks.length; i++) {
                    if (home.tasks[i] === req.params.id) {
                        home.tasks.splice(i,1);
                        break;
                    }
                }
                try {
                    let homeToSave = await home.save();
                } catch (error) {
                    res.status(500).json({message: "Error saving", data:{}})
                    return;
                }

                if (data.assignee) {
                    let user = await User.findById(data.assignee);
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
        if (!req.body.name || !req.body.home) {
            res.status(400).json({message:"Error: missing name or home",data:{name:req.body.name,home:req.body.home}});
            return;
        }
        if (req.body.completed && (req.body.assignee)){ // || (req.body.assigneeName && req.body.assigneeName !== "unassigned"))) {
            res.status(400).json({
                message: "Error: cannot assign a completed task to a user's pendingTasks", data: {}})
            return;
        }
        if ((req.body.assigneeName && req.body.assigneeName !== "unassigned") && !req.body.assignee) { // if there is an assigneeName but no assignee
            res.status(400).json({message: "Error: must provide assignee id", data:{}})
            return;
        }

        const data = await Task.findById(req.params.id);
        if (data) {
            data.name = req.body.name;
            if (req.body.deadline) data.deadline = req.body.deadline;
            if (req.body.notes) data.notes = req.body.notes;
            if (req.body.rotate) data.rotate = req.body.rotate;
            if (req.body.home !== data.home) {
                let old_home = await Home.findById(data.home);
                for (let i = 0; i < old_home.tasks.length; i++) {
                    if (old_home.tasks[i] === req.params.id) {
                        old_tasks.pendingTasks.splice(i,1);
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
                    new_home.tasks.push(data._id);
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
            if (req.body.assignee) { // if provided an assignee
                if (!mongoose.Types.ObjectId.isValid(req.body.assignee)) {
                    res.status(400).json({message:"Error: invalid user id", data:{}});
                    return;
                }
                new_user = await User.findById(req.body.assignee);
                if (new_user) {
                    if (req.body.assigneeName) { // if provided assignee AND assigneeName
                        if (new_user.name !== req.body.assigneeName) { // if assigneeName doesn't match name of assignee
                            res.status(400).json({message: "Error: provided assigneeName does not match records for assignee", data:{}});
                            return;
                        } else if (new_user.home !== req.body.home) {
                            res.status(400).json({message:"Error: cannot assign tasks to a user from a different home",data:{}});
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
            
            
            if (req.body.completed === true || req.body.completed === false) data.completed = req.body.completed;
            let old_user;
            if (data.assignee !== "") {
                old_user = await User.findById(data.assignee);
                if (!old_user) {
                    // let j = "assignee: " + data.assignee;
                    res.status(404).json({message:"Error: old assignee not found", data:{}});
                    // res.status(404).json({message: j, data:{}})
                    return;
                }
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
                // data.assignee = "";
                // data.assigneeName = "";
            }
            if (!data.completed && data.assignee && !req.body.assignee) {
                let a = await User.findById(data.assignee);
                a.pendingTasks.push(data._id);
                try {
                    let userToSave = await a.save();
                } catch (error) {
                    res.status(500).json({message: "Error saving", data:{}})
                    return;
                }
            }
            
            if (req.body.assignee && req.body.assignee !== data.assignee && !data.completed) { // if a new user is provided
                if (data.assignee) {
                    // let old_user = await User.findById(data.assignee);
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
            
            if (req.body.assignee) data.assignee = req.body.assignee;
            
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
            } else {
                res.status(500).json({message:"Error",data:{}});
            }
        }
    })

    return router;
}