# Plan

<!-- Answer each of these, in your own words.

- How did you break the work into sessions?
- What order did you build in, and why that order?
- What did you estimate versus what it actually took?
- What did you cut when you ran short?
 -->

A summary of problem statement and goals, for me to make sure i plan around it

A services company (plumbing/HVAC type stuff) runs everything on a paper sheet right now.dispatcher hands out jobs by memory, techs call in to find their next job, nobody has a record of what actually got done or what parts were used. 
And weh have to build a web app to fix that, dispatcher assigns jobs to techs without double-booking anyone, techs update their own job status from the field, and every completed job leaves behind proof of what was done.

2 agents -> dispatcher, techie (customer is not part of this problem as of now)

top 10 goals, i have to take care of,

1. Login multi tenant, for dispatcher and Techs (server enforced not just frontend logic)
2. CRUD for jobs (has things like customer name, site address etc)
3. parts used in a job completion (name, qty, which job and which Tech added it)
4. Job status rule , no skipping
5. a job can have multiple techs assigned, and a techie can have multiple jobs for a day (not overlapping, this is a core requirement)
6. as already stated in 5,dispatcher cant overlap a job onto a techie's alrady booked schedule
7. job search on dashboard, sorting, filter, pagination must be server enforced
8. dashboard for dispatchers, to see all stats,like todays jobs, assigned, unassigned counts etc
9. bulk assigning (5,6 must be upheld)
10. every job has a history / timeline that gets updated with each action of techie/dispatcher, like creating job, assigning, or changing status by techie etc...
this timeline MUST be IMMUTABLE

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

The Stack
 
im going to keep it simple but effective,

Frontend: ReactJS + Tailwind , simple reusable components, React Query for client side caching and state handline
Backend: Node + ExpressJS
DB: PostgreSQL (NeonDB), the data is relational in nature, like there is many-to many mappings, and constraints
ORM: Prisma for ORM and migrations
Auth: JWT to handle role based control and auth
Hosting: DB on Neon, Frontend on Vercel and Backend on Express
Tools: postman for api testing, claude code cli (with gemini as backend) for productivity

Order of building i expect :

1. DB Setup and schema (est : 2 hr)
   Having all tables and db ready will help keep track of the core app logic and data layer
   so if some change is required in db, it can be done early otherwise later it can become problematic

2. Set up the Auth and roles (est 2 hr)
    Next i can sort out the auth and jwt, this way we can make sure that we already have a seperation of ui and logic in frontend and backend from the start
    Right now i can keep it simple, email + password (bcrypt), verification or otps etc is not a requirement

    update:
    done, implemented jwt tokens and hashed passwords via bcrypt.. will soon add a detail info about each modules in the architeure.md

3. Jobs CRUD and parts (est 2 hr)
    this one is simple, we create apis for dispatcher to create jobs, classic rest apis nothing fancy, just we have to test it using postman before integration
    and make sure the roles are enforced properly,
    
    update:
    done, i implemented the role enforcement via requireRole() middleware, that checks if the requestor satisfies a required role policy before running the requested operation

4. the no double booking (est 2 hr)
    this is the main core requirement... the logic in itself is not difficult , we have to make sure the job must not overlap with another assigned job.., 
    but we have to ensure its atomic in execution and no race condition should happen here.... i can think of transactions in db and locking mechanisms right now..
    possibly it can change too...
    
    update :
    this is one of the best requirements in this assignement.... i used a 2 way solution for this, 
    first let me explain whats the challenge...
    1. there should be no overlap between the jobs for a technician at assignment
    2. there should not be double booking or race conditions for ex when 2 dispatchers try to assign at the same time..

    solution.., my 2 layer solution, is first, we use single query operation for both read and overlap checking, so that its atomic instead of doing a read and then update whic can cause dirty reads,
    and the second solutions is using a EXCLUDE constraint on the assignment table, adding this constraint, we add a condition that outright rejects any overlapping windo in the same technincian, the best part is , its now impossible to add 2 conflicting job assignments in the db, 
    the benefit of this is, we now have app + db level constraints
    i do have to update the schema a bit to add window time attributes directly into assignments otherwise this wont work..

    also just to mention, the overlapping logic is simple as below..

    A.start < B.end  AND  A.end > B.start , where A is a already assigned job and B is the conflicting job
    
    i researched about exclude to get more ideas thru google and ai about preventing race conditions in pg,


5.event log of jobs (est 1.5 hr)
    apis for updating job status , no skipping is allowed, and for a job to complete, a part must be used and a reson be specified, no editing allowed on this table 
    after a record is addded here

    done, ,, in line with the requirement, i have not added any update or delete apis for the the events, so its immutable at app level, there is no direct way to delete or update a event log for any role once its added to timeline

6. searching/filtering/pagination/sorting (est 2.5hr)
    on the jobs list for the dispatcher ,has to be done in the backend not on frontend, indexing on db can help make these operations quick

    done, used claude code to speed up the process, updated old list methods in job.repository has filter options based on search, status, technicianid, date, sortingby, sorting order, pagination, page size, and include or exclude archives (soft deletes)

7. bulk assigning and csv export (est 2 hr)
   bulk assigning, multiple jobs to the same techie, making sure no double booking happens, we have to avoid N + 1 problem here, 

8. dashboard (est 2 hr)
  apis to get stats like assigned, unassigned counts, running lates etc

  update: 
  for dashbaord , i have findbystatus, find unassigned, assigned, find by techninician id, and find all from some day this one is greate, here i used raw sql queries as in prisam we cant directly truncate a timestamp into day, and without that we wont be able to use group by on the desired day, also refer ti the comment i wrote in the dashboard/repository to understand

    update:
    apis are now integreated with the ui
    
9. alerts (est 1.5 hr)
    alerts for late runnning jobs, when the scheduled ending is already passed. we also have to add a dismissed_at to keep track of when a alert was dismissed by techie

10.  seed, test, deploy (est 2.5 hr)
    at last, we can seed test data, and test it manually and maybe write some tests if time is left... and finally deploy

11. integrate with client side
update: added a new module users to get technicians details for thhe frontend

i will keep making changes to the plan, and also add outcomes of each session as i progress