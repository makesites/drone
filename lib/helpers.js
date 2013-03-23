
// Helpers

// - Simple round robin function...
function loadBalance( addresses ){
	// 
	// First, list the servers you want to use in your rotation.
	// this is an example, pass your address list through routes config
	//
	/*var addresses = [
	  {
		host: '123.456.7.01',
		port: 4001
	  },
	  {
		host: '123.456.7.02',
		port: 4002
	  }
	];*/
	//
	// On each request, get the first location from the list...
	//
	var target = addresses.shift();
	//
	// ...and then the server you just used becomes the last item in the list.
	//
	addresses.push(target);
	//
	// ...then proxy to the server whose 'turn' it is...
	//
	return target;
	
};
