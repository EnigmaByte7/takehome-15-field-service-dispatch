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