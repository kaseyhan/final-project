import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/layout';
import Navbar from '../components/Navbar'
import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Modal from "../components/modal";
// import { useNavigate } from "react-router-dom";

export default function ToDoView() {
    // const BASE_URL = "http://localhost:4000/api";
    const BASE_URL = "https://gsk-final-project-api.herokuapp.com/api";

    const [isLoading, setIsLoading] = useState(true);
    const [query, setQuery] = useState({});
    const [newQuery, setNewQuery] = useState({})
    const [queryAssignees, setQueryAssignees] = useState([]);
    const [home, setHome] = useState({});
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [userNames, setUserNames] = useState([]);
    const [sortBy, setSortBy] = useState("deadline");
    const [sortOrder, setSortOrder] = useState("asc");
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [rotation, setRotation] = useState("none");
    const [rotatedTasks, setRotatedTasks] = useState([]);
    const [newTask, setNewTask] = useState({});
    const [taskToEdit, setTaskToEdit] = useState({});
    let homeID = '639508e44c9f274f9cec2a85'
    const api = axios.create({ baseURL: BASE_URL });

    const fetchData = async() => {
        try {
            query["home"] = homeID;
            let p = {
                "params": {
                    "where": JSON.stringify(query)
                }
            }

            const task_get = await api.get('tasks', p);
            setTasks(task_get.data.data);
            await tasks;

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

            // setTaskToEdit({});

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        setIsLoading(true);
        fetchData().then(function(response) {
            setIsLoading(false);
        });
    }, [query,sortBy,sortOrder]);

    function titleCase(str) {
        return str.replace(
          /\w\S*/g,
          function(t) {
            return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();
          }
        );
      }

    function convertDeadline(deadline) {
        if (deadline !== undefined && deadline !== null) return new Date(deadline).toString().substring(0,25);
        else return null;
    }

  if (isLoading) {
    return <div className="pageContents">Loading...</div>;
  } else {
    return (
    <Layout>
      <Head>
        <title>To Do</title>
      </Head>
      <Navbar />
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
                <button className="filterButton" onClick={()=> setShowFilter(true)}>Filter Tasks</button>
                {/* <span>   </span>
                <button className="editRotationsButton">Edit Rotations</button> */}
            </div>
        </div>

        <Modal title="Filter Tasks" button="Apply Filters" onClose={() => setShowFilter(false)} show={showFilter}>
                <label htmlFor="assignees">Assignee</label>
                <div id="assignees">
                    {users.map((user, index) => (
                        <button className="assigneeButton" id={user} key={index} onClick={(event) => {
                            event.target.classList.toggle('active');
                            document.getElementById('anyone').classList.remove('active');
                            let q = [...queryAssignees];
                            q.push(event.target.id);
                            setQueryAssignees(q);
                        }}>{userNames[index]}</button>
                    ))}
                    <button className="assigneeButton" id="anyone" onClick={(event) => {
                        let buttons = document.getElementsByClassName("assigneeButton");
                        for (let i = 0; i < buttons.length; i++) {
                            buttons[i].classList.remove('active');
                        }
                        event.target.classList.toggle('active');
                        setQueryAssignees([]);
                    }}>Anyone</button>
                </div>
                <br></br>
                <label htmlFor="statusButtons">Status</label>
                <div className="statusButtons">
                    <button className="statusButton" id="notCompletedFilter" onClick={(event) => {
                        let buttons = document.getElementsByClassName("statusButton");
                        for (let i = 0; i < buttons.length; i++) {
                            buttons[i].classList.remove('active');
                        }
                        event.target.classList.toggle('active');
                        let q = {...newQuery};
                        q["completed"] = false;
                        setNewQuery(q);
                    }}>Not completed</button>
                    <button className="statusButton" id="completedFilter" onClick={(event) => {
                        let buttons = document.getElementsByClassName("statusButton");
                        for (let i = 0; i < buttons.length; i++) {
                            buttons[i].classList.remove('active');
                        }
                        event.target.classList.toggle('active');
                        let q = {...newQuery};
                        q["completed"] = true;
                        setNewQuery(q);
                    }}>Completed</button>
                    <button className="statusButton" id="anyStatusFilter" onClick={(event) => {
                        let buttons = document.getElementsByClassName("statusButton");
                        for (let i = 0; i < buttons.length; i++) {
                            buttons[i].classList.remove('active');
                        }
                        event.target.classList.toggle('active');
                        let q = {...newQuery};
                        delete q["completed"];
                        setNewQuery(q);
                    }}>Any status</button>
                </div>
                <br></br>
                

                <div className="submitButtons">
                    <button className="modalButton" onClick={() => {
                        if (queryAssignees.length > 0) {
                            newQuery["assignee"] = {"$in":queryAssignees};
                        }
                        
                        setQuery(newQuery);
                        setNewQuery({});
                        setQueryAssignees([]);                            
                        setShowFilter(false)}}>Apply Filters</button>
                </div>

            </Modal>
            
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
                        <p>{convertDeadline(task.deadline)}</p>
                    </div>
                    <span className="listColumn taskButtons">
                        <span className="taskButton">
                            <img className="editButton" id={task._id + 'Edit'} src="https://iili.io/HC8ZzHQ.png" width="18px" height="20px" onClick={(event) => {
                                // console.log(tasks[index]);
                                let endpoint = 'tasks/' + tasks[index]._id//task._id;
                                let task = api.get(endpoint).then(function(response) {
                                    setTaskToEdit(response.data.data);
                                    setShowEdit(true);
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
                    let t = {...taskToEdit};
                    t["name"] = event.target.value;
                    setTaskToEdit(t)
                }}></input><br></br>
                <br></br>

                <label htmlFor="assigneesEdit">Assignee(s) (optional)</label>
                <div id="assigneesEdit">
                    {users.map((user, index) => (
                        <button className="assigneeButton" id={user} key={index} onClick={(event) => {
                            event.target.classList.toggle('active');
                            let t = {...taskToEdit};
                            if (event.target.classList[1] === 'active') {
                                t["assignee"] = user;
                                t["assigneeName"] = userNames[index];
                            }
                            else {
                                t["assignee"] = null;
                                t["assigneeName"] = null;
                            }
                            let buttons = document.getElementsByClassName("assigneeButton");
                            for (let i = 0; i < buttons.length; i++) {
                                if (buttons[i].id !== event.target.id) buttons[i].classList.remove('active');
                            }
                            setTaskToEdit(t);
                        }}>{titleCase(userNames[index])}</button>
                    ))}
                </div>
                <br></br>

                <label htmlFor="deadlineInput">Deadline (optional)</label><br></br>
                <input type="date" className="deadlineInput" id="deadlineInputDateEdit" onChange={event => {
                    let t = {...taskToEdit}
                    t["deadlineDate"] = event.target.value;
                    setTaskToEdit(t)}}></input>
                <input type="time" className="deadlineInput" id="deadlineInputTimeEdit" onChange={event => {
                    let t = {...taskToEdit}
                    t["deadlineTime"] = event.target.value;
                    setTaskToEdit(t)}}></input><br></br>
                <br></br>

                <label htmlFor="notesInputEdit">Notes (optional)</label>
                <br></br>
                <textarea type="text" id="notesInputEdit" placeholder={taskToEdit.notes} cols="40" rows="4" onChange={event => {
                    let t = {...taskToEdit}
                    t["notes"] = event.target.value;
                    setTaskToEdit(t)}}></textarea><br></br>
                <br></br>

                <label htmlFor="selectRotationEdit">Rotate</label>
                <select id="selectRotationEdit" onChange={event => {
                    let t = {...taskToEdit}
                    t["rotate"] = event.target.value;
                    setTaskToEdit(t);
                    /*setRotation(event.target.value);*/}}>
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                </select><br></br>
                <br></br>

                <label htmlFor="completed">Completed?</label>
                <input type="checkbox" id="completed" onChange={event => {
                    let t = {...taskToEdit};
                    t["completed"] = event.target.value;
                    setTaskToEdit(t);
                }}></input>
                <br></br>
                <br></br>
                <br></br>

                <div className="submitButtons">
                    <button className="modalButton" onClick={() => {
                        if (taskToEdit["deadlineDate"] !== undefined) {
                            taskToEdit["deadline"] = taskToEdit["deadlineDate"]
                            if (taskToEdit["deadlineTime"] !== undefined) {
                                taskToEdit["deadline"] += "T" + taskToEdit["deadlineTime"] + ":00";
                            }
                        } else {
                            if (taskToEdit["deadlineTime"] !== undefined) {
                                const date = new Date();
                                let day = date.getDate();
                                let month = date.getMonth() + 1;
                                let year = date.getFullYear();

                                let currentDate = `${year}-${month}-${day}`;
                                taskToEdit["deadline"] = currentDate + "T" + taskToEdit["deadlineTime"] + ":00";
                            }
                        }

                        if (taskToEdit["assigneeName"] === undefined) {
                            taskToEdit["assigneeName"] = "unassigned";
                        }

                        let tt = {name: taskToEdit["name"], home: homeID};
                        if (taskToEdit["deadline"]) tt["deadline"] = taskToEdit["deadline"];
                        if (taskToEdit["rotate"]) tt["rotate"] = taskToEdit["rotate"];
                        if (taskToEdit["assignee"]) tt["assignee"] = taskToEdit["assignee"];
                        else tt["assignee"] = "";
                        if (taskToEdit["assigneeName"] && taskToEdit["assigneeName"] !== "unassigned") tt["assigneeName"] = taskToEdit["assigneeName"];
                        if (taskToEdit["notes"]) tt["notes"] = taskToEdit["notes"];

                        let endpoint = 'tasks/' + taskToEdit._id;
                        api.put(endpoint, tt)
                          .then(function (response) {
                            let new_tasks = [...tasks];
                            const isTaskToEdit = (element) => element._id === taskToEdit._id;
                            let idx = new_tasks.findIndex(isTaskToEdit);
                            let x = new_tasks.splice(idx,1);
                            new_tasks.push(response.data.data);
                            setTasks(new_tasks);
                            setTaskToEdit({});
                          })
                          .catch(function (error) {
                            console.log(error.response.data);
                          });

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
                <select id="selectRotation" defaultValue="none" onChange={event => {
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
                <p id="titleRequired">'Title' field is required.</p>
                <br></br>
                <br></br>

                <div className="submitButtons">
                    <button className="modalButton" onClick={() => {
                        if (newTask["name"] !== undefined) {
                            if (newTask["deadlineDate"] !== undefined && newTask["deadlineDate"] !== null) {
                                newTask["deadline"] = newTask["deadlineDate"]
                                if (newTask["deadlineTime"] !== undefined) {
                                    newTask["deadline"] += "T" + newTask["deadlineTime"] + ":00";
                                } else {
                                    newTask["deadline"] += "T00:00:00";
                                }
                            } else {
                                if (newTask["deadlineTime"] !== undefined && newTask["deadlineTime"] !== null) {
                                    const date = new Date();
                                    let day = date.getDate();
                                    let month = date.getMonth() + 1;
                                    let year = date.getFullYear();

                                    let currentDate = `${year}-${month}-${day}`;
                                    newTask["deadline"] = currentDate + "T" + newTask["deadlineTime"] + ":00";
                                } else {
                                    newTask["deadline"] = null;
                                }
                            }

                            if (newTask["assigneeName"] === undefined) {
                                newTask["assigneeName"] = "unassigned";
                            }

                            let tt;
                            if (newTask["deadline"] !== null && newTask["deadline"] !== undefined) {
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
                                new_tasks.push(response.data.data);
                                setTasks(new_tasks);
                                setNewTask({});
                                // document.getElementById('titleRequired').visibility = "hidden";
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                            
                            setShowCreate(false)
                        } else {
                            console.log('name required')
                            // document.getElementById('titleRequired').visibility = "visible";
                        }}}>Create Task</button>
                </div>

            </Modal>
            <button className="createTaskButton" onClick={() => setShowCreate(true)}>Create Task</button>
        </div>
      </div>
    </Layout>
  );
}
}