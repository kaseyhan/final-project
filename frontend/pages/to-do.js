import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/layout';
import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Modal from "../components/modal";
// import { useNavigate } from "react-router-dom";

export default function ToDoView() {
    const BASE_URL = "http://localhost:4000/api";
    // const BASE_URL = "https://gsk-final-project-api.herokuapp.com/api";

    // const getImage = (path) => `https://image.tmdb.org/t/p/original/${path}`;
    // const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [home, setHome] = useState({});
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [userNames, setUserNames] = useState([]);
    const [sortBy, setSortBy] = useState("deadline");
    const [sortOrder, setSortOrder] = useState("asc");
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [rotation, setRotation] = useState("none");
    const [rotatedTasks, setRotatedTasks] = useState([]);
    const [newTask, setNewTask] = useState({});
    const [taskToEdit, setTaskToEdit] = useState({});
    let homeID = '638ea4a54dea1620a451af13'
    const api = axios.create({ baseURL: BASE_URL });

    const fetchData = async() => {
        try {
            let h = '{"home":"' + homeID + '"}';
            let p = {
                "params": {
                    "where": h
                }
            }

            const task_get = await api.get('tasks', p);
            console.log(task_get)
            setTasks(task_get.data.data);
            // await tasks;

            const home_get = await api.get('homes/'+homeID);

            setHome(home_get.data.data);
            await home;

            let u = [];
            let un = [];
            
            for (let i = 0; i < home.members.length; i++) {
                const user_get = await api.get('users/' + home.members[i].toString());
                u.push(user_get.data.data._id);
                un.push(user_get.data.data.name);
            }
            
            setUsers(u);
            setUserNames(un);

            let r = [];
            for (let i = 0; i < tasks.length; i++) {
                if (tasks[i].rotate !== "none") r.push(tasks[i]._id);
            }
            setRotatedTasks(r);

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {        
        // setTasks([]);
        // setNewTask({
        //     "name": null,
        //     "deadlineDate": null,
        //     "deadlineTime": null,
        //     "assignee": null,
        //     "assigneeNames": null,
        //     "rotate": null,
        //     "notes": null
        // })
        // setUsers([]);
        // setUserNames([]);
        setNewTask({})
        fetchData().then(function(response) {
            setIsLoading(false);
        });



        // let h = '{"home":"' + homeID + '"}';
        // let p = {
        //     "params": {
        //         "where": h
        //     }
        // }
        // const data = api.get('tasks', p);
        // data.then((res) => {
        //     setTasks((curr) => {
        //         return res.data["data"];
        //     });
        // });

        // const home = api.get('homes/'+homeID);

        // home.then((res) => {
        //     let items = res["data"]["data"]["members"];
        //     items = Object.values(items);
        //     setUsers(items);
        //     const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        //     const user_promises = [];

        //     (function loop(i) {
        //         if (i >= items.length) return user_promises; // all done
        //         delay(Math.random() * 1000).then(() => {
        //             let item = items[i].toString();
        //             const u = api.get('users/'+item);
        //             user_promises.push(u);
        //             loop(i+1);
        //         });
        //     })(0);
        //     return user_promises;
        // }).then((resU) => {
        //     console.log(resU.length)
        //     for (let i = 0; i < resU.length; i++) {
        //         console.log(i)
        //         let n = [...userNames];
        //         let userName = resU[i]["data"]["data"]["name"];
        //         n.push(userName);
        //         console.log(n);
        //         if (resU !== undefined && resU !== null) setUserNames(n);
        //     }
        // })
            // home.then((res) => {
            //     // console.log(res["data"])
            //     let items = res["data"]["data"]["members"];
            //     items = Object.values(items);
            //     // console.log(items);
            //     setUsers(items);
            //     const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
            //     const user_promises = [];

            //     (function loop(i) {
            //         if (i >= items.length) return user_promises; // all done
            //         delay(Math.random() * 1000).then(() => {
            //             let item = items[i].toString();
            //             const u = api.get('users/'+item);
            //             user_promises.push(u);
            //             loop(i+1);
            //         });
            //     })(0);
            //     return user_promises;
            // }).then((resU) => {
            //     console.log(resU.length)
            //     for (let i = 0; i < resU.length; i++) {
            //         console.log(i)
            //         let n = [...userNames];
            //         let userName = resU[i]["data"]["data"]["name"];
            //         n.push(userName);
            //         console.log(n);
            //         if (resU !== undefined && resU !== null) setUserNames(n);
            //     }
            // })

                // let names = [];
                // for (let i = 0; i < items.length; i++) {
                //     let item = items[i].toString();
                //     const u = api.get('users/'+item);
                //     u.then((resU) => {
                //         let n = [...userNames];
                //         let userName = resU["data"]["data"]["name"];
                //         n.push(userName);
                //         // console.log(n)
                //         if (resU !== undefined && resU !== null) setUserNames(n);
                //     })
                //     // item = u["data"]["data"]["name"];
                //     // items[i] = item;
                // }
                // setUsers((curr) => {
                //     return res.data["data"]["members"];
                // });
                // setUsers({items});
            // home.then((res) => {
            //     // console.log(res["data"])
            //     let items = res["data"]["data"]["members"];
            //     items = Object.values(items);
            //     // console.log(items);
            //     if (res !== undefined && res !== null) setUsers(items);

            //     // let names = [];
            //     for (let i = 0; i < items.length; i++) {
            //         let item = items[i].toString();
            //         const u = api.get('users/'+item);
            //         u.then((resU) => {
            //             let n = [...userNames];
            //             let userName = resU["data"]["data"]["name"];
            //             n.push(userName);
            //             // console.log(n)
            //             if (resU !== undefined && resU !== null) setUserNames(n);
            //         })
            //         // item = u["data"]["data"]["name"];
            //         // items[i] = item;
            //     }
            //     // setUsers((curr) => {
            //     //     return res.data["data"]["members"];
            //     // });
            //     // setUsers({items});
            // });

    }, [query,sortBy,sortOrder]);
    // console.log(userNames)

    function titleCase(str) {
        return str.replace(
          /\w\S*/g,
          function(t) {
            return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();
          }
        );
      }

  if (isLoading) {
    return <div className="pageContents">Loading...</div>;
  } else {
    return (
    <Layout>
      <Head>
        <title>To Do</title>
      </Head>
      <div className="pageContents">
        <h1>To Do</h1>
        <div className="options">
            <div className="sort">
                <p>Sort by: </p>
                <select name="selectList" id="select" defaultValue="deadline" onChange={event => {
                    setSortBy(event.target.value);}}>
                    <option value="title">Title</option>
                    <option value="deadline">Deadline</option>
                    <option value="dateCreated">Date Created</option>
                    <option value="assignee">Assignee</option>
                </select>
            </div>
            <div className="radioButtons" defaultValue="asc" onChange={event => {
                            setSortOrder(event.target.value);}}>
                <input className="rad" type="radio" value="asc" name="sort"/> ascending
                <span className="spacer">     </span>
                <input className="rad" type="radio" value="desc" name="sort"/> descending
            </div>
            <div className="rightButtons">
                <button className="filterButton" /*onClick={}*/>Filter Tasks</button>
                <span>   </span>
                <button className="editRotationsButton" /*onClick={}*/>Edit Rotations</button>
            </div>
        </div>

            
        <div className="listContainer">
            <div className="listHeader">
                <span>
                    <h3 className="listColumn">Task</h3>
                    <h3 className="listColumn">Assignee</h3>
                    <h3 className="listColumn">Deadline</h3>
                </span>
            </div>
            {tasks.sort((a,b) => {
                let first;
                let second;
                switch (sortBy) {
                    case "title":
                        if (sortOrder === "asc") {
                            first = a.title;
                            second = b.title;
                        } else {
                            first = b.title;
                            second = a.title;
                        }
                        break;
                    case "deadline":
                        if (sortOrder === "asc") {
                            first = a.deadline;
                            second = b.deadline;
                        } else {
                            first = b.deadline;
                            second = a.deadline;
                        }
                        break;
                    case "date_created":
                        if (sortOrder === "asc") {
                            first = Date.parse(a.dateCreated);
                            second = Date.parse(b.dateCreated);
                        } else {
                            first = Date.parse(b.dateCreated);
                            second = Date.parse(a.dateCreated);
                        }
                        break;
                    case "assignee":
                        if (sortOrder === "asc") {
                            first = a.assigneeName;
                            second = b.assigneeName;
                        } else {
                            first = b.assigneeName;
                            second = a.assigneeName;
                        }
                        break;
                    default:
                        if (sortOrder === "asc") {
                            first = a.deadline;
                            second = b.deadline;
                        } else {
                            first = b.deadline;
                            second = a.deadline;
                        }
                        break;
                        
                }
                if (first < second) return -1;
                else if (first > second) return 1;
                else return 0;
            }).map((task, index) => (
                <div className="listItem" key={index}>
                    <div className="listColumn task">
                        <p>{task.name}</p>
                    </div>
                    <div className="listColumn assignee">
                        <span className="assignees">
                            <p>{titleCase(task.assigneeName)}</p>
                        </span>
                        <span className="rotate">
                            <img id={task._id + 'Rotate'} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=" ></img> 
                            {/* <script>
                                if (rotatedTasks.includes(task._id)) {
                                    document.getElementById(task._id+'Rotate').src = "https://iili.io/HnsuCps.png"
                                    // document.getElementById(task._id+'Rotate').visibility = 'visible'
                                }
                            </script> */}
                        </span>
                    </div>
                    <div className="listColumn deadline">
                        <p>{new Date(task.deadline).toString().substring(0,25)}</p>
                    </div>
                    <span className="listColumn taskButtons">
                        <span className="taskButton">
                            <img className="editButton" id={task._id + 'Edit'} src="https://iili.io/HC8ZzHQ.png" width="18px" height="20px" onClick={(event) => {
                                console.log(task);
                                let endpoint = 'tasks/' + task._id;
                                let task = api.get(endpoint).then(function(response) {
                                    setTaskToEdit(response.data.data);
                                    setShowEdit(true)
                                }).catch(function(error) {
                                    console.log(error);
                                });
                        }}></img>
                        </span>
                        <span className="taskButton">
                            <img className="deleteButton" id={task._id + 'Delete'} src="https://iili.io/HC8ZRx1.png" width="20px" height="20px" onClick={(event) => {
                                let taskToDeleteID = task._id;
                                let endpoint = 'tasks/' + taskToDeleteID;
                                api.delete(endpoint).then(function(response) {
                                    let new_tasks = [...tasks]
                                    const isTaskToDelete = (element) => element._id === taskToDeleteID;
                                    let idx = new_tasks.findIndex(isTaskToDelete);
                                    let x = new_tasks.splice(idx,1);
                                    setTasks(new_tasks);
                                }).catch(function(error) {
                                    console.log(error);
                                })
                            }}></img>
                        </span>
                        <span className="taskButton">
                            <img className="checkButton" id={task._id + 'Check'} src="https://iili.io/HC8LA7V.png" width="20px" height="20px" onClick={(event) => {
                                let taskToEditID = task._id;
                                let endpoint = 'tasks/' + taskToEditID;

                                let new_tasks = [...tasks]
                                const isTaskToEdit = (element) => element._id === taskToEditID;
                                let idx = new_tasks.findIndex(isTaskToEdit);
                                
                                let taskToEdit = new_tasks[idx];
                                taskToEdit.completed = !taskToEdit.completed;
                                if (taskToEdit.completed) {
                                    taskToEdit.assignee = "";
                                    taskToEdit.assigneeName = "unassigned"; // ??
                                }

                                api.put(endpoint, taskToEdit).then(function(response) {
                                    let x = new_tasks.splice(idx,1);
                                    new_tasks.push(taskToEdit);
                                    if (taskToEdit.completed) event.target.src = "https://iili.io/HniDgnV.png";
                                    else event.target.src = "https://iili.io/HC8LA7V.png";
                                    setTasks(new_tasks);
                                }).catch(function(error) {
                                    console.log(error);
                                })
                            }}></img>
                        </span>
                    </span>
                </div>
            ))}

            <Modal title="Edit Task" button="Save Task" onClose={() => setShowEdit(false)} show={showEdit}>
                <label htmlFor="titleInputEdit">Title</label>
                <input type="text" id="titleInputEdit" placeholder={taskToEdit.name} onChange={event => {
                    let t = {...newTask};
                    t["name"] = event.target.value;
                    setNewTask(t)
                }}></input><br></br>
                <br></br>

                <label htmlFor="assigneesEdit">Assignee(s) (optional)</label>
                <div id="assigneesEdit">
                    {users.map((user, index) => (
                        <button className="assigneeButton" id={user} key={index} onClick={(event) => {
                            event.target.classList.toggle('active');
                            let t = {...newTask};
                            if (event.target.classList[1] === 'active') {
                                t["assignee"] = user;
                                t["assigneeName"] = userNames[index];
                            }
                            else {
                                // let idx = t["assignees"].indexOf(event.target.id);
                                // let x = t["assignees"].splice(idx, 1);
                                // x = t["assigneeNames"].splice(idx, 1);
                                t["assignee"] = null;
                                t["assigneeName"] = null;
                            }
                            let buttons = document.getElementsByClassName("assigneeButton");
                            for (let i = 0; i < buttons.length; i++) {
                                if (buttons[i].id !== event.target.id) buttons[i].classList.remove('active');
                            }
                        }}>{userNames[index]}</button>
                    ))}
                </div>
                <br></br>

                <label htmlFor="deadlineInput">Deadline (optional)</label><br></br>
                <input type="date" className="deadlineInput" id="deadlineInputDateEdit" onChange={event => {
                    let t = {...newTask}
                    t["deadlineDate"] = event.target.value;
                    setNewTask(t)}}></input>
                <input type="time" className="deadlineInput" id="deadlineInputTimeEdit" onChange={event => {
                    let t = {...newTask}
                    t["deadlineTime"] = event.target.value;
                    setNewTask(t)}}></input><br></br>
                <br></br>

                <label htmlFor="notesInputEdit">Notes (optional)</label>
                <input type="text" id="notesInputEdit" placeholder={taskToEdit.notes}onChange={event => {
                    let t = {...newTask}
                    t["notes"] = event.target.value;
                    setNewTask(t)}}></input><br></br>
                <br></br>

                <label htmlFor="selectRotationEdit">Rotate</label>
                <select id="selectRotationEdit" onChange={event => {
                    let t = {...newTask}
                    t["rotate"] = event.target.value;
                    setNewTask(t);
                    /*setRotation(event.target.value);*/}}>
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                </select>
                <br></br>
                <br></br>
                <br></br>

                <div className="submitButtons">
                    <button className="modalButton" onClick={() => {
                        // newTask["home"] = homeID;
                        if (newTask["deadlineDate"] !== undefined) {
                            newTask["deadline"] = newTask["deadlineDate"]
                            if (newTask["deadlineTime"] !== undefined) {
                                newTask["deadline"] += "T" + newTask["deadlineTime"] + ":00";
                            }
                        } else {
                            if (newTask["deadlineTime"] !== undefined) {
                                const date = new Date();
                                let day = date.getDate();
                                let month = date.getMonth() + 1;
                                let year = date.getFullYear();

                                let currentDate = `${year}-${month}-${day}`;
                                newTask["deadline"] = currentDate + "T" + newTask["deadlineTime"] + ":00";
                            }
                        }

                        if (newTask["assigneeName"] === undefined) {
                            newTask["assigneeName"] = "unassigned";
                        }

                        let tt = {
                            name: newTask["name"],
                            home: homeID,
                            deadline: newTask["deadline"],
                            rotate: newTask["rotate"],
                            assignee: newTask["assignee"],
                            assigneeName: newTask["assigneeName"],
                            notes: newTask["notes"]
                        }

                        let endpoint = 'tasks/' + taskToEdit._id;
                        api.put(endpoint, tt)
                          .then(function (response) {
                            console.log(response);
                          })
                          .catch(function (error) {
                            console.log(error.response.data);
                          });
                        let new_tasks = [...tasks];
                        const isTaskToEdit = (element) => element._id === taskToEdit._id;
                        let idx = new_tasks.findIndex(isTaskToEdit);
                        let x = new_tasks.splice(idx,1);
                        new_tasks.push(tt);
                        setTasks(new_tasks);

                        setShowEdit(false)}}>Save Task</button>
                </div>

            </Modal>

        </div>

        <div className="bottom">
            <Modal title="New Task" button="Create Task" onClose={() => setShowCreate(false)} show={showCreate}>
                <label htmlFor="titleInput">Title</label>
                <input type="text" id="titleInput" onChange={event => {
                    let t = {...newTask};
                    t["name"] = event.target.value;
                    setNewTask(t)
                }}></input><br></br>
                <br></br>

                <label htmlFor="assignees">Assignee(s) (optional)</label>
                <div id="assignees">
                    {users.map((user, index) => (
                        <button className="assigneeButton" id={user} key={index} onClick={(event) => {
                            event.target.classList.toggle('active');
                            let t = {...newTask};
                            if (event.target.classList[1] === 'active') {
                                t["assignee"] = user;
                                t["assigneeName"] = userNames[index];
                            }
                            else {
                                // let idx = t["assignees"].indexOf(event.target.id);
                                // let x = t["assignees"].splice(idx, 1);
                                // x = t["assigneeNames"].splice(idx, 1);
                                t["assignee"] = null;
                                t["assigneeName"] = null;
                            }
                            let buttons = document.getElementsByClassName("assigneeButton");
                            for (let i = 0; i < buttons.length; i++) {
                                if (buttons[i].id !== event.target.id) buttons[i].classList.remove('active');
                            }
                            setNewTask(t);
                        }}>{userNames[index]}</button>
                    ))}
                </div>
                <br></br>

                <label htmlFor="deadlineInput">Deadline (optional)</label><br></br>
                <input type="date" className="deadlineInput" id="deadlineInputDate" onChange={event => {
                    let t = {...newTask}
                    t["deadlineDate"] = event.target.value;
                    setNewTask(t)}}></input>
                <input type="time" className="deadlineInput" id="deadlineInputTime" onChange={event => {
                    let t = {...newTask}
                    t["deadlineTime"] = event.target.value;
                    setNewTask(t)}}></input><br></br>
                <br></br>

                <label htmlFor="notesInput">Notes (optional)</label> <br></br>
                <textarea id="notesInput" cols="40" rows="4" onChange={event => {
                    let t = {...newTask}
                    t["notes"] = event.target.value;
                    setNewTask(t)}}></textarea><br></br>
                <br></br>

                <label htmlFor="selectRotation">Rotate</label>
                <select id="selectRotation" defaultValue="None" onChange={event => {
                    let t = {...newTask}
                    t["rotate"] = event.target.value;
                    setNewTask(t);
                    /*setRotation(event.target.value);*/}}>
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                </select>
                <br></br>
                <br></br>
                <br></br>

                <div className="submitButtons">
                    <button className="modalButton" onClick={() => {
                        // newTask["home"] = homeID;
                        if (newTask["deadlineDate"] !== undefined) {
                            newTask["deadline"] = newTask["deadlineDate"]
                            if (newTask["deadlineTime"] !== undefined) {
                                newTask["deadline"] += "T" + newTask["deadlineTime"] + ":00";
                            } else {
                                newTask["deadline"] += "T00:00:00";
                            }
                        } else {
                            if (newTask["deadlineTime"] !== undefined) {
                                const date = Date();
                                let day = date.getDate();
                                let month = date.getMonth() + 1;
                                let year = date.getFullYear();

                                let currentDate = `${year}-${month}-${day}`;
                                newTask["deadline"] = currentDate + "T" + newTask["deadlineTime"] + ":00";
                            }
                        }

                        if (newTask["assigneeName"] === undefined) {
                            newTask["assigneeName"] = "unassigned";
                        }

                        let tt;
                        if (newTask["deadline"]) {
                            tt = {
                                name: newTask["name"],
                                home: homeID,
                                deadline: newTask["deadline"],
                                rotate: newTask["rotate"],
                                assignee: newTask["assignee"],
                                assigneeName: newTask["assigneeName"],
                                notes: newTask["notes"]
                            }
                        } else {
                            tt = {
                                name: newTask["name"],
                                home: homeID,
                                rotate: newTask["rotate"],
                                assignee: newTask["assignee"],
                                assigneeName: newTask["assigneeName"],
                                notes: newTask["notes"]
                            }
                        }

                        api.post('tasks', tt)
                          .then(function (response) {
                            let new_tasks = [...tasks];
                            new_tasks.push(tt);
                            setTasks(new_tasks);
                          })
                          .catch(function (error) {
                            console.log(error.response.data);
                          });
                        

                        setShowCreate(false)}}>Create Task</button>
                </div>

            </Modal>
            <button className="createTaskButton" onClick={() => setShowCreate(true)}>Create Task</button>
        </div>
      </div>
    </Layout>
  );
}
}