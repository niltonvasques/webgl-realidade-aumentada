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

function drawCorners(markers){
  var corners, corner, i, j;

  videoImageContext.lineWidth = 3;

  for (i = 0; i < markers.length; ++ i){
	corners = markers[i].corners;
	
	videoImageContext.strokeStyle = "red";
	videoImageContext.beginPath();

	for (j = 0; j < corners.length; ++ j){
	  corner = corners[j];
	  videoImageContext.moveTo(corner.x, corner.y);
	  corner = corners[(j + 1) % corners.length];
	  videoImageContext.lineTo(corner.x, corner.y);
	}

	videoImageContext.stroke();
	videoImageContext.closePath();
	
	videoImageContext.strokeStyle = "green";
	videoImageContext.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
  }
};

// ********************************************************
// ********************************************************
function updateScenes(markers){
	var corners, corner, pose, i;

	var solIndex = -1;
	for(var m = 0; m < markers.length; m++ ){
		if( markers[m].id == Marker.sol ){
			solIndex = m;	
		}
	}
  
	if (markers.length > 0 && solIndex != -1) {
		
		corners = markers[solIndex].corners;
		
		for (i = 0; i < corners.length; ++ i) {
			corner = corners[i];
			
			corner.x = corner.x - (canvas.width / 2);
			corner.y = (canvas.height / 2) - corner.y;
		}
		
		pose = posit.pose(corners);
		
		yaw 	= Math.atan2(pose.bestRotation[0][2], pose.bestRotation[2][2]) * 180.0/Math.PI;
		pitch 	= -Math.asin(-pose.bestRotation[1][2]) * 180.0/Math.PI;
		roll 	= Math.atan2(pose.bestRotation[1][0], pose.bestRotation[1][1]) * 180.0/Math.PI;
		
		rotMat.setIdentity();
		rotMat.rotate(yaw, 0.0, 1.0, 0.0);
		rotMat.rotate(pitch, 1.0, 0.0, 0.0);
		rotMat.rotate(roll, 0.0, 0.0, 1.0);
		
		transMat.setIdentity();
		transMat.translate(pose.bestTranslation[0], pose.bestTranslation[1], -pose.bestTranslation[2]);
		scaleMat.setIdentity();
		scaleMat.scale(modelSize, modelSize, modelSize);
		
		console.log("pose.bestError = " + pose.bestError);
		console.log("pose.alternativeError = " + pose.alternativeError);
	} else {
		transMat.setIdentity();
		rotMat.setIdentity();
		scaleMat.setIdentity();
		yaw 	= 0.0;
		pitch 	= 0.0;
		roll 	= 0.0;
	}
};

function drawScene(markers) {
	
	var modelMat = new Matrix4();
	var ViewMat = new Matrix4();
	var ProjMat = new Matrix4();
	var MVPMat 	= new Matrix4();


	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	if (!videoTexture.needsUpdate) 
		return;
	
	modelMat.setIdentity();
	ViewMat.setIdentity();
	ProjMat.setIdentity();
	ProjMat.setOrtho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
	
	MVPMat.setIdentity();
	MVPMat.multiply(ProjMat);
	MVPMat.multiply(ViewMat);
	MVPMat.multiply(modelMat);
		
	drawTextQuad(baseTexture, shaderBaseImage, MVPMat);
	
	updateScenes(markers);
   		
	ViewMat.setLookAt(	0.0, 0.0, 0.0,
    					0.0, 0.0, -1.0,
    					0.0, 1.0, 0.0 );
    
	ProjMat.setPerspective(40.0, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0);
	
	modelMat.setIdentity();
	modelMat.multiply(transMat);
	modelMat.multiply(rotMat);
	modelMat.multiply(scaleMat);
	
	MVPMat.setIdentity();
	MVPMat.multiply(ProjMat);
	MVPMat.multiply(ViewMat);
	MVPMat.multiply(modelMat);
	
	drawAxis(axis, shaderAxis, MVPMat);
}
