export default function createCamera(){
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000)
    camera.position.y = 1.6;
    camera.position.z = 0;
    camera.position.x = 0;

    return {camera}
}