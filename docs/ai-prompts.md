# AI prompts

The prompts you actually used, in the order you used them, grouped by what you were trying to achieve. For each significant one: what you asked, what you got back, and what you had to correct.

Include at least one prompt that produced something wrong, and what you did about it.

If you did not use AI at all, say so here, and describe your process instead.

## <What you were trying to achieve>

### Prompt

### What you got

### What you corrected


Goal : 1. Scaffolding the project structure and init the stack
Prompt : "
Use @plan.md for context on what I'm building. I want a natural project structure — based on controller / service / repository design on the backend, so each layer has one clear job and seperation of concerns. 

On the frontend I'm using TanStack Query and React, so structure it around that and take cues from @plan.md. Give me the actual folder layout first, then a script with the commands to create it (folders, empty files, and the base npm installs) so I can run it in one go. Keep it simple — if something's missing I'll add it later.
"
Got: got a scafolld.sh with the desired folder structure
Corrections: no corrections requiredn at the moment, possibly later

Goal: 2. Creating seeding script for db
Prompt : 
"
    Prepare a seeding script for our database to insert users of both roles 'technician' and 'dispatcher', with hashed password (known), find context of user schema @schema.md
"
Got: got @src/db/seed.ts file
Corrections: ai was unable to get the connection db client code correct, as this one is the prisma latest version 7,and right now llm had no info about that, so i had to manually correct it by referring to the docs at 'https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/introduction'


Goal 3: to research about EXCLUDE constraint in pg, and get more ideas about preventing race conditions in pg
Prompt :
"
    Tell me the solutions about how to prevent race conditions in postgresql, and also about exclude constraint
"
got: got a info about different isolation levels in pg, select..for..update method  (pessimistic locking), atomic single queries and exclude constraint, i googled too


Goal 4: to quickly implement the assignment module, i took help from claude code, as i have already mentioned our research andplan we used behind the logic in @plan.md
Prompt":
"
    Take context from @plan.md and implement @src/modules/assignment based on the plan mentioned in the context, for schema information refer to @prisma/schema.prisma
"
got: got assignments modules done
corrections: missing types and some ts related issues

Goal 5: Server-side search, filter, sort, pagination on the job list
prompt : 
"
 replace the placeholder job list with the actual requirement 6 — text search,
status/technician/date filters, sorting, pagination with a total count, all server-side.
"
outcome: got working implementation for the filter operations
corrections: ts errors , it was rejecting undefined in the filters object 


Goal 6: integrate backend apis with a clean and useful UI 
prompt:
"
    take design context from @plan.md, and @README.md and improve the ui in @client/src/pages, api clients are already available for use in @client/src/api 
"
outcome: got Dashboardpage Ui with charts and stat cards, and myjobs, jobs queue pages in client side

Goal 7: integrate export to CSV functionality with the frontend,
prompt: 
"
    find the toCSV method in @server/src/modules/jobs/jobs.controller.js,integrate the api for /export into the @client/src/pages/JobsPage.jsx
"
outcome: got a export to csv button on dashboard with a day selector to be sent to api