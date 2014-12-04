var MoonPhong 		= new Object( );
MoonPhong.id		= 1;
MoonPhong.rotMat 		= new Matrix4( );
MoonPhong.transMat 	= new Matrix4( );
MoonPhong.scaleMat 	= new Matrix4( );
MoonPhong.modelMat 	= new Matrix4( );
MoonPhong.normalMat 	= new Matrix4( );
MoonPhong.mvpMat 		= new Matrix4( );
MoonPhong.lightColor	= new Vector4( );
MoonPhong.angle 		= 0.0;
MoonPhong.modelSize 	= 10.0;
MoonPhong.ANGLE_STEP	= 30.0;
MoonPhong.last		= Date.now( );

function updateMoonAngle( ){
	var now = Date.now();   // Calculate the elapsed time
	var elapsed = now - MoonPhong.last;
	MoonPhong.last = now;

	// Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = MoonPhong.angle + (MoonPhong.ANGLE_STEP * elapsed) / 1000.0;
	MoonPhong.angle = newAngle % 360;

	MoonPhong.rotMat.setIdentity();
}

function drawMoonPhongInner( gl, program ) {

	gl.useProgram( program );   // Tell that this program object is used

	updateMoonAngle( );

	MoonPhong.modelMat.set( EarthTexMarker.modelMat );
	MoonPhong.modelMat.rotate( MoonPhong.angle, 0.0, 1.0, 0.0 );
	MoonPhong.modelMat.translate( 1, 0, 0 );
	MoonPhong.modelMat.scale(  2 / MoonPhong.modelSize,  2 / MoonPhong.modelSize, 2 / MoonPhong.modelSize );

	//MoonPhong.modelMat.multiply(MoonPhong.rotMat);
	//MoonPhong.modelMat.multiply(MoonPhong.transMat);
	//MoonPhong.modelMat.multiply(MoonPhong.scaleMat);

	MoonPhong.mvpMat.setIdentity( );
	MoonPhong.mvpMat.multiply( scene.projMat );
	MoonPhong.mvpMat.multiply( scene.viewMat );
	MoonPhong.mvpMat.multiply( MoonPhong.modelMat );

	// Calculate transformation matrix for normals and pass it to u_NormalMatrix
	MoonPhong.normalMat.setInverseOf( MoonPhong.modelMat );
	MoonPhong.normalMat.transpose( );

	gl.uniformMatrix4fv(program.uModelMat, false, MoonPhong.modelMat.elements);
	gl.uniformMatrix4fv(program.uViewMat, false, scene.viewMat.elements);
	gl.uniformMatrix4fv(program.uProjMat, false, scene.projMat.elements);
	gl.uniformMatrix4fv(program.uNormMat, false, MoonPhong.normalMat.elements);
	gl.uniform4fv(program.uLightColor, scene.lights[1].color );
	gl.uniform3fv(program.uLightPos, scene.lights[1].pos );
	gl.uniform3fv(program.uCamPos, scene.cameraPos.elements);

	drawMoonPhongDetailed( gl, earthObj.model[1], program, gl.TRIANGLES );	
}


// ********************************************************
// ********************************************************
function drawMoonPhongDetailed(gl, o, shaderProgram, primitive) {

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
	matDif.elements[2] = 1.0;
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

