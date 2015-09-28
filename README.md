
## Overview

Users can specify a number of loads of laundry (a minimum of 1 is always assumed, and there is a max of 120 per day), as well as pick-up and drop-off times, and laundryQueue will automatically filter choices based on existing customers.  If you need to pick up 10 loads of laundry at 5 P.M., laundryQueue will tell you how late it can be dropped off.  If you can drop off 5 loads of laundry at 10 A.M., laundryQueue will tell you how early it can be ready.  You always have the option of dropping it off earlier or picking it up later, too.

## Usage

Clone everything down and run bower install, to get the Angular library.  Then, just open up the view.html file and start entering data and clicking on possible times.  The queue is not persistent - if you need to reset it, just refresh the page.  

## How it works

The essential idea is that when a user selects options, those options are put into functions that check the washer and dryer queue.  By default the latest possible time is tried first, but if it's already full the next-latest time is tried.  That way if an actual laundromat were trying to schedule things, if they had empty washers or dryers they would always have the option of starting a load of laundry that is not scheduled to be finished until later.  In other words, if laundry must be put in no later than 12:00 to be finished on time, we could always put it in at 10:00 if a washer/dryer were empty.

Users can select drop-off times or pick-up times and see what's available; there is logic that uses the same basic functions to determine what spots in the queue are still available.  A temporary copy of the queue is also created to find out what times are available when multiple loads of laundry must be done at once.  That way I can add loads of laundry to the temporary schedule without affecting the official queue.

## Testing

A maximum of 120 loads of laundry can be done in a single day; any combination of loads of laundry that add up to 120 should enter the queue without any errors.  After 120 items are in the queue, there should not be any more times displayed.