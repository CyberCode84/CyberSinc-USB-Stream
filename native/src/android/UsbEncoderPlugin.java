package com.cybersinc.usbstream;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.hardware.usb.UsbAccessory;
import android.hardware.usb.UsbManager;
import android.media.MediaCodec;
import android.media.MediaCodecInfo;
import android.media.MediaFormat;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.ParcelFileDescriptor;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.Surface;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;

/**
 * UsbEncoderPlugin: Optimized for 60FPS High-Action Gaming (FPS).
 * Implements Low-Latency H.264 Encoding and USB AOA Streaming.
 */
public class UsbEncoderPlugin extends CordovaPlugin {

    private static final int SCREEN_RECORD_REQUEST_CODE = 2002;
    private MediaProjectionManager projectionManager;
    private MediaProjection mediaProjection;
    private VirtualDisplay virtualDisplay;
    private MediaCodec encoder;
    private Surface inputSurface;
    private UsbManager usbManager;
    private ParcelFileDescriptor usbFileDescriptor;
    private FileOutputStream usbOutputStream;
    
    private CallbackContext startCallbackContext;
    private boolean isTransmitting = false;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        // Ensure managers are initialized here
        Activity activity = cordova.getActivity();
        if (projectionManager == null) {
            projectionManager = (MediaProjectionManager) activity.getSystemService(Context.MEDIA_PROJECTION_SERVICE);
        }
        if (usbManager == null) {
            usbManager = (UsbManager) activity.getSystemService(Context.USB_SERVICE);
        }

        if (action.equals("startStreaming")) {
            this.startCallbackContext = callbackContext;
            startScreenCapture();
            return true;
        } else if (action.equals("stopStreaming")) {
            stopTransmission();
            callbackContext.success("Stream paralisada.");
            return true;
        }
        return false;
    }

    private void startScreenCapture() {
        UsbAccessory[] accessories = usbManager.getAccessoryList();
        if (accessories == null || accessories.length == 0) {
            startCallbackContext.error("Erro: Conecte o cabo USB ao receptor (AOA).");
            return;
        }

        usbFileDescriptor = usbManager.openAccessory(accessories[0]);
        if (usbFileDescriptor == null) {
            startCallbackContext.error("Erro: Falha na permissão USB ou dispositivo ocupado.");
            return;
        }
        usbOutputStream = new FileOutputStream(usbFileDescriptor.getFileDescriptor());

        Intent permissionIntent = projectionManager.createScreenCaptureIntent();
        cordova.startActivityForResult(this, permissionIntent, SCREEN_RECORD_REQUEST_CODE);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == SCREEN_RECORD_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK) {
                mediaProjection = projectionManager.getMediaProjection(resultCode, data);
                setupHighPerformanceEncoder();
            } else {
                startCallbackContext.error("Permissão de tela negada.");
            }
        }
    }

    private void setupHighPerformanceEncoder() {
        try {
            DisplayMetrics metrics = new DisplayMetrics();
            cordova.getActivity().getWindowManager().getDefaultDisplay().getRealMetrics(metrics);
            int width = metrics.widthPixels;
            int height = metrics.heightPixels;
            int density = metrics.densityDpi;

            // PERFORMANCE TUNING: H.264 optimized for direct hardware rendering
            MediaFormat format = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, width, height);
            
            // 1. Profile Baseline: Fastest decoding, lowest delay
            format.setInteger(MediaFormat.KEY_PROFILE, MediaCodecInfo.CodecCapabilities.AVCProfileBaseline);
            format.setInteger(MediaFormat.KEY_LEVEL, MediaCodecInfo.CodecCapabilities.AVCLevel4);
            
            // 2. High Bitrate for High-Action Games (8Mbps to avoid blocking)
            format.setInteger(MediaFormat.KEY_BIT_RATE, 8000000); 
            
            // 3. 60 FPS Support
            format.setInteger(MediaFormat.KEY_FRAME_RATE, 60);
            format.setInteger(MediaFormat.KEY_CAPTURE_RATE, 60);
            
            // 4. Zero Latency Flags
            format.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1); // Frequent keyframes for sync
            format.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface);
            
            // 5. Advanced Low Latency (Android 11+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                format.setInteger(MediaFormat.KEY_LOW_LATENCY, 1);
            }

            encoder = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC);
            
            // Force ultra-low latency properties
            Bundle params = new Bundle();
            params.putInt("vendor.rtc-ext-dec-low-latency.enable", 1); // Proprietary flag for some chipsets
            
            encoder.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
            inputSurface = encoder.createInputSurface();
            encoder.start();

            // VIRTUAL DISPLAY: Direct link from screen to encoder
            virtualDisplay = mediaProjection.createVirtualDisplay("CyberSincDrive",
                    width, height, density,
                    DisplayManager.VIRTUAL_DISPLAY_FLAG_PUBLIC,
                    inputSurface, null, null);

            isTransmitting = true;
            
            cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    drainEncoderLoop();
                }
            });

            startCallbackContext.success("CyberSinc Ativo: 60FPS");

        } catch (IOException e) {
            startCallbackContext.error("Hardware Codec Error: " + e.getMessage());
        }
    }

    private void drainEncoderLoop() {
        MediaCodec.BufferInfo bufferInfo = new MediaCodec.BufferInfo();
        while (isTransmitting) {
            int outputBufferIndex = encoder.dequeueOutputBuffer(bufferInfo, 0); // No wait for max speed
            if (outputBufferIndex >= 0) {
                ByteBuffer outputBuffer = encoder.getOutputBuffer(outputBufferIndex);
                
                byte[] outData = new byte[bufferInfo.size];
                outputBuffer.get(outData);

                try {
                    // Direct Injection to USB Output Stream
                    usbOutputStream.write(outData);
                } catch (IOException e) {
                    isTransmitting = false;
                }

                encoder.releaseOutputBuffer(outputBufferIndex, false);
            } else if (outputBufferIndex == MediaCodec.INFO_TRY_AGAIN_LATER) {
                // Yield thread briefly if no data
                try { Thread.sleep(1); } catch (InterruptedException ignored) {}
            }
        }
    }

    private void stopTransmission() {
        isTransmitting = false;
        if (virtualDisplay != null) {
            virtualDisplay.release();
            virtualDisplay = null;
        }
        if (encoder != null) {
            try {
                encoder.stop();
                encoder.release();
            } catch (Exception ignored) {}
            encoder = null;
        }
        if (mediaProjection != null) {
            mediaProjection.stop();
            mediaProjection = null;
        }
        try {
            if (usbOutputStream != null) usbOutputStream.close();
            if (usbFileDescriptor != null) usbFileDescriptor.close();
        } catch (IOException ignored) {}
    }
}
