import { useEffect, useRef, useState } from "react";

interface VolumeStats {
  current: number;  // 현재 볼륨
  max: number;      // 최대 볼륨
  average: number;  // 평균 볼륨
}

// 볼륨 측정
export const useVolume = (active: boolean) => {
  const [volume, setVolume] = useState(0);
  const [maxVolume, setMaxVolume] = useState(0);
  
  const rafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const volumeSamplesRef = useRef<number[]>([]);  // 볼륨 샘플 수집

  // 정리 함수
  const cleanup = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    if (!active) {
      cleanup();
      // 비활성화 시 볼륨 샘플 초기화
      volumeSamplesRef.current = [];
      setVolume(0);
      return;
    }

    let analyser: AnalyserNode;
    let dataArray: Uint8Array;
    let isActive = true;  // ✅ cleanup 시그널

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,  // 에코 제거
            noiseSuppression: true,   // 노이즈 제거
            autoGainControl: false    // 자동 게인 제어 비활성화 (볼륨 정확도)
          } 
        });

        if (!isActive) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.3;  // 스무딩(음성 인식 정확도) 추가

        dataArray = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);

        const checkVolume = () => {
          if (!isActive) return;

          analyser.getByteTimeDomainData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += Math.abs(dataArray[i] - 128);
          }

          // 평균 진폭 계산 (0 ~ 128 범위)
          const avgAmplitude = sum / dataArray.length;
          
          // avgAmplitude: 0~128
          // 조용할 때: ~5, 보통 말소리: 10~30, 큰 소리: 40+
          // 5단계로 매핑: 0(무음), 1(매우작음), 2(작음), 3(보통), 4(큼), 5(매우큼)
          let normalizedVolume = 0;
          
          if (avgAmplitude < 5) {
            normalizedVolume = 0;
          } else if (avgAmplitude < 15) {
            normalizedVolume = 1;
          } else if (avgAmplitude < 25) {
            normalizedVolume = 2;
          } else if (avgAmplitude < 35) {
            normalizedVolume = 3;
          } else if (avgAmplitude < 50) {
            normalizedVolume = 4;
          } else {
            normalizedVolume = 5;
          }
          
          setVolume(normalizedVolume);
          
          // 최대 볼륨 추적
          setMaxVolume(prev => Math.max(prev, normalizedVolume));
          
          // 볼륨 샘플 수집 (평균 계산용)
          volumeSamplesRef.current.push(normalizedVolume);
          
          // 샘플이 너무 많아지지 않도록 제한 (최근 100개)
          if (volumeSamplesRef.current.length > 100) {
            volumeSamplesRef.current.shift();
          }

          rafRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (err) {
        console.error("❌ 마이크 접근 실패:", err);
        alert("마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.");
      }
    };

    initAudio();

    return () => {
      isActive = false;
      cleanup();
    };
  }, [active]);

  // 평균 볼륨 계산
  const getAverageVolume = () => {
    if (volumeSamplesRef.current.length === 0) return 0;
    const sum = volumeSamplesRef.current.reduce((a, b) => a + b, 0);
    return Math.round(sum / volumeSamplesRef.current.length);
  };

  return {
    current: volume,      // 현재 실시간 볼륨
    max: maxVolume,       // 최대 볼륨
    average: getAverageVolume()  // 평균 볼륨
  };
};