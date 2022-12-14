#!/usr/bin/env python

import sys
import getopt
import http.client
import urllib
import json
import string
from random import randint
from random import choice
from datetime import date
from time import mktime

def usage():
    print('dbFill.py -u <baseurl> -p <port> -n <numUsers> -t <numTasks> -e <numEvents> -m <numHomes>')

def getUsers(conn):
    # Retrieve the list of users
    conn.request("GET","""/api/users?filter={"_id":1}""")
    response = conn.getresponse()
    data = response.read()
    d = json.loads(data)

    # Array of user IDs
    users = [str(d['data'][x]['_id']) for x in range(len(d['data']))]

    return users

def main(argv):

    # Server Base URL and port
    baseurl = "localhost"
    port = 4000

    # Number of POSTs that will be made to the server
    userCount = 50
    taskCount = 200
    homeCount = 15
    eventCount = 50

    try:
        opts, args = getopt.getopt(argv,"hu:p:n:t:e:m:",["url=","port=","users=","tasks=","events=","homes="])
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
        elif opt in ("-n", "--users"):
             userCount = int(arg)
        elif opt in ("-t", "--tasks"):
             taskCount = int(arg)
        elif opt in ("-e", "--events"):
             eventCount = int(arg)
        elif opt in ("-m", "--homes"):
             homeCount = int(arg)

    # Python array containing common first names and last names
    firstNames = ["james","john","robert","michael","william","david","richard","charles","joseph","thomas","christopher","daniel","paul","mark","donald","george","kenneth","steven","edward","brian","ronald","anthony","kevin","jason","matthew","gary","timothy","jose","larry","jeffrey","frank","scott","eric","stephen","andrew","raymond","gregory","joshua","jerry","dennis","walter","patrick","peter","harold","douglas","henry","carl","arthur","ryan","roger","joe","juan","jack","albert","jonathan","justin","terry","gerald","keith","samuel","willie","ralph","lawrence","nicholas","roy","benjamin","bruce","brandon","adam","harry","fred","wayne","billy","steve","louis","jeremy","aaron","randy","howard","eugene","carlos","russell","bobby","victor","martin","ernest","phillip","todd","jesse","craig","alan","shawn","clarence","sean","philip","chris","johnny","earl","jimmy","antonio","danny","bryan","tony","luis","mike","stanley","leonard","nathan","dale","manuel","rodney","curtis","norman","allen","marvin","vincent","glenn","jeffery","travis","jeff","chad","jacob","lee","melvin","alfred","kyle","francis","bradley","jesus","herbert","frederick","ray","joel","edwin","don","eddie","ricky","troy","randall","barry","alexander","bernard","mario","leroy","francisco","marcus","micheal","theodore","clifford","miguel","oscar","jay","jim","tom","calvin","alex","jon","ronnie","bill","lloyd","tommy","leon","derek","warren","darrell","jerome","floyd","leo","alvin","tim","wesley","gordon","dean","greg","jorge","dustin","pedro","derrick","dan","lewis","zachary","corey","herman","maurice","vernon","roberto","clyde","glen","hector","shane","ricardo","sam","rick","lester","brent","ramon","charlie","tyler","gilbert","gene","amy","anna","sarah","molly","emily","rachel","wendy","irene","sabrina","megan","emma","joanna","katie","kathy","tiffany","holly","leanne","lisa","jenny","jessie","christina","amanda","kelly","nancy","vanessa","veronica","betty","becky","rebecca","zoe","olivia","alice","isabella","erica","stephanie","michelle","lauren","claire","heather","alyssa","melissa","mary","jane","jill","samantha","lucy","mia","sophia","elizabeth","susan","linda","karen","jennifer","anne","jessica","ashley","angela","nicole","laura","diana","doris","maya","elena","aubrey","piper","alexis","alexandra","billie","ariana","nikki","suzanne","marie","connie","debbie","sharon","abby","abigail","grace","hailey","esther","izzy","denise","dana","clara","kathleen","cara","bailey","nellie","madison","maddie","lexi","leah","lacie","jackie","joan","gretchen","penny","patricia","patty","pam","bella","brittney","carrie","elle","ella","julia","kim","courtney","lindsey","natalie","taylor","tina","victoria","allison","eva","katherine","hillary","amber","nina","naomi","gabriella","bianca","natasha","maria","cindy","carol"]
    lastNames = ["smith","johnson","williams","jones","brown","davis","miller","wilson","moore","taylor","anderson","thomas","jackson","white","harris","martin","thompson","garcia","martinez","robinson","clark","rodriguez","lewis","lee","walker","hall","allen","young","hernandez","king","wright","lopez","hill","scott","green","adams","baker","gonzalez","nelson","carter","mitchell","perez","roberts","turner","phillips","campbell","parker","evans","edwards","collins","stewart","sanchez","morris","rogers","reed","cook","morgan","bell","murphy","bailey","rivera","cooper","richardson","cox","howard","ward","torres","peterson","gray","ramirez","james","watson","brooks","kelly","sanders","price","bennett","wood","barnes","ross","henderson","coleman","jenkins","perry","powell","long","patterson","hughes","flores","washington","butler","simmons","foster","gonzales","bryant","alexander","russell","griffin","diaz","hayes","gomez","kim","gupta","nichols","tanner","russo","park","chen","zhou","zhang","cho","chang","wang","li","shi","han","jeon","min","yang","satoshi","tanaka","patel","takahashi","noren","tran","nguyen","watkins","franklin","singh","jain","banks","pearson","walters","benson","fitzgerald","michaelson","wolf","garner","goodwin","huang","wu","gu","saunders","ferguson","warren","morello","ruiz","malone","hudson","woods","peters","buckley","fischer"]

    # Server to connect to (1: url, 2: port number)
    conn = http.client.HTTPConnection(baseurl, port)

    # HTTP Headers
    headers = {"Content-type": "application/x-www-form-urlencoded","Accept": "text/plain"}

    userIDs = []
    userNames = []
    userEmails = []
    passwords = []
    homes = {}

    for i in range(homeCount):
        letters = string.ascii_lowercase
        home_name = ''.join(choice(letters) for i in range(6))
        characters = string.ascii_lowercase + string.digits
        password = ''.join(choice(characters) for i in range(8))
        params = urllib.parse.urlencode({'name': home_name, 'password': password})

        # POST the home
        conn.request("POST", "/api/homes", params, headers)
        response = conn.getresponse()
        data = response.read()
        d = json.loads(data)

        # Store the home's id
        if '_id' in d['data']:
            homeID = str(d['data']['_id'])
            homes[homeID] = []
        else:
            print(data)
    

    # Loop 'userCount' number of times
    for i in range(userCount):

        # Pick a random first name and last name
        x = randint(0,99)
        y = randint(0,99)
        characters = string.ascii_lowercase + string.digits
        password = ''.join(choice(characters) for i in range(8))
        assigned = (randint(0,10) > 2)
        idx = randint(0,len(list(homes.keys()))-1)
        keys = list(homes.keys())
        assignedHome = keys[idx] if assigned else "none"
        params = urllib.parse.urlencode({'name': firstNames[x] + " " + lastNames[y], 'email': firstNames[x] + "@" + lastNames[y] + ".com",'password':password, 'home': assignedHome})

        # POST the user
        conn.request("POST", "/api/users", params, headers)
        response = conn.getresponse()
        data = response.read()
        d = json.loads(data)

        # Store the users id
        if '_id' in d['data']:
            userIDs.append(str(d['data']['_id']))
            userNames.append(str(d['data']['name']))
            userEmails.append(str(d['data']['email']))
            passwords.append(str(d['data']['password']))
            if assignedHome != "none":
                homes[assignedHome].append(str(d['data']['_id']))
        else:
            print(data)

    # Open 'tasks.txt' for sample task names
    f = open('tasks.txt','r')
    taskNames = f.read().splitlines()

    # Loop 'taskCount' number of times
    for i in range(taskCount):
        # Randomly generate task parameters
        assigned = (randint(0,10) > 2)
        completed = (randint(0,10) > 7)
        if completed:
            assigned = False
        home = list(homes.keys())[randint(0,len(list(homes.keys()))-1)]
        if len(homes[home]) == 0:
            assigned = False
        elif len(homes[home]) == 1:
            assignee = 0
        else:
            assignee = randint(0,len(homes[home])-1)
        assigneeID = homes[home][assignee] if assigned else ''
        assigneeName = userNames[userIDs.index(assigneeID)] if assigned else 'unassigned' # ???
        has_deadline = (randint(0,10)>3)
        if has_deadline:
            deadline = (mktime(date.today().timetuple()) + randint(86400,864000)) * 1000
        notes = "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
        rotate_options = ["none","daily","weekly","biweekly","monthly"]
        rotate = choice(rotate_options) if assigned else "none"
        if has_deadline:
            params = urllib.parse.urlencode({'name': choice(taskNames), 'home': home, 'deadline': deadline, 'assigneeName': assigneeName, 'assignee': assigneeID, 'completed': str(completed).lower(), 'notes': notes, 'rotate': choice(rotate)})
        else:
            params = urllib.parse.urlencode({'name': choice(taskNames), 'home': home, 'assigneeName': assigneeName, 'assignee': assigneeID, 'completed': str(completed).lower(), 'notes': notes, 'rotate': choice(rotate)})

        # POST the task
        conn.request("POST", "/api/tasks", params, headers)
        response = conn.getresponse()
        data = response.read()
        d = json.loads(data)

        if '_id' in d['data']:
            taskID = str(d['data']['_id'])
        else:
            print(data)

    f = open('events.txt','r')
    eventNames = f.read().splitlines()

    for i in range(eventCount):
        hosted = (randint(0,10) > 4)
        home = list(homes.keys())[randint(0,len(list(homes.keys()))-1)]
        if len(homes[home]) == 0:
            hosted = False
        elif len(homes[home]) == 1:
            host = 0
        else:
            host = randint(0,len(homes[home])-1)
        hostID = homes[home][host] if hosted else ''
        hostName = userNames[userIDs.index(hostID)] if hosted else 'none'
        start = (mktime(date.today().timetuple()) + randint(3600,864000)) * 1000
        end = start + randint(86400,864000) * 1000
        locations = ["", "kitchen", "living room", "my room"]
        num_guests = randint(0,10)
        guests = []
        # for j in range(num_guests):
        #     x = randint(0,99)
        #     y = randint(0,99)
        #     guests.append(firstNames[x]+" "+lastNames[y])
        notes = "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
        repeat = ["none","daily","weekly","biweekly","monthly"]
        params = urllib.parse.urlencode({'name': choice(eventNames), 'home': home, 'start': start, 'end': end, 'host': hostID, 'hostName': hostName, 'notes': notes, 'repeat': choice(repeat), 'location': choice(locations), 'guests': guests})
        # print(params)
        conn.request("POST", "/api/events", params, headers)
        response = conn.getresponse()
        data = response.read()
        d = json.loads(data)
        
        if '_id' in d['data']:
            eventID = str(d['data']['_id'])
        else:
            print(data)

    # Exit gracefully
    conn.close()
    print(str(userCount)+" users, "+str(taskCount)+" tasks, "+str(homeCount)+" homes, and "+str(eventCount)+" events added at "+baseurl+":"+str(port))
    # print(str(userCount)+" users and "+str(homeCount)+" homes added at "+baseurl+":"+str(port))


if __name__ == "__main__":
     main(sys.argv[1:])
