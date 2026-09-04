# Decisions

Log the decisions that actually shaped this codebase — the ones where a real alternative existed and
you picked one. At least five entries. For each: what you chose, what you rejected, and why. At least
one entry must be a decision you later reversed — say what changed your mind. It can be any entry
below, not necessarily the last one; add a **Later reversed:** line to whichever one it is.

## Decision 1

- **Chose:**:  made Assignment its own table with its own fields for many to many techie to job relation, instead of just letting prisma auto handle the many-to-many between User and Job via relations
- **Rejected:** : using join queries on techie and job, 
- **Why:**: becoz join on both tables is a frequent operation here in this app, and it will become expensive, so its better to just make a permanent table Assignment to represenet the job to techie many to many relation..., also we can add additional fields like updated_at, or removed_at directly into the table, which makes it much easier to get and update these infos and its more intuitive than the later approach

## Decision 2

- **Chose:**: jwt vs session based auth, i chose the jwt, 
- **Rejected:** : not using session tokens here
- **Why:**: jwt tokens are stateless, server dont have to maintain a copy of the token in db.. which means less data to store and less moving parts and logic.. making things simpler, the tokens can be set into cookies or as localstorage or session storage inthe browser

## Decision 3

This decision is about the no double booking and no overlapping in assignment that is the #4 goal we have , and is the core requirement of the app.  here i have written in concise choice i made
- **Chose:**: To prevent race condition for the overlapping and assignemnt logic, i decided to use atomic single queries along with transactions (to achieve write consistency) instead of first reading then updating (READ COMMIT type of race condition) , and one more MOST important things is EXCLUDE constraint which i just learnt more about, EXCLUDE acts as row level comparison which decides if a insert into a table follows a certain logic or rule, like not havnig the overlapping window in our case, this is much much better because it will outright reject any attempt to insert a overlapping assignment directly at the DB level , not just app level. so its impossible to do so, but for this, i have to update the schema a little bit, we have to denormalise to add the timing window and duration into the assignment row too for this to work
- 
- **Rejected:**: there was one more solution i found when researching more about preventing raceconditions, and that is to change the isolation level in postgres itself to Serializable isolation level.. 
- 
- **Why:** the default isolation level is READ COMMITED, means two transactions cannot 'read' each others unfinished changes, but this does not prevent them from assigning two jobs to a same person at a same , the other method is use elevated isolation privileges, like 'Serializable' isolation level, this is the strctest isolation level in pg, if pg finds two transactions reading or using same data, it outrights blocks one transactions and returns a serializable error, forcing the client to try again when the data is free to use, its good and prevents race condiitino, but there are issues with this approach, we have to now add logic to handle the serilizable errors and return safe errors on UI, it adds performance overheads and excess ram and cpu utilizations to check these things which is not worth it, also if there is high write workloads, repeated failures will give a bad UI feedback

## Decision 4

- **Chose:**: i have to decided for a design change in the client ui for job assignment, we now have a check box for unassigned tasks, clicking the checkbox allows us to assign multiple jobs and select a technician from a floating drop down menu in the bottom.that hits the /jobs/bulk-assign  with the jobids and technician id, and returns the result for each job id, if its success or failure
- **Rejected:**: assign technician button with a dropdown for each job 
- **Why:**, this design is more intuitive and easy to understand for the user

## Decision 5

- **Chose:**
- **Rejected:**
- **Why:**
