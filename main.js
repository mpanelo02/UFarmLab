// alert("hello world");
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const canvas = document.getElementById("experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min( window.devicePixelRatio, 2));
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;


const modalContent = {
    // Monitor: {
    //     title: "Dashboard",
    //     content: "This is a monitor.",
    //     link:"https://www.youtube.com",
    // },
    Plate01: {
        title: "LinkedIn",
        content: "Bio.",
        link:"https://www.linkedin.com/in/mark-johnson-panelo-82030a325/",
    },
    Plate02: {
        title: "About",
        content: "Digital Twin Information.",
        link:"https://www.metropolia.fi/en/rdi/collaboration-platforms/urbanfarmlab",
    },
};

const modal = document.querySelector(".modal");
const modalTitle = document.querySelector(".modal-title");
const modalProjectDescription = document.querySelector(".modal-project-description");
const modalExitButton = document.querySelector(".modal-exit-button");
const modalVisitButton = document.querySelector(".modal-visit-button");

function showModal(id){
    const content = modalContent[id];
    if (content) {
        modalTitle.textContent = content.title;
        modalProjectDescription.textContent = content.content;

        if (content.link) {
            modalVisitButton.href = content.link;
            modalVisitButton.classList.remove("hidden");
        }else {
            modalVisitButton.classList.add("hidden");
        }


        modal.classList.toggle("hidden");
    }
}

function hideModal(){
    modal.classList.toggle("hidden");
}


let intersectObject = "";
const intersectObjects = [];
const intersectObjectsNames = [
    "CCTV",
    "Chain",
    "ExhaustFan",
    "FCU",
    "Holder",
    "Monitor",
    "PipeDrain",
    "PipeSupply",
    "PlantBase",
    "Plate01",
    "Plate02",
    "Thermometer",
    "WaterCon",
    "WaterCon2",
    "Clock",
    "PlantLight",
    "Outlet",
    "Plant01",
    "StrawBerry",
];

// Loading screen and loading manager
// See: https://threejs.org/docs/#api/en/loaders/managers/LoadingManager
const loadingScreen = document.getElementById("loadingScreen");
const enterButton = document.querySelector(".enter-button");

const manager = new THREE.LoadingManager();

manager.onLoad = function () {
  const t1 = gsap.timeline();

  t1.to(enterButton, {
    opacity: 1,
    duration: 0,
  });
};

enterButton.addEventListener("click", () => {

  gsap.to(loadingScreen, {
    opacity: 0,
    duration: 2,
    onComplete: () => {
      loadingScreen.remove();
      document.getElementById("mainContent").style.display = "block";
    },
  });
});


let exhaustFan = null;
let clockHandShort = null;
let clockHandLong = null;

const loader = new GLTFLoader();

loader.load( './FarmLab_Model05.glb', function ( glb ) {
  glb.scene.traverse((child) => {
    if (intersectObjectsNames.includes(child.name)) {
        intersectObjects.push(child);
    }

    // HIDE specific objects
    if (["ColdWind1", "ColdWind2", "Water1", "Water2", "Area1", "Area2", "Area3", "Area4", "Area5", "Area6", "Area7", "Area8", "Spot1", "Spot2", "Spot3", "Spot4", "Spot5", "Spot6", "Spot7", "Spot8"].includes(child.name)) {
      child.visible = false;
    }
    // For the animation of the water and cold wind
    if (child.name === "Water1") {
      water1 = child;
      water1.visible = false;
    }
    if (child.name === "Water2") {
      water2 = child;
      water2.visible = false;
    }

    if (child.name === "ColdWind1") {
      coldWind1 = child;
      coldWind1.visible = false;
    }
    if (child.name === "ColdWind2") {
      coldWind2 = child;
      coldWind2.visible = false;
    }

    // For the animation of Exhaust Fan and Clock
    if (child.name === "ExhaustFan") {
        exhaustFan = child;
    }
    if (child.name === "ClockHandShort") {
        clockHandShort = child;
    }
    if (child.name === "ClockHandLong") {
        clockHandLong = child;
    }



    if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // child.material.metalness = 0.2;
    }

    // if (["Area1", "Area2", "Area3", "Area4", "Area5", "Area6", "Area7", "Area8", "Spot1", "Spot2", "Spot3", "Spot4", "Spot5", "Spot6", "Spot7", "Spot8"].includes(child.name)) {
    //   if (child.isLight) {
    //     child.color.set(0xffc0cb); // soft pink
    //     child.intensity = 1.5;      // tweak as needed

    //     if ('distance' in child) child.distance = 20; // for PointLight/SpotLight
        
    //   }
    // }



    // console.log(child);
  });
  scene.add( glb.scene );

}, undefined, function ( error ) {

  console.error( error );

} );

const sun = new THREE.DirectionalLight( 0xFFFFFF );
sun.castShadow = true;
sun.position.set( 40, 40, 0 );
sun.target.position.set( 0, 0, 0 );
sun.shadow.mapSize.width = 4096; // default
sun.shadow.mapSize.height = 4096; // default
sun.shadow.camera.left = -50;
sun.shadow.camera.right = 50;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -50;
sun.shadow.normalBias = 0.2;
scene.add( sun );


const light = new THREE.AmbientLight( 0x404040, 4.5 ); // soft white light
scene.add( light );

// const aspect = sizes.width / sizes.height;

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000 );
camera.position.set(13.3, 4.4, 12.8);
camera.lookAt(0, 3, 0);

const controls = new OrbitControls( camera, canvas );
controls.target.set(0, 3, 0);
controls.update();


function onResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    const aspect = sizes.width / sizes.height;
    camera.left = -aspect * 50;
    camera.right = aspect * 50;
    camera.top = 50;
    camera.bottom = -50;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min( window.devicePixelRatio, 2));
}

function jumpPlants(meshID) {
    const mesh = scene.getObjectByName(meshID);
    if (!mesh) return;
  
    const jumpHeight = 2;
    const jumpDuration = 0.5;
  
    const startY = mesh.position.y; // <- SAVE the original Y
  
    const t1 = gsap.timeline();
  
    t1.to(mesh.scale, {
      x: 1,
      y: 0.8,
      z: 1.2,
      duration: jumpDuration * 0.3,
      ease: "power2.out",
    });
  
    t1.to(mesh.position, {
      y: startY + jumpHeight,
      duration: jumpDuration * 0.3,
      ease: "power2.out",
    }, "<");
  
    t1.to(mesh.position, {
      y: startY, // <- use the saved Y
      duration: jumpDuration * 0.5,
      ease: "bounce.out",
    });
  
    t1.to(mesh.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: jumpDuration * 0.5,
      ease: "elastic.out(1, 0.3)",
    });
  }

  function onClick() {
    if(intersectObject !== ""){
      if([
    // "CCTV",
    // "Chain",
    // "ExhaustFan",
    // "FCU",
    // "Holder",
    // "Monitor",
    // "PipeDrain",
    // "PipeSupply",
    // "PlantBase",
    // "Plate01",
    // "Plate02",
    // "Thermometer",
    // "WaterCon",
    // "WaterCon2",
    // "Clock",
    // "PlantLight",
    // "Outlet",
    "Plant01",
    "StrawBerry"].includes(intersectObject)){
        jumpPlants(intersectObject);
      } else {
        showModal(intersectObject);
      }
    }
  }



function onPointerMove( event ) {
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

modalExitButton.addEventListener("click", hideModal);
window.addEventListener("resize", onResize);
window.addEventListener("click", onClick);
window.addEventListener( "pointermove", onPointerMove );

// Add this near the top of your script, before the animate function
async function fetchAranetTemperature() {
    try {
        const response = await fetch('https://aranet.cloud/api/v2/sensors/latest', {
            headers: {
                'Authorization': 'Bearer k7muwjwzgzmjgx6ahqu29jkjhetq7swe',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Assuming the API returns an array of sensors and we want the first one
        if (data.data && data.data.length > 0) {
            const sensorData = data.data[0];
            if (sensorData.temperature) {
                document.getElementById("temperature-value").textContent = sensorData.temperature.toFixed(1);
            }
        }
    } catch (error) {
        console.error('Error fetching Aranet temperature:', error);
        // You might want to display an error or fallback value
        document.getElementById("temperature-value").textContent = "--";
    }
}

// Call the function initially and then set up an interval to refresh
fetchAranetTemperature();
setInterval(fetchAranetTemperature, 60000); // Update every minute

// The rest of your existing script remains the same...


function animate() {
  controls.enablePan = false;

  controls.maxDistance = 25; // or whatever feels right
  controls.minDistance = 10;


  // Vertical limits (up/down)
  controls.minPolarAngle = THREE.MathUtils.degToRad(35); // 35° down
  controls.maxPolarAngle = THREE.MathUtils.degToRad(90); // 90° up

  // Horizontal limits (left/right)
  controls.minAzimuthAngle = THREE.MathUtils.degToRad(5); // 5° left
  controls.maxAzimuthAngle = THREE.MathUtils.degToRad(85);  // 85° right


  raycaster.setFromCamera( pointer, camera );

	const intersects = raycaster.intersectObjects(intersectObjects);

    if ( intersects.length > 0 ) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
        intersectObject = "";
    }

	for ( let i = 0; i < intersects.length; i ++ ) {
        intersectObject = intersects[0].object.parent.name;
	}

  if (exhaustFan) {
  exhaustFan.rotation.y += 0.08; // Adjust speed as needed
  }
  if (clockHandShort) {
  clockHandShort.rotation.y -= 0.0001; // Adjust speed as needed
  }
  if (clockHandLong) {
  clockHandLong.rotation.y -= 0.001; // Adjust speed as needed
  }

    renderer.render( scene, camera );
  }
  renderer.setAnimationLoop( animate );

// Codes for Display of Time and Date
  function updateDateTime() {
    const now = new Date();

    // const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString(undefined, optionsDate);

    const formattedTime = now.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    document.getElementById('vantaa-date').textContent = formattedDate;
    document.getElementById('vantaa-clock').textContent = formattedTime;
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);

// Codes for Connection to Server and Buttons

const client = mqtt.connect("wss://test.mosquitto.org:8081");

const fanToggleButton = document.getElementById("fanToggleButton");
const bulbToggleButton = document.getElementById("bulbToggleButton");
const pumpToggleButton = document.getElementById("pumpToggleButton");
// const doorToggleButton = document.getElementById("doorToggleButton");

let isFanOn = false;
let isBulbOn = false;
let isPumpOn = false;
// let isDoorOn = false;

function updateButtonState(button, isOn, onLabel, offLabel) {
  button.textContent = isOn ? onLabel : offLabel;
}


let coldWind1 = null;
let coldWind2 = null;
let coldWindToggleInterval = null;
function updateFanButton(state) {
  isFanOn = state === "ON";
  updateButtonState(fanToggleButton, isFanOn, "🌀ON", "🥵OFF");

  if (isFanOn) {
    let toggle = false;
    if (coldWindToggleInterval) clearInterval(coldWindToggleInterval);
    coldWindToggleInterval = setInterval(() => {
      if (coldWind1 && coldWind2) {
        toggle = !toggle;
        coldWind1.visible = toggle;
        coldWind2.visible = !toggle;
      }
    }, 500);
  } else {
    if (coldWindToggleInterval) clearInterval(coldWindToggleInterval);
    coldWindToggleInterval = null;
    if (coldWind1) coldWind1.visible = false;
    if (coldWind2) coldWind2.visible = false;
  }
}


function updateBulbButton(state) {
  isBulbOn = state === "ON";
  updateButtonState(bulbToggleButton, isBulbOn, "💡ON", "🕯️OFF");

  const lightNames = [
    "Area1", "Area2", "Area3", "Area4", "Area5", "Area6", "Area7", "Area8",
    "Spot1", "Spot2", "Spot3", "Spot4", "Spot5", "Spot6", "Spot7", "Spot8"
  ];

  lightNames.forEach(name => {
    const lightObj = scene.getObjectByName(name);
    if (lightObj) {
      lightObj.visible = isBulbOn;
      if (lightObj.isLight) {
        lightObj.color.set("#ff00dd"); // 💖 Solid/Deep Pink
        lightObj.intensity = 5;
        if ('distance' in lightObj) lightObj.distance = 10;
        
      }
    }
  });
}



let water1 = null;
let water2 = null;
let waterToggleInterval = null;
function updatePumpButton(state) {
  isPumpOn = state === "ON";
  updateButtonState(pumpToggleButton, isPumpOn, "🌧️ON", "🌵OFF");

  if (isPumpOn) {
    let toggle = false;
    if (waterToggleInterval) clearInterval(waterToggleInterval);
    waterToggleInterval = setInterval(() => {
      if (water1 && water2) {
        toggle = !toggle;
        water1.visible = toggle;
        water2.visible = !toggle;
      }
    }, 500);
  } else {
    if (waterToggleInterval) clearInterval(waterToggleInterval);
    waterToggleInterval = null;
    if (water1) water1.visible = false;
    if (water2) water2.visible = false;
  }
}



client.on("connect", () => {
  console.log("✅ Connected to MQTT broker");

  // Subscribe to all topics
  const topics = ["trial/fan", "trial/bulb", "trial/pump"];

  topics.forEach(topic => {
    client.subscribe(topic, err => {
      if (!err) {
        console.log(`📡 Subscribed to topic: ${topic}`);
        // Request the retained message
        client.publish(topic, "", { qos: 0, retain: false });
      }
    });
  });
});

// Handle incoming messages
client.on("message", (topic, message) => {
  const msg = message.toString().trim();
  console.log(`📥 ${topic}: ${msg}`);

  if (["trial/fan", "trial/bulb", "trial/pump"].includes(topic)) {
    if (msg !== "ON" && msg !== "OFF") return;

    switch (topic) {
      case "trial/fan":
        updateFanButton(msg);
        break;
      case "trial/bulb":
        updateBulbButton(msg);
        break;
      case "trial/pump":
        updatePumpButton(msg);
        break;

    }
  }

});

const sunToggleButton = document.getElementById('sunToggleButton');

let isBright = true;



sunToggleButton.addEventListener('click', () => {
  const containers = [
  document.getElementById('vantaa-date-container'),
  document.getElementById('vantaa-time-container'),
  document.getElementById('temperature-container'),
  document.getElementById('humidity-container'),
  document.getElementById('moisture-container'),
  document.getElementById('water-container')
];

const newFontColor = isBright ? 'white' : 'black';

containers.forEach(container => {
  if (container) {
    container.style.color = newFontColor;
  }
});

  isBright = !isBright;
  sunToggleButton.textContent = isBright ? '🌞' : '🌚';

  gsap.to(light, { intensity: isBright ? 4.5 : 1, duration: 1 });
  gsap.to(sun, { intensity: isBright ? 2 : 1, duration: 1 });
  renderer.setClearColor(isBright ? 0xeeeeee : 0x111111, 1);
});




// Button click events to toggle and publish new state
fanToggleButton.addEventListener("click", () => {
  const newState = isFanOn ? "OFF" : "ON";
  client.publish("trial/fan", newState);
  updateFanButton(newState);
});

bulbToggleButton.addEventListener("click", () => {
  const newState = isBulbOn ? "OFF" : "ON";
  client.publish("trial/bulb", newState);
  updateBulbButton(newState);
});

pumpToggleButton.addEventListener("click", () => {
  const newState = isPumpOn ? "OFF" : "ON";
  client.publish("trial/pump", newState);
  updatePumpButton(newState);
})

