# Architecture

Answer each of these, in your own words, once the system has taken real shape.

- What are the moving pieces, and how do they talk to each other?
- Where does each piece run?
- What is the request path for one representative user action, end to end?
- What did you decide *not* to build, and why?


Heres the complete explaination of the codebase, i will keep it as descriptive as possible

## 1, The moving peices
the app is divided into 3 parts,client, server and a db side (postgresql provided by neonDB free tier)
the 2 parts clients and server is where most of the action takes place, and these modules communicate via REST apis
server provides REST apis created using Express.js and client use these to communicated and get or post or update or delete data or info 

now the design,
a. The server is divided into modules...,
8 modules in total (alerts module is not implemented yet at the time of writing, i may not be able to finish it )
each module has 4 layers, 

starting from the lowest layer is Repository that directly interacts with the db via Prisma ORM, it has get, find funcrtions, or update, add functions using prisma as per app needs
then comes the service layer, here the actual app logic lives, like how assignment works, or how events are creted, all the logic of each module 
then the controller, these are the get ,post functions of express that uses service layer inside it, as a design choice we must never write logic inside app controller
routes layer, here we define and attach controllers to routes in express
andfinally import these routes into main app.ts file in root to expose

apart from that we have a middleware that capture and verify jwt token and attaches the derived user object into the request body for further use by routers for authorzation control

this design is called as Clean architecture (only a small subset of it), and i like this way of backend design

b. The client lives in /client folder, and is a simple React application, with 5 pages, Dashboard,Login, Jobs,MyJobs and JobDetailPage
besides these pages, it has a /api folder that has a client.js that acts as a abstract api wrapper to make sure for every request we automatically attach the token,\
and other functions to query jobs, dashboard, users etc...

besides that client is simple, instead of creating many loading states and all that, im using react query to help in data fetching and state management, it also helps to cache the fetch responses

## 2. Where does each peice run

Client is deployed on vercel
Server deployed onto Render as a web service
and postgresql instance is provided by neonDB free tier

## 3. A user happy path

for example, a user with dispatcher privelege attempts to assign a technician with technician id lets say.. #tid to a job with job id #jid, but that technician already has a booked slot in that range,.. it goes like this

i assume dispatcher is logged in, and has a job available and atleast one technician in db already there..
+ now, the client selects a tecnician using the dropdown with technician id #tid and press 'Assign' button
+ it hits backend_url/api/jobs/#jid/assignments with a POST request with a technicianId:#tid as payload and obviously the auth token info,
+ the assignment controller is now responsible for handling this request, u can check in assignments.routes.ts line 9 and app.ts line 19
+ now the assignement controleer parses the technician id, and the user (attached here by our middleware), and parses the job id from the url
+ now it calls a method assignTechnician from the service layer, that takes all these 3 params as input for further logic
+ now in the service layer the logic starts, first the function checks if a job with this jobid exists and not archived (soft deleted) as assignment wont be possible in that case
+ if the above is not true, it moves forward, now we use a helper function getWindow that combines the date and time of a job id into a single date object, and returns the starting and ending window of a job as {start, end}
+ then a findActiveAssignments helper function is used to fnid all the othher active assignments of the same technician that has to be checked for the conflict
+ the windowsOverlap function now checks for the iverlap condition, which is simply, aStart < bEnd && aEnd > bStart, so for example a job is already booked for 10-11, and we try to assign 10:30-11:30, it will result as conflict.. remember that we are not checking for equalty so back to back assignments are treated as a conflict here
+ after the condition passes, the repo function createAssignment records a new assignment for the technician 
+ and finally a timeline record is also created for 'assigned' event
+ all of these operations works in a single transactional unit, so if one of it fails, any other operation will also be rolled back to make sure its consistent
+ in case of errors, for ex if the window finds a conflict, a error OVERLAP_MESSAGE is returned
+ also in the case the db EXCLUDE constraint (i discussed about this in plan.md and in descisions.md too) fails, it returns the same error message to client

## 4. what did u decide not to build ?
the job windo resheduling, i may have to skip it for now.. i know how it works and how i can implment it, but that will require some changes in the current jobs modules, and i think i might not be able to complete it by evening today, so its best to skip it for good and focus on other modules to refine them