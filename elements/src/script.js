// import libraries
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
// import * as d3 from "d3";


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
const vertices = [];
const materials = [];
let particles;

let parameters;
let mouseX = 0,
  mouseY = 0;

// TEXTURE
const textureloader = new THREE.TextureLoader();
const particleTexture = textureloader.load("particle.png");

// Create random "positions"
for (let i = 0; i < 1100; i++) {
  const x = Math.random() * 20 - 10;
  const y = Math.random() * 20 - 10;
  const z = Math.random() * 20 - 10;
  vertices.push(x, y, z);
}

// GEOMETRY (Particles)
const geometry = new THREE.BufferGeometry();
geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);

parameters = [
  [[1.0, 0.2, 0.5], 0.05],
  [[0.95, 0.1, 0.5], 0.3],
  [[0.9, 0.05, 0.5], 0.2],
  [[0.85, 0, 0.5], 0.3],
  [[0.8, 0, 0.5], 0.1],
];

// MATERIAL/PARTICLES
for (let i = 0; i < parameters.length; i++) {
  // const color = parameters[ i ][ 0 ];
  const size = parameters[i][1];

  materials[i] = new THREE.PointsMaterial({
    size: size,
    color: 0x816cff,
    map: particleTexture,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    alphaMap: particleTexture,
    alphaTest: 0.001,
    depthTest: false,
  });

  // CREATE PARTICLES
  particles = new THREE.Points(geometry, materials[i]);
  particles.rotation.x = Math.random() * 3;
  particles.rotation.y = Math.random() * 3;
  particles.rotation.z = Math.random() * 3;
}

scene.add(particles);

// PARTICLES REACT TO POINTER MOVE
document.body.style.touchAction = "none";
document.body.addEventListener("pointermove", onPointerMove);

function onPointerMove(event) {
  if (event.isPrimary === false) return;
  mouseX = event.clientX - sizes.width / 2;
  mouseY = event.clientY - sizes.height / 2;
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
const textures = [];
for (let i = 0; i < 118; i++) {
  const elementstextureLoader = new THREE.TextureLoader();
  textures[i] = elementstextureLoader.load(
    "./textures/elements/textures_elements_" + i + ".png"
  );
}

// GEOMETRY
const vector = new THREE.Vector3();
const geometryBox = new RoundedBoxGeometry(1, 1, 1, 10, 0.1);

// table function
function createTable(filterVar) {

  // separate counter variable for filters
  let newFilteredElements = [];

  // reset raycaster and target arrays
  for (let i = 0; i < targets.helix.length; i++) {
    scene.remove(targets.helix[i]);
  }
  for (let i = 0; i < targets.table.length; i++) {
    scene.remove(targets.table[i]);
  }
  raycasterTestObjects = [];
  targets.table = [];
  targets.helix = [];

  // rows and cols for the grid
  let row = Math.round(118 / 16 / 2) - 1;
  let col = -8;
  // seperate counter variable for filters

  // JSON read call
  $.getJSON("periodic-table.json", function (data) {
    if (filterVar) {
      for (let i = 0; i < data.length; i++) {
        // fill the array initially
        newFilteredElements[i] = i;
        // remove elements that DO NOT match the filter
        if (filtersArr['mg1'] && !(filtersArr['mg1'] === data[i].groupBlock)) {
          newFilteredElements.splice(i, 1);
        }
        if (filtersArr['sts'] && !(filtersArr['sts'] === data[i].standardState)) {
          newFilteredElements.splice(i, 1);
        }
        if (filtersArr['bt'] && !(filtersArr['bt'] === data[i].bondingType)) {
          newFilteredElements.splice(i, 1);
        }
      }
      console.log(newFilteredElements);
      // check if any filters are set
      let counter = 0;
      for (let m = 0; m < data.length; m++) {
        if (newFilteredElements[m]) {
          // grid formation
          if (col > 8) {
            row--;
            col = -8;
          }
          // generate new object and apply the texture. here the above array comes into play
          const object = new THREE.Mesh(
            geometryBox,
            new THREE.MeshBasicMaterial({
              map: textures[m],
            })
          );

          // assign the object name the current index (for redirection)
          object.name = m;

          // add object to table array
          targets.table.push(object);
          targets.table[counter].position.x = col * 1.8;
          targets.table[counter].position.y = row * 2.5;
          // add cubes to scene
          scene.add(targets.table[counter]);

          // increase the column
          col++;
          // increase c for each found element
          counter++;
        }
      }

      // after the loop is through, assign the raycasterTestObjects
      raycasterTestObjects = targets.table;
    }
    // no filters are set
    else {
      for (let i = 0; i < data.length; i++) {
        // grid
        if (col > 8) {
          row--;
          col = -8;
        }
        // generate new object and assign texture
        const object = new THREE.Mesh(
          geometryBox,
          new THREE.MeshBasicMaterial({
            map: textures[i],
          })
        );

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
function createHelix(filtersArr) {
  // separate counter variable for filters
  let newFilteredElements = [];

  // empty raycasterTestObjects and helix array
  for (let i = 0; i < targets.helix.length; i++) {
    scene.remove(targets.helix[i]);
  }
  for (let i = 0; i < targets.table.length; i++) {
    scene.remove(targets.table[i]);
  }
  raycasterTestObjects = [];
  targets.helix = [];
  targets.table = [];

  // JSON read call
  $.getJSON("periodic-table.json", function (data) {
    // check if filters are set
    if (filtersArr) {
      for (let i = 0; i < data.length; i++) {

        // fill the array initially
        newFilteredElements[i] = i;
        // remove elements that DO NOT match the filter
        if (filtersArr['mg1'] && !(filtersArr['mg1'] === data[i].groupBlock)) {
          newFilteredElements.splice(i, 1);
        }
        if (filtersArr['sts'] && !(filtersArr['sts'] === data[i].standardState)) {
          newFilteredElements.splice(i, 1);
        }
        if (filtersArr['bt'] && !(filtersArr['bt'] === data[i].bondingType)) {
          newFilteredElements.splice(i, 1);
        }
      }
      let counter = 0;
      for (let m = 0; m < data.length; m++) {
        if (newFilteredElements[m]) {
          // constellation math
          const theta = m * 0.175 + Math.PI; //default  0.175
          const y = -(m * 0.05) + 2;

          const object = new THREE.Mesh(
            geometryBox,
            new THREE.MeshBasicMaterial({
              map: textures[m],
            })
          );

          // assign name for redirection id
          object.name = m;

          // position the cube
          object.position.setFromCylindricalCoords(8, theta, y);
          vector.x = object.position.x * 2;
          vector.y = object.position.y;
          vector.z = object.position.z * 2;

          // set direction of the object
          object.lookAt(vector);

          targets.helix.push(object);

          // add cubes to scene
          scene.add(targets.helix[counter]);
          console.log("counter: " + counter);
          console.log("m:" + m)
          console.log("array at index m: " + newFilteredElements[m]);
          counter++;
        }
      }
      // after the loop is through, assign the raycasterTestObjects

      console.log(newFilteredElements);
      raycasterTestObjects = targets.helix;
    }
    // no filters are set
    else {
      for (let i = 0; i < data.length; i++) {
        // positional math
        const theta = i * 0.175 + Math.PI; //default  0.175
        const y = -(i * 0.05) + 2;

        // create new object and assign texture
        const object = new THREE.Mesh(
          geometryBox,
          new THREE.MeshBasicMaterial({
            map: textures[i],
          })
        );

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
  controls.target.set(0, -1.5, 0);
});

// Camera
// Base camera

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  1,
  1000
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});

// renderer.setClearAlpha(0)
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lights
const ambientLight = new THREE.AmbientLight(0xcc9ff4, 1);
scene.add(ambientLight);

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
    camera.position.x += (mouseX - camera.position.x) * 0.000008;
    camera.position.y += (-mouseY - camera.position.y) * 0.000008;

    // generate particles
    for (let i = 0; i < scene.children.length; i++) {
      const object = scene.children[i];
      if (object instanceof THREE.Points) {
        object.rotation.y = elapsedTime * (i < 4 ? i + 1 : -(i + 1)) * 0.003;
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
    if (intersects.length > 0) {
      intersects[0].object.material.color.set("#CBC3FF");
    }

    // check if intersects has objects
    if (intersects.length) {
      if (!currentIntersect) {
        // set the redirectionId to the name of the object set above
        redirectId = intersects[0].object.name + 1;
      }
      // set the currently intersecting object to the FIRST in the list of all intersecting objects
      currentIntersect = intersects[0];
    } else {
      if (currentIntersect) {
        // upon leaving set redirectId to 0 which won't redirect
        redirectId = 0;
      }
      currentIntersect = null;
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
$(".btn").on("click", () => {
  if ($(".btn").hasClass("active")) {
    $(".btn").removeClass("active");
    $(".state").text("Helix");

    for (let i = 0; i < targets.table.length; i++) {
      scene.remove(targets.table[i]);
    }

    createHelix();
  } else {
    $(".btn").addClass("active");
    $(".state").text("Table");

    for (let i = 0; i < targets.helix.length; i++) {
      scene.remove(targets.helix[i]);
    }
    createTable();

    // reposition camera
    camera.position.set(0, -8, 13);
    // cam pointer
    controls.target.set(0, -2, 0);
    controls.enablePan = true;
  }
});

// logo redirection link
$(".logo-helix").on("click", () => {
  // set the switch state
  $(".btn").removeClass("active");
  $(".state").text("Helix");

  // should there be elements in the table array, remove them
  for (let i = 0; i < targets.table.length; i++) {
    scene.remove(targets.table[i]);
  }

  // reset filters
  $('#maingroups, #standardstates, #bondingtype').val('default');
  filtersArr = { mg1: false, sts: false, bt: false };

  // create default view
  createHelix();
});

/* Filters */
// maingroup filter
let filtersArr = { mg1: false, sts: false, bt: false };

$(".filters").on("change", (e) => {
  let changedElement = e.target.classList[1];
  let eVal = $(`.${changedElement}`).val();
  filtersArr[changedElement] = eVal;

  if (eVal == "true") {
    eVal = true;
  }

  for (let i = 0; i < targets.table.length; i++) {
    scene.remove(targets.table[i]);
  }
  for (let i = 0; i < targets.helix.length; i++) {
    scene.remove(targets.helix[i]);
  }

  // check which view is currently active and build a new one with the given parameter
  if ($(".btn").hasClass("active")) {
    createTable(filtersArr);
  } else {
    createHelix(filtersArr);
  }

  // reenable panning
  controls.enablePan = true;

})

// redirection

// search url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// check if the "started" parameter is in the querystring
let reroute = urlParams.get("started");
if (reroute) {
  // click on the start button
  $("#starter").click();
}

// helper
// default state
let alertTimer = true;

// load on DOM finish
$(() => {
  // doubleclick
  $(window).on("dblclick", () => {
    // if both redirectId is set AND it's not 0
    if (redirectId && redirectId > 0) {
      // redirect to detailview based on given ID
      loadDetailView(redirectId);
      $('.logo-helix').hide();
      $('.container').fadeIn(500).css('display', 'flex');
      $('header').fadeIn(500);
    }
  });

  // helper function to explain double vs single click
  $(window).on("click", () => {
    // check for alert timer
    if (redirectId && redirectId > 0 && alertTimer) {
      // show helper text
      $(".alert").fadeIn(500).delay(3000).fadeOut(500);

      // set timeout to prevent the message from displaying again for 60s
      alertTimer = false;
      setTimeout(resetAlertTimer, 60000);
    }
  });
});

// reset alert timer function
function resetAlertTimer() {
  alertTimer = true;
}

/* detailview js */
let switchId = 0;
// function with id as parameter
function loadDetailView(id) {
  // deload first canvas
  $('.webgl').fadeOut();
  // delete possible previous canvas
  $('#stage').children('canvas').remove();
  // read json file
  $.getJSON("periodic-table.json", function (data) {

    // generate pivot
    var pivot = new THREE.Object3D();

    // set the initial value for the second canvas
    // define the clicked on element and assign switchId for the arrows
    var ordnungszahl = id;
    switchId = ordnungszahl;
    var quaternion = new THREE.Quaternion();
    var object;

    // atomicNumber = Außenatomen; davon immer zwei auf der ersten schale und dann i.d.r 8
    // Spalten-Nummer ist Anzahl von Außenatomen   
    var anzSchalen = 1;
    var config = data[ordnungszahl - 1].electronicConfiguration;
    var parts;

    // Electronic Configuration notation
    var he = "1s2";
    var ne = he + " 2s2 2p6";
    var ar = ne + " 3s2 3p6";
    var kr = ar + " 3d10 4s2 4p6";
    var xe = kr + " 4d10 5s2 5p6";
    var rn = xe + " 4f14 5d10 6s2 6p6";

    // set parts content
    if (config.includes("[He]")) {
      anzSchalen = 2;
      config = he + config.substring(4);
      parts = config.split(" ");
    } else if (config.includes("[Ne]")) {
      anzSchalen = 3;
      config = ne + config.substring(4);
      parts = config.split(" ");
    } else if (config.includes("[Ar]")) {
      anzSchalen = 4;
      config = ar + config.substring(4);
      parts = config.split(" ");
    } else if (config.includes("[Kr]")) {
      anzSchalen = 5;
      config = kr + config.substring(4);
      parts = config.split(" ");
    } else if (config.includes("[Xe]")) {
      anzSchalen = 6;
      config = xe + config.substring(4);
      parts = config.split(" ");
    } else if (config.includes("[Rn]")) {
      anzSchalen = 7;
      config = rn + config.substring(4);
      parts = config.split(" ");
    } else {
      anzSchalen = 1;
      parts = config.split(" ");
    }

    var atomVerteilung = [];

    // determine config
    for (var i = 0; i < parts.length; i++) {
      // gets first letter of parts[i] from above
      // which equals the number of the shell
      var schalenNummer = parseInt(parts[i].substring(0, 1));
      // determine number of electrons on this specific shell
      var anzahl = parseInt(parts[i].substring(2));

      // set specific array  index to match the number of electrons
      if (atomVerteilung[schalenNummer - 1] == null) {
        atomVerteilung[schalenNummer - 1] = anzahl;
      } else {
        atomVerteilung[schalenNummer - 1] += anzahl;
      }
    }

    // total number of electrons
    var anzElektronen = data[ordnungszahl - 1].atomicNumber;
    // var anzAussenelektronen = (anzElektronen - 2) % 8;

    // total number of neutron / protons
    var kernZahl;

    if (ordnungszahl == 1) {
      kernZahl = 2;
    } else {
      kernZahl = 2 * anzElektronen + 1;
    }

    // main function
    function sphereCollision(canvas) {
      let camera, sceneD, renderer;
      sceneD = new THREE.Scene();
      let controlsD, force;
      let nodes, spheresNodes = [],
        root,
        raycaster = new THREE.Raycaster(),
        INTERSECTED;

      function rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      //Expansion of collision function from http://bl.ocks.org/mbostock/3231298

      function collide(node) {
        var r = node.radius,
          nx1 = node.x - r,
          nx2 = node.x + r,
          ny1 = node.y - r,
          ny2 = node.y + r,
          nz1 = node.z - r,
          nz2 = node.z + r;
        return function (quad, x1, y1, z1, x2, y2, z2) {
          if (quad.point && quad.point !== node) {
            var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              z = node.z - quad.point.z,
              l = Math.sqrt(x * x + y * y + z * z),
              r = node.radius + quad.point.radius;

            if (l < r) {
              l = ((l - r) / l) * 0.5;
              node.x -= x *= l;
              node.y -= y *= l;
              node.z -= z *= l;

              quad.point.x += x;
              quad.point.y += y;
              quad.point.z += z;
            }
          }
          return (
            x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1 || z1 > nz2 || z2 < nz1
          );
        };
      }

      function getSpherePackPositions(canvas) {
        var containerEle = $(canvas);
        var SCREEN_WIDTH = containerEle.innerWidth();
        var SCREEN_HEIGHT = containerEle.innerHeight();

        nodes = d3.range(kernZahl).map(function () {
          // Mapt die Kugeln; Anzahl festgelegt
          return {
            radius: rnd(100, 100), // Radius der Kugeln
          };
        });
        root = nodes[0];
        root.radius = 0.1;
        root.fixed = true;

        force = d3.layout
          .force3D()
          .gravity(0.5) //Anziehung
          .charge(function (d, i) {
            return i ? 0 : -5000;
          })
          .nodes(nodes)
          .size([SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 1]);

        force.start();

        return nodes;
      }
      var angle = 1;

      function addSpheres() {
        //Schalen
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        var xPos = 0;
        var yPos = 0;
        var R = 1500;
        var abstand = 1000;
        pivot.position.set(0, 0, 0);
        pivot.rotation.set(0, 0, 0);
        //Versuch Schalenaufbau

        for (var s = 0; s < atomVerteilung.length; s++) {
          for (var n = 0; n < atomVerteilung[s]; n++) {
            xPos = R * Math.cos((n / atomVerteilung[s]) * 2 * Math.PI);
            yPos = R * Math.sin((n / atomVerteilung[s]) * 2 * Math.PI);

            var geometry = new THREE.SphereGeometry(80, 50, 16);
            var material = new THREE.MeshLambertMaterial({
              color: 0xffffff, // Color Electrons
            });

            const circlegeometry = new THREE.RingGeometry(R, R + 10, 80);
            const circlematerial = new THREE.MeshBasicMaterial({
              color: 0x816cff, // Color Circles
              side: THREE.DoubleSide,
            });
            const circle = new THREE.Mesh(circlegeometry, circlematerial);
            sceneD.add(circle);

            var mesh = new THREE.Mesh(geometry, material);
            pivot.add(mesh);

            mesh.position.set(xPos, yPos, 0);
            // console.log(xPos);
            sceneD.add(mesh);
            // console.log(mesh);
          }
          R += abstand;
          // mesh.rotation.z = value;
        }

        sceneD.add(pivot);

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        var nodes = getSpherePackPositions(canvas);

        for (var i = 0; i < nodes.length; i++) {
          if (i % 2 == true) {
            var geo = new THREE.SphereGeometry(nodes[i].radius, 20, 20);
            var sphere = new THREE.Mesh(
              geo,
              new THREE.MeshLambertMaterial({
                color: 0x816cff, // hälfte dunkler
              })
            );
            var vec = new THREE.Vector3(nodes[i].x, nodes[i].y, nodes[i].z);
            sphere.position.add(vec);
            spheresNodes.push(sphere);
            sceneD.add(sphere);
          } else {
            var geo = new THREE.SphereGeometry(nodes[i].radius, 20, 20);
            var sphere = new THREE.Mesh(
              geo,
              new THREE.MeshLambertMaterial({
                color: 0xe1beff, //hälfte heller
              })
            );
            var vec = new THREE.Vector3(nodes[i].x, nodes[i].y, nodes[i].z);
            sphere.position.add(vec);
            spheresNodes.push(sphere);
            sceneD.add(sphere);
          }
        }
      }

      function updateSpheres() {
        //Position
        var q = d3.geom.octree(nodes);
        for (var i = 1; i < nodes.length; ++i) {
          q.visit(collide(nodes[i]));
          spheresNodes[i].position.x = nodes[i].x - 300;
          spheresNodes[i].position.y = nodes[i].y - 200;
          spheresNodes[i].position.z = nodes[i].z;
        }
      }

      function setupScreen(canvas) {
        var containerEle = $(canvas);

        //set camera
        camera = new THREE.PerspectiveCamera(45, containerEle.innerWidth() / containerEle.innerHeight(), 1, 100000);
        camera.position.set(50, -100, 10000);
        // controls.target(5, 5, 5);

        // RENDERER  
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        });

        renderer.setSize(containerEle.innerWidth(), containerEle.innerHeight());
        renderer.domElement.style.position = "absolute";
        containerEle.append(renderer.domElement);

        controlsD = new OrbitControls(camera, renderer.domElement);



        // LIGHTS  
        var directionalLight = new THREE.DirectionalLight("#ffffff", 0.5);
        directionalLight.position.set(100, 100, -100);
        sceneD.add(directionalLight);

        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.25);
        hemiLight.position.y = 5100;
        sceneD.add(hemiLight);

        var axes = new THREE.AxisHelper(1000);
        // scene.add(axes);

        window.addEventListener("resize", onWindowResize, false);

        function onWindowResize() {
          camera.aspect = containerEle.innerWidth() / containerEle.innerHeight();
          camera.updateProjectionMatrix();
          renderer.setSize(containerEle.innerWidth(), containerEle.innerHeight());
        }

        addSpheres();
      }

      function animate() {
        requestAnimationFrame(animate);
        render();
      }

      function render() {
        updateSpheres();
        pivot.rotation.z += 0.002;

        renderer.render(sceneD, camera);
      }

      setupScreen(canvas);
      animate();
    }

    $(function () {
      sphereCollision($("#stage"));
    });

    // Dynamic View  
    var standardState = data[ordnungszahl - 1].standardState;
    var pElement = data[ordnungszahl - 1];

    // GIFs
    $('.cube, .fluid, .cloud').css('display', 'none');
    if (standardState == "solid") {
      $(".cube").css('display', 'block');
    } else if (standardState == "liquid") {
      $(".fluid").css('display', 'block');
    } else if (standardState == "gas") {
      $(".cloud").css('display', 'block');
    } else {
      $(".cloud").css('display', 'block');
    }


    $("#atomicnumber").text(pElement.atomicNumber);
    $("#symbol").text(pElement.symbol);
    $("#name").text(pElement.name);

    $("#groupblock").text(pElement.groupBlock);
    $("#boilingpoint").text(pElement.boilingPoint);
    $("#electronegativity").text(pElement.electronegativity);
    $("#yeardiscovered").text(pElement.yearDiscovered);

    $(".eState").text(pElement.standardState);


  });
}

$('.x, .logo-detail').on('click', () => {
  $('.container, header').fadeOut();
  $('.webgl').fadeIn();
  $('.logo-helix').fadeIn();

  // reset filters
  $('#maingroups, #standardstates, #bondingtype').val('default');
})

$(() => {
  $('.info').fadeIn(1500).css('display', 'flex');
  $('#maingroups, #standardstates, #bondingtype').val('default');
})

$('.arrow').on('click', (e) => {
  if (e.target.classList.contains('arrow-left') && switchId > 0) {
    loadDetailView(switchId - 1);
  }
  else if (e.target.classList.contains('arrow-right') && switchId < 118) {
    loadDetailView(switchId + 1);
  }
})
