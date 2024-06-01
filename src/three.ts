import { newConnection } from "./connection";
import { Game } from "./game";
import { ThreeScene } from "./scenes/three";

export const threeInit = async (): Promise<void> => {
    
    // get the module to load
    const canvas = document.getElementById('webgl') as HTMLCanvasElement
    const scene = new ThreeScene(canvas);

    // const serverConnection = await newConnection("http://localhost:8080/ws")
    // const game = new Game(scene, serverConnection)
    const game = new Game(scene, null)

    window.addEventListener('resize', () => {
        scene.resize()
    })

    game.update();
}