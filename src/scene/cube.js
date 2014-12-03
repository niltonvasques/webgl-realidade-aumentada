var CubeMarker 		= new Object( );
CubeMarker.id		= 1;
CubeMarker.rotMat 		= new Matrix4( );
CubeMarker.transMat 		= new Matrix4( );
CubeMarker.scaleMat 		= new Matrix4( );
CubeMarker.modelMat 		= new Matrix4( );
CubeMarker.normalMat 		= new Matrix4( );
CubeMarker.mvpMat 		= new Matrix4( );
CubeMarker.lightColor		= new Vector4( );
CubeMarker.angle 		= 0.0;
CubeMarker.modelSize 		= 50.0;

var ANGLE_STEP = 30;   // The increments of rotation angle (degrees)
var last = Date.now(); // Last time that this function was called
function updateCube( markerId, pose ) {
	if( markerId != CubeMarker.id ){
		return;
	}

	var now = Date.now();   // Calculate the elapsed time
	var elapsed = now - last;
	last = now;
	// Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = CubeMarker.angle + (ANGLE_STEP * elapsed) / 1000.0;
	CubeMarker.angle = newAngle % 360;


	yaw 	= Math.atan2(pose.bestRotation[0][2], pose.bestRotation[2][2]) * 180.0/Math.PI;
	pitch 	= -Math.asin(-pose.bestRotation[1][2]) * 180.0/Math.PI;
	roll 	= Math.atan2(pose.bestRotation[1][0], pose.bestRotation[1][1]) * 180.0/Math.PI;

	CubeMarker.found = true;

	CubeMarker.rotMat.setIdentity();
	CubeMarker.rotMat.rotate(yaw, 0.0, 1.0, 0.0);
	CubeMarker.rotMat.rotate(pitch, 1.0, 0.0, 0.0);
	CubeMarker.rotMat.rotate(roll, 0.0, 0.0, 1.0);

	CubeMarker.transMat.setIdentity();
	CubeMarker.transMat.translate(pose.bestTranslation[0], pose.bestTranslation[1], -pose.bestTranslation[2]);

	CubeMarker.scaleMat.setIdentity();
	CubeMarker.scaleMat.scale( CubeMarker.modelSize, CubeMarker.modelSize, CubeMarker.modelSize );
}

function initCubeVertexBuffers(gl) {
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
	CubeMarker.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
	CubeMarker.normalBuffer = initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT);
	CubeMarker.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
	if (!CubeMarker.vertexBuffer || !CubeMarker.normalBuffer || !CubeMarker.indexBuffer){
		CubeMarker = null;
	}

	CubeMarker.numIndices = indices.length;

	// Unbind the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	if( !CubeMarker ){	
		console.log("Failed to set the vertex information...!");
		return;
	}

}

function drawSolidCube( gl, program ) {
	gl.useProgram(program);   // Tell that this program object is used

	// Assign the buffer objects and enable the assignment
	initAttributeVariable(gl, program.a_Position, CubeMarker.vertexBuffer); // Vertex coordinates
	initAttributeVariable(gl, program.a_Normal, CubeMarker.normalBuffer);   // Normal
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CubeMarker.indexBuffer);  // Bind indices

	drawCube( gl, program );   // Draw
}

function drawCube( gl, program ) {
	if( !CubeMarker.found ) return;

	CubeMarker.rotMat.rotate(CubeMarker.angle, 0.0, 1.0, 0.0);
	CubeMarker.modelMat.setIdentity();
	CubeMarker.modelMat.multiply(CubeMarker.transMat);
	CubeMarker.modelMat.multiply(CubeMarker.rotMat);
	CubeMarker.modelMat.multiply(CubeMarker.scaleMat);

	MVPMat.setIdentity( );
	MVPMat.multiply( scene.projMat );
	MVPMat.multiply( scene.viewMat );
	MVPMat.multiply( CubeMarker.modelMat );	

	CubeMarker.mvpMat.setIdentity( );
	CubeMarker.mvpMat.multiply( scene.projMat );
	CubeMarker.mvpMat.multiply( scene.viewMat );
	CubeMarker.mvpMat.multiply( CubeMarker.modelMat );

	// Calculate transformation matrix for normals and pass it to u_NormalMatrix
	CubeMarker.normalMat.setInverseOf( CubeMarker.modelMat );
	CubeMarker.normalMat.transpose( );
	gl.uniformMatrix4fv(program.u_NormalMatrix, false, CubeMarker.normalMat.elements);

	gl.uniformMatrix4fv(program.u_MvpMatrix, false, CubeMarker.mvpMat.elements);

	gl.drawElements(gl.TRIANGLES, CubeMarker.numIndices, CubeMarker.indexBuffer.type, 0);   // Draw
}


