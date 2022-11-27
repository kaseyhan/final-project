var mongoose = require('mongoose');
var User = require('./backend/models/user')
var Task = require('./backend/models/task')

module.exports = function (router) {
	router.post('/users', async function (req, res) {
		let data;
		try {
			data = await User.create({
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
    			home: req.body.home,
    			color: req.body.color,
    			pendingTasks: req.body.pendingTasks,
    			events: req.body.events,
    			debts: req.body.debts
			})
			if (data) {
				for (let i = 0; i < data.pendingTasks.length; i++) {
					try {
						if (!mongoose.Types.ObjectId.isValid(data.pendingTasks[i])) {
							res.status(400).json({message:"Error: invalid task id", data:{}});
							return;
						}
						let task = await Task.findById(data.pendingTasks[i]);
						if (task) {
							// if (!task.completed) {
								task.assignee = data._id;
								task.assigneeName = data.name;
								try {
									let taskToSave = await task.save()
								} catch (error) {
									res.status(500).json({message: "Error saving task", data: {}})
									return;
								}
							// } else {
							// 	res.status(400).json({message: "Error: cannot assign a completed task to a user's pendingTasks", data: {}})
							// 	return;
							// }
						} else {
							res.status(404).json({message: "Error: task does not exist",data: {}})
							return;
						}
					} catch (error) {
						res.status(404).json({message: "Error: task does not exist",data: {}})
						return;
					}
				}

				for (let i = 0; i < data.events.length; i++) {
					// to do
				}

				for (let i = 0; i < data.debts.length; i++) {
					// to do
				}

				res.status(201)
				res.json({
					message: "OK",
					data: data})
				return;
			} else {
				if (!req.body.name || !req.body.email || !req.body.password) {
					res.status(400).json({
						message: "Error: missing name, email, or password",
						data: {name: req.body.name, email: req.body.email, password: req.body.password}})
					return;
				} else {
					res.status(400).json({
						message:"Error: email already in use", data:{}
					})
					return;
				}
			}
			
		} catch (error) {
			if (!req.body.name || !req.body.email || !req.body.password) {
				res.status(400).json({
					message: "Error: missing name, email, or password",
					data: {name: req.body.name, email: req.body.email, password: req.body.password}})
				return;
			} else if (error.message.substring(0,6) === "E11000") {
				res.status(400).json({
					message: "Error: email already in use",
					data: {}})
				return;
			} else {
				res.status(500).json({message: "Error", data: {}})
			}
		}
	})

	router.get('/users', async function (req, res) {
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
			let data = await User.find(query, select, other);
			if (count) data = {count: data.length};
			res.status(200)
			res.json({
				message: "OK",
				data: data})
		}
		catch(error){
			res.status(500)
			res.json({message: "Error: couldn't get users", data: {}})
		}
	})	

	router.get('/users/:id', async function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({message:"Error: invalid user id", data:{}});
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
			const data = await User.findById(req.params.id,select);
			if (data) {
				res.status(200)
				res.json({
					message: "OK",
					data: data})
			} else {
				res.status(404).json({message: "User not found", data:{}})
			}
		}
		catch(error){
			res.status(404).json({message: "User not found", data:{}})
		}
	})

	router.delete('/users/:id', async function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({message:"Error: invalid user id", data:{}});
			return;
		}
		try{
			const data = await User.findByIdAndDelete(req.params.id);
			await Task.updateMany({assignee: data._id}, {assignee: "", assigneeName: "unassigned"})
			res.status(200)
			res.json({
				message: "OK",
				data: data})
		}
		catch(error){
			res.status(404).json({message: "User not found", data:{}})
		}
	})

	router.put('/users/:id', async function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({message:"Error: invalid user id", data:{}});
			return;
		}
		const data = await User.findById(req.params.id);
		if (data) {
			data.name = req.body.name;
			data.email = req.body.email;
			data.password = req.body.password;
    		if (req.body.home) data.home = req.body.home,
    		if (req.body.color) data.color = req.body.color,
			if (req.body.pendingTasks || data.pendingTasks.length > 0) {
				if (req.body.pendingTasks) data.pendingTasks = req.body.pendingTasks;
				await Task.updateMany({assignee: data._id}, {assignee: "", assigneeName: "unassigned"})
				for (let i = 0; i < data.pendingTasks.length; i++) {
					try {
						if (!mongoose.Types.ObjectId.isValid(data.pendingTasks[i])) {
							res.status(400).json({message:"Error: invalid task id", data:{}});
							return;
						}
						let task = await Task.findById(data.pendingTasks[i]);
						if (task) {
							// if (!task.completed) {
								// if (task.assignedUser) {
								// 	const old_user = await User.findById(task.assignedUser);
								// 	if (old_user) {
								// 		for (let i = 0; i < old_user.pendingTasks.length; i++) {
								// 			if (old_user.pendingTasks[i] === 
								// 		}
								// 	}
								// }
								
								task.assignee = data._id;
								task.assigneeName = data.name;
								try {
									let taskToSave = await task.save()
								} catch (error) {
									res.status(500).json({message: "Error saving task", data: {}})
									return;
								}
							// } else {
							// 	res.status(400).json({message: "Error: cannot assign a completed task to a user's pendingTasks", data: {}})
							// 	return;
							// }
						} else {
							res.status(404).json({message: "Error: task does not exist",data: {}})
							return;
						}
					} catch (error) {
						res.status(404).json({message: "Error: task does not exist",data: {}})
						return;
					}
				}
			}
			
			if (req.body.events) {
				// to do
			}

			if (req.body.debts) {
				// to do
			}

		} else {
			res.status(404).json({
				message: "Error: user not found",
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
			if (!data.name || !data.email || !data.password) {
				res.status(400).json({
					message: "Error: missing name, email, or password",
					data: {name: data.name, email: data.email, password: data.password}})
			} 
		}
	})

	return router;
}