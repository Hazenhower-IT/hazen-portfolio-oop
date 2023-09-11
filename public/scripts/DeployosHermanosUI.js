import ThreeMeshUI from 'three-mesh-ui'
import FontJSON from '../../src/font/Roboto-msdf.json';
import FontImage from '../../src/font/Roboto-msdf.png';
import Image from "../../src/immagine1.jpg"
import * as THREE from "three"

export function DeployosHermanosUI(){

    const container = new ThreeMeshUI.Block({
        width: 2,
        height: 1.5,
        padding: 0.2,
        fontFamily: FontJSON,
        fontTexture: FontImage,
    });
       
       //
       
    const text = new ThreeMeshUI.Text({
        content: "Hai un idea per il mondo digitale ma non sai come realizzarla? Grazie alla nostra passione per le nuove tecnologie Stream System Designer portera' il vostro business digitale al livello successivo!",
        fontSize: 0.08
    });
      
       
    container.add( text );
    container.position.set(-60, 1.6, 6)

    return container
}