export default class Sound {
    ctx: AudioContext;
    buffer: AudioBuffer;
    source: AudioBufferSourceNode;

    constructor(ctx: AudioContext, buffer: AudioBuffer) {
        this.ctx = ctx;
        this.buffer = buffer;
    }

    play() {
        if (this.source) return;

        let source = this.ctx.createBufferSource();
        source.buffer = this.buffer;
        source.connect(this.ctx.destination);
        source.onended = () => {
            this.source = null;
        };
        source.start();
        this.source = source;
    }

    stop() {
        if (this.source) {
            this.source.stop();
            this.source = null;
        }
    }
}