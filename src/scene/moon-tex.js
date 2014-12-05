var MoonTex 		= new Object( );
MoonTex.rotMarkerMat	= new Matrix4( );
MoonTex.rotMat 		= new Matrix4( );
MoonTex.transMat 	= new Matrix4( );
MoonTex.scaleMat 	= new Matrix4( );
MoonTex.modelMat 	= new Matrix4( );
MoonTex.normalMat 	= new Matrix4( );
MoonTex.mvpMat 		= new Matrix4( );
MoonTex.lightColor	= new Vector4( );
MoonTex.position        = new Array( 4 );
MoonTex.angle 		= 0.0;
MoonTex.modelSize 	= 50.0;
MoonTex.ANGLE_STEP	= 90.0;
MoonTex.last		= Date.now( );

MoonTex.position[0] = 1.0;
MoonTex.position[1] = 1.0;
MoonTex.position[2] = 1.0;
MoonTex.position[3] = 1.0;

function updateMoonTexAngle( ){
	var now = Date.now();   // Calculate the elapsed time
	var elapsed = now - MoonTex.last;
	MoonTex.last = now;
	// Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = MoonTex.angle + (MoonTex.ANGLE_STEP * elapsed) / 1000.0;
	MoonTex.angle = newAngle % 360;

	MoonTex.rotMat.setIdentity();
}

function drawMoonTex( gl, program ) {
	gl.useProgram( shaderNormalMap );   // Tell that this program object is used

	updateMoonTexAngle( );

	//MoonTex.rotMat.set( MoonTex.rotMarkerMat );
	//MoonTex.rotMat.rotate(MoonTex.angle, 0.0, 1.0, 0.0);
	MoonTex.modelMat.set( EarthTexMarker.modelMat );
	MoonTex.modelMat.rotate( -MoonTex.angle, 0.0, 1.0, 0.0 );
	MoonTex.modelMat.translate( 1, 0, 0 );
	MoonTex.modelMat.scale(  10 / MoonTex.modelSize,  10 / MoonTex.modelSize, 10 / MoonTex.modelSize );

	MoonTex.mvpMat.setIdentity( );
	MoonTex.mvpMat.multiply( scene.projMat );
	MoonTex.mvpMat.multiply( scene.viewMat );
	MoonTex.mvpMat.multiply( MoonTex.modelMat );

	// Calculate transformation matrix for normals and pass it to u_NormalMatrix
	MoonTex.normalMat.setInverseOf( MoonTex.modelMat );
	MoonTex.normalMat.transpose( );

        MoonTex.position        = new Vector4( );
        MoonTex.position.elements[0] = 1.0;
        MoonTex.position.elements[1] = 1.0;
        MoonTex.position.elements[2] = 1.0;
        MoonTex.position.elements[3] = 1.0;
        MoonTex.position = MoonTex.modelMat.multiplyVector4( MoonTex.position ).elements; 

	drawMoonTexDetailed( gl, earthObj.model[0], program, gl.TRIANGLES );	
}


// ********************************************************
// ********************************************************
function drawMoonTexDetailed(gl, o, shaderProgram, primitive) {

    var texNormMap = 2;

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

    gl.uniformMatrix4fv(shaderProgram.uModelMat, false, MoonTex.modelMat.elements);
    //gl.uniformMatrix4fv(shaderProgram.uViewMat, false, scene.viewMat.elements);
    //gl.uniformMatrix4fv(shaderProgram.uProjMat, false, scene.projMat.elements);
    gl.uniformMatrix4fv(shaderProgram.uMVPMat, false, MoonTex.mvpMat.elements);
    gl.uniformMatrix4fv(shaderProgram.uNormMat, false, MoonTex.normalMat.elements);
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

