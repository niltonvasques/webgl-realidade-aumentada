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
var sphereModel		= null;
var earthObj		= null;
var color 		= new Float32Array(3);
var modelMat 		= new Matrix4();
var ViewMat 		= new Matrix4();
var ProjMat 		= new Matrix4();
var MVPMat 		= new Matrix4();

var cameraPos 		= new Vector3();
var cameraLook 		= new Vector3();
var cameraUp 		= new Vector3();

var SiriusStar 		= new Object();
SiriusStar.rotMat 	= new Matrix4( );
SiriusStar.transMat 	= new Matrix4( );
SiriusStar.scaleMat 	= new Matrix4( );
SiriusStar.modelMat 	= new Matrix4( );
SiriusStar.mvpMat 	= new Matrix4( );
SiriusStar.lightColor	= new Vector4( );


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

// Initialize textures
	initTexture();

// Initialize shaders
	initializeShaderAxis( );
			
	initializeShaderPlanets( );	

	initTerraShader( );

	initSolidShader( );

	initTextureShader( );

// Initialize buffers
	initCubeVertexBuffers( gl );

	// Loading resources, fica aguardando o carregamento dos materiais e objetos
	// Após o carregamento é dado início a renderização através do mainloop animate/render.
	loadResources( );
	
}

function loadResources( ){
	var sphereOBJLoad = new OBJLoad( );
	sphereOBJLoad.readOBJFile("obj/sphere.obj", gl, 1, true);

	var earthOBJLoad = new OBJLoad( );
	earthOBJLoad.readOBJFile("obj/earth.obj", gl, 1, true);
	
	var tick = function() {   // Start drawing
		if ( sphereModel == null && sphereOBJLoad.g_objDoc != null && sphereOBJLoad.g_objDoc.isMTLComplete()) { // OBJ and all MTLs are available
			sphereModel = onSphereReadComplete( gl, sphereOBJLoad );
		}
		if ( earthObj == null && earthOBJLoad.g_objDoc != null && earthOBJLoad.g_objDoc.isMTLComplete()) { // OBJ and all MTLs are available
			earthObj = onEarthReadComplete( gl, earthOBJLoad );
		}
		
		if ( earthObj != null && sphereModel != null && earthObj.model.length > 0 && sphereModel.length > 0) {
		//if ( sphereModel != null && sphereModel.length > 0) {
			console.log( "Resources loaded!!" );
			configureCameraPosition( );	
			rotMat.setIdentity();
			transMat.setIdentity();
			animate();
		}else{
			console.log( "Waiting resources to be loaded!!" );
			detector 	= new AR.Detector();
			posit 		= new POS.Posit(modelSize, canvas.width);
			requestAnimationFrame(tick, canvas);
		}
	};	
	tick();
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
	drawTerra( true );
}

// ********************************************************
// ********************************************************
function updateScenes(markers){ //As modificações foram feitas aqui!!
	var corners, corner, pose, i;

	SolMarker.found 	= false;
	TerraMarker.found 	= false;
	CubeMarker.found 	= false;

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
   		
		updateTerraMarker( markers[m].id, pose );
	}
};



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


	for(var o = 0; o < sphereModel.length; o++) { 
		draw(sphereModel[o], shaderPlanets, gl.TRIANGLES);
	}
}

// Basically, vertex attrib 0 has to be enabled or else OpenGL 
// will not render where as OpenGL ES 2.0 will. 
// https://www.khronos.org/webgl/public-mailing-list/archives/1005/msg00053.html
function workaroundFixBindAttribZeroProblem(){
	try{
		gl.bindBuffer( gl.ARRAY_BUFFER, sphereModel[0].vertexBuffer );
		gl.vertexAttribPointer( 0, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( 0 );
        }catch( err ){
                alert( err );
                console.log( err.description );
        }
}


