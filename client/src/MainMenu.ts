import Game from "./Game";
export default class MainMenu {
    constructor() {
        this.init();
        this.registerEvents();
    }

    init() {
        (document.querySelector('#server') as HTMLInputElement).value = `${location.hostname}:${parseInt(location.port) + 1}`;
    }

    registerEvents() {
        document.querySelector('#play').addEventListener('click', this.play.bind(this));
    }

    play() {
        let serverAddress = (document.querySelector('#server') as HTMLInputElement).value;
        if (serverAddress.length === 0) return;

        document.querySelector('#mainmenu').style.display = 'none';
        document.querySelector('#gui').style.display = 'block';
        new Game(serverAddress);
    }
}