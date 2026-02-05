import { LOADING_WINDOW, loadingWindow } from "./template/loadingWindow";

export class LoadingWindow {
    static instance: LoadingWindow | null = null;

    static getInstance() {
        if (LoadingWindow.instance === null) {
            return new LoadingWindow();
        }
        return LoadingWindow.instance;
    }

    render(){
        const existingLoading = document.getElementById(LOADING_WINDOW);
        if (existingLoading) {
            existingLoading.remove();
        }

        const loadingDiv = document.createElement("div");

        loadingDiv.id = "prompttier-loading";
        loadingDiv.innerHTML = loadingWindow();

        document.body.appendChild(loadingDiv);
    }

    remove() {
        const loadingDiv = document.getElementById(LOADING_WINDOW);

        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
}