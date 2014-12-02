var EarthTexMarker 		= new Object( );
EarthTexMarker.id		= 2;
EarthTexMarker.rotMat 		= new Matrix4( );
EarthTexMarker.transMat 		= new Matrix4( );
EarthTexMarker.scaleMat 		= new Matrix4( );
EarthTexMarker.modelMat 		= new Matrix4( );
EarthTexMarker.normalMat 		= new Matrix4( );
EarthTexMarker.mvpMat 		= new Matrix4( );
EarthTexMarker.lightColor		= new Vector4( );
EarthTexMarker.angle 		= 0.0;
EarthTexMarker.modelSize 		= 50.0;

var ANGLE_STEP = 30;   // The increments of rotation angle (degrees)
var last = Date.now(); // Last time that this function was called
function updateEarthTex( markerId, pose ) {
	if( markerId != EarthTexMarker.id ){
		return;
	}

	var now = Date.now();   // Calculate the elapsed time
	var elapsed = now - last;
	last = now;
	// Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = EarthTexMarker.angle + (ANGLE_STEP * elapsed) / 1000.0;
	EarthTexMarker.angle = newAngle % 360;


	yaw 	= Math.atan2(pose.bestRotation[0][2], pose.bestRotation[2][2]) * 180.0/Math.PI;
	pitch 	= -Math.asin(-pose.bestRotation[1][2]) * 180.0/Math.PI;
	roll 	= Math.atan2(pose.bestRotation[1][0], pose.bestRotation[1][1]) * 180.0/Math.PI;

	EarthTexMarker.found = true;

	EarthTexMarker.rotMat.setIdentity();
	EarthTexMarker.rotMat.rotate(yaw, 0.0, 1.0, 0.0);
	EarthTexMarker.rotMat.rotate(pitch, 1.0, 0.0, 0.0);
	EarthTexMarker.rotMat.rotate(roll, 0.0, 0.0, 1.0);

	EarthTexMarker.transMat.setIdentity();
	EarthTexMarker.transMat.translate(pose.bestTranslation[0], pose.bestTranslation[1], -pose.bestTranslation[2]);

	EarthTexMarker.scaleMat.setIdentity();
	EarthTexMarker.scaleMat.scale( EarthTexMarker.modelSize, EarthTexMarker.modelSize, EarthTexMarker.modelSize );
}

function initEarthTexVertexBuffers(gl) {
	// Create a cube
	//    v6----- v5
	//   /|      /|
	//  v1------v0|
	//  | |     | |
	//  | |v7---|-|v4
	//  |/      |/
	//  v2------v3

	var vertices = new Float32Array([   // Vertex coordinates
	   1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
	   1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
	   1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
	  -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
	  -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
	   1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
	]);

	var normals = new Float32Array([   // Normal
	   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,     // v0-v1-v2-v3 front
	   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,     // v0-v3-v4-v5 right
	   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,     // v0-v5-v6-v1 up
	  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,     // v1-v6-v7-v2 left
	   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,     // v7-v4-v3-v2 down
	   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0      // v4-v7-v6-v5 back
	]);

	var texCoords = new Float32Array([   // Texture coordinates
	   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
	   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
	   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
	   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
	   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
	   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
	]);

	var indices = new Uint8Array([        // Indices of the vertices
	   0, 1, 2,   0, 2, 3,    // front
	   4, 5, 6,   4, 6, 7,    // right
	   8, 9,10,   8,10,11,    // up
	  12,13,14,  12,14,15,    // left
	  16,17,18,  16,18,19,    // down
	  20,21,22,  20,22,23     // back
	]);

	// Write vertex information to buffer object
	EarthTexMarker.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
	EarthTexMarker.normalBuffer = initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT);
	EarthTexMarker.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
	if (!EarthTexMarker.vertexBuffer || !EarthTexMarker.normalBuffer || !EarthTexMarker.indexBuffer){
		EarthTexMarker = null;
	}

	EarthTexMarker.numIndices = indices.length;

	// Unbind the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	if( !EarthTexMarker ){	
		console.log("Failed to set the vertex information...!");
		return;
	}

}

function drawEarthTexShader( gl, program ) {
  gl.useProgram(program);   // Tell that this program object is used

  // Assign the buffer objects and enable the assignment
  initAttributeVariable(gl, program.a_Position, EarthTexMarker.vertexBuffer); // Vertex coordinates
  initAttributeVariable(gl, program.a_Normal, EarthTexMarker.normalBuffer);   // Normal
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EarthTexMarker.indexBuffer);  // Bind indices

  drawEarthTex( gl, program );   // Draw
}

function drawEarthTex( gl, program ) {
	if( !EarthTexMarker.found ) return;

	EarthTexMarker.rotMat.rotate(EarthTexMarker.angle, 0.0, 1.0, 0.0);
	EarthTexMarker.modelMat.setIdentity();
	EarthTexMarker.modelMat.multiply(EarthTexMarker.transMat);
	EarthTexMarker.modelMat.multiply(EarthTexMarker.rotMat);
	EarthTexMarker.modelMat.multiply(EarthTexMarker.scaleMat);

	MVPMat.setIdentity( );
	MVPMat.multiply( ProjMat );
	MVPMat.multiply( ViewMat );
	MVPMat.multiply( EarthTexMarker.modelMat );	

	EarthTexMarker.mvpMat.setIdentity( );
	EarthTexMarker.mvpMat.multiply( ProjMat );
	EarthTexMarker.mvpMat.multiply( ViewMat );
	EarthTexMarker.mvpMat.multiply( EarthTexMarker.modelMat );

	// Calculate transformation matrix for normals and pass it to u_NormalMatrix
	EarthTexMarker.normalMat.setInverseOf( EarthTexMarker.modelMat );
	EarthTexMarker.normalMat.transpose( );
	gl.uniformMatrix4fv(program.u_NormalMatrix, false, EarthTexMarker.normalMat.elements);

	gl.uniformMatrix4fv(program.u_MvpMatrix, false, EarthTexMarker.mvpMat.elements);

	gl.drawElements(gl.TRIANGLES, EarthTexMarker.numIndices, EarthTexMarker.indexBuffer.type, 0);   // Draw
}


