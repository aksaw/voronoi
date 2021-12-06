//var scene, camera, renderer;
//var geometry, material, mesh;
//// var controls;
//
var mouseX = 0, mouseY = 0;
var freqLow = 110, freqHigh = 880, freq;
var amplitude = 0.15;
var maxVolume = -6;
//var windowHalfX = window.innerWidth / 2;
//var windowHalfY = window.innerHeight / 2;
//
//init();
//animate();

// function init() {

// }

const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 75,
    window.innerWidth / window.innerHeight, 0.1, 1000 );
// camera.position.set( 0, 0, 100 );
camera.position.y = -6;
camera.position.z = 2;
camera.lookAt( 0, 0, 0 );

var renderer = new THREE.WebGLRenderer({ antialias: true });
// var renderer = new THREE.CanvasRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );
// document.addEventListener( 'mousemove', onDocumentMouseMove, false );


// const light = new THREE.PointLight( 0xff0000, 1, 100 );
// light.position.set( 50, 50, 50 );
// light.castShadow = true; // default false
// scene.add( light );
// light.shadow.mapSize.width = 512; // default
// light.shadow.mapSize.height = 512; // default
// light.shadow.camera.near = 0.5; // default
// light.shadow.camera.far = 500; // default
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

// Create random points
var material_circle = new THREE.MeshBasicMaterial( {
    opacity: 0.95,
    transparent: true,
    color: 0xffffff } );
var i, N=20;
var coords = new Array(N);
var phases = new Array(N);
var rates = new Array(N);
var points = new Array(N);
var circles = new Array(N);
var oscillators = new Array(N);
for (i = 0; i < N; i++) {
    rand_x = Math.random()
    rand_y = Math.random()
    x = window.innerWidth * (rand_x - 0.5) * 0.007;
    y = window.innerHeight * (rand_y - 0.5) * 0.01;
    coords[i] = [x, y];
    points[i] = new THREE.Vector3(x, y, 0);

    phases[i] = Math.random() * 2 * Math.PI;
    rates[i] = Math.random();

    var geometry = new THREE.SphereGeometry(  0.1 , 32 , 32 );
    var circle = new THREE.Mesh( geometry, material_circle );
    circle.position.set(x, y, 0);
    circles[i] = circle;
    scene.add( circle );

    osc_freq = freqLow + rand_x * (freqHigh - freqLow);
    osc_phase = rand_y * 2 * Math.PI;
    oscillators[i] = new Tone.Oscillator(osc_freq, "sine", phase=osc_phase).toDestination().start();
}


// Delaunay triangulation
var material_triangle = new THREE.MeshBasicMaterial({
    opacity: 0.2,
    transparent: true,
    color: 0xffffff
  });
//   new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true} );
const delaunay = Delaunator.from(coords);
console.log(delaunay.triangles)
var triangles = delaunay.triangles;
var triangle_geometries = new Array(triangles.length / 3);
for (i = 0; i < triangles.length; i += 3) {
    // var geometry = new THREE.Triangle(points[i], points[i+1], points[i+2]);
    // var triangle = new THREE.Mesh(geometry, material_triangle);
    // scene.add( triangle );
    var geometry = new THREE.Geometry();
    geometry.vertices.push(points[triangles[i]]);
    geometry.vertices.push(points[triangles[i+1]]);
    geometry.vertices.push(points[triangles[i+2]]);
    triangle_geometries[i/3] = geometry;

    var line = new THREE.Line( geometry, material_triangle );
    scene.add( line );
}

// function onDocumentMouseMove(event) {
//     mouseX = ( event.clientX - windowHalfX ) * 1;
//     mouseY = ( event.clientY - windowHalfY ) * 1;
// }


function animate() {
    requestAnimationFrame( animate );

    // animation code here
    for (i = 0; i < N; i++) {
        phases[i] += 0.01  * (1 + rates[i]);
        circles[i].position.z = amplitude * Math.sin(phases[i]);
        points[i].z = circles[i].position.z

        // -amp -> -50 -> log(2e-22)
        // amp -> 0 -> log(1)
        oscillators[i].volume.value = map(points[i].z, -amplitude, amplitude, -50, 0) 
    }

    for (i = 0; i < triangles.length/3; i += 1) {
        triangle_geometries[i].verticesNeedUpdate = true;
    }
    renderer.render( scene, camera );
}

// const osc = new Tone.Oscillator(440, "sine").toDestination().start();
// osc.volume.value = Math.log(2e-22);

animate();
