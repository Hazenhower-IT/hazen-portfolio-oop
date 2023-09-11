import ThreeMeshUI from 'three-mesh-ui'
import FontJSON from '../../src/font/Roboto-msdf.json';
import FontImage from '../../src/font/Roboto-msdf.png';
import Image from "../../src/immagine1.jpg"
import * as THREE from "three"

export function TortugaUI(){
    const container = new ThreeMeshUI.Block({
        // width: 2,
        // height: 1.5,
        padding: 0.025,
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontColor: new THREE.Color(0xffffff),
        backgroundOpacity: 1
      });

      container.position.set(-53.1, 1.6, 61)
      container.rotation.y = Math.PI/2
    //   this.scene.add( container );
       
      const title = new ThreeMeshUI.Block({
        height: 0.2,
        width: 1.5,
        margin: 0.025,
        justifyContent: "center",
        fontSize: 0.09,
      })

      title.add(new ThreeMeshUI.Text({
        content: "Tortuga Studios",
      }))
      container.add(title)

      const leftSubBlock = new ThreeMeshUI.Block({
        height: 0.95,
        width: 1.0,
        margin: 0.025,
        padding: 0.025,
        textAlign: "left",
        justifyContent: "end",
      })

      const caption = new ThreeMeshUI.Block({
        height: 0.07,
        width: 0.37,
        textAlign: "center",
        justifyContent: "center"
      })

      caption.add(new ThreeMeshUI.Text({
        content: "Mind your fingers",
        fontSIze: 0.04,
      }))

      leftSubBlock.add(caption)

      const rightSubBlock = new ThreeMeshUI.Block({
        margin: 0.025,
      })

      const subBlock1 = new ThreeMeshUI.Block({
        height: 0.35,
        width: 0.5,
        margin: 0.025,
        padding: 0.02,
        fontSize: 0.04,
        justifyContent: "center",
        backgroundOpacity: 0
      })
      subBlock1.add( 
        new ThreeMeshUI.Text({
          content: "bisogna cercare di capire come funziona il posizionamento",
        }),

        new ThreeMeshUI.Text({
          content: "bristly",
          color: new THREE.Color(0x92e66c),
        }),

        new ThreeMeshUI.Text({
          content: "appearence",
        }),
      )

      const subBlock2 = new ThreeMeshUI.Block({
        height: 0.53,
        width: 0.5,
        margin: 0.01,
        padding: 0.02,
        fontSize: 0.025,
        alignItems: "start",
        textAlign: "justify",
        backgroundOpacity: 0,
      })
      subBlock2.add(
        new ThreeMeshUI.Text({
          content:"the males of this species grow to maxix total length of 73cm. ijsjioj sioej psei soi epsie psepi espieopiseops epoise ps-.the males of this species grow to maxix total length of 73cm. ijsjioj sioej psei soi epsie psepi espieopiseops epoise ps-.the males of this species grow to maxix total length of 73cm. ijsjioj sioej psei soi epsie psepi espieopiseops epoise ps-.the males of this species grow to maxix total length of 73cm. ijsjioj sioej psei soi epsie psepi espieopiseops epoise ps-."
        })
      )

      rightSubBlock.add(subBlock1, subBlock2)

      const contentContainer = new ThreeMeshUI.Block({
        contentDirection: "row",
        padding: 0.02,
        margin: 0.025,
        backgroundOpacity: 0,
      })
      contentContainer.add(leftSubBlock, rightSubBlock)
      container.add(contentContainer)

      new THREE.TextureLoader().load(Image, (texture) => {
        leftSubBlock.set({
          backgroundTexture: texture,
        })
      })

    return container
}