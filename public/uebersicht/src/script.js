// import libraries
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// jQuery
const $ = require("jquery");

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Startpage (Particle)
const vertices = []
const materials = []
let particles
 
let parameters
let mouseX = 0, mouseY = 0

// TEXTURE
const textureloader = new THREE.TextureLoader()
const particleTexture = textureloader.load('particle.png')

// Create random "positions"
for ( let i = 0; i < 1100; i ++ ) {
  const x = Math.random() * 20 - 10;
  const y = Math.random() * 20 - 10;
  const z = Math.random() * 20 - 10;
  vertices.push( x, y, z );
}

// GEOMETRY (Particles)
const geometry = new THREE.BufferGeometry();
geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

parameters = [
  [[ 1.0, 0.2, 0.5 ], 0.05 ],
  [[ 0.95, 0.1, 0.5 ], 0.3 ],
  [[ 0.90, 0.05, 0.5 ], 0.2 ],
  [[ 0.85, 0, 0.5 ], 0.3 ],
  [[ 0.80, 0, 0.5 ], 0.1 ]
];

// MATERIAL/PARTICLES
for ( let i = 0; i < parameters.length; i ++ ) {
  // const color = parameters[ i ][ 0 ];
  const size = parameters[ i ][ 1 ];

  materials[ i ] = new THREE.PointsMaterial({
    size: size,
    color: 0x816CFF,
    map: particleTexture,
    blending: THREE.AdditiveBlending, 
    depthTest: false, 
    transparent: true,
    alphaMap: particleTexture,
    alphaTest: 0.001,
    depthTest: false
  });

  // CREATE PARTICLES
  particles = new THREE.Points( geometry, materials[ i ] );
  particles.rotation.x = Math.random() * 3;
  particles.rotation.y = Math.random() * 3;
  particles.rotation.z = Math.random() * 3;
}

scene.add( particles );

// PARTICLES REACT TO POINTER MOVE
document.body.style.touchAction = 'none';
document.body.addEventListener( 'pointermove', onPointerMove );

function onPointerMove( event ) {
  if ( event.isPrimary === false ) return;
  mouseX = event.clientX - sizes.width/2;
  mouseY = event.clientY - sizes.height/2;
}



/*    Overview Page    */

// which page to load
let loadLandingPage = true;
let loadTablePage = false;
// redirect id for elements
let redirectId = 0;

// targets
const targets = { table: [], sphere: [], helix: [], grid: [] };

// TEXTURES
const textures = []
for(let i = 0; i < 118; i++) {
    const elementstextureLoader = new THREE.TextureLoader()
    textures[i] = elementstextureLoader.load('./textures/elements/textures_elements_'+ i + '.png')
}

// GEOMETRY
const vector = new THREE.Vector3();
const geometryBox = new RoundedBoxGeometry(1, 1, 1, 10, 0.1)

// table function
function createTable(filterVar) {
  // reset raycaster and target arrays
  for(let i = 0; i < targets.helix.length; i++){
    scene.remove(targets.helix[i]);
  }
  for(let i = 0; i < targets.table.length; i++){
    scene.remove(targets.table[i]);
  }
  raycasterTestObjects = [];
  targets.table = [];
  targets.helix = [];
  // rows and cols for the grid
  let row = Math.round((118 / 16) / 2) - 1;
  let col = -8;
  // seperate counter variable for filters
  let c = 0;
  let filteredElements = [];

  // JSON read call
  $.getJSON("periodic-table.json", function (data) {
    if(filterVar){
      for(let i = 0; i < data.length; i++){
        // check if any filters are set
        if(filterVar === data[i].groupBlock || filterVar === data[i].standardState || filterVar === data[i].bondingType){
          // grid formation
          if (col > 8) {
            row--;
            col = -8;
          }
          // assign the c'th element in this array the index of the current element should it match the filter
          filteredElements[c] = i;
          // generate new object and apply the texture. here the above array comes into play
          const object = new THREE.Mesh(geometryBox, new THREE.MeshBasicMaterial({
            map: textures[filteredElements[c]],
          }));

          // assign the object name the current index (for redirection)
          object.name = i;
          
          // add object to table array
          targets.table.push(object);
          targets.table[c].position.x = col * 1.8;
          targets.table[c].position.y = row * 2.5;
          // add cubes to scene
          scene.add(targets.table[c]);
          
          // increase the column
          col++;
          // increase c for each found element
          c++;
        } 
      }
      // after the loop is through, assign the raycasterTestObjects
      raycasterTestObjects = targets.table;
    }
    // no filters are set
    else{
      for(let i = 0; i < data.length; i++){
      // grid
      if (col > 8) {
        row--;
        col = -8;
      }
      // generate new object and assign texture
      const object = new THREE.Mesh(geometryBox, new THREE.MeshBasicMaterial({
        map: textures[i]
      }))

      // assign name for redirection id
      object.name = i;

      targets.table.push(object);
      targets.table[i].position.x = col * 1.8;
      targets.table[i].position.y = row * 2.5;
      // add cubes to scene
      scene.add(targets.table[i]);
      // up the column
      col++;
      }   
      // assign to raycasterTestObjects
      raycasterTestObjects = targets.table;   
    }
  });
}


// Helix function
function createHelix(filterVar) {
  // separate counter variable for filters
  let c = 0;
  let filteredElements = [];

  // empty raycasterTestObjects and helix array
  for(let i = 0; i < targets.helix.length; i++){
    scene.remove(targets.helix[i]);
  }
  for(let i = 0; i < targets.table.length; i++){
    scene.remove(targets.table[i]);
  }
  raycasterTestObjects = [];
  targets.helix = [];
  targets.table = [];

  // JSON read call
  $.getJSON("periodic-table.json", function (data) {
    if(filterVar){
      for(let i = 0; i < data.length; i++){
        
        // constellation math
        const theta = i * 0.175 + Math.PI; //default  0.175
        const y = -(i * 0.05) + 2;

        // check for set filters
        if(filterVar === data[i].groupBlock || filterVar === data[i].standardState || filterVar === data[i].bondingType){
          
          // assign the c'th element in this array the index of the current element should it match the filter
          filteredElements[c] = i;

          // create object and assign texture
          const object = new THREE.Mesh(geometryBox, new THREE.MeshBasicMaterial({
            map: textures[filteredElements[c]]
          }))

          // assign name for redirection id
          object.name = i;
          
          // position the cube
          object.position.setFromCylindricalCoords(8, theta, y);
          vector.x = object.position.x * 2;
          vector.y = object.position.y;
          vector.z = object.position.z * 2;
  
          // set direction of the object
          object.lookAt(vector);
          
          targets.helix.push(object);
        
          // add cubes to scene
          scene.add(targets.helix[c]);
          
          // increase counter for each found element
          c++;
        } 
      }
      // after the loop is through, assign the raycasterTestObjects
      raycasterTestObjects = targets.helix;
    }
    // no filters are set
    else{
      for (let i = 0; i < data.length; i++) {
        // positional math
        const theta = i * 0.175 + Math.PI; //default  0.175
        const y = -(i * 0.05) + 2;
        
        // create new object and assign texture
        const object = new THREE.Mesh(geometryBox, new THREE.MeshBasicMaterial({
          map: textures[i]
        }));

        // assign name for redirection id
        object.name = i;
        
        // position the cube
        object.position.setFromCylindricalCoords(8, theta, y);
        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;
  
        // set direction of the object
        object.lookAt(vector);
  
        targets.helix.push(object);
        
        // add cubes to scene
        scene.add(targets.helix[i]);
      }
      // assign to raycasterTestObjects
      raycasterTestObjects = targets.helix;
    }    
  });
  // set the camera after creating the helix
  camera.position.set(0, 0, -15);
  controls.target.set(0, -1.5, 0);
}

// raycaster
const raycaster = new THREE.Raycaster();
const intersect = raycaster.intersectObjects(targets);

// Mouse
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1; // Values from -1 to 1 -> normalized
  mouse.y = -(event.clientY / sizes.height) * 2 + 1; // Values from -1 to 1 -> normalized
});

// window resize
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// start button on landing page
document.getElementById("starter").addEventListener("click", () => {
  loadLandingPage = false;
  loadTablePage = true;
  scene.remove(particles);
  $(".section").fadeOut();
  $(".switcher").fadeIn();
  $(".filter").fadeIn();
  $(".toggle").fadeIn();
  $(".state").fadeIn();
  $(".logo-helix").fadeIn();
  createHelix();
  camera.position.z = -15;

  // reset controls
  controls.target.set( 0, -1.5, 0 );
});


// Camera
// Base camera

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 1000);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});

// renderer.setClearAlpha(0)
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));



// Lights
const ambientLight = new THREE.AmbientLight(0xcc9ff4, 1);
scene.add(ambientLight)

// Animate
const clock = new THREE.Clock();
// initial set of the raycasterTestObjects to the default display method
let raycasterTestObjects = targets.helix;
let currentIntersect;

// cycle function
const tick = () => {
  // default
  if (loadLandingPage) {
    // get elapsed time
    const elapsedTime = clock.getElapsedTime();

    //UPDATE STARTPAGE (PARTICLES)
    camera.position.x += ( mouseX - camera.position.x ) * 0.000008;
    camera.position.y += ( - mouseY - camera.position.y ) * 0.000008;

    // generate particles
    for (let i = 0; i < scene.children.length; i++){
      const object = scene.children[i];
      if ( object instanceof THREE.Points ) {
        object.rotation.y = elapsedTime * ( i < 4 ? i + 1 : - ( i + 1 ) ) * 0.003;
      }
    }
  }

  // after the start button
  if (loadTablePage) {
    // Cast a Ray
    raycaster.setFromCamera(mouse, camera);
    // set intersct objects || THIS CYCLES
    const objectsToTest = raycasterTestObjects;
    const intersects = raycaster.intersectObjects(objectsToTest);

    // change color shading of the hovered object
    for (const object of objectsToTest) {
      object.material.color.set("#FFF");
    }

    // change color shading of the hovered object
    if(intersects.length > 0) {
      intersects[0].object.material.color.set('#CBC3FF');
    }
  
    // check if intersects has objects
    if(intersects.length){
      if(!currentIntersect)
      {
        // set the redirectionId to the name of the object set above
        redirectId = intersects[0].object.name + 1;          
      }
      // set the currently intersecting object to the FIRST in the list of all intersecting objects 
      currentIntersect = intersects[0]
    }
    else
    {
      if(currentIntersect){
        // upon leaving set redirectId to 0 which won't redirect
        redirectId = 0;
      }
      currentIntersect = null
    }
  }

  // Update controls
  controls.update();
  // renderer
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

// call tick once to start the cycle
tick();


// button and filters

// switch between grid and helix
$('.btn').on('click', () => {
  if($('.btn').hasClass('active')){
    $('.btn').removeClass('active');
    $('.state').text('Helix');

    for (let i = 0; i < targets.table.length; i++) {
      scene.remove(targets.table[i]);
    }

    createHelix();
  }
  else{
    $(".btn").addClass("active");
    $('.state').text('Table');
    
    for (let i = 0; i < targets.helix.length; i++) {
      scene.remove(targets.helix[i]);
    }
    createTable();

    // reposition camera
    camera.position.set(0, -8, 13);
    // cam pointer
    controls.target.set( 0, -2, 0);
    controls.enablePan = true;
  }
});

// logo redirection link
$('.logo-helix').on('click', () => {

  // set the switch state
  $('.btn').removeClass('active');
  $('.state').text('Helix');

  // should there be elements in the table array, remove them
  for (let i = 0; i < targets.table.length; i++) {
    scene.remove(targets.table[i]);
  }
  
  // create default view
  createHelix();  
});

// maingroup filter
$(".mg1").on("change", () => {

  // get the value of the selected option
  let s = $('.mg1').val();

  // remove all prior elements
  for (let i = 0; i < targets.table.length; i++) {
    scene.remove(targets.table[i]);
  }
  for (let i = 0; i < targets.helix.length; i++) {
    scene.remove(targets.helix[i]);
  }

  // check which view is currently active and build a new one with the given parameter
  if($('.btn').hasClass('active')){
    createTable(s);
  }
  else{
    createHelix(s);
  }  

  // reenable panning
  controls.enablePan = true;
})

$(".sts").on("change", () => {

  // get the value of the selected option
  let s = $('.sts').val();

  // remove all prior elements
  for (let i = 0; i < targets.table.length; i++) {
    scene.remove(targets.table[i]);
  } 
  for (let i = 0; i < targets.helix.length; i++) {
    scene.remove(targets.helix[i]);
  }

  // check which view is currently active and build a new one with the given parameter
  if($('.btn').hasClass('active')){
    createTable(s);
  }
  else{
    createHelix(s);
  }

  // reeanble panning
  controls.enablePan = true;
})

$(".bt").on("change", () => {

  // get the value of the selected option
  let s = $('.bt').val();

  // remove all prior elements
  for (let i = 0; i < targets.table.length; i++) {
    scene.remove(targets.table[i]);
  }
  for (let i = 0; i < targets.helix.length; i++) {
    scene.remove(targets.helix[i]);
  }

  // check which view is currently active and build a new one with the given parameter
  if($('.btn').hasClass('active')){
    createTable(s);
  }
  else{
    createHelix(s);
  }
})

// redirection

// search url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// check if the "started" parameter is in the querystring
let reroute = urlParams.get("started");
if(reroute) {
  // click on the start button
  $('#starter').click();
}


// helper
// default state
let alertTimer = true;

// load on DOM finish
$(() => {
  // doubleclick
  $(window).on('dblclick', () => {
    // if both redirectId is set AND it's not 0
    if(redirectId && redirectId > 0){
      // redirect to detailview based on given ID
      window.location.replace('/detail?id=' + redirectId);
    }
  });

  // helper function to explain double vs single click
  $(window).on('click', () => {
    // check for alert timer
    if(redirectId && redirectId > 0 && alertTimer){
      // show helper text
      $('.alert').fadeIn(500).delay(3000).fadeOut(500);
      
      // set timeout to prevent the message from displaying again for 60s
      alertTimer = false;
      setTimeout(resetAlertTimer, 60000);
    }
  });
});

// reset alert timer function
function resetAlertTimer(){
  alertTimer = true;
}
