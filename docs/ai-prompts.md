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