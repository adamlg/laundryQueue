//create class with startHour and endHour
function Availability(startHour,endHour){
	this.startHour = startHour
	this.endHour = endHour
}

//return an array of availability structures, probably for user to choose multiple start and end times
function findAvailability(numOfLoads,time,startOrEnd){

	if(startOrEnd==='end'){
		return findDropoffTimes(numOfLoads,time)
	} else {
		var earliestTime = findPickupTimeForMultipleLoads(numOfLoads,time)

		var times = officialDryerQueue.slice(earliestTime-1).map(function(val,ind){
			//find pickup times for each possible starting time, and create availabilities if found
			return new Availability(time,ind+earliestTime) //add one to account for end-of-hour vs. start-of-hour
		})

		//return array of availabilities
		return times
		
	}

	//user could specify either start time or end time
		//could just find all available times and filter by start > current hour, or something similar

	//could get an array of availabilities and slice based on numOfLoads
		//if numOfLoads = 4; avails.slice(4-1) since we assume the previous three spots will all be used

	//return array of new Availability()
	//when availability is accepted, add to washer and dryer queue
}

//return boolean on whether time is booked
function checkTime(time){

	//return true/false
}

//might not actually need these functions
function checkDryer(time){
	//do I need these parentheses?
	return (!!dryers[time] && !!dryers[time+1])
}

function useDryer(time){
	dryers[time]--
	dryers[time+1]--
}

function useWasher(time){
	washers[time]--
}

//might not need this storage
var washers = {}
var dryers = {}

for(var i = 0; i <=23; i++){
	washers[i] = 10
	dryers[i] = 7
}

dryers[24] = dryers[25] = 7

//these times represent the beginning of the hour; need to account for that when telling people about pickup times.
//when washer is occupied, decrement property
//when dryer is occupied, decrement property + next property

/*
general thoughts:
maybe we should have a queue of loads, and only start loads when needed:
	e.g., if someone drops off laundry at 0 and picks it up at 5, we can start it at 0, 1, or 2
	we can also wash it at 0 and dry it at 2, depending on what people need
	should i have a user dashboard, and an owner dashboard to illustrate this?


var queue = [] //array of arrays corresponding to pickup times - we will check the queue to see whether a time is available
//whenever a washer or dryer is empty, take next item from the queue; if the next item is empty, take items from queue for the hour after that, etc.

*/

function checkWasherTime(start,washerQueue){
	return washerQueue[start].length < 7
}

function checkDryerTime(start,dryerQueue){
	return (dryerQueue[start].length < 10) && (dryerQueue[start+1].length < 10)
}

function findPickupTime(start,washerQueue,dryerQueue){

	//if that time is fully occupied, check next possible time
	while(!checkWasherTime(start,washerQueue) && start<washerQueue.length) {
		start++
	}

	//if no times available, return null
	if(!(start<washerQueue.length)) return null
	
	//update temp queue
	washerQueue[start].push(1)
	start++

	while(!checkDryerTime(start,dryerQueue) && start<dryerQueue.length) {
		start++
	}
	
	if(!(start<dryerQueue.length)) return null
	
	//dryer is now occupied for two hours
	dryerQueue[start].push(1)
	dryerQueue[start+1].push(1)

	//earliest pickup time is two hours after load is placed in dryer
	return start+2
}

//user specifies dropoff time and number of loads
function findPickupTimeForMultipleLoads(num, start){
	//this will be useful for explaining queueing in readme.
//check washer queue for next washer load time - check whether start time is available; if not, go to next time
	//can move items into empty earlier time slots if that slot index > dropoff time.
	//not later time slots, since loads will be placed at latest possible time for them to be washed/dried.
//check dryer queue for dryer load time after earliest washer load time
	
	var results = []

	//create temp queue, so we can fill time slots for calculations without affecting actual queue
	//have to slice each individual array to avoid object-pointer problems
	var washerQueue = officialWasherQueue.map(function(arr){return arr.slice()})
	var dryerQueue = officialDryerQueue.map(function(arr){return arr.slice()})
	
	while(results.length<num && start<dryerQueue.length){
		var foundTime = findPickupTime(start,washerQueue,dryerQueue)
		if(!foundTime) break
		results.push(foundTime)
	}

	//return earliest pickup time
	return results.length === num ? results.slice(-1)[0] : null
}

function reset(){
	officialWasherQueue = Array.apply(null,Array(24)).map(function(){return []})
	officialDryerQueue = Array.apply(null,Array(26)).map(function(){return []})
}

//should this just be an array of counts, rather than of arrays?
var officialWasherQueue = Array.apply(null,Array(24)).map(function(){return []})
var officialDryerQueue = Array.apply(null,Array(26)).map(function(){return []})

// findPickupTimeForMultipleLoads(10,1)

//user specifies a pickup time and number of loads
function findDropoffTimes(num, end){
//check dryer queue to see when a dryer is free for 2 hours
//check washer queue to see when a washer is free before necessary dryer load time

	var times = officialWasherQueue.slice(0,end-2).map(function(val,ind){
		//find pickup times for each possible starting time, and create availabilities if found
		return findPickupTimeForMultipleLoads(num, ind) <= end ? new Availability(ind,end) : null
	})

	times = times.filter(function(val){
		return !(val===null)
	})

	//return array of availabilities
	return times
}

// function checkQueue(start,end){
// 	var slots = queue.slice(start,end+1).reduce(function(a,b){
// 		return a+b.length
// 	},0)

// 	//how do we compare that availability to washers, dryers, etc.?  do we need to at all, or just have one giant queue?
// 	//can we do this with trackers, rather than doing reduce every time?  - probably doesn't actually save much time.
// }

//write tests?



// findDropoffTimes(10,6)

function acceptAvailability(availability){
	var queuePosition = availability.endHour - 2

	//when item is added to queue, if that spot in queue already has 7/10 items, move to earlier spot
	while(officialDryerQueue[queuePosition].length === 10){
		queuePosition--
	}

	officialDryerQueue[queuePosition].push(1)

	queuePosition--

	while(officialWasherQueue[queuePosition].length === 7){
		queuePosition--
	}

	officialWasherQueue[queuePosition].push(1)
}