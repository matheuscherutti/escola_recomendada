# 📖 Manual de Uso do Aplicativo — Escolas Parceiras
### Sistema Escola Recomendada — Guia de Operação Direta

Este manual detalha o passo a passo de como operar as telas e funções do aplicativo. O sistema foi desenvolvido para ser direto e intuitivo, permitindo que a sua escola gerencie a jornada de treinamento dos alunos de forma autônoma.

---

## 🔑 1. Acesso ao Sistema e Painel Geral

### Como fazer Login
1. Acesse o endereço da plataforma fornecido pela coordenação da Empresa.
2. Insira suas credenciais corporativas:
    *   **E-mail**: O seu endereço de e-mail cadastrado na escola parceira.
    *   **Senha**: A sua senha de acesso seguro.
3. Clique em **Entrar**.

> [!NOTE]
> Caso esqueça a sua senha ou precise de uma nova conta de acesso, entre em contato com a equipe de TI da Empresa administradora.

### Visão Geral do Menu (Sidebar)
O menu lateral esquerdo exibe os seguintes itens de navegação rápida:
*   **Logo da Escola**: Identificação da escola logada.
*   **Dashboard**: Resumo geral e indicadores da escola.
*   **Nossos Candidatos**: Lista completa de alunos associados à sua instituição.
*   **Solicitar Validação**: Atalho para cadastrar novos alunos.
*   **Sino de Alertas (🔔)**: Central de notificações em tempo real.

---

## 📝 2. Passo a Passo: Cadastrar um Novo Aluno

Antes de iniciar qualquer treinamento, o candidato deve ser validado pela Empresa administradora.

```
+-------------------------------------------------------------+
| SOLICITAR VALIDAÇÃO DE CANDIDATO                            |
+-------------------------------------------------------------+
| Nome Completo:                                              |
| [ Ex: João da Silva               ]                         |
|                                                             |
| Registro de Empregado (RE):                                 |
| [ RE-9923                         ]                         |
|                                                             |
| Licença ANAC:                                               |
| [ ANAC-12345                      ]                         |
|                                                             |
|                  [ Cancelar ] [ Enviar para Validação ]     |
+-------------------------------------------------------------+
```

### Passo a passo:
1. No canto superior direito do Dashboard, clique no botão **`+ Novo Candidato`** (ou acesse "Solicitar Validação" no menu lateral).
2. Preencha os campos obrigatórios com atenção:
    *   **Nome Completo**: Nome completo do aluno (sem abreviações).
    *   **Registro de Empregado (RE)**: O código identificador único do funcionário na empresa.
    *   **Licença ANAC**: Número de registro da licença ANAC do candidato.
3. Clique em **Enviar para Validação**.
4. **O que acontece em seguida?**
    *   O aluno é registrado com o status `Aguardando Validação` (Badge em **Amarelo**).
    *   A Empresa é notificada imediatamente para analisar o cadastro.
    *   Você receberá um alerta assim que a Empresa aprovar ou recusar o candidato.

---

## 📚 3. Passo a Passo: Atualizar Progresso e Enviar Certificados

Quando a Empresa aprova o cadastro inicial, o aluno é transicionado para o status `Em Treinamento` (Badge em **Azul**) e fica visível na sua lista de alunos ativos.

Cada candidato precisa concluir obrigatoriamente três módulos: **Teórico**, **Simulador** e **Voo**.

```
+--------------------------------------------------------------------------+
| Roberto Alencar  (RE-1092 | ANAC-99281)                                  |
|                                                                          |
| Progresso do Curso: [██████████████████████████████████] 100%            |
|                                                                          |
| +--------------------+   +--------------------+   +--------------------+ |
| |   📚 TEÓRICO       |   |   🎮 SIMULADOR     |   |   ✈️ VOO           | |
| | Concluído e Valid. |   | Aguarda Validação  |   |    Pendente        | |
| | (05/07 - Verde)    |   | (10/07 - Amarelo)  |   | (Não Iniciado-Cinza| |
| +--------------------+   +--------------------+   +--------------------+ |
+--------------------------------------------------------------------------+
```

### Como anexar o certificado de um módulo concluído:
1. Localize o card do aluno na lista de treinamento do seu Dashboard.
2. Identifique o módulo desejado e clique no botão **`Anexar [Nome do Módulo]`** (ou clique no bloco do módulo caso queira substituir).
3. Uma janela suspensa (Drawer lateral) será aberta:
    *   **Data de Conclusão**: Selecione o dia exato em que o treinamento daquele módulo foi finalizado.
    *   **Certificado**: Faça o upload do arquivo oficial de comprovação (Formatos aceitos: **PDF**, **PNG** ou **JPG** com tamanho máximo de **5MB**).
4. Clique em **Salvar Alterações**.

### Entendendo os status dos módulos por cores:
*   ⚪ **Cinza (Não Iniciado)**: O treinamento ainda não começou ou o certificado não foi anexado.
*   🟡 **Amarelo (Aguardando Validação)**: O certificado foi anexado pela escola e está sob auditoria da Empresa.
*   🟢 **Verde (Concluído)**: O certificado foi validado com sucesso pela equipe da Empresa. O card do módulo passará a exibir a data de conclusão e o nome da escola parceira que realizou o treinamento (ex: "Aeroclube Eldorado do Sul").
*   🔴 **Vermelho (Recusado)**: O certificado foi rejeitado pelo revisor. Acesse a notificação para ler a justificativa (ex: arquivo ilegível, data incorreta), corrija o documento e faça um novo upload.

---

## 🎓 4. Conclusão do Curso e Acompanhamento de Seleção

### Graduação do Candidato
Quando todos os 3 módulos (Teórico, Simulador e Voo) estiverem marcados em **Verde (Concluído)**, o sistema altera automaticamente o status geral do aluno para `Curso Concluído`. O aluno sai do painel de treinamento ativo e é movido para o histórico de "Cursos Concluídos".

### Acompanhamento do Processo Seletivo (Pós-Treinamento)
Após a formação do candidato, a Empresa administradora inicia a etapa de recrutamento interno. A sua escola pode acompanhar se os seus formados estão avançando no processo através do campo **Status de Seleção** no histórico:

*   **Não Chamado**: O aluno concluiu o treinamento, mas ainda não foi convocado pela Empresa.
*   **Chamado para Processo Seletivo**: O aluno foi oficialmente convocado para a etapa de seleção/exames Admissionais da Empresa.
*   **Finalizou - Não Cadastrado**: O aluno completou o processo, mas não teve o seu cadastro efetivado no quadro da Empresa (por desistência ou outro motivo).

---

## 🔔 5. Central de Alertas e Notificações

No canto superior direito, ao lado do nome do seu perfil, está o ícone do **Sino de Alertas**. Sempre que houver uma ação da Empresa que exija sua atenção, uma notificação com indicador numérico aparecerá:

*   **Tipos de Alerta**:
    *   Aprovação/Recusa de novos candidatos cadastrados.
    *   Aprovação/Recusa de certificados enviados para triagem.
    *   Chamados para processos seletivos dos alunos formados da sua escola.
*   **Como visualizar**:
    1. Clique no **Sino de Alertas**.
    2. Leia as notificações recentes.
    3. As notificações não lidas aparecem destacadas. Clique sobre uma notificação para marcar como lida.

---

## ❓ 6. FAQ — Resolução de Dúvidas Rápidas

#### O sistema acusa que o RE ou ANAC do candidato já existe. O que fazer?
> Cada candidato possui RE e ANAC únicos no banco de dados. Caso o sistema apresente erro de duplicidade, verifique se o candidato já foi cadastrado anteriormente por outro usuário da sua escola ou se os números digitados contêm algum erro de digitação.

#### Meu upload de arquivo falhou. Qual o motivo?
> O sistema aceita apenas arquivos com formatos **PDF**, **PNG** ou **JPG**, e tamanho inferior a **5MB**. Certifique-se de que o arquivo não está corrompido e atende a estes requisitos.

#### Um certificado foi rejeitado. O que faço agora?
> No painel de treinamento, o módulo voltará a exibir o status **Vermelho**. Clique no módulo para abrir o Drawer, leia o motivo da recusa indicado pela Empresa, realize as correções necessárias no documento e faça o upload do novo arquivo correto.
