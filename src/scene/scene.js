function Light( pos, color ){
	this.pos 		= pos;
	this.color 		= color;
}

function Scene( ){
	this.lights 		= new Array( );
	this.rawLightsPos 	= new Array( );
	this.rawLightsColor 	= new Array( );
	this.viewMat 		= new Matrix4();
	this.projMat 		= new Matrix4();
	this.cameraPos 		= new Vector3();
	this.cameraLook 	= new Vector3();
	this.cameraUp 		= new Vector3();

//  CAMERA DEFAULT VALUES
	this.cameraPos.elements[0] 	=  0.0;
	this.cameraPos.elements[1] 	=  0.0;
	this.cameraPos.elements[2] 	=  0.0;
	this.cameraLook.elements[0] 	=  0.0;
	this.cameraLook.elements[1] 	=  0.0;
	this.cameraLook.elements[2] 	= -1.0;
	this.cameraUp.elements[0] 	=  0.0;
	this.cameraUp.elements[1] 	=  1.0;
	this.cameraUp.elements[2] 	=  0.0;
}

Scene.prototype.addLight = function ( light ){
	this.lights.push( light );
	this.rawLightsPos 	= this.rawLightsPos.concat( light.pos );
	this.rawLightsColor 	= this.rawLightsColor.concat( light.color );
}

Scene.prototype.updateRawLights = function ( ){
    this.rawLightsPos = new Array( );
    this.rawLightsColor = new Array( );
    for( var i = 0; i < this.lights.length; i++ ) {
        this.rawLightsPos 	= this.rawLightsPos.concat( this.lights[i].pos );
        this.rawLightsColor 	= this.rawLightsColor.concat( this.lights[i].color );
    }
}
