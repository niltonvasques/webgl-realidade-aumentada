function drawTextQuad(o, shaderProgram, MVPMat) {
	
	try {
		gl.useProgram(shaderProgram);
	} catch(err) {
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
	} else {
		alert("o.vertexBuffer == null");
		return;
	}

	if (o.textureBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.textureBuffer);
		gl.vertexAttribPointer(shaderProgram.vTexAttr, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vTexAttr);
	} else {
		alert("o.textureBuffer == null");
  		return;
	}
   	
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
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
	//gl.uniform1i(textShader.uSampler, 0);
/*
	if (o.texCoordBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.texCoordBuffer);
		gl.vertexAttribPointer(shaderProgram.vTexCoordAttr, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vTexCoordAttr);
		}
	else
		alert("o.texCoordBuffer == null");

*/
/*
	if (texture[o.Material] != null)
	{
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture[[o.Material]]);
	}
*/
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

	gl.drawElements(primitive, o.numObjects, gl.UNSIGNED_SHORT, 0);

	gl.bindTexture(gl.TEXTURE_2D, null);
}


// ********************************************************
// ********************************************************
function drawAxis(o, shaderProgram, MVPMat) {

	try {
		gl.useProgram(shaderProgram);
	}catch(err){
		alert(err);
		console.error(err.description);
    	}
    	
 	gl.uniformMatrix4fv(shaderProgram.uMVPMat, false, MVPMat.elements);
   	
	if (o.vertexBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.vertexBuffer);
		gl.vertexAttribPointer(shaderProgram.vPositionAttr, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vPositionAttr);  
	} else {
		alert("o.vertexBuffer == null");
		return;
	}

	if (o.colorBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, o.colorBuffer);
		gl.vertexAttribPointer(shaderProgram.vColorAttr, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.vColorAttr);
	} else {
		alert("o.colorBuffer == null");
  		return;
	}

	gl.drawArrays(gl.LINES, 0, o.numItems);
}


		
	

	
