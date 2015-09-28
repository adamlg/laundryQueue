check washer queue for next washer load time - check whether start time is available; if not, go to next time
can move items into empty earlier time slots if that slot index > dropoff time.
not later time slots, since loads will be placed at latest possible time for them to be washed/dried.
check dryer queue for dryer load time after earliest washer load time

check dryer queue to see when a dryer is free for 2 hours
check washer queue to see when a washer is free before calculated dryer load time


when start time is selected, find available slots and hide end times
when end time is selected, find available slots and hide start times
when both start and time are selected, display button for accepting time
on accept click, accept correct number of latest possible availabilities