var mongoose = require('mongoose');
var User = require('../models/user')
var Task = require('../models/task')
var Event = require('../models/event')
var Home = require('../models/home')

module.exports = function (router) {
	router.post('/users', async function (req, res) {
		if (!req.body.name || !req.body.email || !req.body.password) {
			res.status(400).json({
				message: "Error: missing name, email, or password",
				data: { name: req.body.name, email: req.body.email, password: req.body.password }
			})
			return;
		}
		if (!req.body.home && (req.body.pendingTasks || req.body.events)) {
			res.status(400).json({ message: "Error: cannot assign tasks or events to a user without a home", data: {} });
			return;
		}

		// generate color
		let newColor;
		if (!req.body.color || req.body.color == "#ADD8E6") {
			// cite: https://mui.com/material-ui/react-avatar/
			let hash = 0;
			let i;
			let name = req.body.name;
			/* eslint-disable no-bitwise */
			for (i = 0; i < name.length; i += 1) {
				hash = name.charCodeAt(i) + ((hash << 5) - hash);
			}

			let color = '#';

			for (i = 0; i < 3; i += 1) {
				const value = (hash >> (i * 8)) & 0xff;
				color += `00${value.toString(16)}`.slice(-2);
			}
			/* eslint-enable no-bitwise */
			newColor = color;
		}

		let data;
		try {
			data = await User.create({
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
				home: req.body.home,
				color: newColor || req.body.color,
				pendingTasks: req.body.pendingTasks,
				events: req.body.events,
				debts: req.body.debts
			})
			if (data) {
				if (req.body.home && req.body.home !== "none") {
					let home = await Home.findById(req.body.home);
					home.members.push(data._id);
					try {
						let homeToSave = await home.save();
					} catch (error) {
						res.status(500).json({ message: "Error saving home", data: {} })
					}
				}

				for (let i = 0; i < data.pendingTasks.length; i++) { // do we need to check if the task's home matches the user's home? i feel like no cuz they can't exist without a home anyway
					try {
						if (!mongoose.Types.ObjectId.isValid(data.pendingTasks[i])) {
							res.status(400).json({ message: "Error: invalid task id", data: {} });
							return;
						}
						let task = await Task.findById(data.pendingTasks[i]);
						if (task) {
							if (!task.completed) {
								task.assignee = data._id;
								task.assigneeName = data.name;
								try {
									let taskToSave = await task.save()
								} catch (error) {
									res.status(500).json({ message: "Error saving task", data: {} })
									return;
								}
							} else {
								res.status(400).json({ message: "Error: cannot assign a completed task to a user's pendingTasks", data: {} })
								return;
							}
						} else {
							res.status(404).json({ message: "Error: task does not exist", data: {} })
							return;
						}
					} catch (error) {
						res.status(404).json({ message: "Error: task does not exist", data: {} })
						return;
					}
				}

				for (let i = 0; i < data.events.length; i++) { // same question ^ for events
					try {
						if (!mongoose.Types.ObjectId.isValid(data.events[i])) {
							res.status(400).json({ message: "Error: invalid event id", data: {} });
							return;
						}
						let event = await Event.findById(data.events[i]);
						if (event) {
							event.host = data._id;
							event.hostName = data.name;
							try {
								let eventToSave = await event.save()
							} catch (error) {
								res.status(500).json({ message: "Error saving event", data: {} })
								return;
							}
						} else {
							res.status(404).json({ message: "Error: event does not exist", data: {} })
							return;
						}
					} catch (error) {
						res.status(404).json({ message: "Error: event does not exist", data: {} })
						return;
					}
				}

				for (let i = 0; i < data.debts.length; i++) {
					let debt = data.debts[i];
					let other_user = await User.findById(debt.user);
					if (other_user) {
						const isDebtToEdit = (element) => element.user === data._id;
						let idx = other_user.debts.findIndex(isDebtToEdit);
						if (idx !== -1) {
							other_user.debts[idx]["amount"] += -debt.amount;
						} else {
							other_user.debts.push({"user": data._id, "amount": -debt.amount});
						}
						try {
							let otherUserToSave = await other_user.save();
						} catch (error) {
							res.status(500).json({message:"Error: couldn't save debt user",data:{}});
							return;
						}
					} else {
						res.status(404).json({message:"Error: couldn't find debt user", data:{}});
						return;
					}
				}


				let dataToSave = await data.save();
				res.status(201)
				res.json({
					message: "OK",
					data: data
				})
				return;
			} else {
				if (!req.body.name || !req.body.email || !req.body.password) {
					res.status(400).json({
						message: "Error: missing name, email, or password",
						data: { name: req.body.name, email: req.body.email, password: req.body.password }
					})
					return;
				} else {
					res.status(400).json({
						message: "Error: email already in use", data: {}
					})
					return;
				}
			}

		} catch (error) {
			if (!req.body.name || !req.body.email || !req.body.password) {
				res.status(400).json({
					message: "Error: missing name, email, or password",
					data: { name: req.body.name, email: req.body.email, password: req.body.password }
				})
				return;
			} else if (error.message.substring(0, 6) === "E11000") {
				res.status(400).json({
					message: "Error: email already in use",
					data: {}
				})
				return;
			} else {
				console.log(error)
				res.status(500).json({ message: "Error", data: {} })
			}
		}
	})

	router.get('/users', async function (req, res) {
		try {
			let query = {};
			let select = {};
			let other = {};
			let count = false;
			for (var key of Object.keys(req.query)) {
				switch (key) {
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
						res.status(400).json({ message: "Error: invalid query", data: {} })
						return;
				}

			}
			let data = await User.find(query, select, other);
			if (count) data = { count: data.length };
			res.status(200)
			res.json({
				message: "OK",
				data: data
			})
		}
		catch (error) {
			res.status(500)
			res.json({ message: "Error: couldn't get users", data: {} })
		}
	})

	router.get('/users/:id', async function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({ message: "Error: invalid user id", data: {} });
			return;
		}
		try {
			let select = {};
			for (var key of Object.keys(req.query)) {
				switch (key) {
					case "select":
						select = JSON.parse(req.query[key])
						break;
					default:
						res.status(400).json({ message: "Error: invalid query", data: {} })
						return;
				}
			}
			const data = await User.findById(req.params.id, select);
			if (data) {
				res.status(200)
				res.json({
					message: "OK",
					data: data
				})
			} else {
				res.status(404).json({ message: "User not found", data: {} })
			}
		}
		catch (error) {
			res.status(404).json({ message: "User not found", data: {} })
		}
	})

	router.delete('/users/:id', async function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({ message: "Error: invalid user id", data: {} });
			return;
		}
		try {
			const data = await User.findByIdAndDelete(req.params.id);
			await Task.updateMany({ assignee: data._id }, { assignee: "", assigneeName: "unassigned" });
			await Event.updateMany({ host: data._id }, { host: "", hostName: "none" });

			let home = await Home.findById(data.home);
			for (let i = 0; i < home.members.length; i++) {
				if (home.members[i] === req.params.id) {
					home.members.splice(i, 1);
					break;
				}
			}
			try {
				let homeToSave = await home.save();
			} catch (error) {
				res.status(500).json({ message: "Error saving", data: {} })
				return;
			}

			res.status(200)
			res.json({
				message: "OK",
				data: data
			})
		}
		catch (error) {
			res.status(404).json({ message: "User not found", data: {} })
		}
	})

	router.put('/users/:id', async function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			res.status(400).json({ message: "Error: invalid user id", data: {} });
			return;
		}
		if (!req.body.name || !req.body.email || !req.body.password) {
			res.status(400).json({
				message: "Error: missing name, email, or password",
				data: { name: req.body.name, email: req.body.email, password: req.body.password }
			})
			return;
		}

		const data = await User.findById(req.params.id);
		if (data) {
			let new_provided_home = req.body.home && req.body.home !== "none";
			if (!new_provided_home && data.home === "none" && (req.body.pendingTasks || req.body.events)) {
				res.status(400).json({ message: "Error: cannot assign tasks or events to a user without a home", data: {} });
				return;
			}
			data.name = req.body.name;
			data.email = req.body.email;
			data.password = req.body.password;
			if (req.body.color) data.color = req.body.color;

			if (req.body.home && req.body.home !== data.home) {
				let old_home = await Home.findById(data.home);
				for (let i = 0; i < old_home.members.length; i++) {
					if (old_home.members[i] === data._id) {
						old_home.members.splice(i, 1);
						break;
					}
				}
				try {
					let homeToSave = await old_home.save();
				} catch (error) {
					res.status(500).json({ message: "Error saving", data: {} })
					return;
				}
				let new_home = await Home.findById(req.body.home);
				if (new_home) {
					new_home.members.push(data._id);
					try {
						let homeToSave = await new_home.save();
					} catch (error) {
						res.status(500).json({ message: "Error saving", data: {} })
						return;
					}
					data.home = req.body.home;
				} else {
					res.status(404).json({ message: "Error: home does not exist", data: {} })
					return;
				}
			}

			if (req.body.pendingTasks || data.pendingTasks.length > 0) {
				if (req.body.pendingTasks) data.pendingTasks = req.body.pendingTasks;
				await Task.updateMany({ assignee: data._id }, { assignee: "", assigneeName: "unassigned" })
				for (let i = 0; i < data.pendingTasks.length; i++) {
					try {
						if (!mongoose.Types.ObjectId.isValid(data.pendingTasks[i])) {
							res.status(400).json({ message: "Error: invalid task id", data: {} });
							return;
						}
						let task = await Task.findById(data.pendingTasks[i]);
						if (task) {
							if (!task.completed) {
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
									res.status(500).json({ message: "Error saving task", data: {} })
									return;
								}
							} else {
								res.status(400).json({ message: "Error: cannot assign a completed task to a user's pendingTasks", data: {} })
								return;
							}
						} else {
							res.status(404).json({ message: "Error: task does not exist", data: {} })
							return;
						}
					} catch (error) {
						res.status(404).json({ message: "Error: task does not exist", data: {} })
						return;
					}
				}
			}

			if (req.body.events || data.events.length > 0) {
				if (req.body.events) data.events = req.body.events;
				await Event.updateMany({ host: data._id }, { host: "", hostName: "none" })
				for (let i = 0; i < data.events.length; i++) {
					try {
						if (!mongoose.Types.ObjectId.isValid(data.events[i])) {
							res.status(400).json({ message: "Error: invalid event id", data: {} });
							return;
						}
						let event = await Event.findById(data.events[i]);
						if (event) {
							event.host = data._id;
							event.hostName = data.name;
							try {
								let eventToSave = await event.save()
							} catch (error) {
								res.status(500).json({ message: "Error saving event", data: {} })
								return;
							}
						} else {
							res.status(404).json({ message: "Error: event does not exist", data: {} })
							return;
						}
					} catch (error) {
						res.status(404).json({ message: "Error: event does not exist", data: {} })
						return;
					}
				}
			}

			if (req.body.debts) {
				if (data.debts.length > 0) {
					for (let i = 0; i < data.debts.length; i++) {
						let otherUser = await User.findById(data.debts[i].user);
						const isDebtToDelete = (element) => element.user == data._id;
						let idx = otherUser.debts.findIndex(isDebtToDelete);
						if (idx !== -1) otherUser.debts.splice(idx,1);

						try {
							let otherUserToSave = await otherUser.save();
						} catch (error) {
							res.status(500).json({message:"Error: couldn't save debt user",data:{}});
							return;
						}
					}
				}
				
				let others = [];
				for (let i = 0; i < req.body.debts.length; i++) {
					let debt = req.body.debts[i];
					let other_user = await User.findById(debt.user);
					others.push(other_user);
					if (other_user) {
						const isDebtToEdit = (element) => element.user == data._id;
						let idx = other_user.debts.findIndex(isDebtToEdit);
						if (idx !== -1) {
							other_user.debts[idx]["amount"] = -debt.amount;
						} else {
							other_user.debts.push({"user": data._id, "amount": -debt.amount});
						}
						try {
							let otherUserToSave = await other_user.save();

						} catch (error) {
							res.status(500).json({message:"Error: couldn't save debt user",data:{}});
							return;
						}
					} else {
						res.status(404).json({message:"Error: couldn't find debt user", data:{}});
						return;
					}
				}
				

				data.debts = req.body.debts;
				// for (let i = 0; i < others.length; i++) {
				// 	let oid = others[i]._id;
				// 	let total = 0;
				// 	let duplicateIdxs = [];
				// 	for (let j = 0; j < data.debts.length; j++) {
				// 		if (data.debts[j].user == oid) {
				// 			total += data.debt;
				// 			duplicateIdxs.push(j);
				// 		}
				// 	}
				// 	if (duplicateIdxs.length > 1) {
				// 		for (let j = 0; j < duplicateIdxs.length; j++) {
				// 			data.debts.splice(duplicateIdxs[j],1);
				// 		}
				// 	}
				// 	data.debts.push({user: oid, amount: total});

				// }
			}

		} else {
			res.status(404).json({
				message: "Error: user not found",
				data: {}
			})
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
					data: { name: data.name, email: data.email, password: data.password }
				})
			}
		}
	})

	return router;
}