# Schema
<!-- 
Answer each of these, in your own words.

- Table by table: what columns and types does each one have?
- Which relationships are one-to-many, and which are many-to-many?
- Which constraints are enforced by the database, and which by application code — and why did you draw the line there?
- What did you deliberately denormalise?
- What would break first if this had 100x the data? -->

Tables

starting with tables, i can think of these right now... 

User
id: uuid, PK
email: text, unique
password_hash: text
role: enum (dispatcher/technician)
created_at: timestamp


Job  (cretaed by role dispatcher)
id: uuid, PK
customer_name: text
site_address: text
description: text
priority: enum (low/medium/high/urgent)
scheduled_date: date
start_time: time
estimated_duration_minutes: int
status: enum (unassigned/assigned/en_route/on_site/completed)
completion_note: text, nullable
archived_at: timestamp, nullable
created_at: timestamp

Assignment
this is a crucial table,  this is the join table between users and jobs

id: uuid, PK
job_id: uuid, FK → Job
technician_id: uuid, FK → User
created_at: timestamp
removed_at: timestamp, nullable

PartUsed

id: uuid, PK
job_id: uuid, FK → Job
part_name: text
quantity: int
recorded_by: uuid, FK → User
created_at: timestamp

JobEvent this is a immutable log of jobs

id: uuid, PK
job_id: uuid, FK → Job
event_type: text (created/assigned/unassigned/status_changed/note_added/completed)
old_value: text, nullable
new_value: text, nullable
actor_id: uuid, FK → User
created_at: timestamp this is the history log, append only

Alert

id: uuid, PK
job_id: uuid, FK → Job
created_at: timestamp
dismissed_at: timestamp, nullable


Relationships: 
1. most importatn relation as we can already tell from the ps, is the many to many relation of techie and jobs.. each techie can have multiple jobs for a day (non overlapping)
and each job can have more than one techies too, so to handle this, we are createing a "Assignment" table, so we dont have to write join queires again and again, 
also in this way we can also store thgings like created_at and updated_at for the assignment in this table only... which makes it more natural

Assignment table, user (techie) -> assignment (one to many) and job to assignment (one to many), whichb makes it effectively a many to many between techie and job

2. job to partsUSed, or alerts or JobEvents are all one to many (easily understood by the ps)


db vs app level constraints

1. trivial things like unique emails, not null on required fields like address and client_name can be easily applied on the schema itself
2. but things like job complettion requiring a note or a part used, or the job status transition from Unassigned to Completed and there should not be any skipping or illegal
   movement must be handled as part of business logic only

Denormalizing

Yet to think on this

What can break over scaling

one thing im certain is the sorting/filtering/paging logic requires a lot of interaction with db and queries, so there is a possiblity of it breaking, unless we employ
particular indexing etc
