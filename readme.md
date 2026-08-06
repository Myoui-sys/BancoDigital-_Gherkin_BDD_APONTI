# BancoDigital - Gherkin BDD APONTI

## 📖 Descrição

Projeto de automação de testes para um sistema bancário fictício utilizando **BDD (Behavior-Driven Development)** com **Gherkin**, **Cucumber**, **Playwright** e **TypeScript**.

O objetivo é automatizar cenários de transferência bancária (PIX e TED) com base nas regras de negócio fornecidas.

---

## 🚀 Tecnologias

- TypeScript
- Node.js
- Playwright
- Cucumber
- Gherkin (BDD)

---

## 📁 Estrutura do Projeto

```text
BancoDigital-_Gherkin_BDD_APONTI/
│
├── features/
│   ├── transferencia.feature
│   └── step_definitions/
│
├── pages/
│   ├── LoginPage.ts
│   └── TransferenciaPage.ts
│
├── support/
│   └── hook.ts
│
├── node_modules/
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
└── README.md
```

---

## ⚙️ Instalação

Instale as dependências do projeto:

```bash
npm install
```

---

## ▶️ Execução dos Testes

Os testes poderão ser executados utilizando o Cucumber:

```bash
npx cucumber-js
```

> **Observação:** O comando poderá ser alterado conforme a configuração final do projeto.

---

## 📋 Cenários de Teste

Os cenários estão descritos em arquivos `.feature` localizados na pasta `features/`.

As implementações dos passos (Steps) utilizam o Playwright para automatizar a interação com a aplicação.

---

## 🏗️ Arquitetura

O projeto segue o padrão **Page Object Model (POM)**.

```text
.feature
      │
      ▼
step_definitions
      │
      ▼
Pages
      │
      ▼
Playwright
      │
      ▼
Aplicação
```

### Responsabilidades

- **features** → Cenários escritos em Gherkin.
- **step_definitions** → Implementação dos passos (`Given`, `When`, `Then`).
- **pages** → Objetos que representam as telas da aplicação.
- **support** → Configurações compartilhadas, Hooks e inicialização dos testes.

---

## 👨‍💻 Autor

Projeto desenvolvido para fins acadêmicos na **APONTI**.

---

## 📄 Licença

MIT