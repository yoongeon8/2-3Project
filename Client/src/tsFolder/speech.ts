import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export const useSpeechToText = () => {
    const {
      transcript,
      listening,
      browserSupportsSpeechRecognition,
      resetTranscript
    } = useSpeechRecognition();
  
    const start = () => {
      if (!browserSupportsSpeechRecognition){
        console.error("브라우저가 음성 인식을 지원하지 않습니다.");
        alert("이 브라우저는 음성인식을 지원하지 않습니다. chrome을 이용해주세요!!");
        return;
      }
      resetTranscript();
      try{
        SpeechRecognition.startListening({
          language: "ko-KR",
          continuous: false,
          interimResults: false
        });
        console.log("음성 인식 시작함!");
      } catch(err){
        console.error("음성 인식 실패함.", err);
      }
    };
  
    const stop = () => {
      try{
        SpeechRecognition.stopListening();
        console.log("음성 인식 중지함!");
      } catch(err){
        console.error("음성 인식 실패!", err);
      }
    };
  
    return {
      transcript,
      listening,
      browserSupportsSpeechRecognition,
      start,
      stop
    };
  };