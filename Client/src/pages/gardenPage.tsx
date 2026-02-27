import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import background1 from '../assets/background1.png';
import playerImg from '../assets/player-start-1.png';
import playerProfileImg from '../assets/player-start-profile.png';

import npc1_1 from '../assets/npc1-1.png'; 
import npc1_2 from '../assets/npc1-2.png'; 

import npc_profile1 from '../assets/npc-profile1.png';
import { createGlobalStyle } from 'styled-components';
import mic from '../assets/mic.png';
import playerbattle1 from '../assets/player-change-1.png';
import magic_stick from "../assets/magic-stick.png";
import player_change_1 from "../assets/player-change-1.png"; 

import {spells, failMic} from "../../../Server/src/tsFile/spells";
import {useSpeechToText} from "../tsFolder/speech";
import {useVolume} from "../tsFolder/audio";
import {createSpellJson} from "../../../Server/serverFile/damage";

export const SERVER_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "https://two-3project.onrender.com";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Cafe24ClassicType';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2210-2@1.0/Cafe24ClassicType-Regular.woff2')
      format('woff2');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
`;

const pulse = keyframes`
  0% { transform: scale(0.3); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
`;

const Container = styled.div<{ $bg: string }>`
  width: 100vw; height: 100vh;
  background-image: url(${props => props.$bg});
  background-size: cover; background-position: center;
  position: relative; overflow: hidden; cursor: pointer;
`;

const IntroOverlay = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%; height: 100%;
  display: flex; justify-content: center; align-items: center;
`;

const IntroText = styled.h1` color: white; font-size: 3rem; `;

const StandingCharacter = styled.img`
  position: absolute; bottom: 0; right: 10%; height: 85%; z-index: 5;
`;

const NpcCharacter2 = styled.img`
  position: absolute; bottom: 0; left: 10%; height: 85%; z-index: 0;
`;

// ✨ 마법봉 스타일: 화면 정중앙에 크게 배치
const ItemOverlay = styled.img`
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px; 
  z-index: 25; 
  pointer-events: none;
  filter: drop-shadow(0 0 30px rgba(255, 245, 131, 1));
`;

const DialogueSection = styled.div`
  position: absolute; bottom: 40px; left: 50%;
  transform: translateX(-50%); width: 95%;
  display: flex; align-items: stretch; z-index: 10;
`;

const ProfileWrapper = styled.div`
  width: 180px; height: 180px; border-radius: 5px;
  background: linear-gradient(54deg, #FF7CF2 -28.84%, #FFF583 91.73%);
  display: flex; justify-content: center; align-items: center; flex-shrink: 0; margin-right: 10px;
`;

const ProfileInner = styled.div`
  width: 100%; height: 100%; padding: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex; justify-content: center; align-items: center;
`;

const ProfileImage = styled.img<{ $scale?: number }>`
  width: 100%; height: 100%; transform: scale(${props => props.$scale ?? 1});
`;

const MessageBox = styled.div`
  flex-grow: 1; background-color: rgba(0, 0, 0, 0.2);
  border: 6px solid; border-image-source: linear-gradient(to right, #FFF583, #FF7CF2);
  border-image-slice: 1; padding: 30px; position: relative;
  display: flex; flex-direction: column; justify-content: center;
`;

const NameTag = styled.div`
  position: absolute; top: -70px; left: 0; padding: 3px 26px;
  color: #FF27AC; -webkit-text-stroke-width: 2px; -webkit-text-stroke-color: #FFF583;
  font-family: "Cafe24 ClassicType"; font-size: 40px;
`;

const DialogueText = styled.div<{ $speak: boolean }>`
  font-size: ${({ $speak }) =>
    $speak ? '2rem' : '1.5rem'};
  color: ${({ $speak }) =>
    $speak ? '#FFF583' : 'white'};
  line-height: 1.4;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-family: ${({ $speak }) =>
    $speak ? "'Cafe24ClassicType'" : 'inherit'};
`;

const SpeakOverlay = styled.div`
  position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 15;
`;

const SpeakMicWrapper = styled.div`
  position: absolute; top: 18%; left: 50%; transform: translateX(-50%);
  width: 150px; height: 150px; z-index: 20; display: flex; justify-content: center; align-items: center;
`;

const MicCircle = styled.div`
  width: 150px; height: 150px; border-radius: 50%;
  background: linear-gradient(180deg, #FF9A3B 0%, #FF27AC 100%);
  display: flex; justify-content: center; align-items: center;
`;

const MicImage = styled.img` width: 80px; height: 80px; `;

const PulseRing = styled.div`
  position: absolute; width: 100%; height: 100%; border-radius: 50%;
  background: rgba(255, 105, 180, 0.4); animation: ${pulse} 1.6s ease-out infinite;
`;

const GardenPage = () => {
  const navigate = useNavigate();

  const { transcript, listening, start, stop } = useSpeechToText(); // useSpeechToText 함수 변수
  const [step, setStep] = useState(1); // 
  const [currentLine, setCurrentLine] = useState(0); //
  const [battlePhase, setBattlePhase] = useState<'intro' | 'idle' | 'attack' | 'processing'>('intro'); //
  const [targetSpell, setTargetSpell] = useState("치링치링 샤랄라 나날이 예뻐지는 나 너무나도 소중해"); //스펠
  const [gameState, setGameState] = useState<'playing' | 'victory_end' | 'defeat_end'>('playing'); //게임 변화 상태
  const [battleText, setBattleText] = useState<string | null>(null); //
  const [isTransformed, setIsTransformed] = useState(false); //
  const [currentNpcImage, setCurrentNpcImage] = useState(() => Math.random() < 0.5 ? npc1_1 : npc1_2); // 

  const dialogues: { speaker: SpeakerKey; situation: string; text: string; }[] = [
    { speaker: 'player', situation: 'story', text: '학교가 사라지면 내가 좀 편해질까?' },
    { speaker: 'sebaschan', situation: 'story', text: '내가 도와줄까?' },
    { speaker: 'player', situation: 'story', text: '세바스찬? 말을 하는 세바스찬?' },
    { speaker: 'sebaschan', situation: 'story', text: '나는 세바스찬. 너의 말을 듣고 너를 도와주기 위해서 나타났어.' },
    { speaker: 'player', situation: 'story', text: '왜? 뭔가 수호령 같은 존재 아니었어? 왜 날 도와주려는 거야?' },
    { speaker: 'sebaschan', situation: 'story', text: '아니. 난 지금 학교에 불만이 많아. 왜냐하면 내 형제들이 맨날 미림의 부실한 관리로 인해서 왜가리들에게 먹혔다고..!' },
    { speaker: 'sebaschan', situation: 'story', text: '난 그런 학교를 용서 할 수 없어. 너를 도와줄게.' },
    { speaker: 'sebaschan', situation: 'story', text: '자 이건 선물이야. 이걸 이용하면 학교를 폭파시키는데 도움이 될 거야. 마법소녀로 변신할 수 있어.' }, 
    { speaker: 'player', situation: 'story', text: '마법소녀? 그 애니에서만 나오던 거??' },
    { speaker: 'sebaschan', situation: 'story', text: '변신 주문은 “치링치링 샤랄라 나날이 예뻐지는 나. 너무나도 소중해”라고 마법봉을 들고 외치면 돼!' },
    { speaker: 'player', situation: 'speak', text: '치링치링 샤랄라 나날이 예뻐지는 나. 너무나도 소중해' }, 
    { speaker: 'player', situation: 'story', text: '뭐야 교복에서 빛이 나잖아!' },
    { speaker: 'sebaschan', situation: 'story', text: '맞아. 이제 넌 마법소녀의 힘을 얻었어. 이 힘으로 학교를 폭파 시키자!' },
    { speaker: 'player', situation: 'story', text: '알겠어! 가보자!' },
  ];

  const speakerConfig = {
    player: { name: "미림이", profile: playerProfileImg },
    sebaschan: { name: '세바스찬', profile: npc_profile1 },
  }as const;

  type SpeakerKey = keyof typeof speakerConfig;

  const currentDialogue = dialogues[currentLine];
  const isSpeak = currentDialogue.situation === 'speak';
  const showMic = isSpeak && battlePhase === 'attack';
  const [isRecording, setIsRecording] = useState(false);

  const volume = useVolume(showMic && listening);
  const transcriptRef = useRef("");

  if (!currentDialogue) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep(2);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentDialogue.situation === 'speak') {
      setBattlePhase('idle');
    }
  }, [currentLine]);

  useEffect(() => {
    if(battlePhase === 'idle' && currentDialogue.situation === 'speak'){
      setBattleText(null);
      transcriptRef.current = "";
      setBattlePhase('attack');
      setIsRecording(true);
      start();
    }
  }, [battlePhase, currentDialogue.situation]);

  useEffect(() => {
    if(transcript){
      transcriptRef.current = transcript;
      console.log("현재 인식된 내용 : ", transcript);
    }
  }, [transcript]);

  const handleVoiceEnd = async () => {
    const finaltranscript = transcriptRef.current;

    if (!finaltranscript) {
      const sebaschanDialogues = failMic[Math.floor(Math.random() * failMic.length)];
      console.log('인식된 내용이 없습니다.');
      setBattlePhase('idle');
      setBattleText(sebaschanDialogues);
      return;
    }

    console.log("목표 주문:", targetSpell);
    console.log("최종 인식된 주문:", finaltranscript);

    const sendData = createSpellJson(targetSpell, finaltranscript, volume);
    
    try {
      setBattlePhase('processing');

      const res = await fetch(`${SERVER_URL}/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: targetSpell,
          transcript: finaltranscript,
          volume: sendData.decibel,
        }),
      });

      if (res.ok) {
        console.log("✅ 주문 성공");
        setIsTransformed(true);
        if (isSpeak) {
          setCurrentLine(prev => prev + 1);
          setBattlePhase('intro');
        }
      } else {
        throw new Error("주문 실패!");
      }
    } catch (err) {
      console.error("❌ 서버 통신 실패", err);
      setBattlePhase('idle');
      setBattleText(failMic[Math.floor(Math.random() * failMic.length)]);
    }
  };
  

// 마이크 버튼 클릭 핸들러
const handleMicClick = async (e: React.MouseEvent) => {
  e.stopPropagation();
  console.log("음성 인식 중지");
  stop();
  await handleVoiceEnd();
};

// 대사 화면 넘기기
const handleScreenClick = () => {
  if (gameState !== 'playing') return;

  // 공격 프로세싱 넘기기
  if(battlePhase === 'attack' || battlePhase === 'processing') return;

  // 일반 대화 넘기기
  if (currentLine < dialogues.length - 1) {
    setCurrentLine(prev => prev + 1);
  }else{
    navigate('/computer');
  }
};

  return (
    <Container $bg={background1} onClick={handleScreenClick}>
      <GlobalStyle />
      {showMic && <SpeakOverlay />}
      {showMic && (
        <SpeakMicWrapper onClick={handleMicClick}>
          <PulseRing />
          <MicCircle><MicImage src={mic} alt="mic" /></MicCircle>
        </SpeakMicWrapper>
      )}

      {step === 1 && (
        <IntroOverlay><IntroText>점심시간 정원 앞</IntroText></IntroOverlay>
      )}

      {step === 2 && (
        <>
          <StandingCharacter
            src={isTransformed ? player_change_1 : playerImg}
            alt="Character"
          />
          <NpcCharacter2 src={currentNpcImage} alt="Character"/>

          {/* ✨ 중앙에 마법봉 표시 (선물 대사부터 주문 외우기 전까지) */}
          {currentLine >= 7 && currentLine < 10 && (
            <ItemOverlay src={magic_stick} alt="magic stick" />
          )}

          <DialogueSection>
            <ProfileWrapper>
              <ProfileInner>
                <ProfileImage 
                  src={battleText ? speakerConfig.sebaschan.profile : speakerConfig[currentDialogue.speaker].profile} 
                  alt="Profile" />
              </ProfileInner>
            </ProfileWrapper>
            <MessageBox>
              <NameTag>
              {battleText ? speakerConfig.sebaschan.name : speakerConfig[currentDialogue.speaker].name}
              </NameTag>
              <DialogueText $speak={showMic}>
              {!battleText ? currentDialogue.text : battleText}
              </DialogueText>
            </MessageBox>
          </DialogueSection>
        </>
      )}
    </Container>
  );
};

export default GardenPage;