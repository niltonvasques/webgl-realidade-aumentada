// A biblioteca Aruco detecta os markers e atribui um id único de acordo
// com o desenho do marker.
// Aqui ficará declarado todos os marcadores que iremos utilizar na aplicação.
//
var SolMarker 		= new Object();
SolMarker.id		= 25;
SolMarker.rotMat 	= new Matrix4( );
SolMarker.transMat 	= new Matrix4( );
SolMarker.scaleMat 	= new Matrix4( );
SolMarker.modelMat 	= new Matrix4( );
SolMarker.mvpMat 	= new Matrix4( );
SolMarker.lightColor	= new Vector4( );

function updateSolMarker( markerId, pose ){
		
	if( markerId != SolMarker.id ){
		return;
	}

	yaw 	= Math.atan2(pose.bestRotation[0][2], pose.bestRotation[2][2]) * 180.0/Math.PI;
	pitch 	= -Math.asin(-pose.bestRotation[1][2]) * 180.0/Math.PI;
	roll 	= Math.atan2(pose.bestRotation[1][0], pose.bestRotation[1][1]) * 180.0/Math.PI;

	SolMarker.found = true;

	SolMarker.rotMat.setIdentity();
	SolMarker.rotMat.rotate(yaw, 0.0, 1.0, 0.0);
	SolMarker.rotMat.rotate(pitch, 1.0, 0.0, 0.0);
	SolMarker.rotMat.rotate(roll, 0.0, 0.0, 1.0);

	SolMarker.transMat.setIdentity();
	SolMarker.transMat.translate(pose.bestTranslation[0], pose.bestTranslation[1], -pose.bestTranslation[2]);

	SolMarker.scaleMat.setIdentity();
	SolMarker.scaleMat.scale( modelSize, modelSize, modelSize );

	/*console.log(yaw);
	console.log(pitch);
	console.log(roll);
	*/

	/*console.log("pose.bestTranslation.x = " + pose.bestTranslation[0]/262.144);
	console.log("pose.bestTranslation.y = " + pose.bestTranslation[1]/262.144);
	console.log("pose.bestTranslation.z = " + -pose.bestTranslation[2]/262.144);
	*/
}


function drawSol( axisEnabled ){
	if( !SolMarker.found ) return;

	SolMarker.modelMat.setIdentity();
	SolMarker.modelMat.multiply(SolMarker.transMat);
	SolMarker.modelMat.multiply(SolMarker.rotMat);
	SolMarker.modelMat.multiply(SolMarker.scaleMat);

	MVPMat.setIdentity( );
	MVPMat.multiply( ProjMat );
	MVPMat.multiply( ViewMat );
	MVPMat.multiply( SolMarker.modelMat );	

	SolMarker.mvpMat.setIdentity( );
	SolMarker.mvpMat.multiply( ProjMat );
	SolMarker.mvpMat.multiply( ViewMat );
	SolMarker.mvpMat.multiply( SolMarker.modelMat );
	
	if( axisEnabled ) drawAxis(axis, shaderAxis, MVPMat);

	try { 
		gl.useProgram( shaderPlanets );
	}catch(err){
		alert( err );
		console.error( err.description );
	}
	
	gl.uniformMatrix4fv( shaderPlanets.uModelMat, false, MVPMat.elements );

	color[0] = 1.0; color[1] = 1.0; color[2] = 0.0;
	gl.uniform3fv(shaderPlanets.uColor, color);


	for(var o = 0; o < sphereObj.model.length; o++) { 
		draw(sphereObj.model[o], shaderPlanets, gl.TRIANGLES);
	}
}
