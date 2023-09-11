import ThreeMeshUI from 'three-mesh-ui'
import FontJSON from '../../src/font/Roboto-msdf.json';
import FontImage from '../../src/font/Roboto-msdf.png';
import Image from "../../src/immagine1.jpg"
import * as THREE from "three"

export function UnityUI(){
    const container = new ThreeMeshUI.Block({
        width: 2,
        height: 1.5,
        padding: 0.2,
        fontFamily: FontJSON,
        fontTexture: FontImage,
    });
       
       //
       
    const text = new ThreeMeshUI.Text({
        content: "Try my games!",
         fontSize: 0.08
    });
      
       
    container.add( text );
    container.position.set(30, 1.6, 20)
    container.rotation.y = -Math.PI/2

    return container
}