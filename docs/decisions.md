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

- **Chose:**
- **Rejected:**
- **Why:**

## Decision 3

- **Chose:**
- **Rejected:**
- **Why:**

## Decision 4

- **Chose:**
- **Rejected:**
- **Why:**

## Decision 5

- **Chose:**
- **Rejected:**
- **Why:**
