import { FontLoader } from "three/examples/jsm/loaders/FontLoader"
import {VRButton} from "three/examples/jsm/webxr/VRButton"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import * as THREE from "three"
import * as CANNON from "cannon"
import * as dat from "dat.gui"
import ThreeMeshUI from 'three-mesh-ui'
  
import {XRControllerModelFactory} from "three/addons/webxr/XRControllerModelFactory.js"

import FontJSON from './src/font/Roboto-msdf.json';
import FontImage from './src/font/Roboto-msdf.png';
import Image from "./src/immagine1.jpg"

import { TortugaUI } from "./public/scripts/TortugaUI.js"
import { ModernMusaUI } from "./public/scripts/ModernMusaUI"
import { UnityUI } from "./public/scripts/UnityUI"
import { DeployosHermanosUI } from "./public/scripts/DeployosHermanosUI"
import { House1UI } from "./public/scripts/House1UI"

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
    this.audioVR = false

    const progressBar = document.getElementById("progress-bar")
    loadingManager.onProgress = (url, loaded, total) => {
      progressBar.value = (loaded/total) * 100
    }

    const progressBarContainer = document.querySelector(".progress-bar-container")
    loadingManager.onLoad = () =>{
      progressBarContainer.style.display = "none"
    } 

    this.uiToTest = []
    this.intersectUI

    this.player = new THREE.Object3D()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(0, 1.6, 0);
    this.player.add(this.camera)

    this.scene = new THREE.Scene();
    this.scene.background = cubeTextureLoader.load([
      "/skybox/px.jpg",
      "/skybox/nx.jpg",
      "/skybox/py.jpg",
      "/skybox/ny.jpg",
      "/skybox/pz.jpg",
      "/skybox/nz.jpg",
    ])
    // this.scene.add(this.camera)
    this.scene.add(this.player)
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


    
    //CUSTOM MOUSE CONTROLS ///////////////////////////////////////////////////////////////////
    //MOUSE/Touch & Mouse/Touch Events

    this.mouse = new THREE.Vector2();
    this.mouse.x = this.mouse.y = null;

    this.selectState = false;
    this.rightMouseDown = false;

    window.addEventListener( 'pointermove', ( event ) => {
      this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
    } );

    window.addEventListener("pointerdown", (event)=>{
      if(event.button === 0){
        this.selectState = true;
      }
      
    })

    window.addEventListener( 'mousedown', (event) => {
      if (event.button === 2) {
        this.rightMouseDown = true;
      }
      // else{
      //   this.selectState = true;
      // }
    } );

    window.addEventListener("pointerup", ()=>{
      this.selectState = false;
    })

    window.addEventListener( 'mouseup', (event) => {
      if (event.button === 2) {
        this.rightMouseDown = false;
      }
      // else{
      //   this.selectState = false;
      // }
    });
    

    //impedisce di aprire il menu opzioni quando premi il tasto destro del mouse
    window.addEventListener('contextmenu', (event) => {
      event.preventDefault(); // Impedisci l'azione predefinita del menu di contesto
    });


    //modelli
    this.loadedModel

    this.house1
    this.house1UIContainer

    this.musicStore
    this.tortugaUIContainer

    this.gameStore
    this.modernMusaUIContainer

    this.arcadeCity
    this.unityUIContainer

    this.deployosHermanos
    this.deployosUIContainer

    this.parco
    this.fontana
    
    
    // Keyboard Controller

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
      16: "shift",
      27: "esc"
    };


    // Event listener Keyboard
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

          if(key==="esc"){
            this.showMenu()
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

  raycastUI() {

    return this.uiToTest.reduce( ( closestIntersection, obj ) => {
  
      const intersection = this.raycaster.intersectObject( obj, true );
  
      if ( !intersection[ 0 ] ) return closestIntersection;
  
      if ( !closestIntersection || intersection[ 0 ].distance < closestIntersection.distance ) {
  
        intersection[ 0 ].object = obj;
  
        return intersection[ 0 ];
  
      }
  
      return closestIntersection;
  
    }, null );
  
  }

  updateButtonStates(){

    if ( this.selectState === true ) {


      // Component.setState internally call component.set with the options you defined in component.setupState
      this.intersectUI.object.setState( 'selected' );

    } else {

      // Component.setState internally call component.set with the options you defined in component.setupState
      this.intersectUI.object.setState( 'hovered' );
    }
  }

  
  updateMovement(delta){
    const previousPosition = this.camera.position.clone()

    const cameraRotationSpeed = 2
    
    if(this.rightMouseDown){
      this.player.rotateOnWorldAxis(new THREE.Vector3(0,1,0), -this.mouse.x * delta * cameraRotationSpeed)
    }

    if(this.keyPressed.shift){
      this.moveSpeed = 20 * delta;
    }
    else{
      this.moveSpeed = 10 * delta;
    }

    if(this.keyPressed.ArrowRight || this.keyPressed.d){
      this.player.translateX(this.moveSpeed)
    }
    else if(this.keyPressed.ArrowLeft || this.keyPressed.a){
      this.player.translateX(-this.moveSpeed)
    }
    else if(this.keyPressed.ArrowUp || this.keyPressed.w){
      this.player.translateZ(-this.moveSpeed)
    }
    else if(this.keyPressed.ArrowDown || this.keyPressed.s){
      this.player.translateZ(this.moveSpeed)
    }
    
    //mantiene il player attaccato al pavimento in modo che non possa ne fluttuare, ne andare sotto
    this.player.position.y = 0

    // Aggiungi altre azioni se necessario
  }

  loadUIs(){
    //House1UI
    const house1UI = House1UI()
    this.house1UIContainer = house1UI[0]
    const House1ButtonNext = house1UI[1]
    const House1ButtonPrevious = house1UI[2]

    this.uiToTest.push( House1ButtonNext, House1ButtonPrevious );
      
    //VISIBILITA UI
    // this.house1UIContainer.visible = false
    this.scene.add( this.house1UIContainer );


    //Tortuga Studio UI
    const tortugaUI = TortugaUI()
    const tortugaContainer = tortugaUI[0]
    const tortugaButtonNext = tortugaUI[1]
    const tortugaButtonPrevious = tortugaUI[2]
    const tortugaButtonGoTo = tortugaUI[3]

    this.uiToTest.push(tortugaButtonNext, tortugaButtonPrevious, tortugaButtonGoTo)

    this.scene.add(tortugaContainer)

    //ModernMusa UI
    const modernMusaUI = ModernMusaUI()
    const modernMusaContainer = modernMusaUI[0]
    const modernMusaButtonNext = modernMusaUI[1]
    const modernMusaButtonPrevious = modernMusaUI[2]
    const modernMusaButtonGoTo = modernMusaUI[3]

    this.uiToTest.push(modernMusaButtonNext, modernMusaButtonPrevious, modernMusaButtonGoTo)

    this.scene.add( modernMusaContainer );

    //UnityUI
    const unityUI = UnityUI()
    const unityContainer = unityUI[0]
    const unityButtonNext = unityUI[1]
    const unityButtonPrevious = unityUI[2]
    const unityButtonGoTo = unityUI[3]

    this.uiToTest.push(unityButtonNext, unityButtonPrevious, unityButtonGoTo)

    this.scene.add(unityContainer);

    //DeployosHermanosUI
    const deployosUI = DeployosHermanosUI()
    const deployosContainer = deployosUI[0]
    const deployosButtonNext = deployosUI[1]
    const deployosButtonPrevious = deployosUI[2]
    const deployosButtonGoTo = deployosUI[3]

    this.uiToTest.push( deployosButtonNext, deployosButtonPrevious, deployosButtonGoTo );

    this.scene.add( deployosContainer );
  }

  showUI(){
    const distanceTreshold = 8
    let distanceToUI
    
    if(this.renderer.xr.isPresenting){
      if(this.house1){
        distanceToUI = this.renderer.xr.getCamera().position.distanceTo(this.house1.position)
      }
    }
    else if(this.house1){
      distanceToUI = this.player.position.distanceTo(this.house1.position)
      console.log(distanceToUI)
    }
    
    if(distanceToUI < distanceTreshold){
      this.house1UIContainer.visible = true
      console.log(this.house1UIContainer)
    }
    else {
      this.house1UIContainer.visible = false
    }
    
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
    this.plane.name ="plane"
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
    this.loadUIs()


    this.initPhysics();
  
    
  }

  initPhysics(){
    this.world = new CANNON.World();
    this.dt = 1.0 / 60.0;
    this.damping = 0.01;

    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.gravity.set(0, -10, 0);

    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({mass:0 })
    groundBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1, 0, 0), -Math.PI/2);
    groundBody.addShape(groundShape)
    this.world.add(groundBody);
    

  }

  setupVR(){
    this.renderer.xr.enabled = true;

    document.body.appendChild(VRButton.createButton(this.renderer))

    this.controllers = this.buildControllers()

    const self = this

    function onSelectStart(){
      this.userData.selectPressed = true
      

      // if(self.intersectUI && self.intersectUI.object.isUI){
        self.selectState = true
      //}

    }

    function onSelectEnd(){
     this.userData.selectPressed = false

     self.selectState = false

     self.intersectUI = undefined

      
      if(self.INTERSECTION){
        const offsetPosition = {x: -self.INTERSECTION.x, y: -self.INTERSECTION.y, z: -self.INTERSECTION.z, w:1}
        const offsetRotation = new THREE.Quaternion()
        const transform = new XRRigidTransform(offsetPosition, offsetRotation)
        const teleportSpaceOffset = self.baseReferenceSpace.getOffsetReferenceSpace(transform)
        
        self.renderer.xr.setReferenceSpace(teleportSpaceOffset)
        this.children[0].scale.z = 0
      }
      
      this.children[0].scale.z = 0
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


  handleVRController(controller){


    let intersects = []

    if(controller.userData.selectPressed === true){

      controller.children[0].scale.z = 10
      this.workingMatrix.identity().extractRotation(controller.matrixWorld)

      this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
      this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.workingMatrix)

      intersects = this.raycaster.intersectObjects([this.plane])
      this.intersectUI = this.raycastUI()
      
      

      if(intersects.length > 0){
        controller.children[0].scale.z = intersects[0].distance;

        if(intersects[0].object.name === "plane"){
          this.INTERSECTION = intersects[0].point
        }
        
      }
        
    }

    


    // Update targeted button state (if any)
    if ( this.intersectUI && this.intersectUI.object.isUI ) {
      controller.children[0].scale.z = this.intersectUI.distance;
      this.updateButtonStates()
    }



    // Update non-targeted buttons state

    this.uiToTest.forEach( ( obj ) => {

      if ( ( !this.intersectUI || obj !== this.intersectUI.object ) && obj.isUI ) {

        // Component.setState internally call component.set with the options you defined in component.setupState
        obj.setState( 'idle' );
        console.log("ciao")
      }

    });

  }

  



  render(){
    const delta = this.clock.getDelta()
    
    let cameraPos = this.camera.position

    this.INTERSECTION = undefined

    //TEST
    if(this.renderer.xr.isPresenting){

      if(this.audioVR === false){
        this.sound.play()
        this.controllers[0].add(this.listener)
        this.audioVR = true
      }

      for(let i=0; i<=1; i++){

        // if(this.controllers[i].userData.selectPressed === true){
          this.handleVRController(this.controllers[i])
        // }

      }

      if(this.INTERSECTION){
        this.marker.position.copy(this.INTERSECTION)
        this.marker.position.y += 0.01
      }

      this.marker.visible = this.INTERSECTION !== undefined

    }
    else{

      this.updateMovement(delta)
      //inutile qui, da usare per gestire raycast ui in modalità NON VR
      if (this.mouse.x !== null && this.mouse.y !== null && !this.renderer.xr.isPresenting) {
        this.raycaster.setFromCamera( this.mouse, this.camera );
      
        this.intersectUI = this.raycastUI();

        // Update targeted button state (if any)
        if ( this.intersectUI && this.intersectUI.object.isUI ) {
          this.updateButtonStates()
        }

        // Update non-targeted buttons state

        this.uiToTest.forEach( ( obj ) => {

          if ( ( !this.intersectUI || obj !== this.intersectUI.object ) && obj.isUI ) {

            // Component.setState internally call component.set with the options you defined in component.setupState
            obj.setState( 'idle' );


          }

        });
      }

    }

    this.showUI()

    ThreeMeshUI.update();

   

    this.renderer.render(this.scene, this.camera)
  }

}

export {App};