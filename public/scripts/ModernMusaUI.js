import ThreeMeshUI from 'three-mesh-ui'
import FontJSON from '../../src/font/Roboto-msdf.json';
import FontImage from '../../src/font/Roboto-msdf.png';
import Image from "../../src/immagine1.jpg"
import * as THREE from "three"

export function ModernMusaUI(){
    const container = new ThreeMeshUI.Block({
        width: 2,
        height: 1.5,
        padding: 0.2,
        fontFamily: FontJSON,
        fontTexture: FontImage,
    });
       
       //
       
    const text = new ThreeMeshUI.Text({
        content: "Qui potrete immergervi nel meraviglioso mondo di Modern Musa, dove pixel e birra si incontrano per danzare sullo schermo!",
        fontSize: 0.08
    });
      
       
    container.add( text );
    container.position.set(-46.4, 1.6, 42)
    container.rotation.y = Math.PI/2

    return container
}