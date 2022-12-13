import Head from 'next/head';
import Layout from '../components/layout';
import Navbar from '../components/Navbar'
import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Modal from "../components/modal";
import styles from '../styles/to-do.module.css'

export default function ToDoView() {
    // const BASE_URL = "http://localhost:4000/api";
    const BASE_URL = "https://gsk-final-project-api.herokuapp.com/api";

    const [isLoading, setIsLoading] = useState(true);
    const [query, setQuery] = useState({});
    const [newQuery, setNewQuery] = useState({})
    const [queryAssignees, setQueryAssignees] = useState([]);
    const [queryDeadline, setQueryDeadline] = useState("");
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
    const [activeStatusFilterButton, setActiveStatusFilterButton] = useState("");
    const [activeAssigneeFilterButton, setActiveAssigneeFilterButton] = useState([]);
    const [activeDeadlineFilterButton, setActiveDeadlineFilterButton] = useState("");
    const [activeAssigneeEditButton, setActiveAssigneeEditButton] = useState("");
    const [activeAssigneeCreateButton, setActiveAssigneeCreateButton] = useState("");

    const homeID = '639508e44c9f274f9cec2a85'
    const userID = '639508e64c9f274f9cec2b23'
    const blankImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
    const rotateImage = "https://iili.io/HnsuCps.png";
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
            
            // if (typeof home !== "undefined" && typeof home.members !== "undefined") {
                for (let i = 0; i < home.members.length; i++) {
                    const user_get = await api.get('users/' + home.members[i].toString());
                    u.push(user_get.data.data._id);
                    un.push(user_get.data.data.name);
                }
                
                setUsers(u);
                setUserNames(un);
            // }
            

            // let r = [];
            // for (let i = 0; i < tasks.length; i++) {
            //     if (tasks[i].rotate !== "none") r.push(tasks[i]._id);
            // }
            // setRotatedTasks(r);

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
        if (str) {
            return str.replace(
            /\w\S*/g,
            function(t) {
                return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();
            }
            );
        } else {
            return "EMPTY"
        }
      }

    function convertDeadline(deadline) {
        if (deadline !== undefined && deadline !== null) return new Date(deadline).toString().substring(0,25);
        else return null;
    }

  if (isLoading) {
    return <div className={styles.pageContents}>Loading...</div>;
  } else {
    return (
    <Layout>
      <Head>
        <title>To Do</title>
      </Head>
      <Navbar />
      <div className={styles.pageContents}>
        <h1>To Do</h1>
        <div className={styles.options}>
            <div className={styles.sort}>
                <p>Sort by: </p>
                <select name="selectList" id="select" defaultValue="deadline" onChange={event => {
                    setSortBy(event.target.value);}}>
                    <option value="title">Title</option>
                    <option value="deadline">Deadline</option>
                    <option value="dateCreated">Date Created</option>
                    <option value="assignee">Assignee</option>
                </select>
            </div>
            <div className={styles.radioButtons} defaultValue="asc" onChange={event => {
                            setSortOrder(event.target.value);}}>
                <input className={styles.rad} type="radio" value="asc" name="sort"/> ascending
                <span className={styles.spacer}>     </span>
                <input className={styles.rad} type="radio" value="desc" name="sort"/> descending
            </div>
            <div className={styles.rightButtons}>
                <button className={styles.filterButton} onClick={()=> setShowFilter(true)}>Filter Tasks</button>
                {/* <span>   </span>
                <button className="editRotationsButton">Edit Rotations</button> */}
            </div>
        </div>

        <Modal title="Filter Tasks" button="Apply Filters" onClose={() => setShowFilter(false)} show={showFilter}>
                <label htmlFor="assignees">Assignee</label>
                <br></br>
                <div id="assignees" className={styles.assigneeButtons}>
                    {users.map((user, index) => (
                        <button className={activeAssigneeFilterButton.includes(user) ? `${styles.assigneeButton} ${styles.active}` : 
                        styles.assigneeButton} id={user} key={index} onClick={(event) => {
                            // event.target.classList.toggle('active');
                            // document.getElementById('anyone').classList.remove('active');
                            if (activeAssigneeFilterButton.includes("anyone") || activeAssigneeFilterButton.includes("unassigned")) {
                                setActiveAssigneeFilterButton([user]);
                            } else if (activeAssigneeFilterButton.includes(user)) {
                                let a = [...activeAssigneeFilterButton];
                                const isAssigneeToDelete = (element) => element === user;
                                let idx = a.findIndex(isAssigneeToDelete);
                                let x = a.splice(idx,1);
                                setActiveAssigneeFilterButton(a);
                            } else {
                                let a = [...activeAssigneeFilterButton];
                                a.push(user);
                                setActiveAssigneeFilterButton(a);
                            }
                            let q = [...queryAssignees];
                            q.push(event.target.id);
                            setQueryAssignees(q);
                        }}>{titleCase(userNames[index])}</button>
                    ))}
                    {/* <span className={styles.buttonSpacer}> </span> */}
                    <button className={activeAssigneeFilterButton[0]==="anyone" ? `${styles.assigneeButton} ${styles.active}` : 
                            styles.assigneeButton} id="anyone" onClick={(event) => {
                        // let buttons = document.getElementsByClassName(styles.assigneeButton);
                        // for (let i = 0; i < buttons.length; i++) {
                        //     buttons[i].classList.remove('active');
                        // }
                        // event.target.classList.toggle('active');
                        if (activeAssigneeFilterButton.length === 1 && activeAssigneeFilterButton[0] === "anyone") setActiveAssigneeFilterButton([]);
                        else setActiveAssigneeFilterButton(["anyone"]);
                        setQueryAssignees([]);
                    }}>Anyone</button>
                    {/* <span className={styles.buttonSpacer}> </span> */}
                    <button className={activeAssigneeFilterButton[0]==="unassigned" ? `${styles.assigneeButton} ${styles.active}` : 
                            styles.assigneeButton} id="unassigned" onClick={(event) => {
                        if (activeAssigneeFilterButton.length === 1 && activeAssigneeFilterButton[0] === "unassigned") setActiveAssigneeFilterButton([]);
                        else setActiveAssigneeFilterButton(["unassigned"]);
                        setQueryAssignees([""]);
                    }}>Unassigned</button>
                </div>
                <br></br>
                <br></br>

                <label htmlFor="statusButtons">Status</label>
                <div className={styles.statusButtons}>
                    <button className={activeStatusFilterButton==="notCompletedFilter" ? `${styles.statusButton} ${styles.active}` : 
                            styles.statusButton} id="notCompletedFilter" onClick={(event) => {
                        // let buttons = document.getElementsByClassName("statusButton");
                        // for (let i = 0; i < buttons.length; i++) {
                        //     buttons[i].classList.remove(styles.active);
                        // }
                        // event.target.classList.toggle(styles.active);
                        if (activeStatusFilterButton === "notCompletedFilter") setActiveStatusFilterButton("");
                        else setActiveStatusFilterButton("notCompletedFilter")
                        let q = {...newQuery};
                        q["completed"] = false;
                        setNewQuery(q);
                    }}>Not completed</button>
                    <span className={styles.buttonSpacer}> </span>
                    
                    <button className={activeStatusFilterButton==="completedFilter" ? `${styles.statusButton} ${styles.active}` : 
                            styles.statusButton} id="completedFilter" onClick={(event) => {
                        // let buttons = document.getElementsByClassName(styles.statusButton);
                        // for (let i = 0; i < buttons.length; i++) {
                        //     buttons[i].classList.remove(styles.active);
                        // }
                        // event.target.classList.toggle(styles.active);
                        if (activeStatusFilterButton === "completedFilter") setActiveStatusFilterButton("");
                        else setActiveStatusFilterButton("completedFilter")
                        let q = {...newQuery};
                        q["completed"] = true;
                        setNewQuery(q);
                    }}>Completed</button>
                    <span className={styles.buttonSpacer}> </span>

                    <button className={activeStatusFilterButton==="anyStatusFilter" ? `${styles.statusButton} ${styles.active}` : 
                            styles.statusButton} id="anyStatusFilter" onClick={(event) => {
                        // let buttons = document.getElementsByClassName(styles.statusButton);
                        // for (let i = 0; i < buttons.length; i++) {
                        //     buttons[i].classList.remove(styles.active);
                        // }
                        // event.target.classList.toggle(styles.active);
                        if (activeStatusFilterButton === "anyStatusFilter") setActiveStatusFilterButton("");
                        else setActiveStatusFilterButton("anyStatusFilter")
                        let q = {...newQuery};
                        delete q["completed"];
                        setNewQuery(q);
                    }}>Any status</button>
                </div>
                <br></br>
                <br></br>
                
                <label htmlFor="deadlineButtons">Deadline</label>
                <div className={styles.deadlineButtons}>
                    <button className={activeDeadlineFilterButton==="pastFilter" ? `${styles.deadlineButton} ${styles.active}` : 
                            styles.deadlineButton} id="pastFilter" onClick={(event) => {
                        // let buttons = document.getElementsByClassName(styles.deadlineButton);
                        // for (let i = 0; i < buttons.length; i++) {
                        //     buttons[i].classList.remove('active');
                        // }
                        // event.target.classList.toggle('active');
                        if (activeDeadlineFilterButton === "pastFilter") setActiveDeadlineFilterButton("");
                        else setActiveDeadlineFilterButton("pastFilter");
                        let q = "$lt"
                        setQueryDeadline(q);
                    }}>Past</button>
                    <span className={styles.buttonSpacer}> </span>

                    <button className={activeDeadlineFilterButton==="todayFilter" ? `${styles.deadlineButton} ${styles.active}` : 
                            styles.deadlineButton} id="todayFilter" onClick={(event) => {
                        // let buttons = document.getElementsByClassName(styles.deadlineButton);
                        // for (let i = 0; i < buttons.length; i++) {
                        //     buttons[i].classList.remove('active');
                        // }
                        // event.target.classList.toggle('active');
                        if (activeDeadlineFilterButton === "todayFilter") setActiveDeadlineFilterButton("");
                        else setActiveDeadlineFilterButton("todayFilter");
                        let q = "$eq"
                        setQueryDeadline(q);
                    }}>Today</button>
                    <span className={styles.buttonSpacer}> </span>

                    <button className={activeDeadlineFilterButton==="futureFilter" ? `${styles.deadlineButton} ${styles.active}` : 
                            styles.deadlineButton} id="futureFilter" onClick={(event) => {
                        // let buttons = document.getElementsByClassName(styles.deadlineButton);
                        // for (let i = 0; i < buttons.length; i++) {
                        //     buttons[i].classList.remove('active');
                        // }
                        // event.target.classList.toggle('active');
                        if (activeDeadlineFilterButton === "futureFilter") setActiveDeadlineFilterButton("");
                        else setActiveDeadlineFilterButton("futureFilter");
                        let q = "$gt"
                        setQueryDeadline(q);
                    }}>Future</button>
                    <span className={styles.buttonSpacer}> </span>

                    <button className={activeDeadlineFilterButton==="anyDeadlineFilter" ? `${styles.deadlineButton} ${styles.active}` : 
                            styles.deadlineButton} id="anyDeadlineFilter" onClick={(event) => {
                        // let buttons = document.getElementsByClassName(styles.deadlineButton);
                        // for (let i = 0; i < buttons.length; i++) {
                        //     buttons[i].classList.remove('active');
                        // }
                        // event.target.classList.toggle('active');
                        if (activeDeadlineFilterButton === "anyDeadlineFilter") setActiveDeadlineFilterButton("");
                        else setActiveDeadlineFilterButton("anyDeadlineFilter");
                        setQueryDeadline("");
                    }}>Any deadline</button>
                </div>
                <br></br>
                <br></br>

                <div className={styles.submitButtons}>
                    <button className={styles.modalButton} onClick={() => {
                        if (queryAssignees.length > 0) {
                            if (queryAssignees.length === 1 && queryAssignees[0] === "unassigned") newQuery["assignee"] = "";
                            else newQuery["assignee"] = {"$in":queryAssignees};
                        }
                        
                        // if (queryDeadline !== "") {
                        //     newQuery["deadline"] = {queryDeadline: Date()}
                        // }
                        if (queryDeadline === "$gt") {
                            newQuery["deadline"] = {"$gt": Date()}
                        } else if (queryDeadline === "$eq") {
                            newQuery["deadline"] = {"$eq": Date()}
                        } else if (queryDeadline === "$lt") {
                            newQuery["deadline"] = {"$lt": Date()}

                        }
                        
                        setQuery(newQuery);
                        setNewQuery({});
                        setQueryAssignees([]);       
                        setQueryDeadline("");                     
                        setShowFilter(false)}}>Apply Filters</button>
                </div>

            </Modal>
            
        <div className={styles.listContainer}>
            <div className={styles.listHeader}>
                <span>
                    <h3 className={styles.listColumn}>Task</h3>
                    <h3 className={styles.listColumn}>Assignee</h3>
                    <h3 className={styles.listColumn}>Deadline</h3>
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
                /*<div className={styles.listItem} key={index}>*/
                <div className={task.assignee === userID ? `${styles.listItem} ${styles.activeUser}` : styles.listItem}>
                    <div className={[styles.listColumn, styles.task].join(" ")}>
                        <p>{task.name}</p>
                    </div>
                    <div className={[styles.listColumn, styles.assignee].join(" ")}>
                        <span className={styles.assignees}>
                            <p>{titleCase(task.assigneeName)}</p>
                        </span>
                        <span className={styles.rotate}>
                            <img id={task._id + 'Rotate'} src={task.rotate !== "none" ? rotateImage : blankImage} alt=" "></img> 
                            {/* <script>
                                if (rotatedTasks.includes(task._id)) {
                                    document.getElementById(task._id+'Rotate').src = "https://iili.io/HnsuCps.png"
                                    // document.getElementById(task._id+'Rotate').visibility = 'visible'
                                }
                            </script> */}
                        </span>
                    </div>
                    <div className={[styles.listColumn, styles.deadline].join(" ")}>
                        <p>{convertDeadline(task.deadline)}</p>
                    </div>
                    <span className={[styles.listColumn, styles.taskButtons].join(" ")}>
                        <span className={styles.taskButton}>
                            <img className={styles.editButton} id={task._id + 'Edit'} src="https://iili.io/HC8ZzHQ.png" width="18px" height="20px" onClick={(event) => {
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
                        <span className={styles.taskButton}>
                            <img className={styles.deleteButton} id={task._id + 'Delete'} src="https://iili.io/HC8ZRx1.png" width="20px" height="20px" onClick={(event) => {
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
                        <span className={styles.taskButton}>
                            <img className={styles.checkButton} id={task._id + 'Check'} src="https://iili.io/HC8LA7V.png" width="20px" height="20px" onClick={(event) => {
                                let taskToEditID = task._id;
                                let endpoint = 'tasks/' + taskToEditID;

                                let new_tasks = [...tasks]
                                const isTaskToEdit = (element) => element._id === taskToEditID;
                                let idx = new_tasks.findIndex(isTaskToEdit);
                                
                                let taskToEdit = new_tasks[idx];
                                taskToEdit.completed = !taskToEdit.completed;
                                // console.log(taskToEdit.completed);
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
                        <button className={activeAssigneeEditButton===user ? `${styles.assigneeButton} ${styles.active}` : 
                        styles.assigneeButton} id={user} key={index} onClick={(event) => {
                            // event.target.classList.toggle('active');
                        
                            let t = {...taskToEdit};
                            if (activeAssigneeEditButton === user) {
                                t["assignee"] = null;
                                t["assigneeName"] = null;
                                setActiveAssigneeEditButton("");
                            } else {
                                t["assignee"] = user;
                                t["assigneeName"] = userNames[index];
                                setActiveAssigneeEditButton(user);
                            }
                            // let buttons = document.getElementsByClassName(styles.assigneeButton);
                            // for (let i = 0; i < buttons.length; i++) {
                            //     if (buttons[i].id !== event.target.id) buttons[i].classList.remove('active');
                            // }
                            setTaskToEdit(t);
                        }}>{titleCase(userNames[index])}</button>
                    ))}
                </div>
                <br></br>

                <label htmlFor="deadlineInput">Deadline (optional)</label><br></br>
                <input type="date" className={styles.deadlineInput} id="deadlineInputDateEdit" onChange={event => {
                    let t = {...taskToEdit}
                    t["deadlineDate"] = event.target.value;
                    setTaskToEdit(t)}}></input>
                <input type="time" className={styles.deadlineInput} id="deadlineInputTimeEdit" onChange={event => {
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

                <div className={styles.submitButtons}>
                    <button className={styles.modalButton} onClick={() => {
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

        <div className={styles.bottom}>
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
                        <button className={activeAssigneeCreateButton===user ? `${styles.assigneeButton} ${styles.active}` : 
                        styles.assigneeButton} id={user} key={index} onClick={(event) => {
                            // event.target.classList.toggle('active');
                            
                            let t = {...newTask};
                            if (activeAssigneeCreateButton === user) {
                                t["assignee"] = null;
                                t["assigneeName"] = null;
                                setActiveAssigneeCreateButton("");
                            } else {
                                t["assignee"] = user;
                                t["assigneeName"] = userNames[index];
                                setActiveAssigneeCreateButton(user);
                            }

                            // let t = {...newTask};
                            // if (event.target.classList[1] === 'active') {
                            //     t["assignee"] = user;
                            //     t["assigneeName"] = userNames[index];
                            // }
                            // else {
                            //     t["assignee"] = null;
                            //     t["assigneeName"] = null;
                            // }

                            // let buttons = document.getElementsByClassName(styles.assigneeButton);
                            // for (let i = 0; i < buttons.length; i++) {
                            //     if (buttons[i].id !== event.target.id) buttons[i].classList.remove('active');
                            // }
                            setNewTask(t);
                        }}>{titleCase(userNames[index])}</button>
                    ))}
                </div>
                <br></br>

                <label htmlFor="deadlineInput">Deadline (optional)</label><br></br>
                <input type="date" className={styles.deadlineInput} id="deadlineInputDate" onChange={event => {
                    let t = {...newTask}
                    t["deadlineDate"] = event.target.value;
                    setNewTask(t)}}></input>
                <input type="time" className={styles.deadlineInput} id="deadlineInputTime" onChange={event => {
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
                {/* <p className={newTask["name"] === undefined ? styles.visible : styles.hidden}>'Title' field is required.</p> */}
                <br></br>
                <br></br>

                <div className={styles.submitButtons}>
                    <button className={styles.modalButton} onClick={() => {
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
                                setActiveAssigneeCreateButton("");
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
            <button className={styles.createTaskButton} onClick={() => setShowCreate(true)}>Create Task</button>
        </div>
      </div>
    </Layout>
  );
}
}