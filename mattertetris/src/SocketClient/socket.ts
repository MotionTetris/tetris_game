import { io } from "socket.io-client";

export class Socket {
    private socket;

    public constructor() {
        this.socket = io("http://localhost:8081");
        this.socket.on("connect", () => {
            console.log("연결 완료");
        });
    }

    public dispose() {
        console.log("소켓 연결 해제");
        this.socket.disconnect();
    }

    public sync(data:any) {
        this.socket.emit("sync", data);
    }

    public get sock() {
        return this.socket;
    }
}