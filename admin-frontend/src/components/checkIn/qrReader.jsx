import React, { useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

const QrReader = ({ onScan, facingMode }) => {
  const videoId = 'qr-video';

  useEffect(() => {
    const qrCodeReader = new BrowserQRCodeReader(null, {
      delayBetweenScanAttempts: 300,
    });

    let controls = undefined;
    void qrCodeReader
      .decodeFromConstraints({ video: { facingMode } }, videoId, (result) => {
        if (result) onScan(result.getText());
      })
      .then((c) => {
        controls = c;
      });

    return () => {
      if (controls) {
        controls.stop();
      }
    };
  }, []);

  return (
    <section style={{ width: '100%', height: '100%', position: 'relative' }}>
      <section
        style={{
          width: '100%',
          paddingTop: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}>
        <div
          style={{
            top: 0,
            left: 0,
            zIndex: 1,
            boxSizing: 'border-box',
            border: '50px solid rgba(0, 0, 0, 0.3)',
            boxShadow: 'rgba(255, 0, 0, 0.5) 0px 0px 0px 5px inset',
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        />
        <video
          muted
          id={videoId}
          style={{
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            overflow: 'hidden',
            position: 'absolute',
            objectFit: 'cover',
            transform: facingMode === 'user' ? 'scaleX(-1)' : undefined,
          }}
        />
      </section>
    </section>
  );
};

export default QrReader;
