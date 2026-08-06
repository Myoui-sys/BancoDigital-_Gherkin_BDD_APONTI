import { Page } from "@playwright/test";

export class LoginPage {

    constructor(private page: Page) {}

    async login(cpf: string, senha: string) {

        await this.page.goto("https://bancodigital.com/login");

        await this.page.getByLabel("CPF").fill(cpf);

        await this.page.getByLabel("Senha").fill(senha);

        await this.page.getByRole("button", {
            name: "Entrar"
        }).click();

    }

}