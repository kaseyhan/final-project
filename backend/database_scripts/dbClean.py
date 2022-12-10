#!/usr/bin/env python

"""
 * @file dbClean.py
 * Used in CS498RK MP4 to empty database of all users and tasks.
 *
 * @author Aswin Sivaraman
 * @date Created: Spring 2015
 * @date Modified: Spring 2015
 * @date Modified: Spring 2019
"""

import sys
import getopt
import http.client
import urllib
import json

def usage():
    print('dbClean.py -u <baseurl> -p <port>')

def getUsers(conn):
    # Retrieve the list of users
    conn.request("GET","""/api/users?select={"_id":1}""")
    response = conn.getresponse()
    data = response.read()
    d = json.loads(data)

    # Array of user IDs
    users = [str(d['data'][x]['_id']) for x in range(len(d['data']))]

    return users

def getTasks(conn):
    # Retrieve the list of tasks
    conn.request("GET","""/api/tasks?select={"_id":1}""")
    response = conn.getresponse()
    data = response.read()
    d = json.loads(data)

    # Array of user IDs
    tasks = [str(d['data'][x]['_id']) for x in range(len(d['data']))]

    return tasks

def getHomes(conn):
    # Retrieve the list of homes
    conn.request("GET","""/api/homes?select={"_id":1}""")
    response = conn.getresponse()
    data = response.read()
    d = json.loads(data)

    # Array of user IDs
    homes = [str(d['data'][x]['_id']) for x in range(len(d['data']))]

    return homes

def getEvents(conn):
    # Retrieve the list of events
    conn.request("GET","""/api/events?select={"_id":1}""")
    response = conn.getresponse()
    data = response.read()
    d = json.loads(data)

    # Array of user IDs
    events = [str(d['data'][x]['_id']) for x in range(len(d['data']))]

    return events

def main(argv):

    # Server Base URL and port
    baseurl = "localhost"
    port = 4000

    try:
        opts, args = getopt.getopt(argv,"hu:p:",["url=","port="])
    except getopt.GetoptError:
        usage()
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
             usage()
             sys.exit()
        elif opt in ("-u", "--url"):
             baseurl = str(arg)
        elif opt in ("-p", "--port"):
             port = int(arg)

    # Server to connect to (1: url, 2: port number)
    conn = http.client.HTTPConnection(baseurl, port)

    # Fetch a list of users
    users = getUsers(conn)

    # Loop for as long as the database still returns users
    while len(users):

        # Delete each individual user
        for user in users:
            conn.request("DELETE","/api/users/"+user)
            response = conn.getresponse()
            data = response.read()

        # Fetch a list of users
        users = getUsers(conn)
    print("finished users")
    # Fetch a list of tasks
    tasks = getTasks(conn)

    # Loop for as long as the database still returns tasks
    while len(tasks):

        # Delete each individual task
        for task in tasks:
            conn.request("DELETE","/api/tasks/"+task)
            response = conn.getresponse()
            data = response.read()

        # Fetch a list of tasks
        tasks = getTasks(conn)
    print("finished tasks")

    homes = getHomes(conn)
    while len(homes):
        for home in homes:
            conn.request("DELETE","/api/homes/"+home)
            response = conn.getresponse()
            data = response.read()
        homes = getHomes(conn)
    print("finished homes")

    events = getEvents(conn)
    while len(events):
        for event in events:
            conn.request("DELETE","/api/events/"+event)
            response = conn.getresponse()
            data = response.read()
        events = getEvents(conn)
    print("finished events")

    # Exit gracefully
    conn.close()
    print("All users, tasks, homes, and events removed at "+baseurl+":"+str(port))


if __name__ == "__main__":
     main(sys.argv[1:])
