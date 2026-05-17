# CyberSinc USB Stream (H-Performance Transmissor)

Este projeto é um transmissor de espelhamento de tela de ultra-baixa latência projetado para jogos competitivos (60 FPS), estruturado para **Cordova/VoltBuilder**.

## Otimizações de Gaming (FPS)

- **60 FPS Estáveis**: Configurado via `MediaFormat.KEY_FRAME_RATE`.
- **Zero Latency Engine**: Implementa `MediaFormat.KEY_LATENCY` como 0 e `AVCProfileBaseline` para processamento imediato.
- **Hardware Direct Rendering**: Captura direta da GPU via `MediaProjection` ligada ao `inputSurface` do `MediaCodec`.
- **USB AOA Spitter**: Injeção direta de bytes H.264 no barramento USB sem buffering adicional.

## Estrutura do Projeto (Cordova Nativo)

- `/www/`: Contém a interface estática (HTML/JS) pura para evitar tela branca.
- `config.xml`: Arquivo de configuração mestre com permissões e IDs.
- `native/`: Plugin Cordova local contendo o código Java nativo de alta performance.
- `.github/workflows/android.yml`: Automação para gerar o APK automaticamente no GitHub.

## Automação (GitHub Actions)

Toda vez que você fizer um `git push` para este repositório, o GitHub irá:
1. Instalar o Java e Android SDK.
2. Instalar o Cordova.
3. Adicionar o plugin nativo local.
4. Gerar um APK assinado/não-assinado que pode ser baixado na aba **Actions** do seu GitHub.

## Como Usar no Receptor (TV Box)
O receptor deve abrir um servidor H.264 escutando a porta USB no modo Accessory e decodificar o stream raw usando aceleração de hardware.

