var SunTex 		= new Object( );
SunTex.id		= 24;
SunTex.rotMarkerMat	= new Matrix4( );
SunTex.rotMat 		= new Matrix4( );
SunTex.transMat 	= new Matrix4( );
SunTex.scaleMat 	= new Matrix4( );
SunTex.modelMat 	= new Matrix4( );
SunTex.normalMat 	= new Matrix4( );
SunTex.mvpMat 		= new Matrix4( );
SunTex.lightColor	= new Vector4( );
SunTex.angle 		= 0.0;
SunTex.modelSize 	= 50.0;
SunTex.ANGLE_STEP	= 30.0;
SunTex.last		= Date.now( );

function updateSunTexAngle( ){
	var now = Date.now();   // Calculate the elapsed time
	var elapsed = now - SunTex.last;
	SunTex.last = now;
	// Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = SunTex.angle + (SunTex.ANGLE_STEP * elapsed) / 1000.0;
	SunTex.angle = newAngle % 360;

}

function drawSunTex( gl, program ) {
        gl.useProgram( program );

	updateSunTexAngle( );

	SunTex.rotMat.setIdentity( );

	SunTex.transMat.setIdentity( );
	SunTex.transMat.translate( 0, 0, -300 );

	SunTex.scaleMat.setIdentity();
	SunTex.scaleMat.scale( SunTex.modelSize, SunTex.modelSize, SunTex.modelSize );

	SunTex.modelMat.setIdentity();
	SunTex.modelMat.multiply(SunTex.transMat);
	SunTex.modelMat.multiply(SunTex.rotMat);
	SunTex.modelMat.multiply(SunTex.scaleMat);

	SunTex.mvpMat.setIdentity( );
	SunTex.mvpMat.multiply( scene.projMat );
	SunTex.mvpMat.multiply( scene.viewMat );
	SunTex.mvpMat.multiply( SunTex.modelMat );

	// Calculate transformation matrix for normals and pass it to u_NormalMatrix
	SunTex.normalMat.setInverseOf( SunTex.modelMat );
	SunTex.normalMat.transpose( );


	drawSunTexDetailed( gl, earthObj.model[1], program, gl.TRIANGLES );	
}


// ********************************************************
// ********************************************************
function drawSunTexDetailed(gl, o, shaderProgram, primitive) {

    var texNormMap = 3;

    var matAmb		= new Vector4();
    var matDif		= new Vector4();
    var matSpec		= new Vector4();
    var Ns;

    if (earthObj.textures[texNormMap*2] != null) {   	
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, earthObj.textures[texNormMap*2]);
    }

    if (o.Material != -1) {
        matAmb.elements[0] = earthObj.material[texNormMap].Ka.r;
        matAmb.elements[1] = earthObj.material[texNormMap].Ka.g;
        matAmb.elements[2] = earthObj.material[texNormMap].Ka.b;
        matAmb.elements[3] = earthObj.material[texNormMap].Ka.a;

        matDif.elements[0] = earthObj.material[texNormMap].Kd.r;
        matDif.elements[1] = earthObj.material[texNormMap].Kd.g;
        matDif.elements[2] = earthObj.material[texNormMap].Kd.b;
        matDif.elements[3] = earthObj.material[texNormMap].Kd.a;

        matSpec.elements[0] = earthObj.material[texNormMap].Ks.r;
        matSpec.elements[1] = earthObj.material[texNormMap].Ks.g;
        matSpec.elements[2] = earthObj.material[texNormMap].Ks.b;
        matSpec.elements[3] = earthObj.material[texNormMap].Ks.a;

        Ns = earthObj.material[texNormMap].Ns;
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

    gl.uniformMatrix4fv(shaderProgram.uModelMat, false, SunTex.modelMat.elements);
    gl.uniformMatrix4fv(shaderProgram.uViewMat, false, scene.viewMat.elements);
    gl.uniformMatrix4fv(shaderProgram.uProjMat, false, scene.projMat.elements);
    gl.uniformMatrix4fv(shaderProgram.uNormMat, false, SunTex.normalMat.elements);
    gl.uniform4fv(shaderProgram.uLightColor, scene.rawLightsColor );
    gl.uniform3fv(shaderProgram.uLightPos, scene.rawLightsPos );
    gl.uniform3fv(shaderProgram.uCamPos, scene.cameraPos.elements);

    gl.uniform4fv(shaderProgram.uMatAmb, matAmb.elements);
    gl.uniform4fv(shaderProgram.uMatDif, matDif.elements);
    gl.uniform4fv(shaderProgram.uMatSpec, matSpec.elements);
    gl.uniform1f(shaderProgram.uExpSpec, Ns);
    gl.uniform1i(shaderProgram.uSampler, 0);

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

