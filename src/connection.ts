export class ServerConnection {
    constructor(private readonly _socket: WebSocket) {
        
    }

    public onSceneMessage(callback: (data: any) => void) {
        this._socket.onmessage = callback
    }

    public onDisconnect(callback: () => void) {
        this._socket.onclose = callback
    }

    public ok() {
        this._socket.send("ok")
    }
}

export const newConnection = async (addr: string): Promise<ServerConnection> => {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(addr)
        ws.onopen = () => {
            resolve(new ServerConnection(ws))
        };
        ws.onerror = (e) => {
            reject(e)
        };
    })
}
