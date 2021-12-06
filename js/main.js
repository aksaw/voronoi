//var scene, camera, renderer;
//var geometry, material, mesh;
//// var controls;
//
var mouseX = 0, mouseY = 0;
var freqLow = 110, freqHigh = 880, freq;
var amplitude = 0.15;
var maxVolume = -6;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// variables for mousedown event handler
var sphere_idx = 0;
var vec = new THREE.Vector3();
var pos = new THREE.Vector3();
    
//init();
//animate();

// function init() {

// }

const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;
const clamp = (value, lower, upper) => Math.max(lower, Math.min(upper, value));

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 75,
    window.innerWidth / window.innerHeight, 0.1, 1000 );
// camera.position.set( 0, 0, 100 );
camera.position.y = -6;
camera.position.z = 3;
camera.lookAt( 0, 0, 0 );

var renderer = new THREE.WebGLRenderer({ antialias: true });
// var renderer = new THREE.CanvasRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );

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
var i, N=25;
var coords = new Array(N);
var phases = new Array(N);
var rates = new Array(N);
var points = new Array(N);
var spheres = new Array(N);
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

    var material_sphere = new THREE.MeshBasicMaterial( {
        opacity: 0.95,
        transparent: true,
        color: 0xffffff } );
    var geometry = new THREE.SphereGeometry(  0.1 , 32 , 32 );
    var sphere = new THREE.Mesh( geometry, material_sphere );
    sphere.position.set(x, y, 0);
    spheres[i] = sphere;
    scene.add( sphere );

    osc_freq = freqLow + rand_x * (freqHigh - freqLow);
    osc_phase = rand_y * 2 * Math.PI;
    oscillators[i] = new Tone.Oscillator(osc_freq, "sine", phase=osc_phase).toDestination();
}

var material_triangle = new THREE.MeshBasicMaterial({
    opacity: 0.2,
    transparent: true,
    color: 0xffffff
  });

var triangles = new Array(0);
var triangle_geometries;
var lines;

updateTriangulation()

function updateTriangulation() {
    // remove current triangulation
    for (i = 0; i < triangles.length / 3; i += 1) {
        scene.remove( lines[i] );
        triangle_geometries[i].dispose();
    }

    // update triangulation
    const delaunay = Delaunator.from(coords);
    triangles = delaunay.triangles;
    triangle_geometries = new Array(triangles.length / 3);
    lines = new Array(triangles.length / 3)
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
        lines[i/3] = line
        scene.add( line );
    }
}

var tone_started = false;

// TODO: ability to drag nodes around?
function onDocumentMouseDown(event) {
    if ( !tone_started ) { // Put this in a button maybe
        tone_started = true;
        // Tone.start()

        for (i=0; i < N; i++) {
            oscillators[i].start();
        }

        console.log('audio started')
    }
    // mouseX = ( event.clientX - windowHalfX ) * 1;
    // mouseY = ( event.clientY - windowHalfY ) * 1;

    vec.set(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        - ( event.clientY / window.innerHeight ) * 2 + 1,
        0.5 );
    vec.unproject( camera );
    vec.sub( camera.position ).normalize();
    var distance = - camera.position.z / vec.z;
    pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );

    spheres[sphere_idx].position.x = pos.x;
    spheres[sphere_idx].position.y = pos.y;

    coords[sphere_idx] = [pos.x, pos.y]
    points[sphere_idx].x = pos.x
    points[sphere_idx].y = pos.y

    rx = clamp(pos.x / (0.007 * window.innerWidth) + 0.5, 0, 1); 
    // ry = 1.0 - clamp(pos.y / (0.01 * window.innerWidth) + 0.5, 0, 1); 
    osc_freq = freqLow + rx * (freqHigh - freqLow);
    oscillators[sphere_idx].frequency.value = osc_freq

    sphere_idx = (sphere_idx + 1) % N;

    updateTriangulation();
}


function animate() {
    requestAnimationFrame( animate );

    // animation code here
    for (i = 0; i < N; i++) {
        phases[i] += 0.01  * (1 + rates[i]);
        spheres[i].position.z = amplitude * Math.sin(phases[i]);
        points[i].z = spheres[i].position.z

        brightness = 0.3 + 0.7 * 0.5 * (points[i].z + amplitude)/amplitude;
        spheres[i].material.color.setScalar(brightness)

        oscillators[i].volume.value = map(points[i].z, -amplitude, amplitude, -80, 0) 
    }

    for (i = 0; i < triangles.length/3; i += 1) {
        triangle_geometries[i].verticesNeedUpdate = true;
    }
    renderer.render( scene, camera );
}

// const osc = new Tone.Oscillator(440, "sine").toDestination().start();
// osc.volume.value = Math.log(2e-22);

animate();
