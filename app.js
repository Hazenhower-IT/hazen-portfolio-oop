import { FontLoader } from "three/examples/jsm/loaders/FontLoader"
import {VRButton} from "three/examples/jsm/webxr/VRButton"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import * as THREE from "three"
import * as CANNON from "cannon-es"
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
import { XRWorldUI } from "./public/scripts/XRWorldUI"

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

    this.planeBody

    this.player = new THREE.Object3D()
    this.playerSpeed = 10
    // this.playerBody = new THREE.Mesh(
    //   new THREE.BoxGeometry(1,2,1),
    //   new THREE.MeshLambertMaterial()
    // )
    // this.playerBody.position.y += 1
    // this.playerBoundingBox = new THREE.Box3().setFromObject(this.playerBody)
    // const playerHelper = new THREE.Box3Helper(this.playerBoundingBox)
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(0, 1.6, 0);
    this.player.add(this.camera)
    // this.player.add(this.playerBoundingBox)
    //this.player.add(this.playerHelper)

    this.scene = new THREE.Scene();
    this.scene.background = cubeTextureLoader.load([
      "/skybox3/px.png",
      "/skybox3/nx.png",
      "/skybox3/py.png",
      "/skybox3/ny.png",
      "/skybox3/pz.png",
      "/skybox3/nz.png",
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

    this.wallDoor

    this.wallNord
    this.wallNordBBox

    this.wallSud1
    this.wallSud2
    this.wallSudBBox

    this.wallEast
    this.wallEastBBox

    this.wallWest
    this.wallWestBBox

    


    this.house1
    this.house1UIContainer
    this.house1BBox
    this.house1TrashBBox
    this.house1SecchioBBox
    this.house1PedanaBBox

    
    this.musicStore
    this.tortugaUIContainer
    this.tortugaBBox

    this.gameStore
    this.modernMusaUIContainer
    this.musaBBox

    this.arcadeCity
    this.unityUIContainer
    this.unityBBox

    this.xrWorldModel
    this.xrWorldUIContainer
    this.xrWorldBBox
    this.xrWorldBBox2

    this.deployosHermanos
    this.deployosUIContainer
    this.deployosBBox

    this.parco
    this.parcoBBox
    this.fontana
    this.fontanaBBox
    
    
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
    const previousPosition  = this.player.position.clone()

    const cameraRotationSpeed = 2
    
    if(this.rightMouseDown){
      this.player.rotateOnWorldAxis(new THREE.Vector3(0,1,0), -this.mouse.x * delta * cameraRotationSpeed)
    }

    if(this.keyPressed.shift){
      this.moveSpeed = (this.playerSpeed * 1.5) * delta;
    }
    else{
      this.moveSpeed = this.playerSpeed * delta;
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
    //this.player.position.y = 0

    // Aggiungi altre azioni se necessario
    if(this.checkCollision()){
      this.player.position.copy(previousPosition)
    }
    
  }

  checkCollision(){
    this.playerBoundingBox = new THREE.Box3()
    const cameraWorldPosition = new THREE.Vector3()

    this.camera.getWorldPosition(cameraWorldPosition)

    this.playerBoundingBox.setFromCenterAndSize(cameraWorldPosition, new THREE.Vector3(1,1,1))
    

    if(this.playerBoundingBox.intersectsBox(this.house1BBox)){
      return true
    }
    else if(this.playerBoundingBox.intersectsBox(this.house1TrashBBox)){
      return true
    }
    else if(this.playerBoundingBox.intersectsBox(this.house1SecchioBBox)){
      return true
    }
    else if(this.playerBoundingBox.intersectsBox(this.house1PedanaBBox)){
      return true
    }
    else if(this.playerBoundingBox.intersectsBox(this.tortugaBBox)){
      return true
    }
    else if(this.playerBoundingBox.intersectsBox(this.musaBBox)){
      return true
    }
    else if(this.playerBoundingBox.intersectsBox(this.deployosBBox)){
      return true
    }
    else if(this.playerBoundingBox.intersectsSphere(this.unityBBox)){
      return true
    }
    else if(this.playerBoundingBox.intersectsBox(this.xrWorldBBox)){
      return true
    }
    else if(this.playerBoundingBox.intersectsBox(this.xrWorldBBox2)){
      return true
    }
    else if(this.playerBoundingBox.intersectsSphere(this.fontanaBBox)){
      return true
    }
    else if(this.playerBoundingBox.intersectsBox(this.wallNordBBox)){
      return true
    }
    else if(this.playerBoundingBox.intersectsBox(this.wallSudBBox)){
      return true
    }
    else if(this.playerBoundingBox.intersectsBox(this.wallEastBBox)){
      return true
    }
    else if(this.playerBoundingBox.intersectsBox(this.wallWestBBox)){
      return true
    }
 
    else{
      return false  
    }
      
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
    this.tortugaUIContainer = tortugaUI[0]
    const tortugaButtonNext = tortugaUI[1]
    const tortugaButtonPrevious = tortugaUI[2]
    const tortugaButtonGoTo = tortugaUI[3]

    this.uiToTest.push(tortugaButtonNext, tortugaButtonPrevious, tortugaButtonGoTo)

    this.scene.add(this.tortugaUIContainer)

    //ModernMusa UI
    const modernMusaUI = ModernMusaUI()
    this.modernMusaUIContainer = modernMusaUI[0]
    const modernMusaButtonNext = modernMusaUI[1]
    const modernMusaButtonPrevious = modernMusaUI[2]
    const modernMusaButtonGoTo = modernMusaUI[3]

    this.uiToTest.push(modernMusaButtonNext, modernMusaButtonPrevious, modernMusaButtonGoTo)

    this.scene.add( this.modernMusaUIContainer );

    //UnityUI
    const unityUI = UnityUI()
    this.unityUIContainer = unityUI[0]
    const unityButtonNext = unityUI[1]
    const unityButtonPrevious = unityUI[2]
    const unityButtonGoTo = unityUI[3]

    this.uiToTest.push(unityButtonNext, unityButtonPrevious, unityButtonGoTo)

    this.scene.add(this.unityUIContainer);


    //XRWorldUI
    const xrWorldUI = XRWorldUI()
    this.xrWorldUIContainer = xrWorldUI[0]
    const xrWorldButtonNext = xrWorldUI[1]
    const xrWorldButtonPrevious = xrWorldUI[2]
    const xrWorldButtonGoTo = xrWorldUI[3]

    this.uiToTest.push(xrWorldButtonNext, xrWorldButtonPrevious, xrWorldButtonGoTo)
    this.scene.add(this.xrWorldUIContainer)

    //DeployosHermanosUI
    const deployosUI = DeployosHermanosUI()
    this.deployosUIContainer = deployosUI[0]
    const deployosButtonNext = deployosUI[1]
    const deployosButtonPrevious = deployosUI[2]
    const deployosButtonGoTo = deployosUI[3]

    this.uiToTest.push( deployosButtonNext, deployosButtonPrevious, deployosButtonGoTo );

    this.scene.add( this.deployosUIContainer );
  }

  showUI(){
    const distanceTreshold = 13
    const xrWorldDistanceTreshold = 19
    let distanceToHouse1UI
    let distanceToTortugaUI
    let distanceToMusaUI
    let distanceToDeployosUI
    let distanceToUnityUI
    let distanceToXRWorldUI
    
    //registra la distanza tra player e il modello a cui è attaccata una UI in modalità VR
    if(this.renderer.xr.isPresenting){
      if(this.house1){
        distanceToHouse1UI = this.renderer.xr.getCamera().position.distanceTo(this.house1.position)
      }
      
      if(this.musicStore){
        distanceToTortugaUI = this.renderer.xr.getCamera().position.distanceTo(this.musicStore.position)
      }

      if(this.gameStore){
        distanceToMusaUI = this.renderer.xr.getCamera().position.distanceTo(this.gameStore.position)
      }

      if(this.deployosHermanos){
        distanceToDeployosUI = this.renderer.xr.getCamera().position.distanceTo(this.deployosHermanos.position)
      }

      if(this.arcadeCity){
        distanceToUnityUI = this.renderer.xr.getCamera().position.distanceTo(this.arcadeCity.position)
      }

      if(this.xrWorldModel){
        distanceToXRWorldUI = this.renderer.xr.getCamera().position.distanceTo(this.xrWorldModel.position)
      }
      
    }
    //registra la distanza tra player e il modello a cui è attaccata una UI in modalità NON VR
    else{

      if(this.house1){
        distanceToHouse1UI = this.player.position.distanceTo(this.house1.position)
        
      }

      if(this.musicStore){
        distanceToTortugaUI = this.player.position.distanceTo(this.musicStore.position)

      }

      if(this.gameStore){
        distanceToMusaUI = this.player.position.distanceTo(this.gameStore.position)
 
      }

      if(this.deployosHermanos){
        distanceToDeployosUI = this.player.position.distanceTo(this.deployosHermanos.position)

      }

      if(this.arcadeCity){
        distanceToUnityUI = this.player.position.distanceTo(this.arcadeCity.position)

      }

      if(this.xrWorldModel){
        distanceToXRWorldUI = this.player.position.distanceTo(this.xrWorldModel.position)
      }
    }

    //se la distanza tra player e uno dei modelli a cui è attaccata la ui è minore della distanzaTreshold, allora mostra la corrispondere UI
    if(distanceToHouse1UI < distanceTreshold){
      this.house1UIContainer.visible = true
      //console.log(this.house1UIContainer)
    }
    //altrimenti la nasconde
    else {
      this.house1UIContainer.visible = false
    }

    if(distanceToTortugaUI < distanceTreshold){
      this.tortugaUIContainer.visible = true
    }
    else {
      this.tortugaUIContainer.visible = false
    }

    if(distanceToMusaUI < distanceTreshold){
      this.modernMusaUIContainer.visible = true
    }
    else {
      this.modernMusaUIContainer.visible = false
    }

    if(distanceToUnityUI < distanceTreshold){
      this.unityUIContainer.visible = true
    }
    else {
      this.unityUIContainer.visible = false
    }

    if(distanceToXRWorldUI < xrWorldDistanceTreshold){
      this.xrWorldUIContainer.visible = true
    }
    else{
      this.xrWorldUIContainer.visible = false
    }

    if(distanceToDeployosUI < distanceTreshold){
      this.deployosUIContainer.visible = true
    }
    else {
      this.deployosUIContainer.visible = false
    }

    
  }

  loadWalls(){
    let wallTexture = this.textureLoader.load("/texture/walltexture6.png")
    wallTexture.wrapS = THREE.RepeatWrapping
    wallTexture.wrapT = THREE.RepeatWrapping
    wallTexture.repeat.set(50,5)

    let wallSudTexture = this.textureLoader.load("/texture/walltexture6.png")
    wallSudTexture.wrapS = THREE.RepeatWrapping
    wallSudTexture.wrapT = THREE.RepeatWrapping
    wallSudTexture.repeat.set(20,2)
  
    
    this.wallNord = new THREE.Mesh(new THREE.BoxGeometry(150, 10, 0.2), new THREE.MeshBasicMaterial({map: wallTexture}))
    this.wallNord.position.set(0, 5, -75)
    this.scene.add(this.wallNord)

    this.wallSud1 = new THREE.Mesh(new THREE.BoxGeometry(70, 10, 0.2), new THREE.MeshBasicMaterial({map: wallSudTexture}))
    this.wallSud1.position.set(-40, 5, 75)
    this.scene.add(this.wallSud1)

    this.wallSud2 = new THREE.Mesh(new THREE.BoxGeometry(70, 10, 0.2), new THREE.MeshBasicMaterial({map: wallSudTexture}))
    this.wallSud2.position.set(40, 5, 75)
    this.scene.add(this.wallSud2)

    this.wallEast = new THREE.Mesh(new THREE.BoxGeometry(0.2, 10, 150), new THREE.MeshBasicMaterial({map: wallTexture}))
    this.wallEast.position.set(75, 5, 0)
    this.scene.add(this.wallEast)

    this.wallWest = new THREE.Mesh(new THREE.BoxGeometry(0.2, 10, 150), new THREE.MeshBasicMaterial({map: wallTexture}))
    this.wallWest.position.set(-75, 5, 0)
    this.scene.add(this.wallWest)
  }

  loadModels(){

    //Porta Principale
    this.gltfLoader.load("/models/wall-door/scene.gltf", (model)=>{
      this.loadedModel = model.scene
      this.wallDoor = this.loadedModel.clone()

      this.wallDoor.name="wallDoor"
      this.wallDoor.scale.set(2,2,1)
      this.wallDoor.position.set(0, 0, 76)

      this.scene.add(this.wallDoor)
    })

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

    //XR World
    this.gltfLoader.load("/models/xr-world/scene.gltf", (model)=>{
      this.loadedModel = model.scene.children[0]
      this.xrWorldModel = this.loadedModel.clone()

      this.xrWorldModel.name = "XRWorld"
      this.xrWorldModel.scale.set(1,1,1)
      this.xrWorldModel.position.set(30 , 0.01, -20)
      this.xrWorldModel.rotation.z += -Math.PI/2

      this.scene.add(this.xrWorldModel)
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

    // //Parco
    // this.gltfLoader.load("/models/city-park-at-sunset/scene.gltf", (model)=>{
      
    //   this.loadedModel = model.scene.children[0]
    //   this.parco = this.loadedModel.clone()
      
    //   this.parco.name="parco"
    //   this.parco.scale.set(1, 1, 1)
    //   this.parco.position.set(-7, 0, -36)
      
    //   this.scene.add(this.parco)
    // })

    /** */
    //Fontana1
    this.gltfLoader.load("/models/medieval-fountain/scene.gltf", (model)=>{
      
      this.loadedModel = model.scene.children[0]
      this.fontana = this.loadedModel.clone()
      
      this.fontana.name="fontana"
      this.fontana.scale.set(1, 1, 1)
      this.fontana.position.set(-47.6, -0.5, -36)
      
      this.scene.add(this.fontana)
    })

    

  }

  loadModelsBoundingBoxes(){
    const house1Placeholder = new THREE.Mesh(new THREE.BoxGeometry(8.3, 10, 16), new THREE.MeshBasicMaterial({color:0xff0000}))
    house1Placeholder.position.set(59.5, 5 , 61.3) 
    this.scene.add(house1Placeholder)
    this.house1BBox = new THREE.Box3().setFromObject(house1Placeholder)
    house1Placeholder.visible = false;

    const trashPlaceholder = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2 ,11.5), new THREE.MeshBasicMaterial({color:0x0000ff, wireframe: true}))
    trashPlaceholder.position.set(65, 1, 60)
    this.scene.add(trashPlaceholder)
    this.house1TrashBBox = new THREE.Box3().setFromObject(trashPlaceholder)
    trashPlaceholder.visible = false;

    const secchioPlaceholder = new THREE.Mesh(new THREE.BoxGeometry(.9, 2 ,1.3), new THREE.MeshBasicMaterial({color:0x00ffff, wireframe: true}))
    secchioPlaceholder.position.set(66.5, 1, 59)
    this.scene.add(secchioPlaceholder)
    this.house1SecchioBBox = new THREE.Box3().setFromObject(secchioPlaceholder)
    secchioPlaceholder.visible = false;

    const pedanaPlaceholder = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2 ,2.3), new THREE.MeshBasicMaterial({color:0x00ffff, wireframe: true}))
    pedanaPlaceholder.position.set(60.4, 1, 70)
    this.scene.add(pedanaPlaceholder)
    this.house1PedanaBBox = new THREE.Box3().setFromObject(pedanaPlaceholder)
    pedanaPlaceholder.visible = false;

    //const house1BoxHelper = new THREE.Box3Helper(this.house1BBox)
    //this.scene.add(house1BoxHelper)

    const tortugaPlaceholder = new THREE.Mesh(new THREE.BoxGeometry(11,6,7.8), new THREE.MeshPhongMaterial({color:0xff0000}))
    tortugaPlaceholder.position.set(-58.5, 3, 62.5)
    this.scene.add(tortugaPlaceholder)
    this.tortugaBBox = new THREE.Box3().setFromObject(tortugaPlaceholder)
    tortugaPlaceholder.visible = false

    //const tortugaBoxHelper = new THREE.Box3Helper(this.tortugaBBox)
    //this.scene.add(tortugaBoxHelper)

    const musaPlaceholder = new THREE.Mesh(new THREE.BoxGeometry(7.4, 6 , 8.2 ), new THREE.MeshBasicMaterial({color:0xff0000}))
    musaPlaceholder.position.set(-50, 3, 40)
    this.scene.add(musaPlaceholder)
    this.musaBBox = new THREE.Box3().setFromObject(musaPlaceholder)
    musaPlaceholder.visible = false

    // const musaBoxHelper = new THREE.Box3Helper(this.musaBBox)
    // this.scene.add(musaBoxHelper)

    const unityPlaceholder = new THREE.Mesh(new THREE.SphereGeometry(4.7, 32), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}))
    unityPlaceholder.position.set(31, 2.1, 20)
    this.scene.add(unityPlaceholder)
   
    this.unityBBox =  new THREE.Sphere().set(new THREE.Vector3(31, 2.1, 20), 4.7)
    unityPlaceholder.visible = false

    const xrWorldPlaceholder = new THREE.Mesh(new THREE.BoxGeometry(8.3, 10, 8.2), new THREE.MeshBasicMaterial({color:0xff0000, wireframe: true}))
    xrWorldPlaceholder.position.set(30, 5.01, -6)
    this.scene.add(xrWorldPlaceholder)
    const xrWorldPlaceholder2 = new THREE.Mesh(new THREE.BoxGeometry(3, 10, 5), new THREE.MeshBasicMaterial({color: 0x0000ff, wireframe:true}))
    xrWorldPlaceholder2.position.set(24.5, 5.01, -6)
    this.scene.add(xrWorldPlaceholder2)
    this.xrWorldBBox = new THREE.Box3().setFromObject(xrWorldPlaceholder)
    this.xrWorldBBox2 = new THREE.Box3().setFromObject(xrWorldPlaceholder2)
    xrWorldPlaceholder.visible = false
    xrWorldPlaceholder2.visible = false

    

    const deployosPlaceholder = new THREE.Mesh(new THREE.BoxGeometry(23, 6, 15.5), new THREE.MeshBasicMaterial({color: 0xff0000}))
    deployosPlaceholder.position.set(-60, 3, -1.64)
    this.scene.add(deployosPlaceholder)
    this.deployosBBox = new THREE.Box3().setFromObject(deployosPlaceholder)
    deployosPlaceholder.visible = false

    //const deployosHelper = new THREE.Box3Helper(this.deployosBBox)
    //this.scene.add(deployosHelper)

    const fontanaPlaceholder = new THREE.Mesh(new THREE.SphereGeometry(5 , 32), new THREE.MeshBasicMaterial({color:0xff0000, wireframe: true}))
    fontanaPlaceholder.position.set(-47.6, 2, -36)
    this.scene.add(fontanaPlaceholder)
    this.fontanaBBox = new THREE.Sphere().set(new THREE.Vector3(-47.6, 2, -36), 5 )
    fontanaPlaceholder.visible = false


    //Collisioni con i muri della città
    const nordWallPlaceholder = new THREE.Mesh(new THREE.BoxGeometry(150, 10, 0.4), new THREE.MeshBasicMaterial({color:0xff0000, wireframe: true}))
    nordWallPlaceholder.position.set(0, 5, -75)
    this.scene.add(nordWallPlaceholder)
    this.wallNordBBox = new THREE.Box3().setFromObject(nordWallPlaceholder)
    nordWallPlaceholder.visible = false

    const sudWallPlaceholder = new THREE.Mesh(new THREE.BoxGeometry(150, 10, 0.4), new THREE.MeshBasicMaterial({color:0xff0000, wireframe: true}))
    sudWallPlaceholder.position.set(0, 5, 75)
    this.scene.add(sudWallPlaceholder)
    this.wallSudBBox = new THREE.Box3().setFromObject(sudWallPlaceholder)
    sudWallPlaceholder.visible = false

    const eastWallPlaceholder = new THREE.Mesh(new THREE.BoxGeometry(0.4, 10, 150), new THREE.MeshBasicMaterial({color:0xff0000, wireframe: true}))
    eastWallPlaceholder.position.set(75, 5, 0)
    this.wallEastBBox = new THREE.Box3().setFromObject(eastWallPlaceholder)
    eastWallPlaceholder.visible = false
  
    const westWallPlaceholder = new THREE.Mesh(new THREE.BoxGeometry(0.4, 10, 150), new THREE.MeshBasicMaterial({color:0xff0000, wireframe: true}))
    westWallPlaceholder.position.set(-75, 5, 0)
    this.wallWestBBox = new THREE.Box3().setFromObject(westWallPlaceholder)
    westWallPlaceholder.visible = false
  }

  loadBuildingSign(){
    const tortugaSignTexture = this.textureLoader.load("texture/tortuga-sign.png")
    const tortugaSign = new THREE.Mesh(new THREE.BoxGeometry(.4,3,6), new THREE.MeshPhongMaterial({map:tortugaSignTexture, side: THREE.DoubleSide}))
    tortugaSign.position.set(-53.4, 6, 62.5)
    this.scene.add(tortugaSign)

    const musaSignTexture = this.textureLoader.load("/texture/musa-sign.png")
    const musaSign = new THREE.Mesh(new THREE.BoxGeometry(.1,1.5,8.2), new THREE.MeshPhongMaterial({map:musaSignTexture, side: THREE.DoubleSide}))
    musaSign.position.set(-46.4, 5.45, 39.9)
    this.scene.add(musaSign)

    const hermanosSignTexture = this.textureLoader.load("/texture/deployos-sign.png")
    const hermanosSign = new THREE.Mesh(new THREE.BoxGeometry(15, 8, .1), new THREE.MeshPhongMaterial({map:hermanosSignTexture, side: THREE.DoubleSide}))
    hermanosSign.position.set(-60, 10, 6)
    this.scene.add(hermanosSign)

    const XRWorldSignTexture = this.textureLoader.load("/texture/XRWorld-sign.png")
    const XRWorldSign = new THREE.Mesh(new THREE.BoxGeometry(.1, 3, 5.2), new THREE.MeshPhongMaterial({map:XRWorldSignTexture, side: THREE.DoubleSide}))
    XRWorldSign.position.set(24.7, 9.1, -6.1)
    this.scene.add(XRWorldSign)

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
    
    this.loadWalls()
    this.loadModels()
    this.loadUIs()
    this.loadBuildingSign()
    this.loadModelsBoundingBoxes()

    this.initPhysics();
  
    
  }

  initPhysics(){
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0)
    });

    this.dt = 1.0 / 60.0;
    // this.damping = 0.01;

    // this.world.broadphase = new CANNON.NaiveBroadphase();
    // this.world.gravity.set(0, -10, 0);


    this.planeBody = new CANNON.Body({
      shape: new CANNON.Plane(),
      //mass: 0,
      type: CANNON.Body.STATIC
    })

    this.world.addBody(this.planeBody)
    this.planeBody.quaternion.setFromEuler(-Math.PI/2, 0, 0)
    
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

      //TRY WITHOUS PLANE
      //intersects = this.raycaster.intersectObjects([this.plane])
      intersects = this.raycaster.intersectObjects()

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

   
    //UPDATING THE PHYSICS WORLD
    this.world.step(this.dt);
    
    this.plane.position.copy(this.planeBody.position)
    this.plane.quaternion.copy(this.planeBody.quaternion)


    
    this.renderer.render(this.scene, this.camera)
  }

}

export {App};