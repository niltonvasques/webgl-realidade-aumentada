
var TerraMarker 	= new Object();
TerraMarker.id		= 2;
TerraMarker.normMat 	= new Matrix4( );
TerraMarker.rotMat 	= new Matrix4( );
TerraMarker.transMat 	= new Matrix4( );
TerraMarker.scaleMat 	= new Matrix4( );
TerraMarker.lightColor	= new Vector4( );
TerraMarker.matAmb	= new Vector4( );
TerraMarker.matDif	= new Vector4( );
TerraMarker.matSpec	= new Vector4( );
TerraMarker.Ns 		= 100.0;


function updateTerraMarker( markerId, pose ){
		
	if( markerId != TerraMarker.id ){
		return;
	}

	yaw 	= Math.atan2(pose.bestRotation[0][2], pose.bestRotation[2][2]) * 180.0/Math.PI;
	pitch 	= -Math.asin(-pose.bestRotation[1][2]) * 180.0/Math.PI;
	roll 	= Math.atan2(pose.bestRotation[1][0], pose.bestRotation[1][1]) * 180.0/Math.PI;

	TerraMarker.found = true;

	TerraMarker.rotMat.setIdentity();
	TerraMarker.rotMat.rotate(yaw, 0.0, 1.0, 0.0);
	TerraMarker.rotMat.rotate(pitch, 1.0, 0.0, 0.0);
	TerraMarker.rotMat.rotate(roll, 0.0, 0.0, 1.0);

	TerraMarker.transMat.setIdentity();
	TerraMarker.transMat.translate(pose.bestTranslation[0], pose.bestTranslation[1], -pose.bestTranslation[2]);

	TerraMarker.scaleMat.setIdentity();
	TerraMarker.scaleMat.scale( modelSize, modelSize, modelSize );
}


function drawTerra( axisEnabled ){
	
	if( !TerraMarker.found ) return;


	modelMat.setIdentity();
	modelMat.multiply(TerraMarker.transMat);
	modelMat.multiply(TerraMarker.rotMat); 
	modelMat.multiply(TerraMarker.scaleMat); 

	TerraMarker.normMat.setIdentity();
	TerraMarker.normMat.setInverseOf( modelMat );
	TerraMarker.normMat.transpose();

	TerraMarker.lightColor.elements[0] = 0.2;
	TerraMarker.lightColor.elements[1] = 0.2;
	TerraMarker.lightColor.elements[2] = 0.8;
	TerraMarker.lightColor.elements[3] = 1.0;

	TerraMarker.matAmb.elements[0] = 0.3;
	TerraMarker.matAmb.elements[1] = 0.3;
	TerraMarker.matAmb.elements[2] = 0.3;
	TerraMarker.matAmb.elements[3] = 1.0;

	TerraMarker.matDif.elements[0] = 0.8;
	TerraMarker.matDif.elements[1] = 0.8;
	TerraMarker.matDif.elements[2] = 0.8;
	TerraMarker.matDif.elements[3] = 1.0;

	TerraMarker.matSpec.elements[0] = 0.7;
	TerraMarker.matSpec.elements[1] = 0.7;
	TerraMarker.matSpec.elements[2] = 0.7;
	TerraMarker.matSpec.elements[3] = 1.0;

	TerraMarker.Ns	= 10.0;

	MVPMat.setIdentity();
	MVPMat.multiply(ProjMat);
	MVPMat.multiply(ViewMat);
	MVPMat.multiply(modelMat);	

	if( axisEnabled ) drawAxis(axis, shaderAxis, MVPMat);
	
	console.log( MVPMat.elements );

	try { 
		gl.useProgram(shaderTerra);
	}catch(err){
		alert(err);
		console.error(err.description);
	}
	//
	//gl.uniformMatrix4fv(shaderPlanets.uModelMat, false, MVPMat.elements);

	//color[0] = 0.2; color[1] = 0.2; color[2] = 0.8;
	//gl.uniform3fv(shaderPlanets.uColor, color);


	//for(var o = 0; o < model.length; o++) { 
	//	console.log("chegou aqui!!");
	//	draw(model[o], shaderPlanets, gl.TRIANGLES);
	//}

	gl.uniformMatrix4fv( shaderTerra.uNormMat, false, TerraMarker.normMat.elements );
	gl.uniformMatrix4fv( shaderTerra.uModelMat, false, modelMat.elements );	
	gl.uniformMatrix4fv( shaderTerra.uViewMat, false, ViewMat.elements );
	gl.uniformMatrix4fv( shaderTerra.uProjMat, false, ProjMat.elements );

//Descobrir como cálcular as posições reais dos objetos
	var solLightPos4 	= new Vector4( );
	solLightPos4.elements[0] = 1.0;
	solLightPos4.elements[1] = 1.0;
	solLightPos4.elements[2] = 1.0;

	solLightPos4 = SolMarker.mvpMat.multiplyVector4( solLightPos4 );

	var solLightPos = new Vector3( );
	solLightPos.elements[0] = solLightPos4.elements[0];
	solLightPos.elements[1] = solLightPos4.elements[1];
	solLightPos.elements[2] = solLightPos4.elements[2];

	console.log( "Sol Light Pos " );
	console.log( solLightPos.elements[0] );
	console.log( solLightPos.elements[1] );
	console.log( solLightPos.elements[2] );

	var siriusLightPos4 	= new Vector4( );
	siriusLightPos4.elements[0] = 1.0;
	siriusLightPos4.elements[1] = 1.0;
	siriusLightPos4.elements[2] = 1.0;

	siriusLightPos4 = SiriusStar.mvpMat.multiplyVector4( siriusLightPos4 );

	var siriusLightPos = new Vector3( );
	siriusLightPos.elements[0] = siriusLightPos4.elements[0];
	siriusLightPos.elements[1] = siriusLightPos4.elements[1];
	siriusLightPos.elements[2] = siriusLightPos4.elements[2];

	console.log( "Sirius Light Pos " );
	console.log( siriusLightPos.elements[0] );
	console.log( siriusLightPos.elements[1] );
	console.log( siriusLightPos.elements[2] );

	gl.uniform3fv( shaderTerra.uCamPos, cameraPos.elements );
	gl.uniform4fv( shaderTerra.uLColor, TerraMarker.lightColor.elements );
	gl.uniform3fv( shaderTerra.uLPos, solLightPos.elements );
	gl.uniform3fv( shaderTerra.uSiriusPos, siriusLightPos.elements );
	gl.uniform3fv( shaderTerra.uCamPos, cameraPos.elements );
	
	gl.uniform4fv( shaderTerra.uMatSpec, TerraMarker.matSpec.elements );
	gl.uniform4fv( shaderTerra.uMatAmb, TerraMarker.matAmb.elements );
	gl.uniform4fv( shaderTerra.uMatDif, TerraMarker.matDif.elements );
	gl.uniform1f( shaderTerra.uExpSpec, TerraMarker.Ns );

	//workaroundFixBindAttribZeroProblem( );
	
	for( var o = 0; o < model.length; o++ ){
		draw( model[o], shaderTerra, gl.TRIANGLES );
	}
}

// Basically, vertex attrib 0 has to be enabled or else OpenGL 
// will not render where as OpenGL ES 2.0 will. 
// https://www.khronos.org/webgl/public-mailing-list/archives/1005/msg00053.html
function workaroundFixBindAttribZeroProblem(){
	try{
		gl.bindBuffer( gl.ARRAY_BUFFER, sphereObj.model[0].vertexBuffer );
		gl.vertexAttribPointer( 0, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( 0 );
        }catch( err ){
                alert( err );
                console.log( err.description );
        }
}
