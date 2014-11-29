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


navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;


// ********************************************************
// ********************************************************
function initGL(canvas) {
	
	var gl = canvas.getContext("webgl");
	if (!gl) {
		return (null);
		}
	
	gl.viewportWidth 	= canvas.width;
	gl.viewportHeight 	= canvas.height;
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	return gl;
}


function getHtmlElements( ){

	// assign variables to HTML elements
	video = document.getElementById("monitor");
	videoImage = document.getElementById("videoImage");
	videoImageContext = videoImage.getContext("2d");
	
	// background color if no video present
	videoImageContext.fillStyle = "#005337";
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
	
	canvas = document.getElementById("videoGL");

}

function initializeShaderBaseImagem( ){

	shaderBaseImage = initShaders("baseImage", gl);
	if (shaderBaseImage == null) {
		alert("Erro na inicilizacao do shaderBaseImage!!");
		return;
	}

	shaderBaseImage.vPositionAttr 	= gl.getAttribLocation(shaderBaseImage, "aVertexPosition");
	shaderBaseImage.vTexAttr 		= gl.getAttribLocation(shaderBaseImage, "aVertexTexture");
	shaderBaseImage.uMVPMat 		= gl.getUniformLocation(shaderBaseImage, "uMVPMat");
	shaderBaseImage.SamplerUniform	= gl.getUniformLocation(shaderBaseImage, "uSampler");

	if ( 	(shaderBaseImage.vertexPositionAttribute < 0) 	||
			(shaderBaseImage.vertexTextAttribute < 0) 		||
			(shaderBaseImage.SamplerUniform < 0) 			||
			!shaderBaseImage.uMVPMat ) {
		alert("shaderBaseImage attribute ou uniform nao localizado!");
		return;
	}
}

function initializeShaderAxis( ){

	shaderAxis 					= initShaders("Axis", gl);	
	shaderAxis.vPositionAttr 	= gl.getAttribLocation(shaderAxis, "aVertexPosition");		
	shaderAxis.vColorAttr		= gl.getAttribLocation(shaderAxis, "aVertexColor");
	shaderAxis.uMVPMat 			= gl.getUniformLocation(shaderAxis, "uMVPMat");
	
	if (	shaderAxis.vPositionAttr < 0 	|| 
			shaderAxis.vColorAttr < 0 		|| 
			!shaderAxis.uMVPMat	) {
		console.log("Error getAttribLocation shaderAxis"); 
		return;
		}
		
	axis = initAxisVertexBuffer();
	if (!axis) {
		console.log('Failed to set the AXIS vertex information');
		return;
	}

}

function initializeShaderPlanets( ){

	shaderPlanets 					= initShaders("Planets", gl);	
	shaderPlanets.vPositionAttr 	= gl.getAttribLocation(shaderPlanets, "aVertexPosition");		
	shaderPlanets.uColor 			= gl.getUniformLocation(shaderPlanets, "uColor");
	shaderPlanets.uModelMat 		= gl.getUniformLocation(shaderPlanets, "uModelMat");
	
	if (shaderPlanets.vPositionAttr < 0 || shaderPlanets.uColor  < 0 || !shaderPlanets.uModelMat) {
		console.log("Error getAttribLocation shaderPlanets"); 
		return;
	}
}

function initializeShaderTerra( ){

	shaderTerra 			= initShaders( "terra", gl );

	shaderTerra.vPositionAttr 	= gl.getAttribLocation( shaderTerra, "aVertexPosition" );
	shaderTerra.aVNorm		= gl.getAttribLocation( shaderTerra, "aVNorm" );

	shaderTerra.uModelMat		= gl.getUniformLocation( shaderTerra, "uModelMat" );
	shaderTerra.uViewMat		= gl.getUniformLocation( shaderTerra, "uViewMat" );
	shaderTerra.uProjMat		= gl.getUniformLocation( shaderTerra, "uProjMat" );
	shaderTerra.uNormMat		= gl.getUniformLocation( shaderTerra, "uNormMat" );

	shaderTerra.uCamPos		= gl.getUniformLocation( shaderTerra, "uCamPos" );
	shaderTerra.uLPos		= gl.getUniformLocation( shaderTerra, "uLPos" );
	shaderTerra.uLColor		= gl.getUniformLocation( shaderTerra, "uLColor" );
	shaderTerra.uMatAmb		= gl.getUniformLocation( shaderTerra, "uMatAmb" );
	shaderTerra.uMatDif		= gl.getUniformLocation( shaderTerra, "uMatDif" );
	shaderTerra.uMatSpec		= gl.getUniformLocation( shaderTerra, "uMatSpec" );
	shaderTerra.uExpSpec		= gl.getUniformLocation( shaderTerra, "uExpSpec" );

	if( !shaderTerra ) {
		alert( "Could not initialize shader Terra" );
	}else{
 		if( shaderTerra.aVertexPosition < 0 || shaderTerra.aVNorm < 0 ){
			alert( "ERROR: getAttribLocation shaderTerra" );
		}
 		if( !shaderTerra.uModelMat || !shaderTerra.uProjMat || !shaderTerra.uNormMat
			|| !shaderTerra.uCamPos  || !shaderTerra.uLPos
			|| !shaderTerra.uLColor  || !shaderTerra.uMatSpec 
			|| !shaderTerra.uMatAmb  || !shaderTerra.uMatDif
			|| !shaderTerra.uExpSpec ){
			alert( "ERROR: getUniformLocation shaderTerra" );
		}
	}
}

function readOBJFile(fileName, gl, scale, reverse) {
	var request = new XMLHttpRequest();
	
	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status !== 404) 
			onReadOBJFile(request.responseText, fileName, gl, scale, reverse);
		}
	request.open('GET', fileName, true); // Create a request to acquire the file
	request.send();                      // Send the request
}

function onReadOBJFile(fileString, fileName, gl, scale, reverse) {
	var objDoc = new OBJDoc(fileName);	// Create a OBJDoc object
	var result = objDoc.parse(fileString, scale, reverse);	// Parse the file
	
	if (!result) {
		g_objDoc 		= null; 
		g_drawingInfo 	= null;
		console.log("OBJ file parsing error.");
		return;
		}
		
	g_objDoc = objDoc;
}

function onReadComplete(gl) {
	
var groupModel = null;

	g_drawingInfo 	= g_objDoc.getDrawingInfo();
	
	for(var o = 0; o < g_drawingInfo.numObjects; o++) {
		
		groupModel = new Object();

		groupModel.vertexBuffer = gl.createBuffer();
		if (groupModel.vertexBuffer) {		
			gl.bindBuffer(gl.ARRAY_BUFFER, groupModel.vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, g_drawingInfo.vertices[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create vertexBuffer");
	
		groupModel.colorBuffer = null;

		groupModel.indexBuffer = gl.createBuffer();
		if (groupModel.indexBuffer) {		
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, groupModel.indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g_drawingInfo.indices[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create indexBuffer");
		
		groupModel.normalBuffer = gl.createBuffer( );
		if( groupModel.normalBuffer ){
			gl.bindBuffer( gl.ARRAY_BUFFER, groupModel.normalBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, g_drawingInfo.normals[o], gl.STATIC_DRAW );
		}else{
			alert( "ERROR: Can't create normal buffer " );
		}

		groupModel.numObjects = g_drawingInfo.indices[o].length;
		model.push(groupModel);
		}
}



// ********************************************************
// ********************************************************
function initBaseImage() {
	
	var baseImage = new Object(); 
	var vPos = new Array;
	var vTex = new Array;

	vPos.push(-1.0); 	// V0
	vPos.push(-1.0);
	vPos.push( 0.0);
	vPos.push( 1.0);	// V1
	vPos.push(-1.0);
	vPos.push( 0.0);
	vPos.push( 1.0);	// V2
	vPos.push( 1.0);
	vPos.push( 0.0);
	vPos.push(-1.0); 	// V0
	vPos.push(-1.0);
	vPos.push( 0.0);
	vPos.push( 1.0);	// V2
	vPos.push( 1.0);
	vPos.push( 0.0);
	vPos.push(-1.0);	// V3
	vPos.push( 1.0);
	vPos.push( 0.0);
			
	vTex.push( 0.0); 	// V0
	vTex.push( 0.0);
	vTex.push( 1.0);	// V1
	vTex.push( 0.0);
	vTex.push( 1.0);	// V2
	vTex.push( 1.0);
	vTex.push( 0.0); 	// V0
	vTex.push( 0.0);
	vTex.push( 1.0);	// V2
	vTex.push( 1.0);
	vTex.push( 0.0);	// V3
	vTex.push( 1.0);
		
	baseImage.vertexBuffer = gl.createBuffer();
	if (baseImage.vertexBuffer) {		
		gl.bindBuffer(gl.ARRAY_BUFFER, baseImage.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vPos), gl.STATIC_DRAW);
		}
	else
		alert("ERROR: can not create vertexBuffer");
	
	baseImage.textureBuffer = gl.createBuffer();
	if (baseImage.textureBuffer) {		
		gl.bindBuffer(gl.ARRAY_BUFFER, baseImage.textureBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vTex), gl.STATIC_DRAW);
		}
	else
		alert("ERROR: can not create textureBuffer");

	baseImage.numItems = vPos.length/3.0;
	
	return baseImage;
}


// ********************************************************
// ********************************************************

function initAxisVertexBuffer() {

var axis	= new Object(); // Utilize Object object to return multiple buffer objects
var vPos 	= new Array;
var vColor 	= new Array;

	// X Axis
	// V0
	vPos.push(0.0);
	vPos.push(0.0);
	vPos.push(0.0);
	vColor.push(1.0);
	vColor.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	// V1
	vPos.push(1.0);
	vPos.push(0.0);
	vPos.push(0.0);
	vColor.push(1.0);
	vColor.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);

	// Y Axis
	// V0
	vPos.push(0.0);
	vPos.push(0.0);
	vPos.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vColor.push(0.0);
	vColor.push(1.0);
	// V2
	vPos.push(0.0);
	vPos.push(1.0);
	vPos.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vColor.push(0.0);
	vColor.push(1.0);

	// Z Axis
	// V0
	vPos.push(0.0);
	vPos.push(0.0);
	vPos.push(0.0);
	vColor.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vColor.push(1.0);
	// V3
	vPos.push(0.0);
	vPos.push(0.0);
	vPos.push(1.0);
	vColor.push(0.0);
	vColor.push(0.0);
	vColor.push(1.0);
	vColor.push(1.0);
	
	axis.vertexBuffer = gl.createBuffer();
	if (axis.vertexBuffer) {		
		gl.bindBuffer(gl.ARRAY_BUFFER, axis.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vPos), gl.STATIC_DRAW);
		}
	else
		alert("ERROR: can not create vertexBuffer");
	
	axis.colorBuffer = gl.createBuffer();
	if (axis.colorBuffer) {		
		gl.bindBuffer(gl.ARRAY_BUFFER, axis.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vColor), gl.STATIC_DRAW);
		}
	else
		alert("ERROR: can not create colorBuffer");

	axis.numItems = vPos.length/3.0;
	
	return axis;
}

// ********************************************************
// ********************************************************

// ********************************************************
// ********************************************************

// ********************************************************
// ********************************************************
function initTexture() {

	videoTexture = gl.createTexture();		
	gl.bindTexture(gl.TEXTURE_2D, videoTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	videoTexture.needsUpdate = false;
}

