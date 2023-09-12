import ThreeMeshUI from 'three-mesh-ui'
import FontJSON from '../../src/font/Roboto-msdf.json';
import FontImage from '../../src/font/Roboto-msdf.png';
import Image from "../../src/immagine1.jpg"
import Image1 from "../../src/deployos-hermanos-insegna.png";
import Image2 from "../../src/landscape5.jpg";
import * as THREE from "three"


export function DeployosHermanosUI(){

    let currentIndex = 0;

    const texts = [
        "Hai un idea per il tuo business digitale ma non sai come realizzarla? Vuoi sfruttare la tecnologie piu recenti per creare qualcosa di unico da offrire al tuo pubblico? O vuoi Potenziare la tua presenza online? Contattaci e porta il tuo business al livello successivo!",
        "Some really long text 2",
        "Some really long text 3",
    ]

    const images = [
        Image, Image1, Image2
    ]

    const container = new ThreeMeshUI.Block({
        width: 2,
        height: 1.5,
        padding: 0.002,
        fontFamily: FontJSON,
        fontTexture: FontImage,
    });

    const title = new ThreeMeshUI.Block({
        height: 0.2,
        width: 1.5,
        margin: 0.025,
        justifyContent: "center",
        fontSize: 0.09,
        backgroundOpacity: 0,
    })

    title.add(new ThreeMeshUI.Text({
        content: "Deployos Hermanos",
        
    }))
    container.add(title)

    const description = new ThreeMeshUI.Block({
        height: 0.4,
        width: 2,
        // margin:0.025,
        // justifyContent: "center",
        fontSize: 0.07,
        backgroundOpacity: 0,
        // textAlign: "left",
    })
       

    const text1 = new ThreeMeshUI.Text({
        content: texts[currentIndex],
        fontSize: 0.08
    });
    description.add(text1)
       
    container.add( description );

    const imageBlock = new ThreeMeshUI.Block({
        height: 0.6,
        width: 1.8,
    })
    container.add(imageBlock)
    container.position.set(-60, 1.6, 6)

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
    
    // Add text to buttons
    
    buttonNext.add(
        new ThreeMeshUI.Text( { content: 'next' } )
    );
    
    buttonPrevious.add(
        new ThreeMeshUI.Text( { content: 'previous' } )
    );
    
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
            new THREE.TextureLoader().load(images[currentIndex], (texture) => {
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
            new THREE.TextureLoader().load(images[currentIndex], (texture) => {
                imageBlock.set({
                  backgroundTexture: texture,
                })
            }) 
        }
    });
    buttonPrevious.setupState( hoveredStateAttributes );
    buttonPrevious.setupState( idleStateAttributes );
    
    function showNextUI(currentUI){
        if(currentIndex === texts.length - 1){
            currentIndex = 0
        }else
        {
            currentIndex++
        }
        text1.content = texts[currentIndex]
    }

    
    container.add( buttonNext, buttonPrevious );
    
    new THREE.TextureLoader().load(images[currentIndex], (texture) => {
        imageBlock.set({
          backgroundTexture: texture,
        })
    })

    return [container, buttonNext, buttonPrevious]
}