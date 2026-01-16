export const generalUseTemplate = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email de Teste</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, Helvetica, sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8; padding: 20px 0;">
            <tr>
            <td align="center">

                <!-- Container -->
                <table width="600" cellpadding="0" cellspacing="0"
                style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

                <!-- Header -->
                <tr>
                    <td style="background-color: #1e293b; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">
                        API - Service
                    </h1>
                    </td>
                </tr>

                <!-- Conteúdo -->
                <tr>
                    <td style="padding: 30px;">
                    <h2 style="color: #1e293b; margin-top: 0;">
                        E-mail de teste 📧
                    </h2>

                    <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                        Olá,
                    </p>

                    <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                        Este é um e-mail de teste enviado pela plataforma <strong>API - Service</strong>.
                        Ele tem como objetivo validar o funcionamento do módulo de envio de e-mails,
                        bem como a correta renderização do template em diferentes clientes de e-mail.
                    </p>

                    <!-- Card informativo -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                        style="background-color: #f8fafc; border-radius: 6px; margin: 20px 0; padding: 15px;">
                        <tr>
                        <td style="color: #334155; font-size: 14px;">
                            <strong>Tipo de mensagem:</strong> E-mail de teste
                        </td>
                        </tr>
                        <tr>
                        <td style="color: #334155; font-size: 14px; padding-top: 8px;">
                            <strong>Origem:</strong> Módulo de E-mail
                        </td>
                        </tr>
                        <tr>
                        <td style="color: #334155; font-size: 14px; padding-top: 8px;">
                            <strong>Plataforma:</strong> API - Service
                        </td>
                        </tr>
                        <tr>
                        <td style="color: #334155; font-size: 14px; padding-top: 8px;">
                            <strong>Status:</strong> Envio realizado com sucesso
                        </td>
                        </tr>
                    </table>

                    <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                        Se você recebeu este e-mail, significa que a configuração do serviço de envio
                        está funcionando corretamente.
                    </p>

                    <!-- Botão -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="#"
                        style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 15px; display: inline-block;">
                        Acessar API - Service
                        </a>
                    </div>

                    <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
                        Este é um e-mail automático. Não é necessário respondê-lo.
                    </p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color: #f1f5f9; padding: 15px; text-align: center;">
                    <p style="color: #64748b; font-size: 12px; margin: 0;">
                        © 2026 API - Service • Todos os direitos reservados
                    </p>
                    </td>
                </tr>

                </table>
            </td>
            </tr>
        </table>

        </body>
        </html>
        `;
