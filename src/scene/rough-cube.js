var RoughCube 		= new Object( );
RoughCube.id		= 1;
RoughCube.rotMat 	= new Matrix4( );
RoughCube.transMat 	= new Matrix4( );
RoughCube.scaleMat 	= new Matrix4( );
RoughCube.modelMat 	= new Matrix4( );
RoughCube.normalMat 	= new Matrix4( );
RoughCube.mvpMat 	= new Matrix4( );
RoughCube.lightColor	= new Vector4( );
RoughCube.angle 	= 0.0;
RoughCube.modelSize 	= 50.0;
RoughCube.ANGLE_STEP	= 10.0;
RoughCube.last		= Date.now( );

function updateRoughCubeAngle( ){
	var now = Date.now();   // Calculate the elapsed time
	var elapsed = now - RoughCube.last;
	RoughCube.last = now;
	// Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = RoughCube.angle + (RoughCube.ANGLE_STEP * elapsed) / 1000.0;
	RoughCube.angle = newAngle % 360;

	RoughCube.rotMat.setIdentity();
}

function updateRoughCube( markerId, pose ) {
	if( markerId != RoughCube.id ){
		return;
	}


	updateRoughCubeAngle( );

	var yaw 	= Math.atan2(pose.bestRotation[0][2], pose.bestRotation[2][2]) * 180.0/Math.PI;
	var pitch 	= -Math.asin(-pose.bestRotation[1][2]) * 180.0/Math.PI;
	var roll 	= Math.atan2(pose.bestRotation[1][0], pose.bestRotation[1][1]) * 180.0/Math.PI;

	RoughCube.found = true;

	RoughCube.rotMat.rotate(yaw, 0.0, 1.0, 0.0);
	RoughCube.rotMat.rotate(pitch, 1.0, 0.0, 0.0);
	RoughCube.rotMat.rotate(roll, 0.0, 0.0, 1.0);

	RoughCube.transMat.setIdentity();
	RoughCube.transMat.translate(pose.bestTranslation[0], pose.bestTranslation[1], -pose.bestTranslation[2]);

	//console.log(" EarthPosition "+ pose.bestTranslation[0]+ " " +pose.bestTranslation[0]+ " " + -pose.bestTranslation[2] );

	RoughCube.scaleMat.setIdentity();
	RoughCube.scaleMat.scale( RoughCube.modelSize, RoughCube.modelSize, RoughCube.modelSize );
}

function drawRoughCubeShader( ) {
	if( !RoughCube.found ) return;

	gl.useProgram( shaderNormalMap );   // Tell that this program object is used

	drawRoughCube( gl, shaderNormalMap );   // Draw
}

function drawRoughCube( gl, program ) {
	if( !RoughCube.found ) return;

	RoughCube.rotMat.rotate(RoughCube.angle, 0.0, 1.0, 0.0);
	RoughCube.modelMat.setIdentity();
	RoughCube.modelMat.multiply(RoughCube.transMat);
	RoughCube.modelMat.multiply(RoughCube.rotMat);
	RoughCube.modelMat.multiply(RoughCube.scaleMat);

	RoughCube.mvpMat.setIdentity( );
	RoughCube.mvpMat.multiply( scene.projMat );
	RoughCube.mvpMat.multiply( scene.viewMat );
	RoughCube.mvpMat.multiply( RoughCube.modelMat );

	// Calculate transformation matrix for normals and pass it to u_NormalMatrix
	RoughCube.normalMat.setInverseOf( RoughCube.modelMat );
	RoughCube.normalMat.transpose( );

	
//	for( var o = 0; o < roughCubeObj.model.length; o++ )
		drawRoughCubeDetailed( gl, roughCubeObj.model[0], program, gl.TRIANGLES );	
}


// ********************************************************
// ********************************************************
function drawRoughCubeDetailed(gl, o, shaderProgram, primitive) {

	var texNormMap = 0;

	var matAmb		= new Vector4();
	var matDif		= new Vector4();
	var matSpec		= new Vector4();
	var Ns;

	if (roughCubeObj.textures[texNormMap*2] != null) {   	
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, roughCubeObj.textures[texNormMap*2]);
		}
	if (roughCubeObj.textures[texNormMap*2+1] != null) {   	
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, roughCubeObj.textures[texNormMap*2+1]);
		}
	if (o.Material != -1) {
		matAmb.elements[0] = roughCubeObj.material[o.Material].Ka.r;
		matAmb.elements[1] = roughCubeObj.material[o.Material].Ka.g;
		matAmb.elements[2] = roughCubeObj.material[o.Material].Ka.b;
		matAmb.elements[3] = roughCubeObj.material[o.Material].Ka.a;
	
		matDif.elements[0] = roughCubeObj.material[o.Material].Kd.r;
		matDif.elements[1] = roughCubeObj.material[o.Material].Kd.g;
		matDif.elements[2] = roughCubeObj.material[o.Material].Kd.b;
		matDif.elements[3] = roughCubeObj.material[o.Material].Kd.a;
	
		matSpec.elements[0] = roughCubeObj.material[o.Material].Ks.r;
		matSpec.elements[1] = roughCubeObj.material[o.Material].Ks.g;
		matSpec.elements[2] = roughCubeObj.material[o.Material].Ks.b;
		matSpec.elements[3] = roughCubeObj.material[o.Material].Ks.a;
		
		Ns = roughCubeObj.material[texNormMap].Ns;
		}
	else {
		matAmb.elements[0] = 
		matAmb.elements[1] = 
		matAmb.elements[2] = 0.2
		matAmb.elements[3] = 1.0;
	
		matDif.elements[0] = 
		matDif.elements[1] = 
		matDif.elements[2] = 0.8;
		matDif.elements[3] = 1.0;
	
		matSpec.elements[0] = 
		matSpec.elements[1] = 
		matSpec.elements[2] = 0.5;
		matSpec.elements[3] = 1.0;
		
		Ns 					= 100.0;
	}

	gl.uniformMatrix4fv(shaderProgram.uModelMat, false, RoughCube.modelMat.elements);
	gl.uniformMatrix4fv(shaderProgram.uMVPMat, false, RoughCube.mvpMat.elements);
	gl.uniformMatrix4fv(shaderProgram.uNormMat, false, RoughCube.normalMat.elements);
	gl.uniform4fv(shaderProgram.uLightColor, scene.rawLightsColor );
        gl.uniform3fv(shaderProgram.uLightPos, scene.rawLightsPos );
        gl.uniform1i(shaderProgram.uLightSize, scene.lights.length );
	gl.uniform3fv(shaderProgram.uCamPos, scene.cameraPos.elements);

	gl.uniform4fv(shaderProgram.uMatAmb, matAmb.elements);
	gl.uniform4fv(shaderProgram.uMatDif, matDif.elements);
	gl.uniform4fv(shaderProgram.uMatSpec, matSpec.elements);
	gl.uniform1f(shaderProgram.uExpSpec, Ns);
	gl.uniform1i(shaderProgram.uTexture, 0);
	gl.uniform1i(shaderProgram.uNormalMap, 1);
	
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
	
	if (o.texCoordBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.texCoordBuffer);
		gl.vertexAttribPointer(shaderProgram.vTexCoordAttr, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vTexCoordAttr);
		}
	else
		alert("o.texCoordBuffer == null");

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

	gl.drawElements(primitive, o.numObjects, gl.UNSIGNED_SHORT, 0);
		
	gl.bindTexture(gl.TEXTURE_2D, null);
}

