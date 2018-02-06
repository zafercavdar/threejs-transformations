/////////////////////////////////////////////////////////////////////////////////////////
//  UBC CPSC 314,  Vjan2018
//  Assignment Template
/////////////////////////////////////////////////////////////////////////////////////////


// SETUP RENDERER & SCENE
var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
var camera;
var cameraFov = 30; // initial camera vertical field of view, in degrees

renderer.setClearColor(0xd0f0d0); // set background colour
canvas.appendChild(renderer.domElement);

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function() {
  window.scrollTo(0, 0);
}

// ADAPT TO WINDOW RESIZE
function resize() {
  console.log('resize called');
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

var animation = true;
var aniTime = 0.0;

var light;
var light2;
var light3;
var light4;
var torus;
var worldFrame;
var sphere;
var sphere2;
var sphere3;
var sphere4;
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
var leftLeftLeg;
var leftRightLeg;
var rightLeftLeg;
var rightRightLeg;

// Custom mydino
var dinoParts = [];
var longBody;
var shortBody;
var leftArm;
var leftWrist;
var rightArm;
var rightWrist;
var leftLeg1;
var leftLeg2;
var leftLeg3;
var rightLeg1;
var rightLeg2;
var rightLeg3;
var neck;
var head;
var tail1;
var tail2;
var tail3;

var ball;
var rocketBody;
var rocketHead;


var loadingManager = null;
var RESOURCES_LOADED = false;

var LASER_ENABLED = true;
var TIME_CONSTANT = 1;
var LIGHT_INTENSITY = 1;
var FLIPPING_IN_PROGRESS = false;
var FLIP_DEGREE = 0;

var BALL_RADIUS = 0.4
var JUMP_MAX = 10;
var JUMP_MIN = 1.5 * BALL_RADIUS;
var JUMP_IN_PROGRESS = false;
var JUMP_DIR = 1;

////////////////////////////////////////////////////////////
// Keyframe   and   KFobj  classes
////////////////////////////////////////////////////////////

class Keyframe {
  constructor(name, time, avars) {
    this.name = name;
    this.time = time;
    this.avars = avars;
  }
}

class KFobj {
  constructor(setMatricesFunc) {
    this.keyFrameArray = []; // list of keyframes
    this.maxTime = 0.0; // time of last keyframe
    this.currTime = 0.0; // current playback time
    this.setMatricesFunc = setMatricesFunc; // function to call to update transformation matrices
  };
  reset() { // go back to first keyframe
    this.currTime = 0.0;
  };
  add(keyframe) { // add a new keyframe at end of list
    this.keyFrameArray.push(keyframe);
    if (keyframe.time > this.maxTime)
      this.maxTime = keyframe.time;
  };
  timestep(dt) { //  take a time-step;  loop to beginning if at end
    this.currTime += dt;
    if (this.currTime > this.maxTime)
      this.currTime = 0;
  }
  getAvars() { //  compute interpolated values for the current time
    var i = 1;
    while (this.currTime > this.keyFrameArray[i].time) // find the right pair of keyframes
      i++;
    var avars = [];
    for (var n = 0; n < this.keyFrameArray[i - 1].avars.length; n++) { // interpolate the values
      var y0 = this.keyFrameArray[i - 1].avars[n];
      var y1 = this.keyFrameArray[i].avars[n];
      var x0 = this.keyFrameArray[i - 1].time;
      var x1 = this.keyFrameArray[i].time;
      var x = this.currTime;
      var y = y0 + (y1 - y0) * (x - x0) / (x1 - x0); // linearly interpolate
      avars.push(y);
    }
    return avars; // return list of interpolated avars
  };
}

////////////////////////////////////////////////////////////////////////
// setup animated objects
////////////////////////////////////////////////////////////////////////

// keyframes for the detailed T-rex:   name, time, [x, y, z]
var trexKFobj = new KFobj(trexSetMatrices);
/*
trexKFobj.add(new Keyframe('rest pose', 0.0, [0, 1.9, 0]));
trexKFobj.add(new Keyframe('rest pose', 1.0, [1, 1.9, 0]));
// trexKFobj.add(new Keyframe('rest pose', 2.0, [1, 2.9, 0]));
// trexKFobj.add(new Keyframe('rest pose', 3.0, [0, 2.9, 0]));
trexKFobj.add(new Keyframe('rest pose', 2.0, [1, 4.8, 0]));
trexKFobj.add(new Keyframe('rest pose', 3.0, [0, 4.8, 0]));
trexKFobj.add(new Keyframe('rest pose', 4.0, [0, 1.9, 0]));
*/
trexKFobj.add(new Keyframe('rest pose', 0.0, [14, 1.9, -6, 0]));
trexKFobj.add(new Keyframe('rest pose', 0.5, [12, 1.9, -6, 5]));
trexKFobj.add(new Keyframe('rest pose', 1.0, [10, 1.9, -6, 10]));
trexKFobj.add(new Keyframe('rest pose', 1.5, [8, 1.9, -6, 15]));
trexKFobj.add(new Keyframe('rest pose', 2.0, [6, 1.9, -6, 20]));
trexKFobj.add(new Keyframe('rest pose', 2.5, [4, 1.9, -6, 25]));
trexKFobj.add(new Keyframe('rest pose', 3.0, [2, 1.9, -6, 30]));
trexKFobj.add(new Keyframe('rest pose', 3.5, [0, 1.9, -6, 35]));
trexKFobj.add(new Keyframe('rest pose', 4.0, [-2, 1.9, -6, 40]));
trexKFobj.add(new Keyframe('rest pose', 4.5, [-4, 1.9, -6, 45]));
trexKFobj.add(new Keyframe('rest pose', 5.0, [-6, 1.9, -6, 90]));

trexKFobj.add(new Keyframe('rest pose', 5.5, [-6, 1.9, -4, 95]));
trexKFobj.add(new Keyframe('rest pose', 6.0, [-6, 1.9, -1.5, 100]));
trexKFobj.add(new Keyframe('rest pose', 6.5, [-6, 1.9, 1, 105]));
trexKFobj.add(new Keyframe('rest pose', 7.0, [-6, 1.9, 3.5, 110]));
trexKFobj.add(new Keyframe('rest pose', 7.5, [-6, 1.9, 6, 180]));

trexKFobj.add(new Keyframe('rest pose', 8.0, [-4, 1.9, 6, 185]));
trexKFobj.add(new Keyframe('rest pose', 8.5, [-2, 1.9, 6, 190]));
trexKFobj.add(new Keyframe('rest pose', 9.0, [0, 1.9, 6, 195]));
trexKFobj.add(new Keyframe('rest pose', 9.5, [3, 1.9, 6, 200]));
trexKFobj.add(new Keyframe('rest pose', 10.0, [6, 1.9, 6, 205]));
trexKFobj.add(new Keyframe('rest pose', 10.5, [9, 1.9, 6, 270]));

trexKFobj.add(new Keyframe('rest pose', 11.0, [12, 1.9, 3.5, 275]));
trexKFobj.add(new Keyframe('rest pose', 11.5, [14, 1.9, -2, 285]));
trexKFobj.add(new Keyframe('rest pose', 12.0, [14, 1.9, -6, 360]));


// basic interpolation test
console.log('kf 0.1 = ', trexKFobj.getAvars(0.1)); // interpolate for t=0.1
console.log('kf 2.9 = ', trexKFobj.getAvars(2.9)); // interpolate for t=2.9

// keyframes for mydino:    name, time, [x, y, theta1, theta2]
var mydinoKFobj = new KFobj(mydinoSetMatrices);
mydinoKFobj.add(new Keyframe('rest pose', 0.0, [8, 1.4, 30, -30, 60, -60]));
mydinoKFobj.add(new Keyframe('rest pose', 0.5, [8, 1.4, 20, -20, 40, -40]));
mydinoKFobj.add(new Keyframe('rest pose', 1.0, [8, 1.4, 10, -10, 20, -20]));
mydinoKFobj.add(new Keyframe('rest pose', 1.5, [8, 1.4,  0,   0,  0,   0]));
mydinoKFobj.add(new Keyframe('rest pose', 2.0, [8, 1.4, -10, 10, -20 , 20]));
mydinoKFobj.add(new Keyframe('rest pose', 2.5, [8, 1.4, -20,  20, -40, 40]));
mydinoKFobj.add(new Keyframe('rest pose', 3.0, [8, 1.4, -30,  30, -60, 60]));

mydinoKFobj.add(new Keyframe('rest pose', 3.5, [8, 1.4, -20, 20, -40, 40]));
mydinoKFobj.add(new Keyframe('rest pose', 4.0, [8, 1.4, -10, 10, -20, 20]));
mydinoKFobj.add(new Keyframe('rest pose', 4.5, [8, 1.4,  0,   0,   0, 0]));
mydinoKFobj.add(new Keyframe('rest pose', 5.0, [8, 1.4, 10, -10,  20, -20]));
mydinoKFobj.add(new Keyframe('rest pose', 5.5, [8, 1.4, 20, -20,  40, -40]));
mydinoKFobj.add(new Keyframe('rest pose', 6.0, [8, 1.4, 30,  -30, 60, -60]));

// keyframs for newmydino: name, time, [long body x, long body y, long body z, rot y, leg theta]
var newmydinoKFobj = new KFobj(newmydinoSetMatrices);
newmydinoKFobj.add(new Keyframe('rest pose', 0.0, [6, 3, -6, 0, 0]));
newmydinoKFobj.add(new Keyframe('rest pose', 0.5, [4, 3, -6, 5, 20]));
newmydinoKFobj.add(new Keyframe('rest pose', 1.0, [2, 3, -6, 10, 40]));
newmydinoKFobj.add(new Keyframe('rest pose', 1.5, [0, 3, -6, 15, 60]));
newmydinoKFobj.add(new Keyframe('rest pose', 2.0, [-2, 3, -6, 20, 40]));
newmydinoKFobj.add(new Keyframe('rest pose', 2.5, [-4, 3, -6, 25, 20]));
newmydinoKFobj.add(new Keyframe('rest pose', 3.0, [-6, 3, -6, 90, 0]));

newmydinoKFobj.add(new Keyframe('rest pose', 3.5, [-6, 3, -4, 95, 20]));
newmydinoKFobj.add(new Keyframe('rest pose', 4.0, [-6, 3, -2, 100, 40]));
newmydinoKFobj.add(new Keyframe('rest pose', 4.5, [-6, 3, 0, 105, 60]));
newmydinoKFobj.add(new Keyframe('rest pose', 5.0, [-6, 3, 2, 110, 40]));
newmydinoKFobj.add(new Keyframe('rest pose', 5.5, [-6, 3, 4, 115, 20]));
newmydinoKFobj.add(new Keyframe('rest pose', 6.0, [-6, 3, 6, 180, 0]));

newmydinoKFobj.add(new Keyframe('rest pose', 6.5, [-4, 3, 6, 185, 20]));
newmydinoKFobj.add(new Keyframe('rest pose', 7.0, [-2, 3, 6, 190, 40]));
newmydinoKFobj.add(new Keyframe('rest pose', 7.5, [0, 3, 6, 195, 60]));
newmydinoKFobj.add(new Keyframe('rest pose', 8.0, [2, 3, 6, 200, 40]));
newmydinoKFobj.add(new Keyframe('rest pose', 8.5, [4, 3, 6, 205, 20]));
newmydinoKFobj.add(new Keyframe('rest pose', 9.0, [6, 3, 6, 270, 0]));

newmydinoKFobj.add(new Keyframe('rest pose', 9.5, [6, 3, 4, 275, 20]));
newmydinoKFobj.add(new Keyframe('rest pose', 10.0, [6, 3, 2, 280, 40]));
newmydinoKFobj.add(new Keyframe('rest pose', 10.5, [6, 3, 0, 285, 60]));
newmydinoKFobj.add(new Keyframe('rest pose', 11.0, [6, 3, -2, 290, 40]));
newmydinoKFobj.add(new Keyframe('rest pose', 11.5, [6, 3, -4, 295, 20]));
newmydinoKFobj.add(new Keyframe('rest pose', 12.0, [6, 3, -6, 360, 0]));

// x, y, z, rotateY
var minicooper1KFobj = new KFobj(minicooper1SetMatrices);
minicooper1KFobj.add(new Keyframe('rest pose', 0.0, [10, 0, -6, 0]));
minicooper1KFobj.add(new Keyframe('rest pose', 0.5, [8, 0, -6, 5]));
minicooper1KFobj.add(new Keyframe('rest pose', 1.0, [6, 0, -6, 10]));
minicooper1KFobj.add(new Keyframe('rest pose', 1.5, [4, 0, -6, 15]));
minicooper1KFobj.add(new Keyframe('rest pose', 2.0, [2, 0, -6, 20]));
minicooper1KFobj.add(new Keyframe('rest pose', 2.5, [0, 0, -6, 25]));
minicooper1KFobj.add(new Keyframe('rest pose', 3.0, [-2, 0, -6, 30]));
minicooper1KFobj.add(new Keyframe('rest pose', 3.5, [-4, 0, -6, 35]));
minicooper1KFobj.add(new Keyframe('rest pose', 4.0, [-6, 0, -6, 90]));

minicooper1KFobj.add(new Keyframe('rest pose', 4.5, [-6, 0, -4, 95]));
minicooper1KFobj.add(new Keyframe('rest pose', 5.0, [-6, 0, -2, 100]));
minicooper1KFobj.add(new Keyframe('rest pose', 5.5, [-6, 0, 0, 105]));
minicooper1KFobj.add(new Keyframe('rest pose', 6.0, [-6, 0, 2, 110]));
minicooper1KFobj.add(new Keyframe('rest pose', 6.5, [-6, 0, 4, 115]));
minicooper1KFobj.add(new Keyframe('rest pose', 7.0, [-6, 0, 6, 180]));

minicooper1KFobj.add(new Keyframe('rest pose', 7.5, [-4, 0, 6, 185]));
minicooper1KFobj.add(new Keyframe('rest pose', 8.0, [-1.5, 0, 6, 190]));
minicooper1KFobj.add(new Keyframe('rest pose', 8.5, [1, 0, 6, 195]));
minicooper1KFobj.add(new Keyframe('rest pose', 9.0, [3.5, 0, 6, 200]));
minicooper1KFobj.add(new Keyframe('rest pose', 9.5, [6, 0, 6, 205]));
minicooper1KFobj.add(new Keyframe('rest pose', 10.0, [8.5, 0, 6, 270]));

minicooper1KFobj.add(new Keyframe('rest pose', 10.5, [10, 0, 4, 275]));
minicooper1KFobj.add(new Keyframe('rest pose', 11.0, [10, 0, 0, 285]));
minicooper1KFobj.add(new Keyframe('rest pose', 11.5, [10, 0, -4, 295]));
minicooper1KFobj.add(new Keyframe('rest pose', 12.0, [10, 0, -6, 360]));


// optional:   allow avar indexing by name
// i.e., instead of   avar[1]    one can also use:    avar[ trexIndex["y"]]
var trexIndex = {
  "x": 0,
  "y": 1,
  "z": 2
};
Object.freeze(trexIndex);

/////////////////////////////////////////////////////////////////////////////////////
// MATERIALS:  global scope within this file
/////////////////////////////////////////////////////////////////////////////////////

var diffuseMaterial;
var diffuseMaterialB;
var diffuseMaterial2;
var basicMaterial;
var lightMaterial;
var normalShaderMaterial;
var dinoMaterial;
var floorMaterial;
var shaderFiles;

dinoGreenMaterial = new THREE.MeshLambertMaterial({
  color: 0x4fff4f
});
dinoDarkGreenMaterial = new THREE.MeshLambertMaterial({
  color: 0x006400
});
dinoLightRedMaterial = new THREE.MeshLambertMaterial({
  color: 0xff6666
});
dinoRedMaterial = new THREE.MeshLambertMaterial({
  color: 0xff0000
});
dinoDarkRedMaterial = new THREE.MeshLambertMaterial({
  color: 0x800000
});
dinoBlueMaterial = new THREE.MeshLambertMaterial({
  color: 0x33A1DE
});
laserLineMaterial = new THREE.LineBasicMaterial({
  color: 0xff0000
});
diffuseMaterial = new THREE.MeshLambertMaterial({
  color: 0x7f7fff
});
diffuseMaterialB = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  side: THREE.BackSide
});
diffuseMaterial2 = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide
});
basicMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000
});
lightMaterial = new THREE.MeshBasicMaterial({
  color: 0xDC143C
})
lightWoodMaterial = new THREE.MeshBasicMaterial({
  color: 0xF4A460
})
darkWoodMaterial = new THREE.MeshBasicMaterial({
  color: 0x8B4513
})

floorTexture = new THREE.ImageUtils.loadTexture('images/illusion.png');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(1, 1);
floorMaterial = new THREE.MeshBasicMaterial({
  map: floorTexture,
  side: THREE.DoubleSide
});

// CUSTOM SHADERS
shaderFiles = ['glsl/armadillo.vs.glsl', 'glsl/armadillo.fs.glsl'];
normalShaderMaterial = new THREE.ShaderMaterial();
normalShaderMaterial.side = THREE.BackSide; // dino has the vertex normals pointing inwards!

new THREE.SourceLoader().load(shaderFiles, function(shaders) {
  normalShaderMaterial.vertexShader = shaders['glsl/armadillo.vs.glsl'];
  normalShaderMaterial.fragmentShader = shaders['glsl/armadillo.fs.glsl'];
})

/*
var backgroundMesh, backgroundScene, backgroundCamera;
var backgrounTexture = new THREE.ImageUtils.loadTexture('images/floor.jpg');
backgroundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100, 0),
    new THREE.MeshBasicMaterial({
    map: backgrounTexture
  })
);
backgroundMesh.material.depthTest = false;
backgroundMesh.material.depthWrite = false;

backgroundScene = new THREE.Scene();
backgroundCamera = new THREE.Camera();
backgroundScene.add( backgroundCamera );
backgroundScene.add( backgroundMesh );
*/

var meshes = {}; // Meshes index

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
  camera = new THREE.PerspectiveCamera(cameraFov, 1, 0.1, 1000); // view angle, aspect ratio, near, far

  // set up M_view:   (internally:  camera.matrixWorldInverse )
  camera.position.set(0, 12, 20);
  camera.up = new THREE.Vector3(0, 1, 0);
  camera.lookAt(0, 0, 0);
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
  light.position.set(0, 4, 10);
  scene.add(light);
  light2 = new THREE.PointLight(0xffffff);
  light2.position.set(0, 4, -10);
  scene.add(light2);
  light3 = new THREE.PointLight(0xffffff);
  light3.position.set(10, 4, 0);
  scene.add(light3);
  light4 = new THREE.PointLight(0xffffff);
  light4.position.set(-10, 4, 0);
  scene.add(light4);
  ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);
}

function updateLights() {
  light.intensity = LIGHT_INTENSITY;
  light2.intensity = LIGHT_INTENSITY;
  light3.intensity = LIGHT_INTENSITY;
  light4.intensity = LIGHT_INTENSITY;
  var spheres = [sphere , sphere2, sphere3, sphere4];
  for (var s in spheres) {
    spheres[s].material.color = new THREE.Color(LIGHT_INTENSITY, 0.08, 0.235);
  }
}

////////////////////////////////////////////////////////////////////////
// initObjects():  setup up scene
////////////////////////////////////////////////////////////////////////

function initObjects() {
  /*
  // torus
  torusGeometry = new THREE.TorusGeometry(1, 0.4, 10, 20);
  torus = new THREE.Mesh(torusGeometry, diffuseMaterial);
  torus.position.set(6, 1.2, -8); // translation
  torus.rotation.set(0, 0, 0); // rotation about x,y,z axes
  scene.add(torus);


  // box
  boxGeometry = new THREE.BoxGeometry(1, 1, 1); // width, height, depth
  box = new THREE.Mesh(boxGeometry, diffuseMaterial);
  box.position.set(-6, 0.5, -8);
  scene.add(box);


  // cylinder
  cylinderGeometry = new THREE.CylinderGeometry(0.30, 0.30, 1, 20, 4);
  cylinder = new THREE.Mesh(cylinderGeometry, diffuseMaterial);
  scene.add(cylinder);
  cylinder.matrixAutoUpdate = true;
  cylinder.position.set(2, 0.5, -8);

  //  mcc:  multi-colour cube     [https://stemkoski.github.io/Three.js/HelloWorld.html]
  var cubeMaterialArray = []; // one material for each side of cube;  order: x+,x-,y+,y-,z+,z-
  cubeMaterialArray.push(new THREE.MeshBasicMaterial({
    color: 0xff3333
  }));
  cubeMaterialArray.push(new THREE.MeshBasicMaterial({
    color: 0xff8800
  }));
  cubeMaterialArray.push(new THREE.MeshBasicMaterial({
    color: 0xffff33
  }));
  cubeMaterialArray.push(new THREE.MeshBasicMaterial({
    color: 0x33ff33
  }));
  cubeMaterialArray.push(new THREE.MeshBasicMaterial({
    color: 0x3333ff
  }));
  cubeMaterialArray.push(new THREE.MeshBasicMaterial({
    color: 0x8833ff
  }));
  var mccMaterials = new THREE.MeshFaceMaterial(cubeMaterialArray);
  var mccGeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1); // xyzz size,  xyz # segs
  mcc = new THREE.Mesh(mccGeometry, mccMaterials); //
  mcc.position.set(-4, 0.5, -8);
  scene.add(mcc);

  // cone
  coneGeometry = new THREE.CylinderGeometry(0.0, 0.50, 1, 20, 4); // rTop, rBot, h, #rsegs, #hsegs
  cone = new THREE.Mesh(coneGeometry, diffuseMaterial);
  cone.position.set(-2, 0.5, -8)
  scene.add(cone);


  //  CUSTOM OBJECT
  var geom = new THREE.Geometry();
  var v0 = new THREE.Vector3(0, 0, 0);
  var v1 = new THREE.Vector3(3, 0, 0);
  var v2 = new THREE.Vector3(0, 3, 0);
  var v3 = new THREE.Vector3(3, 3, 0);
  geom.vertices.push(v0);
  geom.vertices.push(v1);
  geom.vertices.push(v2);
  geom.vertices.push(v3);
  geom.faces.push(new THREE.Face3(0, 1, 2));
  geom.faces.push(new THREE.Face3(1, 3, 2));
  geom.computeFaceNormals();
  customObject = new THREE.Mesh(geom, diffuseMaterial2);
  customObject.position.set(0, 0, -10);
  scene.add(customObject);

  */
  // sphere representing light source
  sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32); // radius, segments, segments
  sphere = new THREE.Mesh(sphereGeometry, lightMaterial);
  sphere.position.set(light.position.x, light.position.y, light.position.z);
  scene.add(sphere);

  sphere2 = new THREE.Mesh(sphereGeometry, lightMaterial);
  sphere2.position.set(light2.position.x, light2.position.y, light2.position.z);
  scene.add(sphere2);

  sphere3 = new THREE.Mesh(sphereGeometry, lightMaterial);
  sphere3.position.set(light3.position.x, light3.position.y, light3.position.z);
  scene.add(sphere3);

  sphere4 = new THREE.Mesh(sphereGeometry, lightMaterial);
  sphere4.position.set(light4.position.x, light4.position.y, light4.position.z);
  scene.add(sphere4);

  // world-frame axes
  worldFrame = new THREE.AxisHelper(5);
  scene.add(worldFrame);
  // floor
  floorGeometry = new THREE.PlaneBufferGeometry(20, 20);
  floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = 0;
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);

  // laser line
  var geom = new THREE.Geometry();
  var vL0 = new THREE.Vector3(0, 0, 0);
  var vL1 = new THREE.Vector3(5, 5, 5);
  // use three line segments to give it thickness
  geom.vertices.push(new THREE.Vector3(0 + 0.00, 0 + 0.00, 0 + 0.00));
  geom.vertices.push(new THREE.Vector3(5 + 0.00, 5 + 0.00, 5 + 0.00));
  geom.vertices.push(new THREE.Vector3(0 + 0.02, 0 + 0.00, 0 + 0.00));
  geom.vertices.push(new THREE.Vector3(5 + 0.02, 5 + 0.00, 5 + 0.00));
  geom.vertices.push(new THREE.Vector3(0 + 0.00, 0 + 0.02, 0 + 0.00));
  geom.vertices.push(new THREE.Vector3(5 + 0.00, 5 + 0.02, 5 + 0.00));
  laserLine = new THREE.Line(geom, laserLineMaterial);
  scene.add(laserLine);


  // body
  bodyGeometry = new THREE.BoxGeometry(0.25, 2.8, 0.5); // width, height, depth
  // legGeometry = new THREE.BoxGeometry(0.15, 1.0, 0.15); // width, height, depth
  legGeometry = new THREE.BoxGeometry(0.15, 2.0, 0.15); // width, height, depth
  leglegGeometry = new THREE.BoxGeometry(0.15, 0.8, 0.15);
  body = new THREE.Mesh(bodyGeometry, darkWoodMaterial);
  leftLeg = new THREE.Mesh(legGeometry, lightWoodMaterial);
  rightLeg = new THREE.Mesh(legGeometry, lightWoodMaterial);
  leftLeftLeg = new THREE.Mesh(leglegGeometry, dinoGreenMaterial);
  leftRightLeg = new THREE.Mesh(leglegGeometry, dinoGreenMaterial);
  rightLeftLeg = new THREE.Mesh(leglegGeometry, dinoGreenMaterial);
  rightRightLeg = new THREE.Mesh(leglegGeometry, dinoGreenMaterial);

  scene.add(body);
  scene.add(leftLeg);
  scene.add(rightLeg);
  scene.add(leftLeftLeg);
  scene.add(leftRightLeg);
  scene.add(rightLeftLeg);
  scene.add(rightRightLeg);

  var ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
  ball = new THREE.Mesh(ballGeometry, dinoDarkGreenMaterial);
  ball.position.set(0, ball.geometry.parameters.radius, 0);
  scene.add(ball);

  var rocketBodyGeometry = new THREE.CylinderGeometry(BALL_RADIUS, BALL_RADIUS, 3 * BALL_RADIUS, 32, 32);
  var rocketHeadGeometry = new THREE.CylinderGeometry(0, BALL_RADIUS, BALL_RADIUS * 2, 32);
  rocketBody = new THREE.Mesh(rocketBodyGeometry, dinoDarkGreenMaterial);
  rocketHead = new THREE.Mesh(rocketHeadGeometry, dinoDarkGreenMaterial);
  rocketBody.position.set(0, 1.5 * BALL_RADIUS, 0);
  rocketHead.position.set(0, 4 * BALL_RADIUS, 0);
  scene.add(rocketHead);
  scene.add(rocketBody);

  // new mydino
  longBodyGeometry = new THREE.BoxGeometry(3, 1.2, 0.5);
  shortBodyGeometry = new THREE.BoxGeometry(1.5, 1.2, 0.5);
  topLegGeometry = new THREE.BoxGeometry(0.8, 0.25, 0.15);
  mediumLegGeometry = new THREE.BoxGeometry(1, 0.20, 0.15);
  eyeGeometry = new THREE.SphereGeometry(0.2, 32, 32);
  armGeometry = new THREE.BoxGeometry(0.9, 0.25, 0.1);
  wristGeometry = new THREE.BoxGeometry(0.25, 0.1, 0.1);
  neckGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1.5, 32, 32);
  tail1Geometry = new THREE.BoxGeometry(1.9, 0.1, 0.05);
  tail2Geometry = new THREE.BoxGeometry(1.5, 0.1, 0.05);
  tail3Geometry = new THREE.BoxGeometry(0.4, 0.1, 0.05);
  headGeometry = new THREE.SphereGeometry(0.7, 32, 32);

  longBody = new THREE.Mesh(longBodyGeometry, dinoBlueMaterial);
  shortBody = new THREE.Mesh(shortBodyGeometry, dinoDarkGreenMaterial);
  leftArm = new THREE.Mesh(armGeometry, dinoBlueMaterial);
  leftWrist = new THREE.Mesh(wristGeometry, dinoDarkGreenMaterial);
  rightArm = new THREE.Mesh(armGeometry, dinoBlueMaterial);
  rightWrist = new THREE.Mesh(wristGeometry, dinoDarkGreenMaterial);
  leftLeg1 = new THREE.Mesh(topLegGeometry, dinoBlueMaterial);
  leftLeg2 = new THREE.Mesh(mediumLegGeometry, dinoDarkGreenMaterial);
  rightLeg1 = new THREE.Mesh(topLegGeometry, dinoBlueMaterial);
  rightLeg2 = new THREE.Mesh(mediumLegGeometry, dinoDarkGreenMaterial);
  neck = new THREE.Mesh(neckGeometry, dinoBlueMaterial);
  head = new THREE.Mesh(headGeometry, dinoDarkGreenMaterial);
  leftEye = new THREE.Mesh(eyeGeometry, dinoDarkRedMaterial);
  rightEye = new THREE.Mesh(eyeGeometry, dinoDarkRedMaterial);
  tail1 = new THREE.Mesh(tail1Geometry, dinoLightRedMaterial);
  tail2 = new THREE.Mesh(tail2Geometry, dinoRedMaterial);
  tail3 = new THREE.Mesh(tail3Geometry, dinoDarkRedMaterial);

  dinoParts = [longBody, shortBody, leftArm, leftWrist, rightArm, rightWrist, leftLeg1, leftLeg2, leftEye, rightLeg1, rightLeg2, rightEye, neck, head, tail1, tail2, tail3];
  for (var i in dinoParts) {
    scene.add(dinoParts[i]);
  }
}

////////////////////////////////////////////////////////////////////////
// initFileObjects():    read object data from OBJ files;  see onResourcesLoaded() for instances
////////////////////////////////////////////////////////////////////////

function initFileObjects() {

  // Models index
  models = {
    //bunny: {obj:"obj/bunny.obj", mtl: diffuseMaterial, mesh: null},
    //teapot: {obj:"obj/teapot.obj", mtl: diffuseMaterial, mesh: null	},
    //armadillo: {obj:"obj/armadillo.obj", mtl: diffuseMaterial, mesh: null },
    //	horse: {obj:"obj/horse.obj", mtl: diffuseMaterial, mesh: null },
    minicooper: {obj:"obj/minicooper.obj", mtl: diffuseMaterial, mesh: null },
    trex: {
      obj: "obj/trex.obj",
      mtl: normalShaderMaterial,
      mesh: null
    },
    //	dragon: {obj:"obj/dragon.obj", mtl: diffuseMaterial, mesh: null }
  };

  // Object loader
  loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = function(item, loaded, total) {
    console.log(item, loaded, total);
  };
  loadingManager.onLoad = function() {
    console.log("loaded all resources");
    RESOURCES_LOADED = true;
    onResourcesLoaded();
  };

  // Load models;  asynchronous in JS, so wrap code in a fn and pass it the index
  for (var _key in models) {
    console.log('Key:', _key);
    (function(key) {
      var objLoader = new THREE.OBJLoader(loadingManager);
      objLoader.load(models[key].obj, function(mesh) {
        mesh.traverse(function(node) {
          if (node instanceof THREE.Mesh) {
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
    animation = !animation; // toggle animation on or off
  } else if (keyboard.pressed("r")) {
    console.log('Reset!');
    trexKFobj.reset();
    mydinoKFobj.reset();
    newmydinoKFobj.reset();
    minicooper1KFobj.reset();
  } else if (keyboard.pressed("o")) {
    camera.fov += 0.5;
    camera.updateProjectionMatrix(); // get three.js to recopute   M_proj
  } else if (keyboard.pressed("p")) {
    camera.fov -= 0.5;
    camera.updateProjectionMatrix(); // get three.js to recompute  M_proj
  } else if (keyboard.pressed("l")) {
    LASER_ENABLED = !LASER_ENABLED;
  } else if (keyboard.pressed("t")) {
    TIME_CONSTANT *= -1;
  } else if (keyboard.pressed("q")) {
    LIGHT_INTENSITY = Math.min(LIGHT_INTENSITY + 0.01, 1);
    console.log(LIGHT_INTENSITY);
    updateLights();
  } else if (keyboard.pressed("w")) {
    LIGHT_INTENSITY = Math.max(LIGHT_INTENSITY - 0.01, 0);
    console.log(LIGHT_INTENSITY);
    updateLights();
  } else if(keyboard.pressed("f")) {
    FLIPPING_IN_PROGRESS = true;
  } else if (keyboard.pressed("j")) {
    JUMP_IN_PROGRESS = true;
  }
}

///////////////////////////////////////////////////////////////////////////////////////
// UPDATE CALLBACK
///////////////////////////////////////////////////////////////////////////////////////

function update() {
  checkKeyboard();

  if (!RESOURCES_LOADED) { // wait until all OBJs are loaded
    requestAnimationFrame(update);
    return;
  }

  /////////// animated objects ////////////////

  if (animation) { //   update the current time of objects if  animation = true
    var kfOjbs = [trexKFobj, mydinoKFobj, newmydinoKFobj, minicooper1KFobj]
    mydinoKFobj.timestep(0.02 * TIME_CONSTANT); // the blocky walking figure, your hierarchy
    if (!FLIPPING_IN_PROGRESS) {
      trexKFobj.timestep(0.02 * TIME_CONSTANT); // the big dino
      newmydinoKFobj.timestep(0.02 * TIME_CONSTANT);
      minicooper1KFobj.timestep(0.02 * TIME_CONSTANT);
    }
    aniTime += 0.02 * TIME_CONSTANT; // update global time
    for (kfObjIndex in kfOjbs) {
      var kfObj = kfOjbs[kfObjIndex]
      if (kfObj.currTime < 0) {
        kfObj.currTime += kfObj.maxTime;
      }
    }
  }

  var trexAvars = trexKFobj.getAvars(); // interpolate avars
  trexKFobj.setMatricesFunc(trexAvars); // compute object-to-world matrices

  var mydinoAvars = mydinoKFobj.getAvars(); // interpolate avars
  mydinoKFobj.setMatricesFunc(mydinoAvars); // compute object-to-world matrices

  var newmydinoAvars = newmydinoKFobj.getAvars();
  newmydinoKFobj.setMatricesFunc(newmydinoAvars);

  var minicooper1Avars = minicooper1KFobj.getAvars();
  minicooper1KFobj.setMatricesFunc(minicooper1Avars);

  if (LASER_ENABLED) {
    laserLine.visible = true;
    laserUpdate();
  } else {
    laserLine.visible = false;
  }

  if (FLIPPING_IN_PROGRESS) {
    flipDino(newmydinoAvars);
  }
  if (JUMP_IN_PROGRESS) {
    sendRocket();
  }

  requestAnimationFrame(update);
  //renderer.clear();
  //renderer.render( backgroundScene, backgroundCamera );
  renderer.render(scene, camera);
}


///////////////////////////////////////////////////////////////////////////////////////
//  flipDino()
///////////////////////////////////////////////////////////////////////////////////////
function flipDino(avars) {
  var longBody = dinoParts[0];
  longBody.matrixAutoUpdate = false;
  var unitRotation = 2;
  longBody.matrix.multiply(new THREE.Matrix4().makeRotationZ(-unitRotation * Math.PI / 180));
  longBody.updateMatrixWorld();

  shortBody.matrixAutoUpdate = false;
  shortBody.matrix.copy(longBody.matrix);
  shortBody.matrix.multiply(new THREE.Matrix4().makeTranslation(longBody.geometry.parameters.width / 2, 0, 0));
  shortBody.matrix.multiply(new THREE.Matrix4().makeRotationZ(-1 * Math.PI / 18 + (15 * Math.PI / 180)));
  shortBody.matrix.multiply(new THREE.Matrix4().makeTranslation(shortBody.geometry.parameters.width / 2 - 0.1, 0, 0));
  shortBody.updateMatrixWorld();

  neck.matrixAutoUpdate = false;
  neck.matrix.copy(longBody.matrix);
  neck.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * longBody.geometry.parameters.width / 2, 0, 0));
  neck.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 24 + Math.PI / 3));
  neck.matrix.multiply(new THREE.Matrix4().makeTranslation(0, neck.geometry.parameters.height / 2 - 0.15, 0));
  neck.updateMatrixWorld();

  head.matrixAutoUpdate = false;
  head.matrix.copy(neck.matrix);
  head.matrix.multiply(new THREE.Matrix4().makeTranslation(0, neck.geometry.parameters.height / 2, 0));
  head.updateMatrixWorld();

  leftEye.matrixAutoUpdate = false;
  leftEye.matrix.copy(head.matrix);
  var d = head.geometry.parameters.radius / Math.sqrt(3);
  leftEye.matrix.multiply(new THREE.Matrix4().makeTranslation(-d, d, d));
  leftEye.updateMatrixWorld();

  rightEye.matrixAutoUpdate = false;
  rightEye.matrix.copy(head.matrix);
  var d = head.geometry.parameters.radius / Math.sqrt(3);
  rightEye.matrix.multiply(new THREE.Matrix4().makeTranslation(-d, d, -d));
  rightEye.updateMatrixWorld();

  leftArm.matrixAutoUpdate = false;
  leftArm.matrix.copy(longBody.matrix);
  leftArm.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * longBody.geometry.parameters.width / 4, 0, 0));
  leftArm.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
  leftArm.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (leftArm.geometry.parameters.width + longBody.geometry.parameters.height), 0, 0.5 * (longBody.geometry.parameters.depth - leftArm.geometry.parameters.depth)));
  leftArm.updateMatrixWorld();

  rightArm.matrixAutoUpdate = false;
  rightArm.matrix.copy(longBody.matrix);
  rightArm.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * longBody.geometry.parameters.width / 4, 0, 0));
  rightArm.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
  rightArm.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (rightArm.geometry.parameters.width + longBody.geometry.parameters.height), 0, -0.5 * (longBody.geometry.parameters.depth - rightArm.geometry.parameters.depth)));
  rightArm.updateMatrixWorld();

  leftWrist.matrixAutoUpdate = false;
  leftWrist.matrix.copy(leftArm.matrix);
  leftWrist.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * leftArm.geometry.parameters.width / 2, 0, 0));
  leftWrist.matrix.multiply(new THREE.Matrix4().makeRotationZ(-1 * Math.PI / 12));
  leftWrist.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * leftWrist.geometry.parameters.width / 2, 0, 0));
  leftWrist.updateMatrixWorld();

  rightWrist.matrixAutoUpdate = false;
  rightWrist.matrix.copy(rightArm.matrix);
  rightWrist.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * rightArm.geometry.parameters.width / 2, 0, 0));
  rightWrist.matrix.multiply(new THREE.Matrix4().makeRotationZ(-1 * Math.PI / 12));
  rightWrist.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * rightWrist.geometry.parameters.width / 2, 0, 0));
  rightWrist.updateMatrixWorld();

  leftLeg1.matrixAutoUpdate = false;
  leftLeg1.matrix.copy(shortBody.matrix);
  leftLeg1.matrix.multiply(new THREE.Matrix4().makeTranslation(0.5 * (shortBody.geometry.parameters.width - leftLeg1.geometry.parameters.height) - 0.18, 0, 0));
  leftLeg1.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2 - Math.PI / 12 - avars[4] * (Math.PI / 180)));
  leftLeg1.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (shortBody.geometry.parameters.height + leftLeg1.geometry.parameters.width) + 0.1, 0, 0.5 * (shortBody.geometry.parameters.depth - leftLeg1.geometry.parameters.depth)));
  leftLeg1.updateMatrixWorld();

  rightLeg1.matrixAutoUpdate = false;
  rightLeg1.matrix.copy(shortBody.matrix);
  rightLeg1.matrix.multiply(new THREE.Matrix4().makeTranslation(0.5 * (shortBody.geometry.parameters.width - rightLeg1.geometry.parameters.height) - 0.18, 0, 0));
  rightLeg1.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2 - Math.PI / 12 + avars[4] * (Math.PI / 180)));
  rightLeg1.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (shortBody.geometry.parameters.height + rightLeg1.geometry.parameters.width) + 0.1, 0, -0.5 * (shortBody.geometry.parameters.depth - rightLeg1.geometry.parameters.depth)));
  rightLeg1.updateMatrixWorld();

  leftLeg2.matrixAutoUpdate = false;
  leftLeg2.matrix.copy(leftLeg1.matrix);
  leftLeg2.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (leftLeg1.geometry.parameters.width - leftLeg2.geometry.parameters.height), 0, 0));
  leftLeg2.matrix.multiply(new THREE.Matrix4().makeRotationZ((Math.PI / 8) + avars[4] * (Math.PI / 180)));
  leftLeg2.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (leftLeg2.geometry.parameters.width), 0, 0));
  leftLeg2.updateMatrixWorld();

  rightLeg2.matrixAutoUpdate = false;
  rightLeg2.matrix.copy(rightLeg1.matrix);
  rightLeg2.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (rightLeg1.geometry.parameters.width - rightLeg2.geometry.parameters.height), 0, 0));
  rightLeg2.matrix.multiply(new THREE.Matrix4().makeRotationZ((Math.PI / 8) - avars[4] * (Math.PI / 180)));
  rightLeg2.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (rightLeg2.geometry.parameters.width), 0, 0));
  rightLeg2.updateMatrixWorld();

  tail1.matrixAutoUpdate = false;
  tail1.matrix.copy(shortBody.matrix);
  tail1.matrix.multiply(new THREE.Matrix4().makeTranslation(shortBody.geometry.parameters.width / 2 - 0.1, 0, 0));
  tail1.matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI / 12));
  tail1.matrix.multiply(new THREE.Matrix4().makeTranslation(tail1.geometry.parameters.width / 2, 0, 0));
  tail1.updateMatrixWorld();

  tail2.matrixAutoUpdate = false;
  tail2.matrix.copy(tail1.matrix);
  tail2.matrix.multiply(new THREE.Matrix4().makeTranslation(tail1.geometry.parameters.width / 2 - 0.05, 0, 0));
  tail2.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 12));
  tail2.matrix.multiply(new THREE.Matrix4().makeTranslation(tail2.geometry.parameters.width / 2 - 0.1, 0, 0));
  tail2.updateMatrixWorld();

  tail3.matrixAutoUpdate = false;
  tail3.matrix.copy(tail2.matrix);
  tail3.matrix.multiply(new THREE.Matrix4().makeTranslation((tail2.geometry.parameters.width) / 2 - 0.05, 0, 0));
  tail3.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 12));
  tail3.matrix.multiply(new THREE.Matrix4().makeTranslation((tail3.geometry.parameters.width) / 2, -0.005, 0));
  tail3.updateMatrixWorld();

  FLIP_DEGREE += unitRotation;
  if (FLIP_DEGREE == 360) {
    FLIP_DEGREE = 0;
    FLIPPING_IN_PROGRESS = false;
  }
}


function sendRocket() {
  var next = rocketBody.position.y + 0.03;
  var nextHead = rocketHead.position.y + 0.03;

  var prev = rocketBody.position.y - 0.03;
  var prevHead = rocketHead.position.y - 0.03;

  if (JUMP_DIR == 1 && next < JUMP_MAX) {
    rocketBody.position.setY(next);
    rocketHead.position.setY(nextHead);
  } else if (JUMP_DIR == 1 && next >= JUMP_MAX) {
    rocketBody.position.setY(JUMP_MAX);
    rocketHead.position.setY(JUMP_MAX + 2.5 * BALL_RADIUS);
    JUMP_DIR = -1;
  } else if (JUMP_DIR == -1 && prev > JUMP_MIN) {
    rocketBody.position.setY(prev);
    rocketHead.position.setY(prevHead);
  } else if (JUMP_DIR == -1 && prev <= JUMP_MIN) {
    rocketBody.position.setY(JUMP_MIN);
    rocketHead.position.setY(JUMP_MIN + 2.5 * BALL_RADIUS);
    JUMP_DIR = 1;
    JUMP_IN_PROGRESS = false;
  }
}
///////////////////////////////////////////////////////////////////////////////////////
//  laserUpdate()
///////////////////////////////////////////////////////////////////////////////////////

function laserUpdate() {

  // var trexEyeLocal = new THREE.Vector3(0, 1.2, -1.9);
  var cooperEyeLocal = new THREE.Vector3(0, -75, 30);
  //var trex2 = meshes["trex2"]; //   reference to the Object
  var cooper = meshes['minicooper1']
  //var trexEyeWorld = trexEyeLocal.applyMatrix4(trex2.matrix); // this computes  trex2.matrix * trexEyeLocal (with h=1)
  var cooperFrontWorld = cooperEyeLocal.applyMatrix4(cooper.matrix);

  //var mydinoWorld = new THREE.Vector3(10, 0, 3);
  var newDinoWorld = dinoParts[0].matrix.getPosition();

  var offset = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.02, 0, 0), new THREE.Vector3(0, 0.02, 0)];
  for (var n = 0; n < 3; n++) { // laserLine consists of three line segements, slightly offset (more visible)
    laserLine.geometry.vertices[n * 2].x = cooperFrontWorld.x + offset[n].x;
    laserLine.geometry.vertices[n * 2].y = cooperFrontWorld.y + offset[n].y;
    laserLine.geometry.vertices[n * 2].z = cooperFrontWorld.z + offset[n].z;

    laserLine.geometry.vertices[n * 2 + 1].x = newDinoWorld.x + offset[n].x;
    laserLine.geometry.vertices[n * 2 + 1].y = newDinoWorld.y + offset[n].y;
    laserLine.geometry.vertices[n * 2 + 1].z = newDinoWorld.z + offset[n].z;
  }
  laserLine.geometry.verticesNeedUpdate = true;
}

///////////////////////////////////////////////////////////////////////////////////////
// trexSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function trexSetMatrices(avars) {
  var trex2 = meshes["trex2"]; //   reference to the Object

  trex2.matrixAutoUpdate = false; // tell three.js not to over-write our updates
  trex2.matrix.identity();
  trex2.matrix.multiply(new THREE.Matrix4().makeTranslation(avars[0], avars[1], avars[2]));
  trex2.matrix.multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2 + avars[3] * Math.PI / 180));
  trex2.matrix.multiply(new THREE.Matrix4().makeScale(1.5, 1.5, 1.5));
  trex2.updateMatrixWorld();
}

///////////////////////////////////////////////////////////////////////////////////////
// mydinoSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function mydinoSetMatrices(avars) {
  body.matrixAutoUpdate = false;
  body.matrix.identity(); // root of the hierarchy
  body.matrix.multiply(new THREE.Matrix4().makeTranslation(avars[0], avars[1], 0)); // translate body-center up
  body.updateMatrixWorld();

  leftLeg.matrixAutoUpdate = false;
  leftLeg.matrix.copy(body.matrix); // start with the parent's matrix
  leftLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, 1.4, -0.125)); // translate to hip
  leftLeg.matrix.multiply(new THREE.Matrix4().makeRotationZ(avars[2] * Math.PI / 180)); // rotate about hip
  leftLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0, 1.0, 0)); // translate to center of upper leg
  leftLeg.updateMatrixWorld();

  rightLeg.matrixAutoUpdate = false;
  rightLeg.matrix.copy(body.matrix); // start with the parent's matrix
  rightLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, 1.4, 0.125)); // translate to hip
  rightLeg.matrix.multiply(new THREE.Matrix4().makeRotationZ(avars[3] * Math.PI / 180)); // rotate about hip
  rightLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0, 1.0, 0)); // translate to center of upper leg
  rightLeg.updateMatrixWorld();

  leftLeftLeg.matrixAutoUpdate = false;
  leftLeftLeg.matrix.copy(leftLeg.matrix);
  leftLeftLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, leftLeg.geometry.parameters.height / 2, 0));
  leftLeftLeg.matrix.multiply(new THREE.Matrix4().makeRotationX(avars[4] * Math.PI / 180));
  leftLeftLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, leftLeftLeg.geometry.parameters.height / 2, 0));
  leftLeftLeg.updateMatrixWorld();

  leftRightLeg.matrixAutoUpdate = false;
  leftRightLeg.matrix.copy(leftLeg.matrix);
  leftRightLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, leftLeg.geometry.parameters.height / 2, 0));
  leftRightLeg.matrix.multiply(new THREE.Matrix4().makeRotationX(avars[5] * Math.PI / 180));
  leftRightLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, leftRightLeg.geometry.parameters.height / 2, 0));
  leftRightLeg.updateMatrixWorld();

  rightLeftLeg.matrixAutoUpdate = false;
  rightLeftLeg.matrix.copy(rightLeg.matrix);
  rightLeftLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, rightLeg.geometry.parameters.height / 2, 0));
  rightLeftLeg.matrix.multiply(new THREE.Matrix4().makeRotationX(avars[4] * Math.PI / 180));
  rightLeftLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, rightLeftLeg.geometry.parameters.height / 2, 0));
  rightLeftLeg.updateMatrixWorld();

  rightRightLeg.matrixAutoUpdate = false;
  rightRightLeg.matrix.copy(rightLeg.matrix);
  rightRightLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, rightLeg.geometry.parameters.height / 2, 0));
  rightRightLeg.matrix.multiply(new THREE.Matrix4().makeRotationX(avars[5] * Math.PI / 180));
  rightRightLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, rightRightLeg.geometry.parameters.height / 2, 0));
  rightRightLeg.updateMatrixWorld();
}

///////////////////////////////////////////////////////////////////////////////////////
// newmydinoSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function newmydinoSetMatrices(avars) {
  if (!FLIPPING_IN_PROGRESS) {
    longBody.matrixAutoUpdate = false;
    longBody.matrix.identity(); // root of the hierarchy
    longBody.matrix.multiply(new THREE.Matrix4().makeTranslation(avars[0], avars[1], avars[2]));
    longBody.matrix.multiply(new THREE.Matrix4().makeRotationY(avars[3] * Math.PI / 180));
    longBody.matrix.multiply(new THREE.Matrix4().makeRotationZ(-27 * Math.PI / 180));
    longBody.updateMatrixWorld();

    shortBody.matrixAutoUpdate = false;
    shortBody.matrix.copy(longBody.matrix);
    shortBody.matrix.multiply(new THREE.Matrix4().makeTranslation(longBody.geometry.parameters.width / 2, 0, 0));
    shortBody.matrix.multiply(new THREE.Matrix4().makeRotationZ(-1 * Math.PI / 18 + (15 * Math.PI / 180)));
    shortBody.matrix.multiply(new THREE.Matrix4().makeTranslation(shortBody.geometry.parameters.width / 2 - 0.1, 0, 0));
    shortBody.updateMatrixWorld();

    neck.matrixAutoUpdate = false;
    neck.matrix.copy(longBody.matrix);
    neck.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * longBody.geometry.parameters.width / 2, 0, 0));
    neck.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 24 + Math.PI / 3));
    neck.matrix.multiply(new THREE.Matrix4().makeTranslation(0, neck.geometry.parameters.height / 2 - 0.15, 0));
    neck.updateMatrixWorld();

    head.matrixAutoUpdate = false;
    head.matrix.copy(neck.matrix);
    head.matrix.multiply(new THREE.Matrix4().makeTranslation(0, neck.geometry.parameters.height / 2, 0));
    head.updateMatrixWorld();

    leftEye.matrixAutoUpdate = false;
    leftEye.matrix.copy(head.matrix);
    var d = head.geometry.parameters.radius / Math.sqrt(3);
    leftEye.matrix.multiply(new THREE.Matrix4().makeTranslation(-d, d, d));
    leftEye.updateMatrixWorld();

    rightEye.matrixAutoUpdate = false;
    rightEye.matrix.copy(head.matrix);
    var d = head.geometry.parameters.radius / Math.sqrt(3);
    rightEye.matrix.multiply(new THREE.Matrix4().makeTranslation(-d, d, -d));
    rightEye.updateMatrixWorld();

    leftArm.matrixAutoUpdate = false;
    leftArm.matrix.copy(longBody.matrix);
    leftArm.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * longBody.geometry.parameters.width / 4, 0, 0));
    leftArm.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    leftArm.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (leftArm.geometry.parameters.width + longBody.geometry.parameters.height), 0, 0.5 * (longBody.geometry.parameters.depth - leftArm.geometry.parameters.depth)));
    leftArm.updateMatrixWorld();

    rightArm.matrixAutoUpdate = false;
    rightArm.matrix.copy(longBody.matrix);
    rightArm.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * longBody.geometry.parameters.width / 4, 0, 0));
    rightArm.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    rightArm.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (rightArm.geometry.parameters.width + longBody.geometry.parameters.height), 0, -0.5 * (longBody.geometry.parameters.depth - rightArm.geometry.parameters.depth)));
    rightArm.updateMatrixWorld();

    leftWrist.matrixAutoUpdate = false;
    leftWrist.matrix.copy(leftArm.matrix);
    leftWrist.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * leftArm.geometry.parameters.width / 2, 0, 0));
    leftWrist.matrix.multiply(new THREE.Matrix4().makeRotationZ(-1 * Math.PI / 12));
    leftWrist.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * leftWrist.geometry.parameters.width / 2, 0, 0));
    leftWrist.updateMatrixWorld();

    rightWrist.matrixAutoUpdate = false;
    rightWrist.matrix.copy(rightArm.matrix);
    rightWrist.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * rightArm.geometry.parameters.width / 2, 0, 0));
    rightWrist.matrix.multiply(new THREE.Matrix4().makeRotationZ(-1 * Math.PI / 12));
    rightWrist.matrix.multiply(new THREE.Matrix4().makeTranslation(-1 * rightWrist.geometry.parameters.width / 2, 0, 0));
    rightWrist.updateMatrixWorld();

    leftLeg1.matrixAutoUpdate = false;
    leftLeg1.matrix.copy(shortBody.matrix);
    leftLeg1.matrix.multiply(new THREE.Matrix4().makeTranslation(0.5 * (shortBody.geometry.parameters.width - leftLeg1.geometry.parameters.height) - 0.18, 0, 0));
    leftLeg1.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2 - Math.PI / 12 - avars[4] * (Math.PI / 180)));
    leftLeg1.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (shortBody.geometry.parameters.height + leftLeg1.geometry.parameters.width) + 0.1, 0, 0.5 * (shortBody.geometry.parameters.depth - leftLeg1.geometry.parameters.depth)));
    leftLeg1.updateMatrixWorld();

    rightLeg1.matrixAutoUpdate = false;
    rightLeg1.matrix.copy(shortBody.matrix);
    rightLeg1.matrix.multiply(new THREE.Matrix4().makeTranslation(0.5 * (shortBody.geometry.parameters.width - rightLeg1.geometry.parameters.height) - 0.18, 0, 0));
    rightLeg1.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2 - Math.PI / 12 + avars[4] * (Math.PI / 180)));
    rightLeg1.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (shortBody.geometry.parameters.height + rightLeg1.geometry.parameters.width) + 0.1, 0, -0.5 * (shortBody.geometry.parameters.depth - rightLeg1.geometry.parameters.depth)));
    rightLeg1.updateMatrixWorld();

    leftLeg2.matrixAutoUpdate = false;
    leftLeg2.matrix.copy(leftLeg1.matrix);
    leftLeg2.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (leftLeg1.geometry.parameters.width - leftLeg2.geometry.parameters.height), 0, 0));
    leftLeg2.matrix.multiply(new THREE.Matrix4().makeRotationZ((Math.PI / 8) + avars[4] * (Math.PI / 180)));
    leftLeg2.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (leftLeg2.geometry.parameters.width), 0, 0));
    leftLeg2.updateMatrixWorld();

    rightLeg2.matrixAutoUpdate = false;
    rightLeg2.matrix.copy(rightLeg1.matrix);
    rightLeg2.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (rightLeg1.geometry.parameters.width - rightLeg2.geometry.parameters.height), 0, 0));
    rightLeg2.matrix.multiply(new THREE.Matrix4().makeRotationZ((Math.PI / 8) - avars[4] * (Math.PI / 180)));
    rightLeg2.matrix.multiply(new THREE.Matrix4().makeTranslation(-0.5 * (rightLeg2.geometry.parameters.width), 0, 0));
    rightLeg2.updateMatrixWorld();

    tail1.matrixAutoUpdate = false;
    tail1.matrix.copy(shortBody.matrix);
    tail1.matrix.multiply(new THREE.Matrix4().makeTranslation(shortBody.geometry.parameters.width / 2 - 0.1, 0, 0));
    tail1.matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI / 12));
    tail1.matrix.multiply(new THREE.Matrix4().makeTranslation(tail1.geometry.parameters.width / 2, 0, 0));
    tail1.updateMatrixWorld();

    tail2.matrixAutoUpdate = false;
    tail2.matrix.copy(tail1.matrix);
    tail2.matrix.multiply(new THREE.Matrix4().makeTranslation(tail1.geometry.parameters.width / 2 - 0.05, 0, 0));
    tail2.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 12));
    tail2.matrix.multiply(new THREE.Matrix4().makeTranslation(tail2.geometry.parameters.width / 2 - 0.1, 0, 0));
    tail2.updateMatrixWorld();

    tail3.matrixAutoUpdate = false;
    tail3.matrix.copy(tail2.matrix);
    tail3.matrix.multiply(new THREE.Matrix4().makeTranslation((tail2.geometry.parameters.width) / 2 - 0.05, 0, 0));
    tail3.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 12));
    tail3.matrix.multiply(new THREE.Matrix4().makeTranslation((tail3.geometry.parameters.width) / 2, -0.005, 0));
    tail3.updateMatrixWorld();
  }
}

function minicooper1SetMatrices(avars) {
  car = meshes["minicooper1"];
  /*dinoControl = dinoParts[0];
  dinoBack = dinoParts[1];

  var tail = new THREE.Vector3( 0, 0, 1 );
  var head = new THREE.Vector3( 0, 0, 1 );
  tail.applyMatrix4(new THREE.Matrix4().copyPosition(dinoBack.matrix));
  head.applyMatrix4(new THREE.Matrix4().copyPosition(dinoControl.matrix));
  var dir = head.sub(tail);
  // console.log(dir);*/
  if (!FLIPPING_IN_PROGRESS) {
    car.matrixAutoUpdate = false;
    car.matrix.identity(); // root of the hierarchy
    car.matrix.multiply(new THREE.Matrix4().makeTranslation(avars[0], avars[1], avars[2]));
    car.matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    car.matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI/2 + avars[3] * Math.PI / 180));
    car.matrix.multiply(new THREE.Matrix4().makeScale(0.025, 0.025, 0.025));
    car.updateMatrixWorld();
  }
}


/////////////////////////////////////////////////////////////////////////////////////
// runs when all resources are loaded
/////////////////////////////////////////////////////////////////////////////////////

function onResourcesLoaded() {

  // Clone models into meshes;   [Michiel:  AFAIK this makes a "shallow" copy of the model,
  //                             i.e., creates references to the geometry, and not full copies ]
  /*
  meshes["armadillo1"] = models.armadillo.mesh.clone();
  meshes["bunny1"] = models.bunny.mesh.clone();
  meshes["teapot1"] = models.teapot.mesh.clone();
  meshes["minicooper2"] = models.minicooper.mesh.clone();
  meshes["minicooper3"] = models.minicooper.mesh.clone();
  meshes["trex1"] = models.trex.mesh.clone();
  */
  meshes["minicooper1"] = models.minicooper.mesh.clone();
  meshes["trex2"] = models.trex.mesh.clone();

  // Reposition individual meshes, then add meshes to scene
  /*
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

  meshes["minicooper2"].position.set(6, 0, 6);
  meshes["minicooper2"].scale.set(0.025, 0.025, 0.025);
  meshes["minicooper2"].rotation.set(-Math.PI/2, 0, Math.PI/2);
  scene.add(meshes["minicooper2"]);

  meshes["minicooper3"].position.set(4, 0, -2);
  meshes["minicooper3"].scale.set(0.025, 0.025, 0.025);
  meshes["minicooper3"].rotation.set(-Math.PI/2, 0, 0);
  scene.add(meshes["minicooper3"]);

  meshes["trex1"].position.set(-4, 1.90, -2);
  meshes["trex1"].scale.set(1.5,1.5,1.5);
  meshes["trex1"].rotation.set(0,-Math.PI/2, 0);
  scene.add(meshes["trex1"]);
  */

  meshes["minicooper1"].position.set(-2, 0, 3);
  meshes["minicooper1"].scale.set(0.025, 0.025, 0.025);
  meshes["minicooper1"].rotation.set(-Math.PI/2, 0, Math.PI/2);
  scene.add(meshes["minicooper1"]);

  // note:  we will be animating trex2, so these transformations will be overwritten anyhow
  meshes["trex2"].position.set(0, 1.9, 3);
  meshes["trex2"].scale.set(1.5, 1.5, 1.5);
  meshes["trex2"].rotation.set(0, -Math.PI / 2, 0);
  scene.add(meshes["trex2"]);
}

// window.onload = init;
init();

window.addEventListener('resize', resize); // EVENT LISTENER RESIZE
resize();

update();
