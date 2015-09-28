angular.module('laundryQueue',[])
.controller('mainCtrl', function($scope){

	$scope.initialize = function(){
		$scope.selectedStart = null
		$scope.selectedEnd = null
		$scope.numOfLoads = 1

		//these are just arrays of times used to display options to the users.  They are not the official washer and dryer queues that track which timeslots are already taken (those are named "officialWasherQueue" and "officialDryerQueue").
		$scope.startTimes = Array.apply(null,Array(24)).map(function(val,ind){return {startHour:ind}})
		$scope.endTimes = Array.apply(null,Array(24)).map(function(val,ind){return {endHour:ind+3}})
	}
	
	$scope.initialize()

	//this dynamically updates the available times based on user input.
	$scope.$watch('numOfLoads', function(){
		if(+$scope.numOfLoads > 120) $scope.numOfLoads = 120
		$scope.endTimes = findAvailability(+$scope.numOfLoads || 1, ($scope.selectedStart || 0))
		$scope.startTimes = findAvailability(+$scope.numOfLoads || 1, ($scope.selectedEnd || 26), 'end')
	})

	//this updates the selected start time, for schedule calculations.
	$scope.setStart = function(hour){
		if($scope.selectedStart !== hour) {
			$scope.selectedStart = hour
		} else {
			$scope.selectedStart = null
		}

		//if no start time is selected, provide all possible start times.
		if($scope.selectedStart === null) hour = 0
		$scope.endTimes = findAvailability(+$scope.numOfLoads || 1, hour)
	}

	//this updates the selected end time, for schedule calculations.
	$scope.setEnd = function(hour){
		if($scope.selectedEnd !== hour) {
			$scope.selectedEnd = hour
		} else {
			$scope.selectedEnd = null
		}

		//if no end time is selected, provide all possible end times.
		if($scope.selectedEnd === null) hour = 26
		$scope.startTimes = findAvailability(+$scope.numOfLoads || 1, hour, 'end')
	}

	//class with startHour and endHour
	function Availability(startHour,endHour){
		this.startHour = startHour
		this.endHour = endHour
	}

	//returns an array of all remaining availability structures that can possibly be selected
	function schedule(numOfLoads){
		var timeSlots = officialWasherQueue.map(function(val,ind){return ind})

		function concat(a,b){return a.concat(b)}

		return timeSlots.map(function(val){return findAvailability(numOfLoads,val)}).reduce(concat)
	}

	//returns an array of availability structures, based on whether user specified start or end time
	function findAvailability(numOfLoads,time,startOrEnd){
		var time = time || 0

		//if user specifies end time, start time must be calculated.
		if(startOrEnd==='end'){
			return findDropoffTimes(numOfLoads,time)

		} else {

			//if user specifies dropoff time, end time must be calculated.
			//this is the earliest possible pickup time.  all times afterward are necessarily available as well, since if they are finished early they can just sit around until customer gets them.
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

	}

	//these could be arrays of counters right now, but this is an array of arrays so that in future, we can store entire objects with ID info in the queue.
	var officialWasherQueue = Array.apply(null,Array(24)).map(function(){return []})
	var officialDryerQueue = Array.apply(null,Array(26)).map(function(){return []})

	//might be handy for debugging
	function resetQueues(){
		officialWasherQueue = Array.apply(null,Array(24)).map(function(){return []})
		officialDryerQueue = Array.apply(null,Array(26)).map(function(){return []})
	}

	//checks whether washer time is available.
	function checkWasherTime(start,washerQueue){
		return washerQueue[start].length < 7
	}

	//checks whether dryer time is available.
	//this function is not used anymore, since it does not account for time shifting
	function checkDryerTime(start,dryerQueue){
		return (dryerQueue[start].length < 10) && (dryerQueue[start+1].length < 10)
	}

	//finds earliest possible pickup time for a single load of laundry, based on when it is dropped off, tracked with the "start" variable.
	function findPickupTime(start,washerQueue,dryerQueue){

		//if that time is fully occupied, check next possible time
		while(!checkWasherTime(start,washerQueue) && start<washerQueue.length-1) {
			start++
		}

		//if no times available, return null
		if(!washerQueue[start] || !checkWasherTime(start,washerQueue)) return null
		
		//update temp queue
		washerQueue[start].push(1)

		//move on to dryer calculation
		start++

		//the rest of this is basically the same as above, except adjusted for the dryers' two-hour run time.
		var dryerHoursFound = []
		while(dryerHoursFound.length < 2 && start<dryerQueue.length) {
			if(dryerQueue[start].length < 10) dryerHoursFound.push(start)
			start++
		}
		
		//if we couldn't find a second dryerHour, return null.
		if(dryerHoursFound.length < 2) return null
		
		//dryer is now occupied for two hours
		dryerQueue[dryerHoursFound[0]].push(1)
		dryerQueue[dryerHoursFound[1]].push(1)

		//earliest pickup time is one hour after load is finished in dryer
		return dryerHoursFound[1]+1
	}

	//user specifies dropoff time and number of loads
	function findPickupTimeForMultipleLoads(num, start){
		
		var results = []

		//create temp queue, so we can fill time slots for calculations without affecting actual queue
		//have to slice each individual array to avoid object-pointer problems
		var washerQueue = officialWasherQueue.map(function(arr){return arr.slice()})
		var dryerQueue = officialDryerQueue.map(function(arr){return arr.slice()})
		
		//while loop continues if the results array is not full and we're still looking at times during this single day.
		while(results.length<num && start<dryerQueue.length){
			var foundTime = findPickupTime(start,washerQueue,dryerQueue)

			//if no pickup time is found, just end the while loop.
			if(!foundTime) break
			results.push(foundTime)
		}

		//return pickup time that accomodates all the items being dropped off - in other words, the latest time in our array of num results.  if there aren't enough available slots, return null.
		return results.length === num ? results.slice(-1)[0] : null
	}

	//user specifies a pickup time and number of loads
	function findDropoffTimes(num, end){

		var times = officialWasherQueue.slice(0,end-2).map(function(val,ind){
			//find pickup times for each possible starting time, and create availabilities if found
			return (findPickupTimeForMultipleLoads(num, ind) !== null && findPickupTimeForMultipleLoads(num, ind) <= end) ? new Availability(ind,end) : null
		})

		//broke times out like this because it was a bit easier to debug.
		times = times.filter(function(val){
			return !(val===null)
		})

		//return array of availabilities
		return times
	}

	function acceptAvailability(availability){
		//endHour is when customer can pick up clothes; we start at queue position one hour before instead of two, since we have to traverse our dryer queue and see how we can shift dryer usage.
		var queuePosition = availability.endHour - 1

		//when item is added to washer or dryer queue, if that spot in queue already has 7/10 items, move to earlier spot.
		var dryerHours = []
		while(dryerHours.length < 2 && queuePosition > 0){
			//need space in the queue, and the proper timing between dryerHours; it doesn't make sense to have 3 and 5 as dryer hours, since that would be a total of 3 hours of drying time and the time slot shift wouldn't work properly.
			if(officialDryerQueue[queuePosition].length < 10 && (dryerHours[0] ? ((queuePosition - dryerHours[0])%2 === -1) : true) ) { dryerHours.push(queuePosition) }
			queuePosition--
		}

		//update the two dryer hours in the official queue.
		officialDryerQueue[dryerHours[0]].push(1)
		officialDryerQueue[dryerHours[1]].push(1)

		//the washer queue is searched differently, since washers only take one hour and don't require usage shifting.
		while(officialWasherQueue[queuePosition].length === 7 && queuePosition > -1){
			queuePosition--
		}

		officialWasherQueue[queuePosition].push(1)
	}

	$scope.acceptMultipleAvailabilities = function(){
		var numOfLoads = +$scope.numOfLoads

		//for each load, accept the latest possible availability depending on user-specified times.
		while(numOfLoads){
			acceptAvailability(new Availability($scope.selectedStart,$scope.selectedEnd))
			numOfLoads--
		}

		$scope.initialize()
		$scope.endTimes = findAvailability(1, 0)
		$scope.startTimes = findAvailability(1, 26, 'end')

		//I recommend un-commenting these if you want to see what exactly is being stored.
		// console.log(officialWasherQueue)
		// console.log(officialDryerQueue)
	}

})
