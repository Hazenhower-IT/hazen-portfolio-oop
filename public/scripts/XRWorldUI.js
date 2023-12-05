import ThreeMeshUI from 'three-mesh-ui'
import FontJSON from '../../src/font/Roboto-msdf.json';
import FontImage from '../../src/font/Roboto-msdf.png';
import Image1 from "../../src/xr-world1.png"
import Image2 from "../../src/xr-world2.png";
import Image3 from "../../src/xr-world3.png";
import Image4 from "../../src/xr-world4.png";
import Image5 from "../../src/xr-world5.png";
import * as THREE from "three"

export function XRWorldUI(){

  const textureLoader = new THREE.TextureLoader()

  let currentIndex = 0;

  const texts = [
      "Vr - Room",
      "VR - Work Training",
      "VR - 3D Painting",
      "VR - Architectural Sample",
      "VR - Carnival Duck Shooter",
  ]

  const images = [
      Image1, Image2, Image3, Image4, Image5 
  ]

  //UI CONTAINER

  const container = new ThreeMeshUI.Block({
      // width: 3,
      // height: 2.0,
      padding: 0.002,
      fontFamily: FontJSON,
      fontTexture: FontImage,
      contentDirection:"column",
      justifyContent: "space-between"
  });
  container.position.set(22.5, 1.6, -6)
  container.rotation.y = -Math.PI/2

  //TITLE BLOCK
  const title = new ThreeMeshUI.Block({
      height: 0.2,
      width: 2.5,
      margin: 0.025,
      justifyContent: "center",
      fontSize: 0.09,
      backgroundOpacity: 0,
  })

  //TITLE TEXT
  title.add(new ThreeMeshUI.Text({
      content: "Download my VR Experiences!",
      
  }))
  container.add(title)

  //DESCRIPTION BLOCK
  const description = new ThreeMeshUI.Block({
      height: 0.7,
      width: 3,
      margin:0.025,
      // justifyContent: "center",
      fontSize: 0.07,
      backgroundOpacity: 0,
      // textAlign: "left",
  })
  
  //DESCRIPTION TEXT
  const text1 = new ThreeMeshUI.Text({
      content: texts[currentIndex],
      fontSize: 0.08
  });
  description.add(text1)
     
  container.add( description );

  //IMAGE BLOCK
  const imageBlock = new ThreeMeshUI.Block({
      height: 1.5,
      width: 2.8,
  })
  container.add(imageBlock)

  

  //BUTTONS BLOCK
  const buttonContainer = new ThreeMeshUI.Block( {
  justifyContent: 'center',
  contentDirection: 'row-reverse',
  fontFamily: FontJSON,
  fontTexture: FontImage,
  fontSize: 0.07,
  padding: 0.02,
  borderRadius: 0.11
} );

  //Button Options object(for fast setup of buttons)
  const buttonOptions = {
      width: 0.4,
      height: 0.15,
      justifyContent: 'center',
      offset: 0.05,
      margin: 0.02,
      borderRadius: 0.075
  };
  
  // Options for component.setupState().
  // It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).
  
  const hoveredStateAttributes = {
      state: 'hovered',
      attributes: {
        offset: 0.035,
        backgroundColor: new THREE.Color( 0x999999 ),
        backgroundOpacity: 1,
        fontColor: new THREE.Color( 0xffffff )
      },
  };
  
  const idleStateAttributes = {
      state: 'idle',
      attributes: {
        offset: 0.035,
        backgroundColor: new THREE.Color( 0x666666 ),
        backgroundOpacity: 0.3,
        fontColor: new THREE.Color( 0xffffff )
      },
  };
  
  // Buttons creation, with the options objects passed in parameters.
  
  const buttonNext = new ThreeMeshUI.Block( buttonOptions );
  const buttonPrevious = new ThreeMeshUI.Block( buttonOptions );
  const buttonGoTo = new ThreeMeshUI.Block(buttonOptions)
  
  // Add text to buttons
  
  buttonNext.add(
      new ThreeMeshUI.Text( { content: 'next' } )
  );
  
  buttonPrevious.add(
      new ThreeMeshUI.Text( { content: 'previous' } )
  );

  buttonGoTo.add(
      new ThreeMeshUI.Text({ content: "Download"})
  )
  
  // Create states for the buttons.
  // In the loop, we will call component.setState( 'state-name' ) when mouse hover or click
  
  const selectedAttributes = {
      offset: 0.02,
      backgroundColor: new THREE.Color( 0x777777 ),
      fontColor: new THREE.Color( 0x222222 )
  };
  
  buttonNext.setupState( {
      state: 'selected',
      attributes: selectedAttributes,
      onSet: () => {
          
          if(currentIndex === texts.length - 1){
              currentIndex = 0
          }else
          {
              currentIndex++
          }
          text1.set({content: texts[currentIndex]})
          textureLoader.load(images[currentIndex], (texture) => {
              imageBlock.set({
                backgroundTexture: texture,
              })
          })
  
      }
  });
  buttonNext.setupState( hoveredStateAttributes );
  buttonNext.setupState( idleStateAttributes );
  
    //
  
  buttonPrevious.setupState( {
      state: 'selected',
      attributes: selectedAttributes,
      onSet: () => {
          if(currentIndex === 0){
              currentIndex = texts.length - 1
          }else
          {
              currentIndex--
          }
          text1.set({content: texts[currentIndex]})
          textureLoader.load(images[currentIndex], (texture) => {
              imageBlock.set({
                backgroundTexture: texture,
              })
          }) 
      }
  });
  buttonPrevious.setupState( hoveredStateAttributes );
  buttonPrevious.setupState( idleStateAttributes );
  
  //

  buttonGoTo.setupState( {
      state: 'selected',
      attributes: selectedAttributes,
      onSet: () => {
        switch(currentIndex){
            case 0:
                window.open("https://www.mediafire.com/file/lxm0q6lv4xloa4w/vr-room-hazen.apk/file")
                break;
            case 1:
                window.open("https://www.mediafire.com/file/cyckyrg0n2porxn/vr-challenge3-hazen.apk/file")
                break;
            case 2:
                window.open("https://www.mediafire.com/file/ejygzfuup0wge7p/vr-challenge2-hazen.apk/file")
                break;
            case 3:
                window.open("https://www.mediafire.com/file/p9ywjk4fe1uyldj/vr-challenge1-hazen.apk/file")
                break;
            case 4:
                window.open("https://www.mediafire.com/file/m6cbeft1221qstv/CarnivalDuckShooter.apk/file")
                break;
        }
        //   window.open("https://hazenhower-portfolio.web.app")
          window.dispatchEvent(new MouseEvent("pointerup", {button: 0}))
      }
  });
  buttonGoTo.setupState( hoveredStateAttributes );
  buttonGoTo.setupState( idleStateAttributes );
  
  function showNextUI(currentUI){
      if(currentIndex === texts.length - 1){
          currentIndex = 0
      }else
      {
          currentIndex++
      }
      text1.content = texts[currentIndex]
  }

  
  buttonContainer.add( buttonNext, buttonGoTo , buttonPrevious,);
  container.add(buttonContainer)
  textureLoader.load(images[currentIndex], (texture) => {
      imageBlock.set({
        backgroundTexture: texture,
      })
  })

  return [container, buttonNext, buttonPrevious, buttonGoTo]
}