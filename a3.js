/////////////////////////////////////////////////////////////////////////////////////////
//  UBC CPSC 314,  Vjan2018
//  Assignment Template
/////////////////////////////////////////////////////////////////////////////////////////


// SETUP RENDERER & SCENE
var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
var camera;
var cameraFov = 30;     // initial camera vertical field of view, in degrees

renderer.setClearColor(0xd0f0d0); // set background colour
canvas.appendChild(renderer.domElement);

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
   }

// ADAPT TO WINDOW RESIZE
function resize() {
  console.log('resize called');
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

var animation = true;
var aniTime = 0.0;

var light;
var torus;
var worldFrame;
var sphere;
var box;
var mcc;
var floor;
var cylinder;
var cone;
var customObject;
var laserLine;
var models;

var body;
var leftLeg;
var rightLeg;

var loadingManager = null;
var RESOURCES_LOADED = false;

////////////////////////////////////////////////////////////
// Keyframe   and   KFobj  classes
////////////////////////////////////////////////////////////

class Keyframe {
 constructor(name,time,avars) {
 this.name = name;
 this.time = time;
 this.avars = avars;
 }
}

class KFobj {
    constructor(setMatricesFunc) {
	this.keyFrameArray = [];          // list of keyframes
	this.maxTime = 0.0;               // time of last keyframe
	this.currTime = 0.0;              // current playback time
	this.setMatricesFunc = setMatricesFunc;    // function to call to update transformation matrices
    };
    reset() {                     // go back to first keyframe
	this.currTime = 0.0;
    };
    add(keyframe) {               // add a new keyframe at end of list
	this.keyFrameArray.push(keyframe);
	if (keyframe.time > this.maxTime)
	    this.maxTime = keyframe.time;
    };
    timestep(dt) {                //  take a time-step;  loop to beginning if at end
	this.currTime += dt;
	if (this.currTime > this.maxTime) 
	    this.currTime = 0;
    }
    getAvars() {                  //  compute interpolated values for the current time
	var i = 1;
	while (this.currTime > this.keyFrameArray[i].time)       // find the right pair of keyframes
	    i++;
	var avars = [];
	for (var n=0; n<this.keyFrameArray[i-1].avars.length; n++) {   // interpolate the values
	    var y0 = this.keyFrameArray[i-1].avars[n];
	    var y1 = this.keyFrameArray[i].avars[n];
	    var x0 = this.keyFrameArray[i-1].time;
	    var x1 = this.keyFrameArray[i].time;
	    var x = this.currTime;
	    var y = y0 + (y1-y0)*(x-x0)/(x1-x0);    // linearly interpolate
	    avars.push(y);
	}
	return avars;         // return list of interpolated avars
    };
}

////////////////////////////////////////////////////////////////////////
// setup animated objects
////////////////////////////////////////////////////////////////////////

    // keyframes for the detailed T-rex:   name, time, [x, y, z]
var trexKFobj = new KFobj(trexSetMatrices);     
trexKFobj.add(new Keyframe('rest pose',0.0, [0,1.9,0]));
trexKFobj.add(new Keyframe('rest pose',1.0, [1,1.9,0]));
trexKFobj.add(new Keyframe('rest pose',2.0, [1,2.9,0]));
trexKFobj.add(new Keyframe('rest pose',3.0, [0,2.9,0]));
trexKFobj.add(new Keyframe('rest pose',4.0, [0,1.9,0]));

  // basic interpolation test
console.log('kf 0.1 = ',trexKFobj.getAvars(0.1));    // interpolate for t=0.1
console.log('kf 2.9 = ',trexKFobj.getAvars(2.9));    // interpolate for t=2.9

    // keyframes for mydino:    name, time, [x, y, theta1, theta2]
var mydinoKFobj= new KFobj(mydinoSetMatrices);  
mydinoKFobj.add(new Keyframe('rest pose',0.0, [8, 1,    30, -30]));
mydinoKFobj.add(new Keyframe('rest pose',0.5, [8, 1.8, 20, -20]));
mydinoKFobj.add(new Keyframe('rest pose',1.0, [8, 1.8,  -20, 20]));
mydinoKFobj.add(new Keyframe('rest pose',1.5, [8, 1, -30, 30]));
mydinoKFobj.add(new Keyframe('rest pose',2.0, [8, 1.8,  -20, 20]));
mydinoKFobj.add(new Keyframe('rest pose',2.5, [8, 1.8, 20, -20]));
mydinoKFobj.add(new Keyframe('rest pose',3.0, [8, 1,    30, -30]));

  // optional:   allow avar indexing by name
  // i.e., instead of   avar[1]    one can also use:    avar[ trexIndex["y"]]  
var trexIndex = {"x":0, "y":1, "z":2};   Object.freeze(trexIndex);

/////////////////////////////////////////////////////////////////////////////////////
// MATERIALS:  global scope within this file
/////////////////////////////////////////////////////////////////////////////////////

var diffuseMaterial;
var diffuseMaterialB;
var diffuseMaterial2;
var basicMaterial;
var normalShaderMaterial;
var dinoMaterial;
var floorMaterial;
var shaderFiles;

dinoGreenMaterial = new THREE.MeshLambertMaterial( {color: 0x4fff4f} );
laserLineMaterial = new THREE.LineBasicMaterial( {color: 0xff0000} );
diffuseMaterial = new THREE.MeshLambertMaterial( {color: 0x7f7fff} );
diffuseMaterialB = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.BackSide} );
diffuseMaterial2 = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide } );
basicMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000} );

floorTexture = new THREE.ImageUtils.loadTexture('images/floor.jpg');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(1, 1);
floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });

// CUSTOM SHADERS
shaderFiles = [	'glsl/armadillo.vs.glsl', 'glsl/armadillo.fs.glsl' ];
normalShaderMaterial = new THREE.ShaderMaterial();
normalShaderMaterial.side = THREE.BackSide;      // dino has the vertex normals pointing inwards!

new THREE.SourceLoader().load( shaderFiles, function(shaders) {
	normalShaderMaterial.vertexShader = shaders['glsl/armadillo.vs.glsl'];
	normalShaderMaterial.fragmentShader = shaders['glsl/armadillo.fs.glsl'];
})

var meshes = {};   // Meshes index

////////////////////////////////////////////////////////////////////////	
// init():  setup up scene
////////////////////////////////////////////////////////////////////////	

function init() {
    console.log('init called');

    initCamera();
    initLights();
    initObjects();
    initFileObjects();
};

//////////////////////////////////////////////////////////
//  initCamera():   SETUP CAMERA
//////////////////////////////////////////////////////////

function initCamera() {

    // set up M_proj    (internally:  camera.projectionMatrix )
    camera = new THREE.PerspectiveCamera(cameraFov,1,0.1,1000); // view angle, aspect ratio, near, far

    // set up M_view:   (internally:  camera.matrixWorldInverse )
    camera.position.set(0,12,20);
    camera.up = new THREE.Vector3(0,1,0);
    camera.lookAt(0,0,0);
    scene.add(camera);

      // SETUP ORBIT CONTROLS OF THE CAMERA
    var controls = new THREE.OrbitControls(camera);
    controls.damping = 0.2;
    controls.autoRotate = false;
};

////////////////////////////////////////////////////////////////////////	
// initLights():  SETUP LIGHTS
////////////////////////////////////////////////////////////////////////	

function initLights() {
    light = new THREE.PointLight(0xffffff);
    light.position.set(0,4,20);
    scene.add(light);
    ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
};

////////////////////////////////////////////////////////////////////////	
// initObjects():  setup up scene
////////////////////////////////////////////////////////////////////////	

function initObjects() {

      // torus
    torusGeometry = new THREE.TorusGeometry( 1, 0.4, 10, 20 );
    torus = new THREE.Mesh( torusGeometry, diffuseMaterial);
    torus.position.set(6, 1.2, -8);   // translation
    torus.rotation.set(0,0,0);     // rotation about x,y,z axes
    scene.add( torus );

      // sphere representing light source
    sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);    // radius, segments, segments
    sphere = new THREE.Mesh(sphereGeometry, basicMaterial);    
    sphere.position.set(0,4,2);
    sphere.position.set(light.position.x, light.position.y, light.position.z);
    scene.add(sphere);

      // world-frame axes
    worldFrame = new THREE.AxisHelper(5) ;
    scene.add(worldFrame);

      // box
    boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );    // width, height, depth
    box = new THREE.Mesh( boxGeometry, diffuseMaterial );
    box.position.set(-6, 0.5, -8);
    scene.add( box );
    
      // floor
    floorGeometry = new THREE.PlaneBufferGeometry(20,20);
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = 0;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
    
      // cylinder
    cylinderGeometry = new THREE.CylinderGeometry( 0.30, 0.30, 1, 20, 4 );
    cylinder = new THREE.Mesh( cylinderGeometry, diffuseMaterial);
    scene.add( cylinder );            
    cylinder.matrixAutoUpdate = true;
    cylinder.position.set(2, 0.5, -8);

      //  mcc:  multi-colour cube     [https://stemkoski.github.io/Three.js/HelloWorld.html] 
    var cubeMaterialArray = [];    // one material for each side of cube;  order: x+,x-,y+,y-,z+,z-
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff3333 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff8800 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xffff33 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x33ff33 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x3333ff } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x8833ff } ) );
    var mccMaterials = new THREE.MeshFaceMaterial( cubeMaterialArray );
    var mccGeometry = new THREE.BoxGeometry( 1,1,1, 1, 1, 1 );   // xyzz size,  xyz # segs
    mcc = new THREE.Mesh( mccGeometry, mccMaterials );   // 
    mcc.position.set(-4,0.5,-8);
    scene.add( mcc );	
    
      // cone
    coneGeometry = new THREE.CylinderGeometry( 0.0, 0.50, 1, 20, 4 ); // rTop, rBot, h, #rsegs, #hsegs
    cone = new THREE.Mesh( coneGeometry, diffuseMaterial);
    cone.position.set(-2,0.5,-8)
    scene.add( cone);
    
    //  CUSTOM OBJECT 
    var geom = new THREE.Geometry(); 
    var v0 = new THREE.Vector3(0,0,0);
    var v1 = new THREE.Vector3(3,0,0);
    var v2 = new THREE.Vector3(0,3,0);
    var v3 = new THREE.Vector3(3,3,0);
    geom.vertices.push(v0);
    geom.vertices.push(v1);
    geom.vertices.push(v2);
    geom.vertices.push(v3);
    geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
    geom.faces.push( new THREE.Face3( 1, 3, 2 ) );
    geom.computeFaceNormals();
    customObject = new THREE.Mesh( geom, diffuseMaterial2 );
    customObject.position.set(0, 0, -10);
    scene.add(customObject);

      // laser line
    var geom = new THREE.Geometry(); 
    var vL0 = new THREE.Vector3(0,0,0);
    var vL1 = new THREE.Vector3(5,5,5);
      // use three line segments to give it thickness
    geom.vertices.push( new THREE.Vector3(0+0.00, 0+0.00, 0+0.00));
    geom.vertices.push( new THREE.Vector3(5+0.00, 5+0.00, 5+0.00));
    geom.vertices.push( new THREE.Vector3(0+0.02, 0+0.00, 0+0.00));
    geom.vertices.push( new THREE.Vector3(5+0.02, 5+0.00, 5+0.00));
    geom.vertices.push( new THREE.Vector3(0+0.00, 0+0.02, 0+0.00));
    geom.vertices.push( new THREE.Vector3(5+0.00, 5+0.02, 5+0.00));
    laserLine = new THREE.Line( geom, laserLineMaterial );
    scene.add(laserLine);

      // body
    bodyGeometry = new THREE.BoxGeometry( 0.25, 0.8, 0.5 );    // width, height, depth
    legGeometry = new THREE.BoxGeometry( 0.15, 1.0, 0.15 );    // width, height, depth
    body = new THREE.Mesh( bodyGeometry, dinoGreenMaterial );
    leftLeg = new THREE.Mesh( legGeometry, dinoGreenMaterial );
    rightLeg = new THREE.Mesh( legGeometry, dinoGreenMaterial );
    scene.add( body );
    scene.add( leftLeg );
    scene.add( rightLeg );
}

////////////////////////////////////////////////////////////////////////	
// initFileObjects():    read object data from OBJ files;  see onResourcesLoaded() for instances
////////////////////////////////////////////////////////////////////////	

function initFileObjects() {

    // Models index
    models = {
	bunny: {obj:"obj/bunny.obj", mtl: diffuseMaterial, mesh: null},
	teapot: {obj:"obj/teapot.obj", mtl: diffuseMaterial, mesh: null	},
	armadillo: {obj:"obj/armadillo.obj", mtl: diffuseMaterial, mesh: null },
//	horse: {obj:"obj/horse.obj", mtl: diffuseMaterial, mesh: null },
	minicooper: {obj:"obj/minicooper.obj", mtl: diffuseMaterial, mesh: null },
	trex: { obj:"obj/trex.obj", mtl: normalShaderMaterial, mesh: null },
//	dragon: {obj:"obj/dragon.obj", mtl: diffuseMaterial, mesh: null }
    };

      // Object loader
    loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(item, loaded, total){
	console.log(item, loaded, total);
    };
    loadingManager.onLoad = function(){
	console.log("loaded all resources");
	RESOURCES_LOADED = true;
	onResourcesLoaded();
    };

    // Load models;  asynchronous in JS, so wrap code in a fn and pass it the index
    for( var _key in models ){
	console.log('Key:', _key);
	(function(key){
		var objLoader = new THREE.OBJLoader(loadingManager);
		objLoader.load(models[key].obj, function(mesh){
		    mesh.traverse(function(node){
			if( node instanceof THREE.Mesh ){
			    node.material = models[key].mtl;
			    node.material.shading = THREE.SmoothShading;
			}
		    });
		    models[key].mesh = mesh;
		});
	    
	})(_key);
    }
}

///////////////////////////////////////////////////////////////////////////////////////
// LISTEN TO KEYBOARD
///////////////////////////////////////////////////////////////////////////////////////

var keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
  if (keyboard.pressed(" ")) {
      animation = !animation;           // toggle animation on or off
  } else if (keyboard.pressed("r")) {
      console.log('Reset!');
      trexKFobj.reset();
      mydinoKFobj.reset();
  } else if (keyboard.pressed("o")) {
      camera.fov += 0.5;
      camera.updateProjectionMatrix();  // get three.js to recopute   M_proj
  } else if (keyboard.pressed("p")) {
      camera.fov -= 0.5;
      camera.updateProjectionMatrix();  // get three.js to recompute  M_proj
  }
}

///////////////////////////////////////////////////////////////////////////////////////
// UPDATE CALLBACK
///////////////////////////////////////////////////////////////////////////////////////

function update() {
    checkKeyboard();

    if (!RESOURCES_LOADED) {       // wait until all OBJs are loaded
	requestAnimationFrame(update);
	return;        
    }

    /////////// animated objects ////////////////

    if (animation) {       //   update the current time of objects if  animation = true
	trexKFobj.timestep(0.02);               // the big dino
	mydinoKFobj.timestep(0.02);             // the blocky walking figure, your hierarchy
	aniTime += 0.02;                        // update global time
    }

    var trexAvars = trexKFobj.getAvars();       // interpolate avars
    trexKFobj.setMatricesFunc(trexAvars);       // compute object-to-world matrices

    var mydinoAvars = mydinoKFobj.getAvars();   // interpolate avars
    mydinoKFobj.setMatricesFunc(mydinoAvars);   // compute object-to-world matrices

    laserUpdate();

    requestAnimationFrame(update);
    renderer.render(scene, camera);
}

///////////////////////////////////////////////////////////////////////////////////////
//  laserUpdate()
///////////////////////////////////////////////////////////////////////////////////////

function laserUpdate() {

    var trexEyeLocal = new THREE.Vector3(0,1.2,-1.9);
    var trex2 = meshes["trex2"];     //   reference to the Object
    var trexEyeWorld = trexEyeLocal.applyMatrix4(trex2.matrix);    // this computes  trex2.matrix * trexEyeLocal (with h=1)

    var mydinoWorld = new THREE.Vector3(10,0,3);

  var offset = [ new THREE.Vector3(0,0,0), new THREE.Vector3(0.02,0,0), new THREE.Vector3(0,0.02,0)];
  for (var n=0; n<3; n++) {            // laserLine consists of three line segements, slightly offset (more visible)
	laserLine.geometry.vertices[n*2].x = trexEyeWorld.x + offset[n].x;
	laserLine.geometry.vertices[n*2].y = trexEyeWorld.y + offset[n].y;
	laserLine.geometry.vertices[n*2].z = trexEyeWorld.z + offset[n].z;

	laserLine.geometry.vertices[n*2+1].x = mydinoWorld.x + offset[n].x;
	laserLine.geometry.vertices[n*2+1].y = mydinoWorld.y + offset[n].y;
	laserLine.geometry.vertices[n*2+1].z = mydinoWorld.z + offset[n].z;
    }
    laserLine.geometry.verticesNeedUpdate = true;
}

///////////////////////////////////////////////////////////////////////////////////////
// trexSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function trexSetMatrices(avars) {
    var trex2 = meshes["trex2"];     //   reference to the Object

    trex2.matrixAutoUpdate = false;     // tell three.js not to over-write our updates
    trex2.matrix.identity();              
    trex2.matrix.multiply(new THREE.Matrix4().makeTranslation(avars[0], avars[1], avars[2]));  
    trex2.matrix.multiply(new THREE.Matrix4().makeRotationY(-Math.PI/2));
    trex2.matrix.multiply(new THREE.Matrix4().makeScale(1.5,1.5,1.5));
    trex2.updateMatrixWorld();  
}

///////////////////////////////////////////////////////////////////////////////////////
// mydinoSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function mydinoSetMatrices(avars) {
    body.matrixAutoUpdate = false;
    body.matrix.identity();                // root of the hierarchy
    body.matrix.multiply(new THREE.Matrix4().makeTranslation(avars[0],avars[1],0));   // translate body-center up
    body.updateMatrixWorld();  

    leftLeg.matrixAutoUpdate = false;
    leftLeg.matrix.copy(body.matrix);      // start with the parent's matrix
    leftLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0.0,-0.4,-0.125));     // translate to hip
    leftLeg.matrix.multiply(new THREE.Matrix4().makeRotationZ(avars[2]*Math.PI/180));  // rotate about hip
    leftLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0,-0.5, 0));           // translate to center of upper leg
    leftLeg.updateMatrixWorld();

    rightLeg.matrixAutoUpdate = false;
    rightLeg.matrix.copy(body.matrix);     // start with the parent's matrix
    rightLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0.0,-0.4, 0.125));     // translate to hip
    rightLeg.matrix.multiply(new THREE.Matrix4().makeRotationZ(avars[3]*Math.PI/180));  // rotate about hip
    rightLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0,-0.5,0));            // translate to center of upper leg
    rightLeg.updateMatrixWorld();
}

/////////////////////////////////////////////////////////////////////////////////////
// runs when all resources are loaded
/////////////////////////////////////////////////////////////////////////////////////

function onResourcesLoaded(){
	
 // Clone models into meshes;   [Michiel:  AFAIK this makes a "shallow" copy of the model,
 //                             i.e., creates references to the geometry, and not full copies ]
    meshes["armadillo1"] = models.armadillo.mesh.clone();
    meshes["bunny1"] = models.bunny.mesh.clone();
    meshes["teapot1"] = models.teapot.mesh.clone();
    meshes["minicooper1"] = models.minicooper.mesh.clone();
    meshes["minicooper2"] = models.minicooper.mesh.clone();
    meshes["trex1"] = models.trex.mesh.clone();
    meshes["trex2"] = models.trex.mesh.clone();
    
    // Reposition individual meshes, then add meshes to scene
    
    meshes["armadillo1"].position.set(-7, 1.5, 2);
    meshes["armadillo1"].rotation.set(0,-Math.PI/2,0);
    meshes["armadillo1"].scale.set(1.5,1.5,1.5);
    scene.add(meshes["armadillo1"]);

    meshes["bunny1"].position.set(-5, 0.2, 8);
    meshes["bunny1"].rotation.set(0, Math.PI, 0);
    meshes["bunny1"].scale.set(0.8,0.8,0.8);
    scene.add(meshes["bunny1"]);

    meshes["teapot1"].position.set(3, 0, -6);
    meshes["teapot1"].scale.set(0.5, 0.5, 0.5);
    scene.add(meshes["teapot1"]);

    meshes["minicooper1"].position.set(-2, 0, 3);
    meshes["minicooper1"].scale.set(0.025, 0.025, 0.025);
    meshes["minicooper1"].rotation.set(-Math.PI/2, 0, Math.PI/2);
    scene.add(meshes["minicooper1"]);

    meshes["minicooper2"].position.set(6, 0, 6);
    meshes["minicooper2"].scale.set(0.025, 0.025, 0.025);
    meshes["minicooper2"].rotation.set(-Math.PI/2, 0, Math.PI/2);
    scene.add(meshes["minicooper2"]);

    meshes["trex1"].position.set(-4, 1.90, -2);
    meshes["trex1"].scale.set(1.5,1.5,1.5);
    meshes["trex1"].rotation.set(0,-Math.PI/2, 0);
    scene.add(meshes["trex1"]);

      // note:  we will be animating trex2, so these transformations will be overwritten anyhow
    meshes["trex2"].position.set(0, 1.9, 3);
    meshes["trex2"].scale.set(1.5,1.5,1.5);
    meshes["trex2"].rotation.set(0,-Math.PI/2, 0);
    scene.add(meshes["trex2"]);
}

// window.onload = init;
init();

window.addEventListener('resize',resize);   // EVENT LISTENER RESIZE
resize();

update();

