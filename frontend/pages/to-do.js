import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/layout';
// import axios from 'axios'
import React, {useState, useEffect} from 'react'
// import { useNavigate } from "react-router-dom";
// var data = require("../dummy_data.json");
// import fs from 'fs';
// const fs = require('fs')
import DummyData from '../../dummy_data';

export default function ToDoView() {
    // const BASE_URL = "https://api.themoviedb.org/3";
    // const api_key = "a71077045da085f16d93e6e06966e133";
    // const getImage = (path) => `https://image.tmdb.org/t/p/original/${path}`;
    // const defaultImage = "https://img.freepik.com/premium-vector/clapper-film-movie-icon-design_24877-23150.jpg";
    // const navigate = useNavigate();

    const [query, setQuery] = useState("");
    // const [tasks, setTasks] = useState([]);
    const [sortBy, setSortBy] = useState("deadline");
    const [sortOrder, setSortOrder] = useState("asc");

    // console.log(fs.readFileSync)

    // console.log(fs.readFileSync('../dummy_data.JSON', 'utf8'))

    // let sort = function (a,b) {
    //     let first;
    //     let second;
    //     switch (sortBy) {
    //         case "title":
    //             if (sortOrder === "asc") {
    //                 first = a.title;
    //                 second = b.title;
    //             } else {
    //                 first = b.title;
    //                 second = a.title;
    //             }
    //             break;
    //         case "deadline":
    //             if (sortOrder === "asc") {
    //                 first = a.deadline;
    //                 second = b.deadline;
    //             } else {
    //                 first = b.deadline;
    //                 second = a.deadline;
    //             }
    //             break;
    //         case "date_created":
    //             if (sortOrder === "asc") {
    //                 first = Date.parse(a.dateCreated);
    //                 second = Date.parse(b.dateCreated);
    //             } else {
    //                 first = Date.parse(b.dateCreated);
    //                 second = Date.parse(a.dateCreated);
    //             }
    //             break;
    //         case "assignee":
    //             if (sortOrder === "asc") {
    //                 first = a.assigneeName;
    //                 second = b.assigneeName;
    //             } else {
    //                 first = b.assigneeName;
    //                 second = a.assigneeName;
    //             }
    //             break;
    //         default:
    //             if (sortOrder === "asc") {
    //                 first = Date.parse(a.deadline);
    //                 second = Date.parse(b.deadline);
    //             } else {
    //                 first = Date.parse(b.deadline);
    //                 second = Date.parse(a.deadline);
    //             }
    //             break;
    //     }
    //     if (first && second) {
    //         if (first < second) return -1;
    //         else if (first > second) return 1;
    //         else return 0;
    //     } else if (first) return first;
    //     else return second;
    // };
    
    let tasks;

    useEffect(() => {        
        // const api = axios.create({ baseURL: BASE_URL });
        // setData([]);
        // for (let i = 1; i <= 5; i++) {
            // let tasks;
            // let sort_query = `${sortBy}.${sortOrder}`
            // if (query.length === 0) {
            //     tasks = api.get("discover/movie", {params: {api_key: api_key, page: i, sort_by:sort_query}});
            // } else {
            //     tasks = api.get("search/movie", {params: {api_key: api_key, page: i, query: query}});
            // }

            // tasks.then((res) => {
            //     setData((curr) => {
            //         return [
            //             ...curr,
            //             ...res.data.results,
            //         ];
            //     });
            // });
        // }

    }, [query,sortBy,sortOrder]);

    let user = '638ea4a74dea1620a451af54';
    let home = '638ea4a44dea1620a451aeff'
    try {
        let dummyData = DummyData()
        var json_data = JSON.parse(dummyData);
        tasks = json_data["tasks"];
        tasks = tasks.filter(function (el) {
            return el['home'] === home;
          });

    } catch (error) {
        console.log('err: ', error.message);
    }

        // tasks.sort(function(a,b) {
        //     let first;
        //         let second;
        //         switch (sortBy) {
        //             case "title":
        //                 if (sortOrder === "asc") {
        //                     first = a.title;
        //                     second = b.title;
        //                 } else {
        //                     first = b.title;
        //                     second = a.title;
        //                 }
        //                 break;
        //             case "deadline":
        //                 if (sortOrder === "asc") {
        //                     first = a.deadline;
        //                     second = b.deadline;
        //                 } else {
        //                     first = b.deadline;
        //                     second = a.deadline;
        //                 }
        //                 break;
        //             case "date_created":
        //                 if (sortOrder === "asc") {
        //                     first = Date.parse(a.dateCreated);
        //                     second = Date.parse(b.dateCreated);
        //                 } else {
        //                     first = Date.parse(b.dateCreated);
        //                     second = Date.parse(a.dateCreated);
        //                 }
        //                 break;
        //             case "assignee":
        //                 if (sortOrder === "asc") {
        //                     first = a.assigneeName;
        //                     second = b.assigneeName;
        //                 } else {
        //                     first = b.assigneeName;
        //                     second = a.assigneeName;
        //                 }
        //                 break;
        //             default:
        //                 if (sortOrder === "asc") {
        //                     first = Date.parse(a.deadline);
        //                     second = Date.parse(b.deadline);
        //                 } else {
        //                     first = Date.parse(b.deadline);
        //                     second = Date.parse(a.deadline);
        //                 }
        //                 break;
                        
        //         }
        //         console.log(first,second);
        //         if (first && second) {
        //             if (first < second) return -1;
        //             else if (first > second) return 1;
        //             else return 0;
        //         } else if (first) return first;
        //         else return second;
        // })

        // console.log(tasks)


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
                <span className="spacer"> </span>
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
                            first = Date.parse(a.deadline);
                            second = Date.parse(b.deadline);
                        } else {
                            first = Date.parse(b.deadline);
                            second = Date.parse(a.deadline);
                        }
                        break;
                        
                }
                if (first < second) return -1;
                else if (first > second) return 1;
                else return 0;
            }).map((task, index) => (
                <div className="listItem" key={index} onClick={() => {
                            // let link = `/mp2/details/${task.id}/next`; // FIX
                            /*navigate(link)*/}}>
                    <div className="listColumn task">
                        <p>{task.name}</p>
                    </div>
                    <div className="listColumn assignee">
                        <span className="assignees">
                            <p>{task.assigneeName}</p>
                        </span>
                    </div>
                    <div className="listColumn deadline">
                        <p>{task.deadline}</p>
                    </div>
                    <span className="listColumn taskButtons">
                        <span className="taskButton">
                            <img className="editButton" src="https://iili.io/HC8ZzHQ.png" width="18px" height="20px"></img>
                        </span>
                        <span className="taskButton">
                            <img className="deleteButton" src="https://iili.io/HC8ZRx1.png" width="20px" height="20px"></img>
                        </span>
                        <span className="taskButton">
                            <img className="checkButton" src="https://iili.io/HC8LA7V.png" width="20px" height="20px"></img>
                        </span>
                    </span>
                </div>
            ))}
        </div>

        <div className="bottom">
            <button className="createTaskButton" /*onClick={}*/>Create Task</button>
        </div>
      </div>
    </Layout>
  );
}