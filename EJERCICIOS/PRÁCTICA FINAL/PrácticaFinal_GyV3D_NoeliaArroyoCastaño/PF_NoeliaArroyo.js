console.log("Ejecutando JS...");

var stepX = 0.15;
var stepY = 0.25;

var score_user = 0;
var position_user = 0;
var score_cpu = 0;
var position_cpu = 0;
var counter = "USER: " + score_user  + " - CPU: " + score_cpu;
var start = false;
var playing = false;
var speed_sphere = 1;
var angle_sphere = 1;
var rate = 1; //velocidad a la que va CPU
var level = 0.5; //empieza en 0.5 por defecto
var w = 4;

//variables niveles
const easy = document.getElementById('easy');
const medium = document.getElementById('medium');
const hard = document.getElementById('hard');

//variables cpntador
var segundos = 0;
var minutos = 0;
var horas = 0;
var seconds = document.getElementById("segundos");
var minutes = document.getElementById("minutos");
var hours = document.getElementById("horas");

//variables audio
var pongPaddle = new Audio ("pong-raqueta.mp3");
var pongCollision = new Audio ("pong-rebote.mp3");
var pongGoal = new Audio ("pong-tanto.mp3");
var pongGameover = new Audio ("pong-gameover.mp3");
var pongWin = new Audio ("pong-win.mp3");

function init() {

    var scene = new THREE.Scene();
    var sceneWidth = window.innerWidth - 20;
    var sceneHeight = window.innerHeight - 20;

    var camera = new THREE.PerspectiveCamera(90, sceneWidth / sceneHeight, 0.01, 100);
    camera.position.set(0, -16, 10);
    camera.lookAt(scene.position);

    var renderer = new THREE.WebGLRenderer({
        antialias : true
    });
    renderer.shadowMap.enabled = true;
    renderer.setSize(sceneWidth, sceneHeight);
    document.body.appendChild(renderer.domElement);

    var background = new THREE.TextureLoader().load("fondo.jpg", function(texture){
        scene.background = texture;
    });

    var light = getLight();
    var leftBorder = getBorder("left", 1, 22, 2, -7, 0, 0);
    var rightBorder = getBorder("right", 1, 22, 2, 7, 0, 0);
    var CPU = getBorder("CPU", w, 1, 2, 0, 11, 0);
    var USER = getBorder("USER", w, 1, 2, 0, -11, 0);
    var sphere = getSphere();
    var floor = getFloor();

    scene.add(light);
    scene.add(leftBorder);
    scene.add(rightBorder);
    scene.add(CPU);
    scene.add(USER);
    scene.add(sphere);
    scene.add(floor);

    //mover USER
    document.onkeydown = function (ev){   
        var step = 1
        switch (ev.keyCode){

            case 32: //space
                start = true;
                playing = true;
                getText("counter", scene);
                counter = "USER: " + score_user  + " - CPU: " + score_cpu;
                stepY = 0.25;
            
            case 37: // left
            if(USER.position.x > -5){
                USER.position.x -= step;
            }break;

            case 39: // right
            if(USER.position.x < 5){
                USER.position.x += step;
            }break;

            }
        }

    var borders = [ leftBorder, rightBorder, CPU, USER ];

    getText("counter", scene);
    animate(sphere, borders, renderer, scene, camera);
}

function animate(sphere, borders, renderer, scene, camera) {
    if(start == true){
        checkCollision(sphere, borders);
        moveCPU(sphere, borders[2]);
        sphere.position.x += stepX*angle_sphere; //angulo cambia 
        sphere.position.y += stepY*speed_sphere; //speed incremento velocidad eje y
        console.log(sphere.position.y);
    }

    renderer.render(scene, camera);
    drawCounter(sphere, scene);
    requestAnimationFrame(function() {
        animate(sphere, borders, renderer, scene, camera);    
    });

}

function moveCPU(sphere, CPU){

    CPU.position.x = sphere.position.x * rate;
    if(CPU.position.x >5){
    CPU.position.x = 5;
    }else if(CPU.position.x < -5){
    CPU.position.x = -5;
    }

}

easy.onclick = function(){
    level = 'easy';
    configure(level);
}

medium.onclick = function(){
    level = 'medium';
    configure(level);
}

hard.onclick = function(){
    level = 'hard';
    configure(level);
}

function configure(level) {
    console.log(level);
    switch(level) {
    case "easy":
        rate = 0.2;
        break;

    case "medium":
        rate = 0.5;
        break;

    case "hard":
        rate = 0.9;
        break;

    default:
        rate = 1;
    }
}

function getBackgroundMaterial() {
    var texture = new THREE.TextureLoader().load("suelo.png");
    var material = new THREE.MeshPhysicalMaterial({
        map : texture
    });
    material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.set(1, 1);
    material.side = THREE.DoubleSide;

    return material;
}

function getSphere() {
    var geometry = new THREE.SphereGeometry(1, 20, 20);
    var texture = new THREE.TextureLoader().load("bola.png");
    var material = new THREE.MeshPhysicalMaterial({
        map : texture
    });
    var mesh = new THREE.Mesh(geometry, material);
    material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.set(1, 1);
    material.side = THREE.DoubleSide;
    mesh.position.z = 1;
    mesh.castShadow = true;

    return mesh;
}

function getFloor() {
    var geometry = new THREE.PlaneGeometry(14, 20); //size
    var mesh = new THREE.Mesh(geometry, getBackgroundMaterial());
    mesh.receiveShadow = true;

    return mesh;
}

function getPaddleMaterial(){
    var texture = new THREE.TextureLoader().load("palas.jpg");
    var material = new THREE.MeshPhysicalMaterial({
        map : texture
    });
    material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.set(1, 1);
    material.side = THREE.DoubleSide;

    return material;
}

function getBorderMaterial(){
    var texture = new THREE.TextureLoader().load("bordes.jpg");
    var material = new THREE.MeshPhysicalMaterial({
        map : texture
    });
    material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.set(4, 4);
    material.side = THREE.DoubleSide;

    return material;
}

function getBorder(name, x, y, z, posX, posY, posZ) {
    var geometry = new THREE.BoxGeometry(x, y, z);
    if(name =="CPU" || name == "USER"){
        var mesh = new THREE.Mesh(geometry, getPaddleMaterial("palas.jpg"));
    }if(name =="left" || name == "right"){
        var mesh = new THREE.Mesh(geometry, getBorderMaterial("bordes.jpg"));
    }
    mesh.receiveShadow = true;
    mesh.position.set(posX, posY, posZ);
    mesh.name = name;

    return mesh;
}

function getLight() {
    var light = new THREE.DirectionalLight();
    light.position.set(4,6,4);
    light.castShadow = true;
    light.shadow.camera.near = 0;
    light.shadow.camera.far = 16;
    light.shadow.camera.left = -8;
    light.shadow.camera.right = 5;
    light.shadow.camera.top = 10;
    light.shadow.camera.bottom = -10;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;

    return light;
}

function getText (name, scene){
    var run = new THREE.FontLoader();
    run.load("letra.json", function (font){
        var item = scene.getObjectByName(name);
        if (item){
            scene.remove(item);
        }

        var text = new THREE.TextGeometry(counter, {

            font: font,
            size: 2,
            height: 0.3,
            bevelEnabled: false,
            curveSegment: 5,
            bevelSegments: 0.1,
            bevelSize: 0.1,
            bevelThickness: 0,
            bevelOffset: 0.7
        })

        var textMaterial = new THREE.MeshBasicMaterial({color: 0xF79B4}); 
        var mesh = new THREE.Mesh (text, textMaterial);
        mesh.rotation.x = 1;
        mesh.position.set(-8,10,8);
        mesh.name = name;
        scene.add(mesh);
    });
}


function drawCounter(sphere, scene){
    if (sphere.position.y > 11 && score_user < 5 && score_cpu <5){
        score_user = score_user + 1;
        console.log(score_user);
        counter = "USER: " + score_user  + " - CPU: " + score_cpu;
        console.log(counter);
        getText("counter", scene);
        console.log("¡¡Has marcado punto!!")
        sphere.position.x = 0;
        sphere.position.y=0;
        start = false;
        playing = false;
        pongGoal.play();
    }

    if (sphere.position.y <= -11 && score_user < 5 && score_cpu <5){
        score_cpu = score_cpu + 1;
        console.log(score_cpu);
        counter = "USER: " + score_user  + " - CPU: " + score_cpu;
        console.log(counter);
        getText("counter", scene);
        console.log("Te han marcado punto")
        sphere.position.x = 0;
        sphere.position.y = 0;
        start = false;
        playing = false;
        pongGoal.play();
    }

    if( score_cpu == 5){
        counter = "CPU WIN, ¡¡GAME OVER!!";
        console.log(counter);
        getText("counter", scene);
        sphere.position.x = 0;
        sphere.position.y = 0;
        score_user = 0;
        score_cpu = 0;
        start = false;
        playing = false;
        pongGameover.play();
        
    } 

    if(score_user == 5){
        counter = "YOU WIN, ¡¡CONGRATULATIONS!!";
        console.log(counter);
        getText("counter", scene);
        sphere.position.x = 0;
        sphere.position.y = 0;
        score_user = 0;
        score_cpu = 0;
        start = false;
        playing = false;
        pongWin.play();
        
    } 

}

function chrono(){
    setInterval(() =>{
        if(!playing){
            return;
        }

        segundos++;
        if(segundos < 10){
            seconds.innerHTML="0"+segundos;

        }else{
            seconds.innerHTML=segundos;
        }
        if(segundos == 59){
            segundos = -1;
        }
        if(segundos==0){
            minutos++;
        }
        if(minutos < 10){
            minutes.innerHTML="0"+minutos;

        }else{
            minutes.innerHTML=minutos;
        }
        if(minutos == 59){
            minutos = -1;
        }
        if(minutos==0 && segundos==0){
            horas++;
        }
        if(horas < 10){
            hours.innerHTML="0"+horas;

        }else{
            hours.innerHTML=horas;
        }

    }, 1000)
}

function checkCollision(sphere, borders) {
    var originPosition = sphere.position.clone();

    for (var i = 0; i < sphere.geometry.vertices.length; i++) {
        var localVertex = sphere.geometry.vertices[i].clone();
        var globalVertex = localVertex.applyMatrix4(sphere.matrix);
        var directionVector = globalVertex.sub(sphere.position);
        var ray = new THREE.Raycaster(originPosition, directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(borders);
        var speed_cpu = 0;
        var speed_user = 0;
        var distance_cpu = 0;
        var distance_user = 0;

        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            
            if (collisionResults[0].object.name == "left" || collisionResults[0].object.name == "right") {
                stepX *= -1;
                pongCollision.play();
            }
            if (collisionResults[0].object.name == "CPU") {
                stepY *= -1;
                position_user = borders[3].position.x;

                //distance_cpu = collisionResults[0].object.position.x - position_cpu;
                speed_cpu = Math.abs(position_cpu - borders[2].position.x);
                console.log(speed_cpu);

                if(speed_cpu < 1.25){ //velocidad minima
                    speed_sphere = 1.25;
                }else if(speed_cpu > 1.75){ //velocidad maxima
                    speed_sphere = 1.75;
                }else{
                    speed_sphere = speed_cpu;
                }

                distance_cpu = Math.abs(borders[2].position.x - sphere.position.x);

                if(distance_cpu < 0.5){
                    angle_sphere = 0.5;
                }else if(distance_cpu > 1){
                    angle_sphere = 1;
                }else{
                    angle_sphere = distance_cpu;
                }

                pongPaddle.play();
            }
            if (collisionResults[0].object.name == "USER") {
                stepY *= -1;
                position_cpu = borders[2].position.x;

                //distance_user = collisionResults[0].object.position.x - position_user;
                speed_user = Math.abs(position_user - borders[3].position.x);
                console.log(speed_user);

                if(speed_user < 1.25){
                    speed_sphere = 1.25;
                }else if(speed_user > 1.75){
                    speed_sphere = 1.75;
                }else{
                    speed_sphere = speed_cpu;
                }

                distance_user = Math.abs(borders[3].position.x - sphere.position.x);

                if(distance_user < 0.5){
                    angle_sphere = 0.2;
                }else if(distance_user > 1){
                    angle_sphere = 1;
                }else{
                    angle_sphere = distance_user;
                }
               
                pongPaddle.play();
            } 
            break;
        }
    }
}

window.addEventListener("load", () => {
chrono();
})

console.log("Fin...");
