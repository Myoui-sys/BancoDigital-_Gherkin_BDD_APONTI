import { IWorldOptions, setWorldConstructor, World } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";

export interface Contexto {
    [key: string]: any;
}

export class CustomWorld extends World {

    browser!: Browser;
    context!: BrowserContext;
    page!: Page;
    contexto: Contexto;

    constructor(options: IWorldOptions) {
        super(options);
        this.contexto = {};
    }

}

setWorldConstructor(CustomWorld);