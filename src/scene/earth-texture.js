var EarthTexMarker 		= new Object( );
EarthTexMarker.id		= 24;
EarthTexMarker.rotMarkerMat	= new Matrix4( );
EarthTexMarker.rotMat 		= new Matrix4( );
EarthTexMarker.transMat 	= new Matrix4( );
EarthTexMarker.scaleMat 	= new Matrix4( );
EarthTexMarker.modelMat 	= new Matrix4( );
EarthTexMarker.normalMat 	= new Matrix4( );
EarthTexMarker.mvpMat 		= new Matrix4( );
EarthTexMarker.lightColor	= new Vector4( );
EarthTexMarker.angle 		= 0.0;
EarthTexMarker.modelSize 	= 50.0;
EarthTexMarker.ANGLE_STEP	= 30.0;
EarthTexMarker.last		= Date.now( );

function updateEarthTexAngle( ){
	var now = Date.now();   // Calculate the elapsed time
	var elapsed = now - EarthTexMarker.last;
	EarthTexMarker.last = now;
	// Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = EarthTexMarker.angle + (EarthTexMarker.ANGLE_STEP * elapsed) / 1000.0;
	EarthTexMarker.angle = newAngle % 360;

}

function updateEarthTex( markerId, pose ) {
	if( markerId != EarthTexMarker.id ){
		return;
	}

	var yaw 	= Math.atan2(pose.bestRotation[0][2], pose.bestRotation[2][2]) * 180.0/Math.PI;
	var pitch 	= -Math.asin(-pose.bestRotation[1][2]) * 180.0/Math.PI;
	var roll 	= Math.atan2(pose.bestRotation[1][0], pose.bestRotation[1][1]) * 180.0/Math.PI;

	EarthTexMarker.found = true;

	EarthTexMarker.rotMarkerMat.setIdentity( );

	EarthTexMarker.rotMarkerMat.rotate(yaw, 0.0, 1.0, 0.0);
	EarthTexMarker.rotMarkerMat.rotate(pitch, 1.0, 0.0, 0.0);
	EarthTexMarker.rotMarkerMat.rotate(roll, 0.0, 0.0, 1.0);

	EarthTexMarker.transMat.setIdentity();
	EarthTexMarker.transMat.translate(pose.bestTranslation[0], pose.bestTranslation[1], -pose.bestTranslation[2]);

	//console.log(" EarthPosition "+ pose.bestTranslation[0]+ " " +pose.bestTranslation[0]+ " " + -pose.bestTranslation[2] );

	EarthTexMarker.scaleMat.setIdentity();
	EarthTexMarker.scaleMat.scale( EarthTexMarker.modelSize, EarthTexMarker.modelSize, EarthTexMarker.modelSize );
}

function drawEarthTexShader( ) {
	if( !EarthTexMarker.found ) return;

	gl.useProgram( shaderNormalMap );   // Tell that this program object is used

	drawEarthTex( gl, shaderNormalMap );   // Draw
}

function drawEarthTex( gl, program ) {
	if( !EarthTexMarker.found ) return;

	updateEarthTexAngle( );

	EarthTexMarker.rotMat.set( EarthTexMarker.rotMarkerMat );
	EarthTexMarker.rotMat.rotate(EarthTexMarker.angle, 0.0, 1.0, 0.0);

	EarthTexMarker.modelMat.setIdentity();
	EarthTexMarker.modelMat.multiply(EarthTexMarker.transMat);
	EarthTexMarker.modelMat.multiply(EarthTexMarker.rotMat);
	EarthTexMarker.modelMat.multiply(EarthTexMarker.scaleMat);

	EarthTexMarker.mvpMat.setIdentity( );
	EarthTexMarker.mvpMat.multiply( scene.projMat );
	EarthTexMarker.mvpMat.multiply( scene.viewMat );
	EarthTexMarker.mvpMat.multiply( EarthTexMarker.modelMat );

	// Calculate transformation matrix for normals and pass it to u_NormalMatrix
	EarthTexMarker.normalMat.setInverseOf( EarthTexMarker.modelMat );
	EarthTexMarker.normalMat.transpose( );


	drawEarthTexDetailed( gl, earthObj.model[1], program, gl.TRIANGLES );	
}


// ********************************************************
// ********************************************************
function drawEarthTexDetailed(gl, o, shaderProgram, primitive) {

    var texNormMap = 0;

    var matAmb		= new Vector4();
    var matDif		= new Vector4();
    var matSpec		= new Vector4();
    var Ns;

    if (earthObj.textures[texNormMap*2] != null) {   	
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, earthObj.textures[texNormMap*2]);
    }

    if (earthObj.textures[texNormMap*2+1] != null) {   	
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, earthObj.textures[texNormMap*2+1]);
    }

    if (o.Material != -1) {
        matAmb.elements[0] = earthObj.material[o.Material].Ka.r;
        matAmb.elements[1] = earthObj.material[o.Material].Ka.g;
        matAmb.elements[2] = earthObj.material[o.Material].Ka.b;
        matAmb.elements[3] = earthObj.material[o.Material].Ka.a;

        matDif.elements[0] = earthObj.material[o.Material].Kd.r;
        matDif.elements[1] = earthObj.material[o.Material].Kd.g;
        matDif.elements[2] = earthObj.material[o.Material].Kd.b;
        matDif.elements[3] = earthObj.material[o.Material].Kd.a;

        matSpec.elements[0] = earthObj.material[o.Material].Ks.r;
        matSpec.elements[1] = earthObj.material[o.Material].Ks.g;
        matSpec.elements[2] = earthObj.material[o.Material].Ks.b;
        matSpec.elements[3] = earthObj.material[o.Material].Ks.a;

        Ns = earthObj.material[o.Material].Ns;
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

    gl.uniformMatrix4fv(shaderProgram.uModelMat, false, EarthTexMarker.modelMat.elements);
    //gl.uniformMatrix4fv(shaderProgram.uViewMat, false, scene.viewMat.elements);
    //gl.uniformMatrix4fv(shaderProgram.uProjMat, false, scene.projMat.elements);
    gl.uniformMatrix4fv(shaderProgram.uMVPMat, false, EarthTexMarker.mvpMat.elements);
    gl.uniformMatrix4fv(shaderProgram.uNormMat, false, EarthTexMarker.normalMat.elements);
    gl.uniform4fv(shaderProgram.uLightColor, scene.rawLightsColor );
    gl.uniform3fv(shaderProgram.uLightPos, scene.rawLightsPos );
    gl.uniform1i(shaderProgram.uLightSize, scene.lights.length );
    gl.uniform3fv(shaderProgram.uCamPos, scene.cameraPos.elements);

    gl.uniform4fv(shaderProgram.uMatAmb, matAmb.elements);
    gl.uniform4fv(shaderProgram.uMatDif, matDif.elements);
    gl.uniform4fv(shaderProgram.uMatSpec, matSpec.elements);
    gl.uniform1f(shaderProgram.uExpSpec, Ns);
    //gl.uniform1i(shaderProgram.uSampler, 0);
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

