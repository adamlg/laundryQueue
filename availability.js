//create class with startHour and endHour
function Availability(startHour,endHour){
	this.startHour = startHour
	this.endHour = endHour
}

//returns an array of all remaining availability structures that can possibly be selected
function schedule(numOfLoads){
	//looks like something in here is going past the end of the timeSlots array - once start=24, everything breaks
	var timeSlots = officialWasherQueue.map(function(val,ind){return ind})

	function concat(a,b){return a.concat(b)}

	return timeSlots.map(function(val){return findAvailability(numOfLoads,val)}).reduce(concat)
}

//returns an array of availability structures, based on whether user specified start or end time
function findAvailability(numOfLoads,time,startOrEnd){
	var time = time || 0

	if(startOrEnd==='end'){
		return findDropoffTimes(numOfLoads,time)
	} else {
		var earliestTime = findPickupTimeForMultipleLoads(numOfLoads,time)

		//if earliestTime is null, there are no times available; return an empty array.
		if(earliestTime===null) return []

		var availabilities = officialDryerQueue.slice(earliestTime-1).map(function(val,ind){
			//find pickup availabilities for each possible starting time, and create availabilities if found
			return new Availability(time,ind+earliestTime) //add one to account for end-of-hour vs. start-of-hour
		})

		//return array of availabilities
		return availabilities
		
	}

	//when availability is accepted, add to washer and dryer queue - at bottom of page
}

//return boolean - true if time is available, false if it is not
// function checkTime(time){
// 	return checkWasherTime(start,officialWasherQueue) && checkDryerTime(start+1,officialDryerQueue)
// }

function checkWasherTime(start,washerQueue){
	return washerQueue[start].length < 7
}

function checkDryerTime(start,dryerQueue){
	return (dryerQueue[start].length < 10) && (dryerQueue[start+1].length < 10)
}

function findPickupTime(start,washerQueue,dryerQueue){

	//if that time is fully occupied, check next possible time
	while(!checkWasherTime(start,washerQueue) && start<washerQueue.length-1) {
		start++
	}

	//if no times available, return null
	if(!washerQueue[start]) return null
	
	//update temp queue
	washerQueue[start].push(1)
	start++

	while(!checkDryerTime(start,dryerQueue) && start<dryerQueue.length-2) {
		start++
	}
	
	if(!dryerQueue[start+1]) return null
	
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

//these could be arrays of counters right now, but this is an array of arrays so that in future, we can store entire objects with ID info in the queue.
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

//create array of availabilities here, so we can start testing
for(var i = 0; i < 19; i++){
	for(var j = 0; j < 7; j++){
		acceptAvailability(new Availability(i,i+5))
	}
}
console.log(schedule(1))