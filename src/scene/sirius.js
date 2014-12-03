
var SiriusStar 		= new Object();
SiriusStar.rotMat 	= new Matrix4( );
SiriusStar.transMat 	= new Matrix4( );
SiriusStar.scaleMat 	= new Matrix4( );
SiriusStar.modelMat 	= new Matrix4( );
SiriusStar.mvpMat 	= new Matrix4( );
SiriusStar.lightColor	= new Vector4( );
SiriusStar.modelSize 	= 100.0;


function drawSiriusStar( axisEnabled ){
	SiriusStar.scaleMat.setIdentity();
	SiriusStar.scaleMat.scale(SiriusStar.modelSize, SiriusStar.modelSize, SiriusStar.modelSize  );

	SiriusStar.transMat.setIdentity( );
	SiriusStar.transMat.translate( 0, 0, -200 );
	
	SiriusStar.modelMat.setIdentity();
	SiriusStar.modelMat.multiply(SiriusStar.transMat);
	SiriusStar.modelMat.multiply(SiriusStar.rotMat);
	SiriusStar.modelMat.multiply(SiriusStar.scaleMat);

	SiriusStar.mvpMat.setIdentity( );
	SiriusStar.mvpMat.multiply( scene.projMat );
	SiriusStar.mvpMat.multiply( scene.viewMat );
	SiriusStar.mvpMat.multiply( SiriusStar.modelMat );

	MVPMat.setIdentity();
	MVPMat.multiply(scene.projMat);
	MVPMat.multiply(scene.viewMat);
	MVPMat.multiply(SiriusStar.modelMat);	
	
	if( axisEnabled ) drawAxis(axis, shaderAxis, MVPMat);

	try { 
		gl.useProgram(shaderPlanets);
	}catch(err){
		alert(err);
		console.error(err.description);
	}
	
	gl.uniformMatrix4fv(shaderPlanets.uModelMat, false, MVPMat.elements);

	color[0] = 0.8; color[1] = 0.8; color[2] = 0.0;
	gl.uniform3fv(shaderPlanets.uColor, color);


	for(var o = 0; o < sphereObj.model.length; o++) { 
		draw(sphereObj.model[o], shaderPlanets, gl.TRIANGLES);
	}
}
