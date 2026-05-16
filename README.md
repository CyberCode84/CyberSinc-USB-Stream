# CyberSinc USB Stream (H-Performance Transmissor)

Este projeto é um transmissor de espelhamento de tela de ultra-baixa latência projetado para jogos competitivos (60 FPS), estruturado para **Cordova/VoltBuilder**.

## Otimizações de Gaming (FPS)

- **60 FPS Estáveis**: Configurado via `MediaFormat.KEY_FRAME_RATE`.
- **Zero Latency Engine**: Implementa `MediaFormat.KEY_LATENCY` como 0 e `AVCProfileBaseline` para processamento imediato.
- **Hardware Direct Rendering**: Captura direta da GPU via `MediaProjection` ligada ao `inputSurface` do `MediaCodec`.
- **USB AOA Spitter**: Injeção direta de bytes H.264 no barramento USB sem buffering adicional.

## Estrutura de Arquivos

- `config.xml`: ID `com.cybersinc.usbstream`, nome 'CyberSinc USB Stream'.
- `native/src/android/UsbEncoderPlugin.java`: O core nativo otimizado em Java.
- `native/www/CyberSinc.js`: Ponte de comunicação JavaScript.
- `src/App.tsx`: Interface React focada em performance e status em tempo real.

## Como Usar no Receptor (TV Box)
O receptor deve abrir um servidor H.264 escutando a porta USB no modo Accessory e decodificar o stream raw usando aceleração de hardware.
