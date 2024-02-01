export class SeamlessAudio {
    private context: AudioContext;
    private source: AudioBufferSourceNode | null = null;

    constructor(uri: string, cb: (error: Error | null, player?: { play: () => void; stop: () => void }) => void) {
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();

        fetch(uri)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Couldn't load audio from ${uri}`);
                }
                return response.arrayBuffer();
            })
            .then((arrayBuffer) => this.context.decodeAudioData(arrayBuffer))
            .then((buffer) => {
                this.success(buffer);
                cb(null, {
                    play: this.play.bind(this),
                    stop: this.stop.bind(this),
                });
            })
            .catch((err) => {
                // Handle errors
                cb(new Error(`Couldn't decode audio from ${uri}`));
            });
    }

    private success(buffer: AudioBuffer) {
        this.source = this.context.createBufferSource();
        this.source.connect(this.context.destination);
        this.source.buffer = buffer;
        this.source.loop = true;
    }

    public play() {
        this.stop();

        if (this.source) {
            this.source.start(0);
        }
    }

    public stop() {
        if (this.source) {
            this.source.stop();
            this.source = null;
        }
    }
}