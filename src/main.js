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
var shaderPhong 	= null;
var shaderTexture 	= null;
var shaderNormalMap 	= null;

var axis 		= null;
var baseTexture		= null;
var sphereObj		= null;
var earthObj		= null;
var roughCubeObj	= null;
var MVPMat 		= new Matrix4();

var scene 		= new Scene( );

var video, 
    videoImage, 
    videoImageContext, 
    videoTexture;

var imageData, 
    detector, 
    posit;


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

    // Initialize camera textures
    initTexture();

    // Initialize shaders
    initializeShaderAxis( );

    initializeShaderPlanets( );	

    //initTerraShader( );

    initSolidShader( );

    initTextureShader( );

    initPhongShader( );

    initNormalMapShader( );

    // Initialize buffers
    initCubeVertexBuffers( gl );

    scene.addLight( new Light( [ 0.0,  0.0,  -300 ], [ 1.0,  1.0,  1.0, 1.0 ] ) ); // SUN
    scene.addLight( new Light( [ 0.0, 0.0, -100 ], [ 1.0,  1.0,  1.0, 1.0 ] ) ); // MOON 


    // Loading resources, fica aguardando o carregamento dos materiais e objetos
    // Após o carregamento é dado início a renderização através do mainloop animate/render.
    loadResources( );

}

function loadResources( ){
    var sphereOBJLoad = new OBJLoad( );
    sphereOBJLoad.readOBJFile("obj/sphere.obj", gl, 1, true);

    var earthOBJLoad = new OBJLoad( );
    earthOBJLoad.readOBJFile("obj/earth.obj", gl, 1, true);

    //var moonOBJLoad = new OBJLoad( );
    //moonOBJLoad.readOBJFile("obj/moon.obj", gl, 1, true);

    var normalMapOBJLoad = new OBJLoad( );
    normalMapOBJLoad.readOBJFile("obj/cubeText_NM.obj", gl, 1, true);

    var tick = function() {   // Start drawing
        if ( sphereObj == null && sphereOBJLoad.g_objDoc != null && sphereOBJLoad.g_objDoc.isMTLComplete()) { // OBJ and all MTLs are available
            sphereObj = onSphereReadComplete( gl, sphereOBJLoad );
        }

        if ( earthObj == null && earthOBJLoad.g_objDoc != null && earthOBJLoad.g_objDoc.isMTLComplete()) { // OBJ and all MTLs are available
            //earthObj = onEarthReadComplete( gl, earthOBJLoad );
            earthObj = onNormalMapReadComplete( gl, earthOBJLoad );
        }

        //if ( moonObj == null && moonOBJLoad.g_objDoc != null && moonOBJLoad.g_objDoc.isMTLComplete()) { // OBJ and all MTLs are available
        //    moonObj = onNormalMapReadComplete( gl, moonOBJLoad );
        //}

        if ( roughCubeObj == null && normalMapOBJLoad.g_objDoc != null && normalMapOBJLoad.g_objDoc.isMTLComplete()) { // OBJ and all MTLs are available
            roughCubeObj = onNormalMapReadComplete( gl, normalMapOBJLoad );
        }

        if ( earthObj != null && sphereObj != null && roughCubeObj != null 
            && earthObj.model.length > 0 && sphereObj.model.length > 0 && roughCubeObj.model.length > 0 ) {
            console.log( "Resources loaded!!" );
            animate();
        }else{
            console.log( "Waiting resources to be loaded!!" );
            detector 	= new AR.Detector();
            posit 		= new POS.Posit(90.0, canvas.width);
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

    scene.viewMat.setIdentity();
    scene.projMat.setIdentity();
    scene.projMat.setOrtho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);

    MVPMat.setIdentity();
    MVPMat.multiply(scene.projMat);
    MVPMat.multiply(scene.viewMat);


    // Desenha a imagem da câmera na tela
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //Responsável por inverter a imagem da câmera na tela
    gl.disable(gl.DEPTH_TEST);
    drawTextQuad(baseTexture, shaderBaseImage, MVPMat);
    gl.enable(gl.DEPTH_TEST);

    // Verifica os marcadores encontrados
    // Atualiza as matrizes de localização, translação e rotação dos objetos encontrados	
    updateScenes( markers );


    // Configura a matrix de projeção

    scene.viewMat.setLookAt(
            scene.cameraPos.elements[0],
            scene.cameraPos.elements[1],
            scene.cameraPos.elements[2],
            scene.cameraLook.elements[0],
            scene.cameraLook.elements[1],
            scene.cameraLook.elements[2],
            scene.cameraUp.elements[0],
            scene.cameraUp.elements[1],
            scene.cameraUp.elements[2]	
            );

    scene.projMat.setPerspective(40.0, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0);

    // Desenha uma estrela solitária na tela, sem a utilização dos marcadores
    //drawSiriusStar( true );

    // Desenha o sol caso seu marcador tenha sido encontrado
    // IF SolMarker.found = true
    drawSol( true );

    // Desenha um cubo girando na tela
    drawSolidCube( gl, shaderSolid );

    // Desenha a terra caso seu marcador tenha sido encontrado
    // IF TerraMarker.found = true
    //	drawTerra( true );

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    drawEarthTexShader( );


    if( EarthTexMarker.found )
        drawMoonTex( gl, shaderNormalMap );
        //drawMoonPhongInner( gl, shaderPhong );

   // drawSunPhong( );
    drawSunTex( gl, shaderTexture );

    drawRoughCubeShader( );
}

// ********************************************************
// Função responsável por verificar os marcadores detecados e passar 
// as coordenadas deste para os objetos a serem renderizados.
// ********************************************************
function updateScenes(markers){ //As modificações foram feitas aqui!!
    var corners, corner, pose, i;

    SolMarker.found 	= false;
    TerraMarker.found 	= false;
    CubeMarker.found 	= false;
    //EarthTexMarker.found 	= false; // Mantém o posicionamento após o marcador sumir

    //updateEarthTexAngle( );

    updateRoughCubeAngle( );

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

        //updateTerraMarker( markers[m].id, pose );
        updateEarthTex( markers[m].id, pose );

        updateSunPhong( markers[m].id, pose );

        updateRoughCube( markers[m].id, pose );
    }


// Atualizando constantemente a posição da luz da lua
    scene.lights[1].pos[0] = MoonTex.position[0]; 
    scene.lights[1].pos[1] = MoonTex.position[1]; 
    scene.lights[1].pos[2] = MoonTex.position[2]; 
    scene.updateRawLights( );
};













