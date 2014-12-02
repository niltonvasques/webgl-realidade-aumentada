function tratarTextura(textura)
{
	gl.bindTexture(gl.TEXTURE_2d, textura);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textura.image);
	gl.texParametri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParametri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function OBJLoad( ){
	this.g_objDoc 		= null;	// The information of OBJ file
	this.g_drawingInfo 	= null;	// The information for drawing 3D model
	this.result		= null;
}


OBJLoad.prototype.onReadOBJFile = function(fileString, fileName, gl, scale, reverse) {
	var objDoc = new OBJDoc(fileName);	// Create a OBJDoc object
	this.result = objDoc.parse(fileString, scale, reverse);	// Parse the file
	
	if (!this.result) {
		this.g_objDoc 		= null; 
		this.g_drawingInfo 	= null;
		console.log("OBJ file parsing error.");
		return;
	}
		
	this.g_objDoc = objDoc;
}

OBJLoad.prototype.readOBJFile = function(fileName, gl, scale, reverse) {
	var obj = this;
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status !== 404) 
			obj.onReadOBJFile(request.responseText, fileName, gl, scale, reverse);
		}
	request.open('GET', fileName, true); // Create a request to acquire the file
	request.send();                      // Send the request
}

