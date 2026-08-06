import { Page } from "@playwright/test";

export class TransferenciaPage {

    constructor(private page: Page) {}

    async preencherChave(chave: string) {

        await this.page.getByLabel("Chave PIX").fill(chave);

    }

    async preencherValor(valor: string) {

        await this.page.getByLabel("Valor").fill(valor);

    }

    async clicarTransferir() {

        await this.page.getByRole("button", {
            name: "Transferir"
        }).click();

    }

}P