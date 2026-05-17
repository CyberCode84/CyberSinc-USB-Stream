package com.cybersinc.usbstream.receiver;

import android.app.Activity;
import android.content.Context;
import android.hardware.usb.UsbAccessory;
import android.hardware.usb.UsbManager;
import android.media.MediaCodec;
import android.media.MediaFormat;
import android.os.Bundle;
import android.os.ParcelFileDescriptor;
import android.view.Surface;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.ByteBuffer;

/**
 * UsbReceiverPlugin: Zero-Latency H.264 Receiver for Android TV / MXQ.
 * Decodes raw H.264 stream from USB AOA into a native SurfaceView.
 */
public class UsbReceiverPlugin extends CordovaPlugin {

    private UsbManager usbManager;
    private ParcelFileDescriptor usbFileDescriptor;
    private FileInputStream usbInputStream;
    private MediaCodec decoder;
    private SurfaceView surfaceView;
    private FrameLayout layout;
    
    private boolean isReceiving = false;
    private CallbackContext callbackContext;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("start")) {
            this.callbackContext = callbackContext;
            startReception();
            return true;
        } else if (action.equals("stop")) {
            stopReception();
            callbackContext.success("Recepção finalizada.");
            return true;
        }
        return false;
    }

    private void startReception() {
        Activity activity = cordova.getActivity();
        usbManager = (UsbManager) activity.getSystemService(Context.USB_SERVICE);

        // In AOA mode, the receiver app starts when the accessory is attached
        UsbAccessory[] accessories = usbManager.getAccessoryList();
        if (accessories == null || accessories.length == 0) {
            callbackContext.error("Nenhum transmissor USB detectado.");
            return;
        }

        usbFileDescriptor = usbManager.openAccessory(accessories[0]);
        if (usbFileDescriptor == null) {
            callbackContext.error("Falha ao abrir o barramento USB.");
            return;
        }
        usbInputStream = new FileInputStream(usbFileDescriptor.getFileDescriptor());

        // Run UI tasks on main thread
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                setupSurfaceAndDecoder();
            }
        });
    }

    private void setupSurfaceAndDecoder() {
        Activity activity = cordova.getActivity();
        
        // Create a SurfaceView for direct hardware rendering
        surfaceView = new SurfaceView(activity);
        layout = (FrameLayout) activity.findViewById(android.R.id.content);
        
        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 
                ViewGroup.LayoutParams.MATCH_PARENT);
        
        surfaceView.setLayoutParams(params);
        layout.addView(surfaceView);

        surfaceView.getHolder().addCallback(new SurfaceHolder.Callback() {
            @Override
            public void surfaceCreated(SurfaceHolder holder) {
                initDecoder(holder.getSurface());
            }

            @Override
            public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {}

            @Override
            public void surfaceDestroyed(SurfaceHolder holder) {
                stopReception();
            }
        });
    }

    private void initDecoder(Surface surface) {
        try {
            // High-Action Optimized Decoder (H.264 / AVC)
            MediaFormat format = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, 1920, 1080);
            
            decoder = MediaCodec.createDecoderByType(MediaFormat.MIMETYPE_VIDEO_AVC);
            decoder.configure(format, surface, null, 0);
            decoder.start();

            isReceiving = true;
            
            // Start decoding thread
            cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    decodeLoop();
                }
            });

            callbackContext.success("CyberSinc Receiver: Ready");
        } catch (IOException e) {
            callbackContext.error("Decoder Error: " + e.getMessage());
        }
    }

    private void decodeLoop() {
        ByteBuffer[] inputBuffers = decoder.getInputBuffers();
        MediaCodec.BufferInfo bufferInfo = new MediaCodec.BufferInfo();
        byte[] buffer = new byte[65536]; // Buffer for chunks

        while (isReceiving) {
            try {
                int bytesRead = usbInputStream.read(buffer);
                if (bytesRead > 0) {
                    int inputBufferIndex = decoder.dequeueInputBuffer(10000);
                    if (inputBufferIndex >= 0) {
                        ByteBuffer inputBuffer = inputBuffers[inputBufferIndex];
                        inputBuffer.clear();
                        inputBuffer.put(buffer, 0, bytesRead);
                        decoder.queueInputBuffer(inputBufferIndex, 0, bytesRead, System.currentTimeMillis() * 1000, 0);
                    }

                    int outputBufferIndex = decoder.dequeueOutputBuffer(bufferInfo, 0);
                    while (outputBufferIndex >= 0) {
                        decoder.releaseOutputBuffer(outputBufferIndex, true); // true = render to surface
                        outputBufferIndex = decoder.dequeueOutputBuffer(bufferInfo, 0);
                    }
                }
            } catch (IOException e) {
                isReceiving = false;
            }
        }
    }

    private void stopReception() {
        isReceiving = false;
        if (decoder != null) {
            try {
                decoder.stop();
                decoder.release();
            } catch (Exception ignored) {}
            decoder = null;
        }
        if (usbInputStream != null) {
            try { usbInputStream.close(); } catch (IOException ignored) {}
            usbInputStream = null;
        }
        if (usbFileDescriptor != null) {
            try { usbFileDescriptor.close(); } catch (IOException ignored) {}
            usbFileDescriptor = null;
        }
        if (surfaceView != null) {
            Activity activity = cordova.getActivity();
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (layout != null) layout.removeView(surfaceView);
                }
            });
        }
    }
}
