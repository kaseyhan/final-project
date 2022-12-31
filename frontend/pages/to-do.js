import Head from 'next/head';
import Layout from '../components/layout';
import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'
import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Modal from "../components/modal";
import styles from '../styles/to-do.module.css'
import utils from '../components/utils'

export default function ToDo() {
    const BASE_URL = "http://localhost:4000/api";
    // const BASE_URL = "https://cs409-final-project.herokuapp.com/api";
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [currUser, setCurrUser] = useState({});
    const [home, setHome] = useState({});
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [userNames, setUserNames] = useState([]);
    const [query, setQuery] = useState({});
    const [newQuery, setNewQuery] = useState({});
    const [queryAssignees, setQueryAssignees] = useState([]);
    const [queryDeadline, setQueryDeadline] = useState("");
    const [sortBy, setSortBy] = useState("deadline");
    const [sortOrder, setSortOrder] = useState("asc");
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [newTask, setNewTask] = useState({});
    const [taskToEdit, setTaskToEdit] = useState({});
    const [activeStatusFilterButton, setActiveStatusFilterButton] = useState("");
    const [activeAssigneeFilterButton, setActiveAssigneeFilterButton] = useState([]);
    const [activeDeadlineFilterButton, setActiveDeadlineFilterButton] = useState("");
    const [activeAssigneeEditButton, setActiveAssigneeEditButton] = useState("");
    const [activeAssigneeCreateButton, setActiveAssigneeCreateButton] = useState("");

    const blankImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
    const rotateImage = "https://iili.io/HnsuCps.png";
    const uncheckedImage = "https://iili.io/HoB1ha1.png";
    const checkedImage = "https://iili.io/HoB1wyg.png";
    const api = axios.create({ baseURL: BASE_URL });

    let currUserID = null;

    useEffect(() => {
        const fetchData = async() => {
            try {
                if (typeof window !== 'undefined') currUserID = window.sessionStorage.getItem("userID");
                if (currUserID === "undefined" || currUserID == null) {
                    router.push('/login');
                } else {
                    const currUserGet = await api.get('users/'+currUserID);
                    setCurrUser(currUserGet.data.data);

                    let homeID = currUserGet.data.data.home;

                    query["home"] = homeID;
                    let order = sortOrder === "asc" ? 1 : -1;
                    let sort;
                    if (sortBy === "name") sort = {name: order};
                    else if (sortBy === "deadline") sort = {"deadline": order};
                    else if (sortBy === "dateCreated") sort = {"dateCreated": order};
                    else if (sortBy === "assigneeName") sort = {"assigneeName": order};

                    let p = {
                        "params": {
                            "where": JSON.stringify(query),
                            "sort": JSON.stringify(sort)
                        }
                    }
                    const task_get = await api.get('tasks', p);
                    setTasks(task_get.data.data);
        
                    const home_get = await api.get('homes/'+homeID);
                    setHome(home_get.data.data);
                    
                    let q = {"home": homeID};
                    p = {
                        "params": {
                            "where": JSON.stringify(q)
                        }
                    }
                    const usersGet = await api.get('users',p);
                    let u = [];
                    let un = [];
                    for (let i = 0; i < usersGet.data.data.length; i++) {
                        u.push(usersGet.data.data[i]._id);
                        un.push(usersGet.data.data[i].name);
                    }
                    setUsers(u);
                    setUserNames(un)
                }
            } catch (error) {
                console.error(error);
            }
        }

        setIsLoading(true);
        fetchData().then(function(response) {
            setIsLoading(false);
        });
    }, [query,sortBy,sortOrder]);

    function convertDeadline(deadline) {
        if (deadline !== undefined && deadline !== null) return new Date(deadline).toString().substring(0,25);
        else return null;
    }

    function convertDeadlineYYYYMMDD(date) {
        if (date !== undefined && date !== null) return date.split('T')[0];
        else return null;
    }

    function convertTime(date) {
        // console.log(date)
        if (date !== undefined && date !== null) return date.split('T')[1].split('.')[0].substring(0,5);
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
                <select name="selectList" id="select" defaultValue={sortBy} onChange={event => {
                    setSortBy(event.target.value);}}>
                    <option value="name">Title</option>
                    <option value="deadline">Deadline</option>
                    <option value="dateCreated">Date Created</option>
                    <option value="assigneeName">Assignee</option>
                </select>
            </div>
            <div className={styles.radioButtons} >
                <input className={styles.rad} type="radio" value="asc" name="sort" checked={sortOrder==="asc" ? "checked" : false} onChange={event => {
                            setSortOrder(event.target.value);}}/> ascending
                <span className={styles.spacer}>     </span>
                <input className={styles.rad} type="radio" value="desc" name="sort" checked={sortOrder==="desc" ? "checked" : false} onChange={event => {
                            setSortOrder(event.target.value);}}/> descending
            </div>
            <div className={styles.rightButtons}>
                <button className={styles.filterButton} onClick={()=> setShowFilter(true)}>Filter Tasks</button>
                {/* <span>   </span>
                <button className="editRotationsButton">Edit Rotations</button> */}
            </div>
        </div>

        <Modal title="Filter Tasks" button="Apply Filters" onClose={() => setShowFilter(false)} show={showFilter}>
                <label htmlFor="assignees">Assignee </label>
                <br></br>
                <div id="assignees" className={styles.assigneeButtons}>
                    {users.map((user, index) => (
                        <button className={activeAssigneeFilterButton.includes(user) ? `${styles.assigneeButton} ${styles.active}` : 
                        styles.assigneeButton} id={user} key={index} onClick={(event) => {
                            let q = [...queryAssignees];
                            if (activeAssigneeFilterButton.includes("anyone") || activeAssigneeFilterButton.includes("unassigned")) {
                                // console.log("A")
                                setActiveAssigneeFilterButton([user]);
                                q = [user];
                            } else if (activeAssigneeFilterButton.includes(user)) {
                                // console.log("B")
                                let a = [...activeAssigneeFilterButton];
                                const isAssigneeToDelete = (element) => element === user;
                                let idx = a.findIndex(isAssigneeToDelete);
                                let x = a.splice(idx,1);
                                idx = q.findIndex(isAssigneeToDelete);
                                x = q.splice(idx,1);
                                setActiveAssigneeFilterButton(a);
                            } else {
                                // console.log("C")
                                let a = [...activeAssigneeFilterButton];
                                a.push(user);
                                setActiveAssigneeFilterButton(a);
                                q.push(event.target.id);
                            }
                            setQueryAssignees(q);
                        }}>{utils.toTitleCase(userNames[index])}</button>
                    ))}
                    {/* <span className={styles.buttonSpacer}> </span> */}
                    <button className={activeAssigneeFilterButton[0]==="anyone" ? `${styles.assigneeButton} ${styles.active}` : 
                            styles.assigneeButton} id="anyone" onClick={(event) => {
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
                <br></br>
                <div className={styles.statusButtons}>
                    <button className={activeStatusFilterButton==="notCompletedFilter" ? `${styles.statusButton} ${styles.active}` : 
                            styles.statusButton} id="notCompletedFilter" onClick={(event) => {
                        if (activeStatusFilterButton === "notCompletedFilter") setActiveStatusFilterButton("");
                        else setActiveStatusFilterButton("notCompletedFilter")
                        let q = {...newQuery};
                        q["completed"] = false;
                        setNewQuery(q);
                    }}>Not completed</button>
                    <span className={styles.buttonSpacer}> </span>
                    
                    <button className={activeStatusFilterButton==="completedFilter" ? `${styles.statusButton} ${styles.active}` : 
                            styles.statusButton} id="completedFilter" onClick={(event) => {
                        if (activeStatusFilterButton === "completedFilter") setActiveStatusFilterButton("");
                        else setActiveStatusFilterButton("completedFilter")
                        let q = {...newQuery};
                        q["completed"] = true;
                        setNewQuery(q);
                    }}>Completed</button>
                    <span className={styles.buttonSpacer}> </span>

                    <button className={activeStatusFilterButton==="anyStatusFilter" ? `${styles.statusButton} ${styles.active}` : 
                            styles.statusButton} id="anyStatusFilter" onClick={(event) => {
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
                <br></br>
                <div className={styles.deadlineButtons}>
                    <button className={activeDeadlineFilterButton==="pastFilter" ? `${styles.deadlineButton} ${styles.active}` : 
                            styles.deadlineButton} id="pastFilter" onClick={(event) => {
                        if (activeDeadlineFilterButton === "pastFilter") setActiveDeadlineFilterButton("");
                        else setActiveDeadlineFilterButton("pastFilter");
                        let q = "$lt"
                        setQueryDeadline(q);
                    }}>Past</button>
                    <span className={styles.buttonSpacer}> </span>

                    <button className={activeDeadlineFilterButton==="todayFilter" ? `${styles.deadlineButton} ${styles.active}` : 
                            styles.deadlineButton} id="todayFilter" onClick={(event) => {
                        if (activeDeadlineFilterButton === "todayFilter") setActiveDeadlineFilterButton("");
                        else setActiveDeadlineFilterButton("todayFilter");
                        let q = "$eq"
                        setQueryDeadline(q);
                    }}>Today</button>
                    <span className={styles.buttonSpacer}> </span>

                    <button className={activeDeadlineFilterButton==="futureFilter" ? `${styles.deadlineButton} ${styles.active}` : 
                            styles.deadlineButton} id="futureFilter" onClick={(event) => {
                        if (activeDeadlineFilterButton === "futureFilter") setActiveDeadlineFilterButton("");
                        else setActiveDeadlineFilterButton("futureFilter");
                        let q = "$gt"
                        setQueryDeadline(q);
                    }}>Future</button>
                    <span className={styles.buttonSpacer}> </span>

                    <button className={activeDeadlineFilterButton==="anyDeadlineFilter" ? `${styles.deadlineButton} ${styles.active}` : 
                            styles.deadlineButton} id="anyDeadlineFilter" onClick={(event) => {
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
                        
                        if (queryDeadline === "$gt") newQuery["deadline"] = {"$gt": Date()}
                        else if (queryDeadline === "$eq") newQuery["deadline"] = {"$eq": Date()}
                        else if (queryDeadline === "$lt") newQuery["deadline"] = {"$lt": Date()}
                        
                        setQuery(newQuery);
                        setNewQuery({});
                        // setQueryAssignees([]);       
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
                    case "name":
                        if (sortOrder === "asc") {
                            first = utils.toTitleCase(a.name);
                            second = utils.toTitleCase(b.name);
                        } else {
                            first = utils.toTitleCase(b.name);
                            second = utils.toTitleCase(a.name);
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
                    case "dateCreated":
                        if (sortOrder === "asc") {
                            first = Date.parse(a.dateCreated);
                            second = Date.parse(b.dateCreated);
                        } else {
                            first = Date.parse(b.dateCreated);
                            second = Date.parse(a.dateCreated);
                        }
                        break;
                    case "assigneeName":
                        if (sortOrder === "asc") {
                            first = utils.toTitleCase(a.assigneeName);
                            second = utils.toTitleCase(b.assigneeName);
                        } else {
                            first = utils.toTitleCase(b.assigneeName);
                            second = utils.toTitleCase(a.assigneeName);
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
                if (!first && !second) return 0;
                else if (first && !second) return -1;
                else if (!first && second) return 1;
                else if (first < second) return -1;
                else if (first > second) return 1;
                else return 0;
            }).map((task, index) => (
                <div className={task.assignee == currUserID ? `${styles.listItem} ${styles.activeUser}` : styles.listItem}>
                    <div className={[styles.listColumn, styles.task].join(" ")}>
                        <p>{task.name}</p>
                    </div>
                    <div className={[styles.listColumn, styles.assignee].join(" ")}>
                        <span className={styles.assignees}>
                            <p>{utils.toTitleCase(task.assigneeName)}</p>
                        </span>
                        <span className={styles.rotate}>
                            <img id={task._id + 'Rotate'} src={task.rotate !== "none" ? rotateImage : blankImage} alt=" "></img>
                        </span>
                    </div>
                    <div className={[styles.listColumn, styles.deadline].join(" ")}>
                        <p>{convertDeadline(task.deadline)}</p>
                    </div>
                    <span className={[styles.listColumn, styles.taskButtons].join(" ")}>
                        <span className={styles.taskButton}>
                            <img className={styles.editButton} id={task._id + 'Edit'} src="https://iili.io/HC8ZzHQ.png" width="18px" height="20px" onClick={(event) => {
                                let endpoint = 'tasks/' + tasks[index]._id;
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
                            <img className={styles.checkButton} id={task._id + 'Check'} src={task.completed ? checkedImage : uncheckedImage} width="20px" height="20px" onClick={(event) => {
                                let taskToEditID = task._id;
                                let endpoint = 'tasks/' + taskToEditID;

                                let new_tasks = [...tasks]
                                const isTaskToEdit = (element) => element._id === taskToEditID;
                                let idx = new_tasks.findIndex(isTaskToEdit);
                                
                                // let taskToEdit = new_tasks[idx];
                                let t = new_tasks[idx];
                                let taskToEdit = {name: t.name, home: t.home}
                                // taskToEdit.completed = !taskToEdit.completed;
                                taskToEdit.completed = !t.completed;
                                // if (taskToEdit.completed) {
                                //     delete taskToEdit.assignee;
                                //     delete taskToEdit.assigneeName;
                                // }

                                api.put(endpoint, taskToEdit).then(function(response) {
                                    let x = new_tasks.splice(idx,1);
                                    new_tasks.push(response.data.data);
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
                            setTaskToEdit(t);
                        }}>{utils.toTitleCase(userNames[index])}</button>
                    ))}
                </div>
                <br></br>

                <label htmlFor="deadlineInput">Deadline (optional)</label><br></br>
                <input type="date" className={styles.deadlineInput} id="deadlineInputDateEdit" defaultValue={convertDeadlineYYYYMMDD(taskToEdit.deadline)} onChange={event => {
                    let t = {...taskToEdit}
                    t["deadlineDate"] = event.target.value;
                    setTaskToEdit(t)}}></input>
                <input type="time" className={styles.deadlineInput} id="deadlineInputTimeEdit" defaultValue={convertTime(taskToEdit.deadline)} onChange={event => {
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
                <select id="selectRotationEdit" defaultValue={taskToEdit.rotate} onChange={event => {
                    let t = {...taskToEdit}
                    t["rotate"] = event.target.value;
                    setTaskToEdit(t);}}>
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select><br></br>
                <br></br>

                <label htmlFor="completed">Completed?</label>
                <input type="checkbox" id="completed" defaultChecked={taskToEdit.completed} onChange={event => {
                    let t = {...taskToEdit};
                    t["completed"] = event.target.value;
                    setTaskToEdit(t);}}></input>
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

                        let tt = {name: taskToEdit["name"], home: currUser.home};
                        if (taskToEdit["deadline"]) tt["deadline"] = taskToEdit["deadline"];
                        if (taskToEdit["rotate"]) tt["rotate"] = taskToEdit["rotate"];
                        if (taskToEdit["assignee"]) tt["assignee"] = taskToEdit["assignee"];
                        else tt["assignee"] = "";
                        if (taskToEdit["assigneeName"] && taskToEdit["assigneeName"] !== "unassigned") tt["assigneeName"] = taskToEdit["assigneeName"];
                        else tt["assigneeName"] = "unassigned";
                        if (taskToEdit["notes"]) tt["notes"] = taskToEdit["notes"];

                        console.log(tt);

                        let endpoint = 'tasks/' + taskToEdit._id;
                        api.put(endpoint, tt)
                          .then(function (response) {
                            // console.log(response);
                            let new_tasks = [...tasks];
                            const isTaskToEdit = (element) => element._id === taskToEdit._id;
                            let idx = new_tasks.findIndex(isTaskToEdit);
                            let x = new_tasks.splice(idx,1);
                            new_tasks.push(response.data.data);
                            setTasks(new_tasks);
                            setTaskToEdit({});
                            setActiveAssigneeEditButton("");
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
                            setNewTask(t);
                        }}>{utils.toTitleCase(userNames[index])}</button>
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
                    setNewTask(t);}}>
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
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
                                    home: currUser.home,
                                    deadline: newTask["deadline"],
                                    rotate: newTask["rotate"],
                                    assignee: newTask["assignee"],
                                    assigneeName: newTask["assigneeName"],
                                    notes: newTask["notes"]
                                }
                            } else {
                                tt = {
                                    name: newTask["name"],
                                    home: currUser.home,
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
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                            
                            setShowCreate(false)
                        } else {
                            console.log('name required')
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