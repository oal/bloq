import Game from "./Game";
export default class MainMenu {
    constructor() {
        this.init();
        this.registerEvents();
    }

    init() {
        (document.querySelector('#server') as HTMLInputElement).value = `${location.hostname}:8081`;
    }

    registerEvents() {
        document.querySelector('#play').addEventListener('click', this.play.bind(this));
    }

    play() {
        let serverAddress = (document.querySelector('#server') as HTMLInputElement).value;
        if (serverAddress.length === 0) return;

        (document.querySelector('#mainmenu') as HTMLDivElement).style.display = 'none';
        (document.querySelector('#gui') as HTMLDivElement).style.display = 'block';
        new Game(serverAddress);
    }
}