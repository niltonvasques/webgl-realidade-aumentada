// ********************************************************
// ********************************************************
function startCamera( ){
	if (!navigator.getUserMedia) {
		document.getElementById("output").innerHTML = 
			"Sorry. <code>navigator.getUserMedia()</code> is not available.";
	}
	navigator.getUserMedia({video: true}, gotStream, noStream);
}

function gotStream(stream)  {
	if (window.URL) {   
		video.src = window.URL.createObjectURL(stream);   } 
	else {   
		video.src = stream;   
	}

	video.onerror = function(e) {   
		stream.stop();   
	};
	stream.onended = noStream;
}

// ********************************************************
// ********************************************************
function noStream(e) {
	var msg = "No camera available.";
	
	if (e.code == 1) {   
		msg = "User denied access to use camera.";   
	}
	document.getElementById("output").textContent = msg;
}



