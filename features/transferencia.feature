Feature: Operações de Transferência Financeira
 Como um cliente do banco
 Eu quero poder realizar transferências PIX e TED com segurança
 Para que eu possa gerenciar meu dinheiro respeitando limites e regras de segurança


 @HappyPath @BusinessRule
 Scenario: Transferência PIX bem-sucedida sem necessidade de 2FA
   Given que o cliente Pessoa Física possui conta verificada e saldo suficiente
   And deseja realizar um PIX de R$ 1.500,00
   When ele confirma a transferência preenchendo todos os campos obrigatórios
   Then a transferência deve ser processada instantaneamente
   And o comprovante da operação deve ser gerado

 @HappyPath
 Scenario: Transferência TED no horário bancário com campos opcionais
   Given que o cliente Pessoa Jurídica possui saldo de R$ 5.000,00
   And o dia atual é um dia útil às 14h00
   When ele realiza um TED de R$ 1.000,00 preenchendo a "descrição" opcional
   Then a transferência deve ser processada no mesmo dia


 @HappyPath @Integration
 Scenario: Autenticação em dois fatores (2FA) concluída com sucesso
   Given que o cliente solicita uma transferência PIX de R$ 2.500,00
   And o sistema integra com o serviço de mensageria para envio do token
   When ele insere o código 2FA corretamente no prompt
   Then a transferência deve ser autorizada e deduzida do saldo


 @HappyPath @BusinessRule
 Scenario: Agendamento de TED para data futura
   Given que o cliente deseja transferir R$ 500,00 via TED
   And seleciona uma data útil futura para o agendamento
   When ele confirma a operação
   Then o sistema deve salvar o agendamento
   And não deve descontar o saldo no momento da criação


 @HappyPath @EdgeCase
 Scenario: Cancelamento de agendamento no limite do prazo
   Given que o cliente possui um TED agendado para o dia 15
   When ele solicita o cancelamento do agendamento às 23h59 do dia 14
   Then o sistema deve cancelar a operação com sucesso


 @HappyPath @EdgeCase @BusinessRule
 Scenario: Transferência exata no limite para chave PIX recente
   Given que o cliente possui uma chave PIX de destino cadastrada há 10 horas
   When ele tenta transferir exatamente R$ 1.000,00
   Then a transferência deve ser aprovada sem bloqueios


 @NegativePath @BusinessRule
 Scenario: Bloqueio imediato por saldo insuficiente
   Given que o cliente possui saldo de R$ 2.500,00
   When ele tenta realizar uma transferência de R$ 3.000,00
   Then o sistema deve bloquear completamente a operação
   And exibir uma mensagem de erro indicando saldo insuficiente


 @NegativePath @BusinessRule
 Scenario: Tentativa de TED fora do horário bancário
   Given que o horário atual é 18h00 de um dia útil
   When o cliente tenta realizar um TED de qualquer valor
   Then o sistema deve impedir a execução imediata
   And sugerir o agendamento para o próximo dia útil


 @NegativePath
 Scenario: Restrição por pendência cadastral
   Given que a conta do cliente possui uma pendência cadastral
   When ele tenta acessar a funcionalidade de transferências
   Then o sistema deve bloquear o acesso
   And exibir um alerta orientando a regularização do cadastro


 @NegativePath
 Scenario: Falha na validação do 2FA
   Given que o cliente está na etapa de 2FA para um PIX de R$ 3.000,00
   When ele insere um código de verificação inválido
   Then o sistema não deve processar a transferência
   And deve exibir um alerta de código incorreto


 @NegativePath @EdgeCase
 Scenario: Cancelamento de agendamento no dia da execução
   Given que o cliente possui um TED agendado para a data de hoje
   When ele tenta realizar o cancelamento da operação
   Then o sistema deve negar a solicitação
   And informar que cancelamentos só ocorrem até um dia antes


 @NegativePath @BusinessRule
 Scenario: Bloqueio da funcionalidade após 3 senhas incorretas
   Given que o cliente errou a senha de transferência 2 vezes
   When ele insere a senha incorreta pela 3ª vez consecutiva
   Then a funcionalidade deve ser bloqueada
   And o bloqueio deve permanecer ativo por exatos 30 minutos


 @NegativePath @InferredScenario
 Scenario: Validação de campos vazios e espaços em branco
   Given que o cliente está na tela de nova transferência
   When ele preenche a chave PIX com "espaços em branco" ou deixa o valor "vazio"
   And clica em transferir
   Then o sistema deve impedir o avanço
   And limpar os espaços em branco (trim) mantendo o alerta de campo obrigatório


 @NegativePath
 Scenario: Acesso à rota de transferência sem autenticação
   Given que o usuário não realizou login no sistema
   When ele tenta acessar a URL direta da API ou da tela de transferências
   Then o sistema deve recusar o acesso
   And redirecionar o usuário imediatamente para a tela de login


 @EdgeCase @InferredScenario
 Scenario: Transferência exatamente no limite sem 2FA (R$ 2.000,00)
   Given que o cliente possui saldo e limite suficientes
   When ele realiza uma transferência de exatos R$ 2.000,00
   Then o sistema deve processar a operação diretamente
   And não deve exigir a autenticação em dois fatores (2FA)


 @EdgeCase
 Scenario: Transferência no primeiro centavo que exige 2FA (R$ 2.000,01)
   Given que o cliente possui saldo e limite suficientes
   When ele tenta realizar uma transferência de exatos R$ 2.000,01
   Then o sistema deve reconhecer que o valor ultrapassou R$ 2.000,00
   And deve acionar a tela de autenticação em dois fatores (2FA)


 @EdgeCase
 Scenario: Consumo exato do limite diário de conta verificada
   Given que o cliente PF com conta verificada já transferiu R$ 15.000,00 hoje
   When ele tenta transferir mais exatos R$ 5.000,00
   Then a transferência deve ser aprovada
   And o limite diário restante deve ser zerado


 @Integration @InferredScenario
 Scenario: Timeout na integração com o Sistema Antifraude
   Given que o cliente confirma uma transferência de alto valor
   When o módulo de transferências chama a API Antifraude e ocorre um "timeout" na resposta
   Then o sistema deve colocar a transação em análise manual (ou abortar de forma segura)
   And notificar o cliente sem travar a interface da aplicação


 @Integration @InferredScenario
 Scenario: Operações concorrentes (Race Condition)
   Given que o cliente possui um limite diário restante de R$ 5.000,00
   When ele envia duas requisições simultâneas de R$ 4.000,00 através de duplo clique na API
   Then o banco de dados deve processar apenas a primeira requisição
   And negar a segunda informando que o limite foi excedido ou que é uma requisição duplicada


 @Integration
 Scenario: Sessão expirada durante o processo de 2FA
   Given que o cliente iniciou uma transferência e está na tela de 2FA
   When a sessão expira por inatividade no servidor
   And ele tenta confirmar a transação inserindo o código correto
   Then o sistema deve negar a validação
   And redirecionar o cliente para o login sem efetivar a transferência