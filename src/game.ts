import { ServerConnection } from "./connection";
import {ThreeScene} from "./scenes/three"


export class Game {

    constructor(
        private readonly _scene: ThreeScene,
        private readonly _serverConnection: ServerConnection | null
    ) {
    
        if (this._serverConnection) {
            this._serverConnection.onDisconnect(() => this.handleDisconnect());
            this._serverConnection.onSceneMessage((data) => this.handleSceneMsg(data));
    
            this._serverConnection.ok()
        }
    
    }

    public sendClientState() {
        
    }

    public update() {
        this._scene.update()
        requestAnimationFrame(() => this.update())
    }

    private handleDisconnect() {
        
    }

    private handleSceneMsg(data: any) {
        console.log(data)
    }
}