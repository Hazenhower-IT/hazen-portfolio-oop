import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"
import {VRButton} from "three/examples/jsm/webxr/VRButton"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import * as THREE from "three"
import * as dat from "dat.gui"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
  
import {XRControllerModelFactory} from "three/addons/webxr/XRControllerModelFactory.js"

class App{
  constructor(){
    const container = document.createElement("div");
    container.className="canvas" 
    document.body.appendChild(container);

    this.clock = new THREE.Clock();

    //loaders
    const loadingManager = new THREE.LoadingManager()
    this.gltfLoader = new GLTFLoader(loadingManager)
    this.textureLoader = new THREE.TextureLoader()
    this.fontLoader = new FontLoader()
    this.audioLoader = new THREE.AudioLoader()
    const cubeTextureLoader = new THREE.CubeTextureLoader()

    const progressBar = document.getElementById("progress-bar")
    loadingManager.onProgress = (url, loaded, total) => {
      progressBar.value = (loaded/total) * 100
    }

    const progressBarContainer = document.querySelector(".progress-bar-container")
    loadingManager.onLoad = () =>{
      progressBarContainer.style.display = "none"
    } 

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)

    this.camera.position.set(0, 1.6, 0);
    
    this.scene = new THREE.Scene();
    this.scene.background = cubeTextureLoader.load([
      "/skybox/px.jpg",
      "/skybox/nx.jpg",
      "/skybox/py.jpg",
      "/skybox/ny.jpg",
      "/skybox/pz.jpg",
      "/skybox/nz.jpg",
    ])

    this.scene.add(new THREE.HemisphereLight(0x555555, 0xffffff));

    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1, 1.25, 1.25).normalize();
    light.castShadow = true;
    const size = 15;
    light.shadow.left = -size;
    light.shadow.bottom = -size;
    light.shadow.right = size;
    light.shadow.top = size;
    this.scene.add(light)

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    
     
    this.renderer.xr.addEventListener("sessionstart", ()=>{

      this.baseReferenceSpace = this.renderer.xr.getReferenceSpace()
    })

    container.appendChild(this.renderer.domElement)

    //Controls da debug
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    // this.controls.target.set(0, 0, -3)
    // this.controls.update();

    //Controls da deploy
    this.controls = new PointerLockControls(this.camera, document.body)
    this.controls.addEventListener("unlock", this.showMenu.bind(this))
    
    //modelli
    this.loadedModel
    this.house1
    this.musicStore
    this.gameStore
    this.arcadeCity
    this.deployosHermanos

    this.parco
    this.fontana


    
    
    // Controller

    // Tasti
    this.keyPressed = {};

    this.run = false

    // Mappa dei tasti
    this.keyMap = {
      38: "ArrowUp",
      40: "ArrowDown",
      37: "ArrowLeft",
      39: "ArrowRight",
      87: "w",
      65: "a",
      83: "s",
      68: "d",
      16: "shift"
    };


    // Event listener WASD controls
    document.addEventListener(
      "keydown",
      (e) => {
        const keyCode = e.keyCode;
        const key = this.keyMap[keyCode];
        if (key) {
          this.keyPressed[key] = true;

          if(key ==="shift"){
            this.run = true
          }
        }
      },
      false
    );

    document.addEventListener(
      "keyup",
      (e) => {
        const keyCode = e.keyCode;
        const key = this.keyMap[keyCode];
        if (key) {
          this.keyPressed[key] = false;
          if(key==="shift"){
            this.run = false
          }
        }
      },
      false
    );

    this.listener = new THREE.AudioListener()
    this.camera.add(this.listener)

    this.raycaster = new THREE.Raycaster()
    this.workingMatrix = new THREE.Matrix4()
    this.origin = new THREE.Vector3();
    this.INTERSECTION
    this.initScene();
    this.setupVR();
    this.gui = new dat.GUI()
    
    this.renderer.setAnimationLoop(this.render.bind(this))


    window.addEventListener("resize", this.resize.bind(this))
  }

  startExperience(){
    //lock the pointer
   
    //RIATTIVA DOPO POSIZIONAMENTO PALAZZI
    this.controls.lock()
    
    
    //hide the menu
    this.hideMenu()

    this.sound.play()
    
    
  }

  hideMenu(){
    let menu = document.getElementById("menu")
    menu.style.display="none"
  }

  showMenu(){
    let menu = document.getElementById("menu")
    menu.style.display="block"
  }

  resize(){
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }


  
  updateMovement(delta){
    const previousPosition = this.camera.position.clone()
    
    if(this.keyPressed.shift){
      this.moveSpeed = 50 * delta;
    }
    else{
      this.moveSpeed = 10 * delta;
    }

    if(this.keyPressed.ArrowRight || this.keyPressed.d){
      this.controls.moveRight(this.moveSpeed)
    }
    else if(this.keyPressed.ArrowLeft || this.keyPressed.a){
      this.controls.moveRight(-this.moveSpeed)
    }
    else if(this.keyPressed.ArrowUp || this.keyPressed.w){
      this.controls.moveForward( this.moveSpeed)
    }
    else if(this.keyPressed.ArrowDown || this.keyPressed.s){
      this.controls.moveForward(-this.moveSpeed)
    }

    // Aggiungi altre azioni se necessario
  }

  loadModels(){

    //House1
    this.gltfLoader.load("/models/house/scene.gltf", (model)=>{
      this.loadedModel = model.scene.children[0]
      this.house1 = this.loadedModel.clone()
      this.house1.name="house1"
      this.house1.scale.set(0.03, 0.03, 0.03)
      this.house1.position.set(60, 0, 60)
      this.house1.rotation.z = Math.PI
      this.scene.add(this.house1)
    })

    //Music Store - Federici Guitarist
    this.gltfLoader.load("/models/music-store/scene.gltf", (model)=>{
      this.loadedModel = model.scene.children[0]
      this.musicStore = this.loadedModel.clone()
      this.musicStore.name="musicStore"
      this.musicStore.scale.set(1.5, 1.5, 1.5)
      this.musicStore.position.set(-50, 0.1, 70)
      this.musicStore.rotation.z += Math.PI /2
      this.scene.add(this.musicStore)
    })

    //Modern Musa
    this.gltfLoader.load("/models/small-game-store/scene.gltf", (model)=>{
      this.loadedModel = model.scene.children[0]
      this.gameStore = this.loadedModel.clone()
      this.gameStore.name="gameStore"
      this.gameStore.scale.set(.05, .05, .05)
      this.gameStore.position.set(-50, 0, 40)
      this.gameStore.rotation.z += -Math.PI /2
      this.scene.add(this.gameStore)
    })

    //Tendone Unity
    this.gltfLoader.load("/models/arcade-city/scene.gltf", (model)=>{
      this.loadedModel = model.scene.children[0]
      this.arcadeCity = this.loadedModel.clone()
      this.arcadeCity.name="arcadeCity"
      this.arcadeCity.scale.set(.11, .11, .11)
      this.arcadeCity.position.set(30, 2.2, 20)
      this.arcadeCity.rotation.z += -Math.PI /2
      this.scene.add(this.arcadeCity)
    })

     //SSD - Deployos Hermanos
     this.gltfLoader.load("/models/deployos-hermanos/scene.gltf", (model)=>{
      this.loadedModel = model.scene.children[0]
      this.deployosHermanos = this.loadedModel.clone()
      this.deployosHermanos.name="deployosHermanos"
      this.deployosHermanos.scale.set(1.5, 1.5, 1.5)
      this.deployosHermanos.position.set(-60, 0.01, -1.64)
      this.deployosHermanos.rotation.z += -Math.PI /2
      this.scene.add(this.deployosHermanos)
    })

    //Parco
    this.gltfLoader.load("/models/city-park-at-sunset/scene.gltf", (model)=>{
      this.loadedModel = model.scene.children[0]
      this.parco = this.loadedModel.clone()
      this.parco.name="parco"
      this.parco.scale.set(1, 1, 1)
      this.parco.position.set(-7, 0, -36)
      this.scene.add(this.parco)
    })

    //Fontana1
    this.gltfLoader.load("/models/medieval-fountain/scene.gltf", (model)=>{
      this.loadedModel = model.scene.children[0]
      this.fontana = this.loadedModel.clone()
      this.fontana.name="fontana"
      this.fontana.scale.set(1, 1, 1)
      this.fontana.position.set(-47.6, 0, -36)
      this.scene.add(this.fontana)
    })


  }



  initScene(){
    
    this.sound = new THREE.Audio(this.listener)
    self = this

    this.audioLoader.load("sounds/background-2.mp3", function(buffer){
      self.sound.setBuffer(buffer)
      self.sound.setLoop(true)
      self.sound.setVolume(0.3)
    })
    this.scene.add(this.sound)

    let playButton = document.getElementById("play_button")
    playButton.addEventListener("click", this.startExperience.bind(this))

    let sampietrino = this.textureLoader.load("/texture/sampietrino3.jpg")
    sampietrino.wrapS = THREE.RepeatWrapping
    sampietrino.wrapT = THREE.RepeatWrapping
    sampietrino.repeat.set(15,15)

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 150),
      new THREE.MeshPhongMaterial({map: sampietrino, side: THREE.DoubleSide})
    )
    this.plane.rotation.x = -0.5 * Math.PI
    this.plane.receiveShadow = true;
    this.scene.add(this.plane)

    this.marker = new THREE.Mesh(
      new THREE.CircleGeometry(0.25, 32).rotateX(-Math.PI/2),
      new THREE.MeshBasicMaterial(0xbcbcbc)
    )
    this.marker.visible = false;
    this.scene.add(this.marker)

   this.loadModels()


    //this.initPhysics();
  }

  // initPhysics(){
  //   this.world = new CANNON.World();
  //   this.dt = 1.0 / 60.0;
  //   this.damping = 0.01;

  //   this.world.broadphase = new CANNON.NaiveBroadphase();
  //   this.world.gravity.set(0, -10, 0);

  //   const groundShape = new CANNON.Plane();
  //   const groundBody = new CANNON.Body({mass:0 })
  //   groundBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1, 0, 0), -Math.PI/2);
  //   groundBody.addShape(groundShape)
  //   this.world.add(groundBody);
    

  // }

  setupVR(){
    this.renderer.xr.enabled = true;

    document.body.appendChild(VRButton.createButton(this.renderer))

    this.controllers = this.buildControllers()

    const self = this

    function onSelectStart(){
      this.userData.selectPressed = true
    }

    function onSelectEnd(){
     this.userData.selectPressed = false

      
      if(self.INTERSECTION){
        console.log("ciao")
        const offsetPosition = {x: -self.INTERSECTION.x, y: -self.INTERSECTION.y, z: -self.INTERSECTION.z, w:1}
        const offsetRotation = new THREE.Quaternion()
        const transform = new XRRigidTransform(offsetPosition, offsetRotation)
        const teleportSpaceOffset = self.baseReferenceSpace.getOffsetReferenceSpace(transform)
        
        self.renderer.xr.setReferenceSpace(teleportSpaceOffset)
      }
    }

    this.controllers.forEach((controller)=>{
      controller.addEventListener("selectstart", onSelectStart)
      controller.addEventListener("selectend", onSelectEnd)
    }) 

  }

  buildControllers(){
    const controllerModelFactory = new XRControllerModelFactory();

    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)])
    const line = new THREE.Line(geometry)
    line.name = "line"
    line.scale.z = 0;

    const controllers = []

    for(let i=0; i<=1; i++){
      const controller = this.renderer.xr.getController(i)
      controller.add(line.clone())
      controller.userData.selectPressed = false;
      this.scene.add(controller)

      controllers.push(controller)

      const grip = this.renderer.xr.getControllerGrip(i)
      grip.add(controllerModelFactory.createControllerModel(grip))
      this.scene.add(grip)
    }

    return controllers
  }


  handleController(controller){
    if(controller.userData.selectPressed === true){
      
      

      this.workingMatrix.identity().extractRotation(controller.matrixWorld)

      this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
      this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.workingMatrix)

      const intersects = this.raycaster.intersectObjects([this.plane])
      controller.children[0].scale.z = intersects[0].distance;

      if(intersects.length > 0){
        this.INTERSECTION = intersects[0].point
      }
    } 
  }


  render(){
    const delta = this.clock.getDelta()

    this.updateMovement(delta)

    let cameraPos = this.camera.position

    // this.INTERSECTION = undefined

    
    for(let i=0; i<=1; i++){
      if(this.controllers[i].userData.selectPressed === true){
        this.handleController(this.controllers[i])
      }
     
    }
     
    

    if(this.INTERSECTION){
      this.marker.position.copy(this.INTERSECTION)
      this.marker.position.y += 0.1
    }

    this.marker.visible = this.INTERSECTION !== undefined

    this.renderer.render(this.scene, this.camera)
  }

}

export {App};