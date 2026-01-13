import { useEffect, useRef, useState } from "react";

//볼륨 측정
export const useVolume = (active: boolean) => {
  const [volume, setVolume] = useState(0);
  const rafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!active) return;

    let analyser: AnalyserNode;
    let dataArray: Uint8Array;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;

      dataArray = new Uint8Array(analyser.fftSize);
      source.connect(analyser);

      const checkVolume = () => {
        analyser.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += Math.abs(dataArray[i] - 128);
        }

        // ✅ 평균 진폭 계산 (0 ~ 128 범위)
        const avgAmplitude = sum / dataArray.length;
        
        // ✅ 0~100 범위로 정규화
        // 실제 말소리는 보통 10~50 정도, 큰 소리는 50~80
        // 128을 100으로 매핑 (비율 조정 가능)
        const normalizedVolume = Math.min(100, Math.round((avgAmplitude / 128) * 200));
        
        setVolume(normalizedVolume);
        rafRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    }).catch(err => {
      console.error("마이크 접근 실패:", err);
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      
      // ✅ 스트림 정리 (마이크 해제)
      streamRef.current?.getTracks().forEach(track => track.stop());
      
      audioContextRef.current?.close();
    };
  }, [active]);

  return volume;
};