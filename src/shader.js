function drawTextQuad(o, shaderProgram, MVPMat) {
	
    try {
    	gl.useProgram(shaderProgram);
		}
	catch(err){
        alert(err);
        console.error(err.description);
    	}
    	
 	gl.uniformMatrix4fv(shaderProgram.uMVPMat, false, MVPMat.elements);
   	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, videoTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoImage);
	videoTexture.needsUpdate = false;	
	gl.uniform1i(shaderProgram.SamplerUniform, 0);
		
	if (o.vertexBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.vertexBuffer);
		gl.vertexAttribPointer(shaderProgram.vPositionAttr, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vPositionAttr);  
		}
	else {
		alert("o.vertexBuffer == null");
		return;
		}

	if (o.textureBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.textureBuffer);
		gl.vertexAttribPointer(shaderProgram.vTexAttr, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vTexAttr);
		}
	else {
		alert("o.textureBuffer == null");
  		return;
		}
   	
	gl.drawArrays(gl.TRIANGLES, 0, o.numItems);
}

function draw(o, shaderProgram, primitive) {

	if (o.vertexBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.vertexBuffer);
		gl.vertexAttribPointer(shaderProgram.vPositionAttr, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vPositionAttr);  
		}
	else {
		alert("o.vertexBuffer == null");
		return;
		}

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

	gl.drawElements(primitive, o.numObjects, gl.UNSIGNED_SHORT, 0);
}


// ********************************************************
// ********************************************************
function drawAxis(o, shaderProgram, MVPMat) {

    try {
    	gl.useProgram(shaderProgram);
		}
	catch(err){
        alert(err);
        console.error(err.description);
    	}
    	
 	gl.uniformMatrix4fv(shaderProgram.uMVPMat, false, MVPMat.elements);
   	
	if (o.vertexBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.vertexBuffer);
		gl.vertexAttribPointer(shaderProgram.vPositionAttr, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vPositionAttr);  
		}
	else {
		alert("o.vertexBuffer == null");
		return;
	}

	if (o.colorBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.colorBuffer);
		gl.vertexAttribPointer(shaderProgram.vColorAttr, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vColorAttr);
		}
	else {
		alert("o.colorBuffer == null");
  		return;
		}

	gl.drawArrays(gl.LINES, 0, o.numItems);
}

function webGLStart() {

	if (!navigator.getUserMedia) {
		document.getElementById("output").innerHTML = 
			"Sorry. <code>navigator.getUserMedia()</code> is not available.";
	}
	navigator.getUserMedia({video: true}, gotStream, noStream);

	// assign variables to HTML elements
	video = document.getElementById("monitor");
	videoImage = document.getElementById("videoImage");
	videoImageContext = videoImage.getContext("2d");
	
	// background color if no video present
	videoImageContext.fillStyle = "#005337";
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
	
	
	canvas = document.getElementById("videoGL");
	gl = initGL(canvas);
		
	if (!gl) { 
		alert("Could not initialise WebGL, sorry :-(");
		return;
		}
		
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
		
	baseTexture = initBaseImage();
	if (!baseTexture) {
		console.log('Failed to set the baseTexture vertex information');
		return;
		}
	initTexture();
			
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

	shaderPlanets 					= initShaders("Planets", gl);	
	shaderPlanets.vPositionAttr 	= gl.getAttribLocation(shaderPlanets, "aVertexPosition");		
	shaderPlanets.uColor 			= gl.getUniformLocation(shaderPlanets, "uColor");
	shaderPlanets.uModelMat 		= gl.getUniformLocation(shaderPlanets, "uModelMat");
	
	if (shaderPlanets.vPositionAttr < 0 || shaderPlanets.uColor  < 0 || !shaderPlanets.uModelMat) {
		console.log("Error getAttribLocation shaderPlanets"); 
		return;
		}
	
	
	readOBJFile("sphere.obj", gl, 1, true);
	
var tick = function() {   // Start drawing
		if (g_objDoc != null && g_objDoc.isMTLComplete()) { // OBJ and all MTLs are available
			
			onReadComplete(gl);
			
			g_objDoc = null;
			
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
		if (model.length > 0) {
	//		
			animate();
			rotMat.setIdentity();
			transMat.setIdentity();
			animate();
			}
		else{
			detector 	= new AR.Detector();
	
			posit 		= new POS.Posit(modelSize, canvas.width);
	
			requestAnimationFrame(tick, canvas);
		}
		};	
	tick();
}

		
	

	
