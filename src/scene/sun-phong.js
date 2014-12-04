var SunPhongMarker 		= new Object( );
SunPhongMarker.id		= 1;
SunPhongMarker.rotMat 		= new Matrix4( );
SunPhongMarker.transMat 	= new Matrix4( );
SunPhongMarker.scaleMat 	= new Matrix4( );
SunPhongMarker.modelMat 	= new Matrix4( );
SunPhongMarker.normalMat 	= new Matrix4( );
SunPhongMarker.mvpMat 		= new Matrix4( );
SunPhongMarker.lightColor	= new Vector4( );
SunPhongMarker.angle 		= 0.0;
SunPhongMarker.modelSize 	= 50.0;
SunPhongMarker.ANGLE_STEP	= 30.0;
SunPhongMarker.last		= Date.now( );

function updateSunPhong( markerId, pose ) {
	if( markerId != SunPhongMarker.id ){
		return;
	}

	var yaw 	= Math.atan2(pose.bestRotation[0][2], pose.bestRotation[2][2]) * 180.0/Math.PI;
	var pitch 	= -Math.asin(-pose.bestRotation[1][2]) * 180.0/Math.PI;
	var roll 	= Math.atan2(pose.bestRotation[1][0], pose.bestRotation[1][1]) * 180.0/Math.PI;

	SunPhongMarker.found = true;

	SunPhongMarker.rotMat.setIdentity();
	SunPhongMarker.rotMat.rotate(yaw, 0.0, 1.0, 0.0);
	SunPhongMarker.rotMat.rotate(pitch, 1.0, 0.0, 0.0);
	SunPhongMarker.rotMat.rotate(roll, 0.0, 0.0, 1.0);

	SunPhongMarker.transMat.setIdentity();
	SunPhongMarker.transMat.translate(pose.bestTranslation[0], pose.bestTranslation[1], -pose.bestTranslation[2]);

	//console.log(" EarthPosition "+ pose.bestTranslation[0]+ " " +pose.bestTranslation[0]+ " " + -pose.bestTranslation[2] );

	SunPhongMarker.scaleMat.setIdentity();
	SunPhongMarker.scaleMat.scale( SunPhongMarker.modelSize, SunPhongMarker.modelSize, SunPhongMarker.modelSize );
}

function drawSunPhong( ) {

	gl.useProgram( shaderPhong );   // Tell that this program object is used

	drawSunPhongInner( gl, shaderPhong );   // Draw
}

function drawSunPhongInner( gl, program ) {

	SunPhongMarker.transMat.setIdentity( );
	SunPhongMarker.transMat.translate( 0, 0, -200 );

	SunPhongMarker.scaleMat.setIdentity();
	SunPhongMarker.scaleMat.scale( SunPhongMarker.modelSize, SunPhongMarker.modelSize, SunPhongMarker.modelSize );

	SunPhongMarker.modelMat.setIdentity();
	SunPhongMarker.modelMat.multiply(SunPhongMarker.transMat);
	SunPhongMarker.modelMat.multiply(SunPhongMarker.rotMat);
	SunPhongMarker.modelMat.multiply(SunPhongMarker.scaleMat);

	SunPhongMarker.mvpMat.setIdentity( );
	SunPhongMarker.mvpMat.multiply( scene.projMat );
	SunPhongMarker.mvpMat.multiply( scene.viewMat );
	SunPhongMarker.mvpMat.multiply( SunPhongMarker.modelMat );

	// Calculate transformation matrix for normals and pass it to u_NormalMatrix
	SunPhongMarker.normalMat.setInverseOf( SunPhongMarker.modelMat );
	SunPhongMarker.normalMat.transpose( );

	gl.uniformMatrix4fv(program.uModelMat, false, SunPhongMarker.modelMat.elements);
	gl.uniformMatrix4fv(program.uViewMat, false, scene.viewMat.elements);
	gl.uniformMatrix4fv(program.uProjMat, false, scene.projMat.elements);
	gl.uniformMatrix4fv(program.uNormMat, false, SunPhongMarker.normalMat.elements);
	gl.uniform4fv(program.uLightColor, scene.lights[1].color );
	gl.uniform3fv(program.uLightPos, scene.lights[1].pos );
	gl.uniform3fv(program.uCamPos, scene.cameraPos.elements);

	drawSunPhongDetailed( gl, earthObj.model[1], program, gl.TRIANGLES );	
}


// ********************************************************
// ********************************************************
function drawSunPhongDetailed(gl, o, shaderProgram, primitive) {

	var matAmb		= new Vector4();
	var matDif		= new Vector4();
	var matSpec		= new Vector4();
	var Ns;

	matAmb.elements[0] = 
	matAmb.elements[1] = 
	matAmb.elements[2] = 0.1
	matAmb.elements[3] = 1.0;

	matDif.elements[0] = 1.0;
	matDif.elements[1] = 1.0;
	matDif.elements[2] = 0.0;
	matDif.elements[3] = 1.0;

	matSpec.elements[0] = 
	matSpec.elements[1] = 
	matSpec.elements[2] = 0.1;
	matSpec.elements[3] = 1.0;
	
	Ns 					= 100.0;

	gl.uniform4fv(shaderProgram.uMatAmb, matAmb.elements);
	gl.uniform4fv(shaderProgram.uMatDif, matDif.elements);
	gl.uniform4fv(shaderProgram.uMatSpec, matSpec.elements);
	gl.uniform1f(shaderProgram.uExpSpec, Ns);
	
	if (o.vertexBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.vertexBuffer);
		gl.vertexAttribPointer(shaderProgram.vPositionAttr, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vPositionAttr);  
		}
	else
		alert("o.vertexBuffer == null");

	if (o.normalBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.normalBuffer);
		gl.vertexAttribPointer(shaderProgram.vNormalAttr, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vNormalAttr);
		}
	else
		alert("o.normalBuffer == null");
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

	gl.drawElements(primitive, o.numObjects, gl.UNSIGNED_SHORT, 0);
		
	gl.bindTexture(gl.TEXTURE_2D, null);
}

