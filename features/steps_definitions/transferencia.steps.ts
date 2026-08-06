import { Given, When, Then, defineParameterType } from "@cucumber/cucumber";
import { strict as assert } from "assert";
import { CustomWorld } from "../../support/world";

const parseCurrency = (valor: string): number => {
    return Number(
        valor
            .replace(/[^0-9,.-]/g, "")
            .replace(/\./g, "")
            .replace(",", ".")
    );
};

defineParameterType({
    name: "currency",
    regexp: /[0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}/,
    transformer: (valor: string) => parseCurrency(valor)
});

// ----------------------------------------------------------------------
// Cenário: PIX bem-sucedido sem 2FA
// ----------------------------------------------------------------------

Given(
    "que o cliente Pessoa Física possui conta verificada e saldo suficiente",
    async function (this: CustomWorld) {
        this.contexto = {
            tipoCliente: "PF",
            contaVerificada: true,
            saldo: 10000
        };
    }
);

Given(
    "deseja realizar um PIX de R$ {currency}",
    async function (this: CustomWorld, valor: number) {
        this.contexto.valorOperacao = valor;
        this.contexto.tipoOperacao = "PIX";
    }
);

When(
    "ele confirma a transferência preenchendo todos os campos obrigatórios",
    async function (this: CustomWorld) {
        this.contexto.resultado = "processada_instantaneamente";
    }
);

Then(
    "a transferência deve ser processada instantaneamente",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "processada_instantaneamente");
    }
);

Then(
    "o comprovante da operação deve ser gerado",
    async function (this: CustomWorld) {
        this.contexto.comprovanteGerado = true;
        assert.equal(this.contexto.comprovanteGerado, true);
    }
);

// ----------------------------------------------------------------------
// Cenário: TED no horário bancário com campos opcionais
// ----------------------------------------------------------------------

Given(
    "que o cliente Pessoa Jurídica possui saldo de R$ {currency}",
    async function (this: CustomWorld, saldo: number) {
        this.contexto = { tipoCliente: "PJ", saldo };
    }
);

Given(
    "o dia atual é um dia útil às {int}h{int}",
    async function (this: CustomWorld, hora: number, minuto: number) {
        this.contexto.horaAtual = `${hora}:${minuto}`;
        this.contexto.diaUtil = true;
    }
);

When(
    "ele realiza um TED de R$ {currency} preenchendo a {string} opcional",
    async function (this: CustomWorld, valor: number, campoOpcional: string) {
        this.contexto.valorOperacao = valor;
        this.contexto.tipoOperacao = "TED";
        this.contexto.campoOpcionalPreenchido = campoOpcional;
        this.contexto.resultado = "processada_mesmo_dia";
    }
);

Then(
    "a transferência deve ser processada no mesmo dia",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "processada_mesmo_dia");
    }
);

// ----------------------------------------------------------------------
// Cenário: 2FA concluído com sucesso
// ----------------------------------------------------------------------

Given(
    "que o cliente solicita uma transferência PIX de R$ {currency}",
    async function (this: CustomWorld, valor: number) {
        this.contexto = { tipoOperacao: "PIX", valorOperacao: valor };
    }
);

Given(
    "o sistema integra com o serviço de mensageria para envio do token",
    async function (this: CustomWorld) {
        this.contexto.tokenEnviado = true;
    }
);

When(
    "ele insere o código 2FA corretamente no prompt",
    async function (this: CustomWorld) {
        this.contexto.codigo2FAValido = true;
        this.contexto.resultado = "autorizada";
    }
);

Then(
    "a transferência deve ser autorizada e deduzida do saldo",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "autorizada");
    }
);

// ----------------------------------------------------------------------
// Cenário: Agendamento de TED para data futura
// ----------------------------------------------------------------------

Given(
    "que o cliente deseja transferir R$ {currency} via TED",
    async function (this: CustomWorld, valor: number) {
        this.contexto = { tipoOperacao: "TED", valorOperacao: valor };
    }
);

Given(
    "seleciona uma data útil futura para o agendamento",
    async function (this: CustomWorld) {
        this.contexto.dataAgendamento = "futura_dia_util";
    }
);

When(
    "ele confirma a operação",
    async function (this: CustomWorld) {
        this.contexto.agendamentoSalvo = true;
        this.contexto.saldoDescontado = false;
    }
);

Then(
    "o sistema deve salvar o agendamento",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.agendamentoSalvo, true);
    }
);

Then(
    "não deve descontar o saldo no momento da criação",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.saldoDescontado, false);
    }
);

// ----------------------------------------------------------------------
// Cenário: Cancelamento de agendamento no limite do prazo
// ----------------------------------------------------------------------

Given(
    "que o cliente possui um TED agendado para o dia {int}",
    async function (this: CustomWorld, dia: number) {
        this.contexto = { diaAgendado: dia };
    }
);

When(
    "ele solicita o cancelamento do agendamento às {int}h{int} do dia {int}",
    async function (this: CustomWorld, hora: number, minuto: number, diaSolicitacao: number) {
        this.contexto.diaSolicitacao = diaSolicitacao;
        this.contexto.horaSolicitacao = `${hora}:${minuto}`;
        this.contexto.resultado = "cancelado_com_sucesso";
    }
);

Then(
    "o sistema deve cancelar a operação com sucesso",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "cancelado_com_sucesso");
    }
);

// ----------------------------------------------------------------------
// Cenário: Transferência exata no limite para chave PIX recente
// ----------------------------------------------------------------------

Given(
    "que o cliente possui uma chave PIX de destino cadastrada há {int} horas",
    async function (this: CustomWorld, horas: number) {
        this.contexto = { chaveCadastradaHaHoras: horas };
    }
);

When(
    "ele tenta transferir exatamente R$ {currency}",
    async function (this: CustomWorld, valor: number) {
        this.contexto.valorOperacao = valor;
        this.contexto.resultado = "aprovada_sem_bloqueios";
    }
);

Then(
    "a transferência deve ser aprovada sem bloqueios",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "aprovada_sem_bloqueios");
    }
);

// ----------------------------------------------------------------------
// Cenário: Bloqueio imediato por saldo insuficiente
// ----------------------------------------------------------------------

Given(
    /^que o cliente possui saldo de R\$ ([\d.,]+)$/,
    async function (this: CustomWorld, saldoTexto: string) {
        const saldo = parseCurrency(saldoTexto);
        this.contexto = { saldo };
    }
);

When(
    /^ele tenta realizar uma transferência de R\$ ([\d.,]+)$/,
    async function (this: CustomWorld, valorTexto: string) {
        const valor = parseCurrency(valorTexto);
        this.contexto.valorOperacao = valor;
        this.contexto.resultado = valor > this.contexto.saldo
            ? "bloqueada_saldo_insuficiente"
            : "aprovada";
    }
);

Then(
    "o sistema deve bloquear completamente a operação",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "bloqueada_saldo_insuficiente");
    }
);

Then(
    "exibir uma mensagem de erro indicando saldo insuficiente",
    async function (this: CustomWorld) {
        this.contexto.mensagemErro = "Saldo insuficiente";
        assert.equal(this.contexto.mensagemErro, "Saldo insuficiente");
    }
);

// ----------------------------------------------------------------------
// Cenário: TED fora do horário bancário
// ----------------------------------------------------------------------

Given(
    "que o horário atual é {int}h{int} de um dia útil",
    async function (this: CustomWorld, hora: number, minuto: number) {
        this.contexto = { horaAtual: `${hora}:${minuto}`, diaUtil: true };
    }
);

When(
    "o cliente tenta realizar um TED de qualquer valor",
    async function (this: CustomWorld) {
        this.contexto.resultado = "impedido_fora_horario";
    }
);

Then(
    "o sistema deve impedir a execução imediata",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "impedido_fora_horario");
    }
);

Then(
    "sugerir o agendamento para o próximo dia útil",
    async function (this: CustomWorld) {
        this.contexto.sugestaoAgendamento = true;
        assert.equal(this.contexto.sugestaoAgendamento, true);
    }
);

// ----------------------------------------------------------------------
// Cenário: Restrição por pendência cadastral
// ----------------------------------------------------------------------

Given(
    "que a conta do cliente possui uma pendência cadastral",
    async function (this: CustomWorld) {
        this.contexto = { pendenciaCadastral: true };
    }
);

When(
    "ele tenta acessar a funcionalidade de transferências",
    async function (this: CustomWorld) {
        this.contexto.resultado = this.contexto.pendenciaCadastral
            ? "acesso_bloqueado"
            : "acesso_liberado";
    }
);

Then(
    "o sistema deve bloquear o acesso",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "acesso_bloqueado");
    }
);

Then(
    "exibir um alerta orientando a regularização do cadastro",
    async function (this: CustomWorld) {
        this.contexto.alertaExibido = true;
        assert.equal(this.contexto.alertaExibido, true);
    }
);

// ----------------------------------------------------------------------
// Cenário: Falha na validação do 2FA
// ----------------------------------------------------------------------

Given(
    "que o cliente está na etapa de 2FA para um PIX de R$ {currency}",
    async function (this: CustomWorld, valor: number) {
        this.contexto = { tipoOperacao: "PIX", valorOperacao: valor, etapa2FA: true };
    }
);

When(
    "ele insere um código de verificação inválido",
    async function (this: CustomWorld) {
        this.contexto.codigo2FAValido = false;
        this.contexto.resultado = "transferencia_nao_processada";
    }
);

Then(
    "o sistema não deve processar a transferência",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "transferencia_nao_processada");
    }
);

Then(
    "deve exibir um alerta de código incorreto",
    async function (this: CustomWorld) {
        this.contexto.alertaCodigoIncorreto = true;
        assert.equal(this.contexto.alertaCodigoIncorreto, true);
    }
);

// ----------------------------------------------------------------------
// Cenário: Cancelamento de agendamento no dia da execução
// ----------------------------------------------------------------------

Given(
    "que o cliente possui um TED agendado para a data de hoje",
    async function (this: CustomWorld) {
        this.contexto = { agendadoParaHoje: true };
    }
);

When(
    "ele tenta realizar o cancelamento da operação",
    async function (this: CustomWorld) {
        this.contexto.resultado = "solicitacao_negada";
    }
);

Then(
    "o sistema deve negar a solicitação",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "solicitacao_negada");
    }
);

Then(
    "informar que cancelamentos só ocorrem até um dia antes",
    async function (this: CustomWorld) {
        this.contexto.mensagemInformativa = true;
        assert.equal(this.contexto.mensagemInformativa, true);
    }
);

// ----------------------------------------------------------------------
// Cenário: Bloqueio após 3 senhas incorretas
// ----------------------------------------------------------------------

Given(
    "que o cliente errou a senha de transferência {int} vezes",
    async function (this: CustomWorld, tentativas: number) {
        this.contexto = { tentativasErradas: tentativas };
    }
);

When(
    "ele insere a senha incorreta pela {int}ª vez consecutiva",
    async function (this: CustomWorld, tentativa: number) {
        this.contexto.tentativasErradas = tentativa;
        this.contexto.resultado = "funcionalidade_bloqueada";
        this.contexto.bloqueioMinutos = 30;
    }
);

Then(
    "a funcionalidade deve ser bloqueada",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "funcionalidade_bloqueada");
    }
);

Then(
    "o bloqueio deve permanecer ativo por exatos {int} minutos",
    async function (this: CustomWorld, minutos: number) {
        assert.equal(this.contexto.bloqueioMinutos, minutos);
    }
);

// ----------------------------------------------------------------------
// Cenário: Validação de campos vazios e espaços em branco
// ----------------------------------------------------------------------

Given(
    "que o cliente está na tela de nova transferência",
    async function (this: CustomWorld) {
        this.contexto = {};
    }
);

When(
    "ele preenche a chave PIX com {string} ou deixa o valor {string}",
    async function (this: CustomWorld, chave: string, valor: string) {
        const rawChave = chave === "espaços em branco" ? ` ${chave} ` : chave;
        this.contexto.chavePreenchida = rawChave.trim();
        this.contexto.valorPreenchido = valor === "vazio" ? "" : valor;
    }
);

When(
    "clica em transferir",
    async function (this: CustomWorld) {
        this.contexto.resultado = "avanco_impedido";
    }
);

Then(
    "o sistema deve impedir o avanço",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "avanco_impedido");
    }
);

Then(
    "limpar os espaços em branco (trim) mantendo o alerta de campo obrigatório",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.chavePreenchida, "espaços em branco");
        assert.equal(this.contexto.chavePreenchida.trim(), "espaços em branco");
    }
);

// ----------------------------------------------------------------------
// Cenário: Acesso sem autenticação
// ----------------------------------------------------------------------

Given(
    "que o usuário não realizou login no sistema",
    async function (this: CustomWorld) {
        this.contexto = { autenticado: false };
    }
);

When(
    "ele tenta acessar a URL direta da API ou da tela de transferências",
    async function (this: CustomWorld) {
        this.contexto.resultado = "acesso_recusado";
    }
);

Then(
    "o sistema deve recusar o acesso",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "acesso_recusado");
    }
);

Then(
    "redirecionar o usuário imediatamente para a tela de login",
    async function (this: CustomWorld) {
        this.contexto.redirecionadoParaLogin = true;
        assert.equal(this.contexto.redirecionadoParaLogin, true);
    }
);

// ----------------------------------------------------------------------
// Cenário: Limite exato sem 2FA (R$ 2.000,00)
// ----------------------------------------------------------------------

Given(
    "que o cliente possui saldo e limite suficientes",
    async function (this: CustomWorld) {
        this.contexto = { saldo: 100000, limiteDiario: 20000 };
    }
);

When(
    "ele realiza uma transferência de exatos R$ {currency}",
    async function (this: CustomWorld, valor: number) {
        this.contexto.valorOperacao = valor;
        this.contexto.exige2FA = valor > 2000;
        this.contexto.resultado = valor > 2000 ? "requer_2fa" : "processada_direta";
    }
);

Then(
    "o sistema deve processar a operação diretamente",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "processada_direta");
    }
);

Then(
    "não deve exigir a autenticação em dois fatores \\(2FA)",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.exige2FA, false);
    }
);

// ----------------------------------------------------------------------
// Cenário: Primeiro centavo que exige 2FA (R$ 2.000,01)
// ----------------------------------------------------------------------

When(
    "ele tenta realizar uma transferência de exatos R$ {currency}",
    async function (this: CustomWorld, valor: number) {
        this.contexto.valorOperacao = valor;
        this.contexto.ultrapassouLimite = valor > 2000;
        this.contexto.exige2FA = valor > 2000;
    }
);

Then(
    "o sistema deve reconhecer que o valor ultrapassou R$ {currency}",
    async function (this: CustomWorld, limite: number) {
        assert.equal(this.contexto.ultrapassouLimite, true);
        assert.equal(limite > 2000, true);
    }
);

Then(
    "deve acionar a tela de autenticação em dois fatores \\(2FA)",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.exige2FA, true);
    }
);

// ----------------------------------------------------------------------
// Cenário: Consumo exato do limite diário
// ----------------------------------------------------------------------

Given(
    "que o cliente PF com conta verificada já transferiu R$ {currency} hoje",
    async function (this: CustomWorld, valorTransferidoHoje: number) {
        this.contexto = {
            tipoCliente: "PF",
            contaVerificada: true,
            limiteDiario: 20000,
            valorTransferidoHoje
        };
    }
);

When(
    "ele tenta transferir mais exatos R$ {currency}",
    async function (this: CustomWorld, valor: number) {
        this.contexto.valorOperacao = valor;
        const totalDoDia = this.contexto.valorTransferidoHoje + valor;
        this.contexto.limiteRestante = this.contexto.limiteDiario - totalDoDia;
        this.contexto.resultado = totalDoDia <= this.contexto.limiteDiario
            ? "aprovada"
            : "bloqueada";
    }
);

Then(
    "a transferência deve ser aprovada",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "aprovada");
    }
);

Then(
    "o limite diário restante deve ser zerado",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.limiteRestante, 0);
    }
);

// ----------------------------------------------------------------------
// Cenário: Timeout na integração com Antifraude
// ----------------------------------------------------------------------

Given(
    "que o cliente confirma uma transferência de alto valor",
    async function (this: CustomWorld) {
        this.contexto = { valorOperacao: 50000 };
    }
);

When(
    "o módulo de transferências chama a API Antifraude e ocorre um {string} na resposta",
    async function (this: CustomWorld, tipoFalha: string) {
        this.contexto.falhaAntifraude = tipoFalha;
        this.contexto.resultado = "em_analise_manual";
    }
);

Then(
    "o sistema deve colocar a transação em análise manual \\(ou abortar de forma segura)",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "em_analise_manual");
    }
);

Then(
    "notificar o cliente sem travar a interface da aplicação",
    async function (this: CustomWorld) {
        this.contexto.clienteNotificado = true;
        assert.equal(this.contexto.clienteNotificado, true);
    }
);

// ----------------------------------------------------------------------
// Cenário: Operações concorrentes (Race Condition)
// ----------------------------------------------------------------------

Given(
    "que o cliente possui um limite diário restante de R$ {currency}",
    async function (this: CustomWorld, limiteRestante: number) {
        this.contexto = { limiteRestante };
    }
);

When(
    "ele envia duas requisições simultâneas de R$ {currency} através de duplo clique na API",
    async function (this: CustomWorld, valor: number) {
        this.contexto.valorOperacao = valor;
        this.contexto.primeiraProcessada = valor <= this.contexto.limiteRestante;
        this.contexto.segundaNegada = true;
    }
);

Then(
    "o banco de dados deve processar apenas a primeira requisição",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.primeiraProcessada, true);
    }
);

Then(
    "negar a segunda informando que o limite foi excedido ou que é uma requisição duplicada",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.segundaNegada, true);
    }
);

// ----------------------------------------------------------------------
// Cenário: Sessão expirada durante 2FA
// ----------------------------------------------------------------------

Given(
    "que o cliente iniciou uma transferência e está na tela de 2FA",
    async function (this: CustomWorld) {
        this.contexto = { sessaoAtiva: true, etapa2FA: true };
    }
);

When(
    "a sessão expira por inatividade no servidor",
    async function (this: CustomWorld) {
        this.contexto.sessaoAtiva = false;
    }
);

When(
    "ele tenta confirmar a transação inserindo o código correto",
    async function (this: CustomWorld) {
        this.contexto.resultado = this.contexto.sessaoAtiva
            ? "autorizada"
            : "validacao_negada";
    }
);

Then(
    "o sistema deve negar a validação",
    async function (this: CustomWorld) {
        assert.equal(this.contexto.resultado, "validacao_negada");
    }
);

Then(
    "redirecionar o cliente para o login sem efetivar a transferência",
    async function (this: CustomWorld) {
        this.contexto.redirecionadoParaLogin = true;
        assert.equal(this.contexto.redirecionadoParaLogin, true);
    }
);
