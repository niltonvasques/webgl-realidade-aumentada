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
//	gl.enable(gl.DEPTH_TEST);
	// Necessário para a correta renderização do algoritmo de phong, com a iluminação
	gl.enable(gl.CULL_FACE);
	//gl.frontFace(gl.CCW);
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
	shaderTerra.uSiriusPos		= gl.getUniformLocation( shaderTerra, "uSiriusPos" );
	shaderTerra.uLColor		= gl.getUniformLocation( shaderTerra, "uLColor" );
	shaderTerra.uMatAmb		= gl.getUniformLocation( shaderTerra, "uMatAmb" );
	shaderTerra.uMatDif		= gl.getUniformLocation( shaderTerra, "uMatDif" );
	shaderTerra.uMatSpec		= gl.getUniformLocation( shaderTerra, "uMatSpec" );
	shaderTerra.uExpSpec		= gl.getUniformLocation( shaderTerra, "uExpSpec" );
	shaderTerra.vTexCoordAttr 	= gl.getAttribLocation(shaderTerra, "aVTexCoord");
	shaderTerra.uSampler 		= gl.getUniformLocation(shaderTerra, "uSampler");
	
	if( !shaderTerra ) {
		alert( "Could not initialize shader Terra" );
	}else{
 		if( shaderTerra.aVertexPosition < 0 || shaderTerra.aVNorm < 0 ){
			alert( "ERROR: getAttribLocation shaderTerra" );
		}
 		if( !shaderTerra.uModelMat || !shaderTerra.uProjMat || !shaderTerra.uNormMat
			|| !shaderTerra.uCamPos   
			|| !shaderTerra.uLColor  || !shaderTerra.uMatSpec 
			|| !shaderTerra.uMatAmb  || !shaderTerra.uMatDif
			|| !shaderTerra.uExpSpec ){
			alert( "ERROR: getUniformLocation shaderTerra" );
		}
	}
}


function onSphereReadComplete(gl, objload) {
 	var model = new Array();	
	var groupModel = null;

	g_drawingInfo 	= objload.g_objDoc.getDrawingInfo();
	
	for(var o = 0; o < g_drawingInfo.numObjects; o++) {
		
		groupModel = new Object();

		groupModel.vertexBuffer = initArrayBufferForLaterUse(gl, g_drawingInfo.vertices[o], 3, gl.FLOAT);

		groupModel.colorBuffer = null;

		groupModel.indexBuffer = initElementArrayBufferForLaterUse(gl, g_drawingInfo.indices[o], gl.UNSIGNED_BYTE);
		
		groupModel.normalBuffer = initArrayBufferForLaterUse(gl, g_drawingInfo.normals[o], 3, gl.FLOAT);

		groupModel.numObjects = g_drawingInfo.indices[o].length;

		model.push(groupModel);

		// Unbind the buffer object
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
	var obj = new Object( );
	obj.model = model;

	return obj;
}


function onEarthReadComplete( gl, objload ) {
	var obj = new Object( );

	var model = new Array( );
	var material = new Array( );
	var textures = new Array( );
	
	var groupModel = null;

	g_drawingInfo 	= objload.g_objDoc.getDrawingInfo();
	
	for(var o = 0; o < g_drawingInfo.numObjects; o++) {
		
		groupModel = new Object();

		groupModel.vertexBuffer = gl.createBuffer();
		if (groupModel.vertexBuffer) {		
			gl.bindBuffer(gl.ARRAY_BUFFER, groupModel.vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, g_drawingInfo.vertices[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create vertexBuffer");
	
		groupModel.normalBuffer = gl.createBuffer();
		if (groupModel.normalBuffer) {		
			gl.bindBuffer(gl.ARRAY_BUFFER, groupModel.normalBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, g_drawingInfo.normals[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create normalBuffer");
		
		groupModel.texCoordBuffer = gl.createBuffer();
		if (groupModel.texCoordBuffer) {		
			gl.bindBuffer(gl.ARRAY_BUFFER, groupModel.texCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, g_drawingInfo.textCoords[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create texCoordBuffer");

		groupModel.indexBuffer = gl.createBuffer();
		if (groupModel.indexBuffer) {		
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, groupModel.indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g_drawingInfo.indices[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create indexBuffer");
		
		groupModel.numObjects 	= g_drawingInfo.indices[o].length;
		groupModel.Material 	= g_drawingInfo.materials[o];
		
		model.push(groupModel);
	}
		
  	for(var i = 0; i < g_drawingInfo.mtl.length; i++) 
		for(var j = 0; j < g_drawingInfo.mtl[i].materials.length; j++) 
			material.push(g_drawingInfo.mtl[i].materials[j]);
	
	obj.material = material;
	obj.model = model;
	obj.textures = textures;
	obj.textureOK = 0;

	initEarthTextures( obj, g_drawingInfo );
	
	return obj;
}

// ********************************************************
// ********************************************************
function initEarthTextures( obj, g_drawingInfo ) {
	
	for(var i = 0 ; i < g_drawingInfo.mtl.length ; i++) {
		var m = g_drawingInfo.mtl[i];
		for(var j = 0 ; j < m.materials.length ; j++) {
			if (m.materials[j].mapKd != "") {
				initEarthTexture( obj, m.materials[j].mapKd);
			}
		}
	}
}

// ********************************************************
// ********************************************************
function initEarthTexture( obj, filename) {
	
	var image = new Image();
	
	image.onload = function() {
		
		var t = gl.createTexture();
		
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.bindTexture(gl.TEXTURE_2D, t);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.bindTexture(gl.TEXTURE_2D, null);
		
		obj.textures.push(t);
		obj.textureOK++;
	}
	image.src = filename;
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

function initTT()
{
	terraTextura = gl.createTexture();
	terraTextura.image = new image();
	terraTextura.image.onload = function()

{
	tratarTextura(terraTextura);
}

terratextura.image.src = "xadrez.gif";
shaderTerra.samplerUniform = gl.getUniformLocation(shaderTerra, "uSampler");
}




function initArrayBufferForLaterUse(gl, data, num, type) {
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Keep the information necessary to assign to the attribute variable later
  buffer.num = num;
  buffer.type = type;

  return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
  var buffer = gl.createBuffer();　  // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

  buffer.type = type;

  return buffer;
}



// Assign the buffer objects and enable the assignment
function initAttributeVariable(gl, a_attribute, buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
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

function initTerraShader( ){
	var terraVShader = getScriptContent( "terra-vs" );
	var terraFShader = getScriptContent( "terra-fs" );


	// Initialize shaders
	shaderTerra = createProgram(gl, terraVShader, terraFShader );   

	if ( !shaderTerra ) {
		console.log('Failed to intialize shaders.');
		return;
	}

	// Get storage locations of attribute and uniform variables in program object for single color drawing
	shaderTerra.vPositionAttr 	= gl.getAttribLocation( shaderTerra, "aVertexPosition" );
	shaderTerra.aVNorm		= gl.getAttribLocation( shaderTerra, "aVNorm" );

	shaderTerra.uModelMat		= gl.getUniformLocation( shaderTerra, "uModelMat" );
	shaderTerra.uViewMat		= gl.getUniformLocation( shaderTerra, "uViewMat" );
	shaderTerra.uProjMat		= gl.getUniformLocation( shaderTerra, "uProjMat" );
	shaderTerra.uNormMat		= gl.getUniformLocation( shaderTerra, "uNormMat" );

	shaderTerra.uCamPos		= gl.getUniformLocation( shaderTerra, "uCamPos" );
	shaderTerra.uLPos		= gl.getUniformLocation( shaderTerra, "uLPos" );
	shaderTerra.uSiriusPos		= gl.getUniformLocation( shaderTerra, "uSiriusPos" );
	shaderTerra.uLColor		= gl.getUniformLocation( shaderTerra, "uLColor" );
	shaderTerra.uMatAmb		= gl.getUniformLocation( shaderTerra, "uMatAmb" );
	shaderTerra.uMatDif		= gl.getUniformLocation( shaderTerra, "uMatDif" );
	shaderTerra.uMatSpec		= gl.getUniformLocation( shaderTerra, "uMatSpec" );
	shaderTerra.uExpSpec		= gl.getUniformLocation( shaderTerra, "uExpSpec" );

	if( shaderTerra.aVertexPosition < 0 || shaderTerra.aVNorm < 0 ){
		alert( "ERROR: getAttribLocation shaderTerra" );
	}
	if( !shaderTerra.uModelMat || !shaderTerra.uProjMat || !shaderTerra.uNormMat
		|| !shaderTerra.uCamPos   
		|| !shaderTerra.uLColor  || !shaderTerra.uMatSpec 
		|| !shaderTerra.uMatAmb  || !shaderTerra.uMatDif
		|| !shaderTerra.uExpSpec ){
		alert( "ERROR: getUniformLocation shaderTerra" );
	}
}

function initTextureShader( ){
	var textureVShader = getScriptContent( "texture-vs" );
	var textureFShader = getScriptContent( "texture-fs" );


	// Initialize shaders
	shaderTexture = createProgram(gl, textureVShader, textureFShader );   

	if ( !shaderTexture ) {
		console.log('Failed to intialize shaders.');
		return;
	}

	shaderTexture.vPositionAttr 	= gl.getAttribLocation(shaderTexture, "aVPosition");		
	shaderTexture.vNormalAttr 		= gl.getAttribLocation(shaderTexture, "aVNorm");
	shaderTexture.vTexCoordAttr 	= gl.getAttribLocation(shaderTexture, "aVTexCoord");
	shaderTexture.uSampler 		= gl.getUniformLocation(shaderTexture, "uSampler");
	shaderTexture.uModelMat 		= gl.getUniformLocation(shaderTexture, "uModelMat");
	shaderTexture.uViewMat 		= gl.getUniformLocation(shaderTexture, "uViewMat");
	shaderTexture.uProjMat 		= gl.getUniformLocation(shaderTexture, "uProjMat");
	shaderTexture.uNormMat 		= gl.getUniformLocation(shaderTexture, "uNormMat");
	
	shaderTexture.uSampler	 		= gl.getUniformLocation(shaderTexture, "uSampler");	
	
	if (shaderTexture.vPositionAttr < 0 	|| 
		shaderTexture.vColorAttr < 0 		|| 
		shaderTexture.vTexCoordAttr < 0 	|| 
		!shaderTexture.uModelMat 			|| 
		!shaderTexture.uViewMat 			|| 
		!shaderTexture.uProjMat 			|| 
		!shaderTexture.uNormMat ) {
		console.log("Error getAttribLocation shaderTexture"); 
		return;
		}
		
	shaderTexture.uCamPos 			= gl.getUniformLocation(shaderTexture, "uCamPos");
	shaderTexture.uLightPos 		= gl.getUniformLocation(shaderTexture, "uLPos");
	shaderTexture.uLightColor 		= gl.getUniformLocation(shaderTexture, "uLColor");
	shaderTexture.uMatAmb 			= gl.getUniformLocation(shaderTexture, "uMatAmb");
	shaderTexture.uMatDif 			= gl.getUniformLocation(shaderTexture, "uMatDif");
	shaderTexture.uMatSpec			= gl.getUniformLocation(shaderTexture, "uMatSpec");
	shaderTexture.uExpSpec			= gl.getUniformLocation(shaderTexture, "uExpSpec");
	
	if (shaderTexture.uCamPos < 0	 		|| shaderTexture.uLightPos < 0 	|| 
		shaderTexture.uLightColor < 0		|| shaderTexture.uMatAmb < 0 		|| 
		shaderTexture.uMatDif < 0			|| shaderTexture.uMatSpec < 0 		|| 
		shaderTexture.uExpSpec < 0 ) {
		console.log("Error getAttribLocation"); 
		return;
		}

}

function initPhongShader( ){
	var phongVShader = getScriptContent( "phong-vs" );
	var phongFShader = getScriptContent( "phong-fs" );


	// Initialize shaders
	shaderPhong = createProgram(gl, phongVShader, phongFShader );   

	if ( !shaderPhong ) {
		console.log('Failed to intialize shaders.');
		return;
	}

	shaderPhong.vPositionAttr 	= gl.getAttribLocation(shaderPhong, "aVPosition");		
	shaderPhong.vNormalAttr 		= gl.getAttribLocation(shaderPhong, "aVNorm");
	shaderPhong.uModelMat 		= gl.getUniformLocation(shaderPhong, "uModelMat");
	shaderPhong.uViewMat 		= gl.getUniformLocation(shaderPhong, "uViewMat");
	shaderPhong.uProjMat 		= gl.getUniformLocation(shaderPhong, "uProjMat");
	shaderPhong.uNormMat 		= gl.getUniformLocation(shaderPhong, "uNormMat");
	
	if (shaderPhong.vPositionAttr < 0 	|| 
		shaderPhong.vColorAttr < 0 		|| 
		!shaderPhong.uModelMat 			|| 
		!shaderPhong.uViewMat 			|| 
		!shaderPhong.uProjMat 			|| 
		!shaderPhong.uNormMat ) {
		console.log("Error getAttribLocation shaderPhong"); 
		return;
	}
		
	shaderPhong.uCamPos 			= gl.getUniformLocation(shaderPhong, "uCamPos");
	shaderPhong.uLightPos 		= gl.getUniformLocation(shaderPhong, "uLPos");
	shaderPhong.uLightColor 		= gl.getUniformLocation(shaderPhong, "uLColor");
	shaderPhong.uMatAmb 			= gl.getUniformLocation(shaderPhong, "uMatAmb");
	shaderPhong.uMatDif 			= gl.getUniformLocation(shaderPhong, "uMatDif");
	shaderPhong.uMatSpec			= gl.getUniformLocation(shaderPhong, "uMatSpec");
	shaderPhong.uExpSpec			= gl.getUniformLocation(shaderPhong, "uExpSpec");
	
	if (shaderPhong.uCamPos < 0	 		|| shaderPhong.uLightPos < 0 	|| 
		shaderPhong.uLightColor < 0		|| shaderPhong.uMatAmb < 0 		|| 
		shaderPhong.uMatDif < 0			|| shaderPhong.uMatSpec < 0 		|| 
		shaderPhong.uExpSpec < 0 ) {
		console.log("Error getAttribLocation"); 
		return;
	}

}

function onNormalMapReadComplete( gl, objload ) {
	var obj = new Object( );

	var model = new Array( );
	var material = new Array( );
	var textures = new Array( );
	
	var groupModel = null;

	g_drawingInfo 	= objload.g_objDoc.getDrawingInfo();
	
	for(var o = 0; o < g_drawingInfo.numObjects; o++) {
		
		groupModel = new Object();

		groupModel.vertexBuffer = gl.createBuffer();
		if (groupModel.vertexBuffer) {		
			gl.bindBuffer(gl.ARRAY_BUFFER, groupModel.vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, g_drawingInfo.vertices[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create vertexBuffer");
	
		groupModel.normalBuffer = gl.createBuffer();
		if (groupModel.normalBuffer) {		
			gl.bindBuffer(gl.ARRAY_BUFFER, groupModel.normalBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, g_drawingInfo.normals[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create normalBuffer");
		
		groupModel.texCoordBuffer = gl.createBuffer();
		if (groupModel.texCoordBuffer) {		
			gl.bindBuffer(gl.ARRAY_BUFFER, groupModel.texCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, g_drawingInfo.textCoords[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create texCoordBuffer");

		groupModel.indexBuffer = gl.createBuffer();
		if (groupModel.indexBuffer) {		
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, groupModel.indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g_drawingInfo.indices[o], gl.STATIC_DRAW);
			}
		else
			alert("ERROR: can not create indexBuffer");
		
		groupModel.numObjects 	= g_drawingInfo.indices[o].length;
		groupModel.Material 	= g_drawingInfo.materials[o];
		
		model.push(groupModel);
	}
		
  	for(var i = 0; i < g_drawingInfo.mtl.length; i++) 
		for(var j = 0; j < g_drawingInfo.mtl[i].materials.length; j++) 
			material.push(g_drawingInfo.mtl[i].materials[j]);
	
	obj.material = material;
	obj.model = model;
	obj.textures = textures;
	obj.textureOK = 0;

	initNormalMapTextures( obj, g_drawingInfo );
	
	return obj;
}
// ********************************************************
// ********************************************************
function initNormalMapTextures( obj, g_drawingInfo ) {
	
	obj.textures	= new Array(g_drawingInfo.mtl.length*2);

	for(var i = 0 ; i < g_drawingInfo.mtl.length ; i++) {
		var m = g_drawingInfo.mtl[i];
		for(var j = 0 ; j < m.materials.length ; j++) {
			if (m.materials[j].mapKd != "") {
				initNormalMapTexture(obj, m.materials[j].mapKd, j*2);
				var normalMapFilename = m.materials[j].mapKd.replace(".jpg", "NM.jpg");		
				initNormalMapTexture(obj, normalMapFilename, j*2+1);
				}
			}
		}
}

// ********************************************************
// ********************************************************
function initNormalMapTexture( obj, filename, texInd) {
	
	var image = new Image();
	
	image.onload = function() {
		
		var t = gl.createTexture();
		
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.bindTexture(gl.TEXTURE_2D, t);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		
		obj.textures[texInd] = t;
		obj.textureOK++;
	}
	image.src = filename;
}
