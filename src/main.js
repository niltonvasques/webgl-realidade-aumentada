/*
 * Universidade Federal da Bahia
 * Disciplina: Computação Gráfica - MATA65
 * Prof. Apolinário 
 * Semestre: 2014.2
 * 
 * Trabalho Prático 1
 * 
 * Autores: Nilton Vasques Carvalho e Jean Francescoli
 *
*/

var gl;

// SHADERS
var shaderBaseImage	= null;
var shaderAxis		= null;
var shaderPlanets   	= null;
var shaderTerra   	= null;
var shaderSolid 	= null;

var axis 		= null;
var baseTexture		= null;
var model		= new Array;
var color 		= new Float32Array(3);
var modelMat 		= new Matrix4();
var ViewMat 		= new Matrix4();
var ProjMat 		= new Matrix4();
var MVPMat 		= new Matrix4();

var cameraPos 		= new Vector3();
var cameraLook 		= new Vector3();
var cameraUp 		= new Vector3();

var g_objDoc 		= null;	// The information of OBJ file
var g_drawingInfo 	= null;	// The information for drawing 3D model

// A biblioteca Aruco detecta os markers e atribui um id único de acordo
// com o desenho do marker.
// Aqui ficará declarado todos os marcadores que iremos utilizar na aplicação.
//
var SolMarker 		= new Object();
SolMarker.id		= 24;
SolMarker.rotMat 	= new Matrix4( );
SolMarker.transMat 	= new Matrix4( );
SolMarker.scaleMat 	= new Matrix4( );
SolMarker.modelMat 	= new Matrix4( );
SolMarker.mvpMat 	= new Matrix4( );
SolMarker.lightColor	= new Vector4( );

var TerraMarker 	= new Object();
TerraMarker.id		= 23;
TerraMarker.normMat 	= new Matrix4( );
TerraMarker.rotMat 	= new Matrix4( );
TerraMarker.transMat 	= new Matrix4( );
TerraMarker.scaleMat 	= new Matrix4( );
TerraMarker.lightColor	= new Vector4( );
TerraMarker.matAmb	= new Vector4( );
TerraMarker.matDif	= new Vector4( );
TerraMarker.matSpec	= new Vector4( );
TerraMarker.Ns 		= 100.0;


var SiriusStar 		= new Object();
SiriusStar.rotMat 	= new Matrix4( );
SiriusStar.transMat 	= new Matrix4( );
SiriusStar.scaleMat 	= new Matrix4( );
SiriusStar.modelMat 	= new Matrix4( );
SiriusStar.mvpMat 	= new Matrix4( );
SiriusStar.lightColor	= new Vector4( );

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

var video, 
	videoImage, 
	videoImageContext, 
	videoTexture;

var imageData, 
	detector, 
	posit;

var modelSize 	= 90.0; //millimeters

var rotMat 	= new Matrix4();
var transMat 	= new Matrix4();
var scaleMat 	= new Matrix4();


var yaw 		= 0.0,
	pitch 		= 0.0,
	roll		= 0.0;

function main() {
	// Initializing Camera 	
	startCamera( );

	// Load html elements
	getHtmlElements( );

	gl = initGL(canvas);
		
	if (!gl) { 
		alert("Could not initialise WebGL, sorry :-(");
		return;
	}

	initializeShaderBaseImagem( );
		
	baseTexture = initBaseImage();
	if (!baseTexture) {
		console.log('Failed to set the baseTexture vertex information');
		return;
	}
	initTexture();

	initializeShaderAxis( );
			
	initializeShaderPlanets( );	

//	initializeShaderTerra( );

	initSolidShader( );

	initCubeVertexBuffers( gl );

	// Loading resources, fica aguardando o carregamento dos materiais e objetos
	// Após o carregamento é dado início a renderização através do mainloop animate/render.
	loadingResources( );
	
}

function initSolidShader( ){
	var solidVShader = getScriptContent( "solid-vs" );
	var solidFShader = getScriptContent( "solid-fs" );


	// Initialize shaders
	shaderSolid = createProgram(gl, solidVShader, solidFShader );   

	if ( !shaderSolid ) {
		console.log('Failed to intialize shaders.');
		return;
	}

	// Get storage locations of attribute and uniform variables in program object for single color drawing
	shaderSolid.a_Position = gl.getAttribLocation(shaderSolid, 'a_Position');
	shaderSolid.a_Normal = gl.getAttribLocation(shaderSolid, 'a_Normal');
	shaderSolid.u_MvpMatrix = gl.getUniformLocation(shaderSolid, 'u_MvpMatrix');
	shaderSolid.u_NormalMatrix = gl.getUniformLocation(shaderSolid, 'u_NormalMatrix');

	if (shaderSolid.a_Position < 0 || shaderSolid.a_Normal < 0 || 
		!shaderSolid.u_MvpMatrix || !shaderSolid.u_NormalMatrix ) { 
		console.log('Failed to get the storage location of attribute or uniform variable'); 
		return;
	}

}

/*
 * Main loop do programa
 * Responsável por requisitar um novo frame a todo instante
 */
function animate() {
	requestAnimationFrame(animate);

	render();		
}

// ********************************************************
// ********************************************************
function render() {	
	if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
		videoImageContext.drawImage( video, 0, 0, videoImage.width, videoImage.height );
		videoTexture.needsUpdate = true;
		imageData = videoImageContext.getImageData(0, 0, videoImage.width, videoImage.height);
		var markers = detector.detect(imageData);
	
		drawCorners(markers);
		
		drawScene(markers);
	}
}

function drawCorners(markers){

	var corners, corner, i, j;

	videoImageContext.lineWidth = 3;

	for (i = 0; i < markers.length; ++ i){
		corners = markers[i].corners;

		videoImageContext.strokeStyle = "red";
		videoImageContext.beginPath();

		for (j = 0; j < corners.length; ++ j){
			corner = corners[j];
			videoImageContext.moveTo(corner.x, corner.y);
			corner = corners[(j + 1) % corners.length];
			videoImageContext.lineTo(corner.x, corner.y);
		}

		videoImageContext.stroke();
		videoImageContext.closePath();

		videoImageContext.strokeStyle = "green";
		videoImageContext.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
	}
};

function drawScene(markers) {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	if (!videoTexture.needsUpdate) 
		return;
	
	modelMat.setIdentity();
	ViewMat.setIdentity();
	ProjMat.setIdentity();
	ProjMat.setOrtho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
	
	MVPMat.setIdentity();
	MVPMat.multiply(ProjMat);
	MVPMat.multiply(ViewMat);
	MVPMat.multiply(modelMat);
		
	drawTextQuad(baseTexture, shaderBaseImage, MVPMat);

// Verifica os marcadores encontrados
// Atualiza as matrizes de localização, translação e rotação dos objetos encontrados	
	updateScenes( markers );

	ViewMat.setLookAt(	0.0, 0.0, 0.0,
    					0.0, 0.0, -1.0,
    					0.0, 1.0, 0.0 );
    
	ProjMat.setPerspective(40.0, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0);

	drawSiriusStar( true );

// Desenha o sol caso seu marcador tenha sido encontrado
// IF SolMarker.found = true
	drawSol( true );

	// Calculate the view projection matrix
	var viewProjMatrix = new Matrix4();
	viewProjMatrix.setPerspective(30.0, gl.viewportWidth / gl.viewportHeight, 1.0, 100.0);
	viewProjMatrix.lookAt(0.0, 0.0, 15.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

	drawSolidCube( gl, shaderSolid );

// Desenha a terra caso seu marcador tenha sido encontrado
// IF TerraMarker.found = true
//	drawTerra( true );
}

// ********************************************************
// ********************************************************
function updateScenes(markers){ //As modificações foram feitas aqui!!
	var corners, corner, pose, i;

	SolMarker.found 	= false;
	TerraMarker.found 	= false;

	for(var m = 0; m < markers.length; m++ ){

		corners = markers[m].corners;
		
		for (i = 0; i < corners.length; ++ i) {
			corner = corners[i];
			corner.x = corner.x - (canvas.width / 2);
			corner.y = (canvas.height / 2) - corner.y;
		}
		
		pose = posit.pose(corners);
					
		updateSolMarker( markers[m].id, pose );
		updateCube( markers[m].id, pose );
   		
//		updateTerraMarker( markers[m].id, pose );
	}
};

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


var ANGLE_STEP = 30;   // The increments of rotation angle (degrees)
var last = Date.now(); // Last time that this function was called
function updateCube( markerId, pose ) {
	var now = Date.now();   // Calculate the elapsed time
	var elapsed = now - last;
	last = now;
	// Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = CubeMarker.angle + (ANGLE_STEP * elapsed) / 1000.0;
	CubeMarker.angle = newAngle % 360;

	if( markerId != CubeMarker.id ){
		return;
	}

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

function loadingResources( ){
	readOBJFile("sphere.obj", gl, 1, true);

	var tick = function() {   // Start drawing
		if (g_objDoc != null && g_objDoc.isMTLComplete()) { // OBJ and all MTLs are available
			
			onReadComplete(gl);
			
			g_objDoc = null;
			
			configureCameraPosition( );	
		}
		if (model.length > 0) {
			rotMat.setIdentity();
			transMat.setIdentity();
			animate();
		}else{
			detector 	= new AR.Detector();
			posit 		= new POS.Posit(modelSize, canvas.width);
			requestAnimationFrame(tick, canvas);
		}
	};	
	tick();
}

function configureCameraPosition( ){
	cameraPos.elements[0] 	= 0.8;
	cameraPos.elements[1] 	= 0.8;
	cameraPos.elements[2] 	= 0.8;
	cameraLook.elements[0] 	= 0.0;
	cameraLook.elements[1] 	= 0.0;
	cameraLook.elements[2] 	= 0.0;
	cameraUp.elements[0] 	= 0.0;
	cameraUp.elements[1] 	= 1.0;
	cameraUp.elements[2] 	= 0.0;
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


	for(var o = 0; o < model.length; o++) { 
		draw(model[o], shaderPlanets, gl.TRIANGLES);
	}
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

function drawSiriusStar( axisEnabled ){
	SiriusStar.scaleMat.setIdentity();
	SiriusStar.scaleMat.scale( modelSize, modelSize, modelSize );

	SiriusStar.transMat.setIdentity( );
	SiriusStar.transMat.translate( 180, 120, -1000 );
	
	SiriusStar.modelMat.setIdentity();
	SiriusStar.modelMat.multiply(SiriusStar.transMat);
	SiriusStar.modelMat.multiply(SiriusStar.rotMat);
	SiriusStar.modelMat.multiply(SiriusStar.scaleMat);

	SiriusStar.mvpMat.setIdentity( );
	SiriusStar.mvpMat.multiply( ProjMat );
	SiriusStar.mvpMat.multiply( ViewMat );
	SiriusStar.mvpMat.multiply( SiriusStar.modelMat );

	MVPMat.setIdentity();
	MVPMat.multiply(ProjMat);
	MVPMat.multiply(ViewMat);
	MVPMat.multiply(SiriusStar.modelMat);	
	
	if( axisEnabled ) drawAxis(axis, shaderAxis, MVPMat);

	try { 
		gl.useProgram(shaderPlanets);
	}catch(err){
		alert(err);
		console.error(err.description);
	}
	
	gl.uniformMatrix4fv(shaderPlanets.uModelMat, false, MVPMat.elements);

	color[0] = 0.8; color[1] = 0.8; color[2] = 1.0;
	gl.uniform3fv(shaderPlanets.uColor, color);


	for(var o = 0; o < model.length; o++) { 
		draw(model[o], shaderPlanets, gl.TRIANGLES);
	}
}

// Basically, vertex attrib 0 has to be enabled or else OpenGL 
// will not render where as OpenGL ES 2.0 will. 
// https://www.khronos.org/webgl/public-mailing-list/archives/1005/msg00053.html
function workaroundFixBindAttribZeroProblem(){
	try{
		gl.bindBuffer( gl.ARRAY_BUFFER, model[0].vertexBuffer );
		gl.vertexAttribPointer( 0, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( 0 );
        }catch( err ){
                alert( err );
                console.log( err.description );
        }
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
	MVPMat.multiply( ProjMat );
	MVPMat.multiply( ViewMat );
	MVPMat.multiply( CubeMarker.modelMat );	

	CubeMarker.mvpMat.setIdentity( );
	CubeMarker.mvpMat.multiply( ProjMat );
	CubeMarker.mvpMat.multiply( ViewMat );
	CubeMarker.mvpMat.multiply( CubeMarker.modelMat );

	// Calculate transformation matrix for normals and pass it to u_NormalMatrix
	CubeMarker.normalMat.setInverseOf( CubeMarker.modelMat );
	CubeMarker.normalMat.transpose( );
	gl.uniformMatrix4fv(program.u_NormalMatrix, false, CubeMarker.normalMat.elements);

	gl.uniformMatrix4fv(program.u_MvpMatrix, false, CubeMarker.mvpMat.elements);

	gl.drawElements(gl.TRIANGLES, CubeMarker.numIndices, CubeMarker.indexBuffer.type, 0);   // Draw
}


