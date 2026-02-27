import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import background2 from '../assets/background2.png';
import playerImg from '../assets/player-start-1.png';
import playerProfileImg from '../assets/player-start-profile.png';
import npc2_1 from '../assets/npc2-1.png';
import npc2_2 from '../assets/npc2-2.png';
import npc2_3 from '../assets/npc2-3.png';
import npc_profile1 from '../assets/npc-profile1.png';
import npc_profile2 from '../assets/npc-profile2.png';
import npc_profile3 from '../assets/npc-profile3.png';
import npc_profile4 from '../assets/npc-profile4.png';
import { createGlobalStyle } from 'styled-components';
import mic from '../assets/mic.png';
import playerbattle1 from '../assets/player-change-1.png';
import playerbattle2 from '../assets/player-change-2.png';
import playerbattle3 from '../assets/player-change-3.png';
import background2_1 from '../assets/background2-1.png'

import { spells, failMic } from "../../../Server/src/tsFile/spells";
import { useSpeechToText } from "../tsFolder/speech";
import { useVolume } from "../tsFolder/audio";
import { createSpellJson, Enemy } from "../../../Server/serverFile/damage";
import { useNavigate } from 'react-router-dom';

import { SERVER_URL } from "./gardenPage";

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
  0% {
    transform: scale(0.3);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
`;

const Container = styled.div<{ $bg: string }>`
  width: 100vw;
  height: 100vh;
  background-image: url(${props => props.$bg});
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
`;

const IntroOverlay = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const IntroText = styled.h1`
  color: white;
  font-size: 3rem;
`;

const StandingCharacter = styled.img`
  position: absolute;
  bottom: 0;
  right: 10%;
  height: 85%;
  z-index: 5;
`;

const NpcCharacter2 = styled.img`
  position: absolute;
  bottom: 0;
  left: 10%;
  height: 85%;
  z-index: 0;
`;

const DialogueSection = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 95%;
  display: flex;
  align-items: stretch;
  z-index: 10;
`;

const ProfileWrapper = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 5px;
  background: linear-gradient(54deg, #FF7CF2 -28.84%, #FFF583 91.73%);
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  margin-right: 10px;
  box-sizing: border-box;
`;

const ProfileInner = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
`;

const ProfileImage = styled.img<{ $scale?: number }>`
  width: 100%;
  height: 100%;
  transform: scale(${props => props.$scale ?? 1});
`;

const MessageBox = styled.div`
  flex-grow: 1;
  background-color: rgba(0, 0, 0, 0.2);
  border: 6px solid;
  border-image-source: linear-gradient(to right, #FFF583, #FF7CF2);
  border-image-slice: 1;
  padding: 30px;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const NameTag = styled.div`
  letter-spacing: -0.2rem;
  position: absolute;
  top: -70px;
  left: 0;
  padding: 3px 26px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #FF27AC;
  -webkit-text-stroke-width: 2px;
  -webkit-text-stroke-color: #FFF583;
  font-family: "Cafe24 ClassicType";
  font-size: 40px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  span {
    color: yellow;
  }
`;

const DialogueText = styled.div<{ $speak: boolean }>`
  font-size: ${({ $speak }) => ($speak ? '2rem' : '1.5rem')};
  color: ${({ $speak }) => ($speak ? '#FFF583' : 'white')};
  line-height: 1.4;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-family: ${({ $speak }) => ($speak ? "'Cafe24ClassicType'" : 'inherit')};
`;

const SpeakOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
  pointer-events: none;
`;

const MicCircle = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(180deg, #FF9A3B 0%, #FF27AC 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  box-shadow: 0 0 25px rgba(255, 0, 150, 0.8);
`;

const MicImage = styled.img`
  width: 80px;
  height: 80px;
`;

const PulseRing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 105, 180, 0.4);
  animation: ${pulse} 1.6s ease-out infinite;
`;

const PulseRingDelay = styled(PulseRing)`
  animation-delay: 0.8s;
`;

const SpeakMicWrapper = styled.div`
  position: absolute;
  top: 18%;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 150px;
  z-index: 100;
  display: flex;
  justify-content: center;
  cursor: pointer;
  align-items: center;
`;

const BattleHUD = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-center;
  padding: 0 80px;
  gap: 550px;
  z-index: 30;
  pointer-events: none;
`;

const HpBarWrapper = styled.div`
  width: 360px;
`;

const HpName = styled.div`
  color: white;
  font-size: 1.2rem;
  margin-bottom: 6px;
`;

const HpBarBg = styled.div`
  width: 100%;
  height: 36px;
  background: #FFF;
  border: 2px solid black;
  overflow: hidden;
`;

const PlayerhpBarFill = styled.div<{ $hp: number }>`
  width: ${({ $hp }) => $hp}%;
  height: 100%;
  background: linear-gradient(90deg, #FF9D8C 0%, #FC33A9 100%);
  transition: width 0.4s ease;
`;

const EnemyhpBarFill = styled.div<{ $hp: number }>`
  width: ${({ $hp }) => $hp}%;
  height: 100%;
  background: linear-gradient(90deg, #FF6344 0%, #FFF583 100%);
  transition: width 0.4s ease;
`;

const ComputerLabPage = () => {
  const navigate = useNavigate();

  const { transcript, listening, start, stop, resetTranscript } = useSpeechToText();
  const playerName = localStorage.getItem("player") ?? "미림이";

  const [step, setStep] = useState(1);
  const [currentLine, setCurrentLine] = useState(0);
  const [battlePhase, setBattlePhase] = useState<'intro' | 'idle' | 'attack' | 'processing' | 'failed'>('intro'); // ✅ 'failed' 추가
  const [targetSpell, setTargetSpell] = useState("치링치링 샤랄라 나날이 예뻐지는 나. 너무나도 소중해!");
  const [gameState, setGameState] = useState<'playing' | 'victory_end' | 'defeat_end'>('playing');
  const [battleText, setBattleText] = useState<string | null>(null);

  const [isTransformed, setIsTransformed] = useState(false);

  const PLAYER_MAX_HP = 100000;
  const ENEMY_MAX_HP = 50000;

  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [enemyHp, setEnemyHp] = useState(ENEMY_MAX_HP);

  const [isHit, setIsHit] = useState(false);

  const playerHpPercent = (playerHp / PLAYER_MAX_HP) * 100;
  const enemyHpPercent = (enemyHp / ENEMY_MAX_HP) * 100;

  const playerAttackLines = spells;

  const dialogues: {
    speaker: SpeakerKey;
    situation: string;
    text: string;
  }[] = [
    { speaker: 'yoonjiT', situation: 'story', text: '미림아 어디를 다녀온거야?' },
    { speaker: 'player', situation: 'story', text: '선생님 전 이 학교를 폭파시킬 겁니다.' },
    { speaker: 'jinhaT', situation: 'story', text: '헛소리하지 말고 앉아라.' },
    { speaker: 'player', situation: 'story', text: '선생님, 전 지금 마법소녀의 힘을 얻었어요 이 힘으로 학교를 폭파시키겠습니다!' },
    { speaker: 'yoonjiT', situation: 'story', text: '미림아.. 요즘 힘든 건 알겠는데, 어디가 아픈거니?' },
    { speaker: 'player', situation: 'story', text: '선생님들 절 막으신다면 전 선생님들을 쓰러트리는 수 밖에 없어요' },
    { speaker: 'sebaschan', situation: 'story', text: '마법소녀로 변신하자! 이제 밑에 나오는 대사를 외치면 돼!' },
    { speaker: 'player', situation: 'speak', text: '치링치링 샤랄라 나날이 예뻐지는 나. 너무나도 소중해!' },
    { speaker: 'sebaschan', situation: 'battle', text: '이제 공격하자! 대사를 따라 외쳐봐!!' },
    { speaker: 'teachers', situation: 'defeat', text: '진도 나가야 해. 빨리 자리에 앉아' },
    { speaker: 'teachers', situation: 'victory', text: '알겠어. 말리지 않을게' },
    { speaker: 'sebaschan', situation: 'victory', text: '좋아 이제 다른 곳을 가자!' },
  ];

  const speakerConfig = {
    player: { name: playerName, profile: playerProfileImg },
    yoonjiT: { name: '김윤지 선생님', profile: npc_profile2 },
    jinhaT: { name: '임진하 선생님', profile: npc_profile3 },
    sebaschan: { name: '세바스찬', profile: npc_profile1 },
    teachers: { name: '임진하&김윤지 선생님', profile: npc_profile4 },
  } as const;

  type SpeakerKey = keyof typeof speakerConfig;

  const currentDialogue = dialogues[currentLine];
  const isSpeak = currentDialogue?.situation === 'speak';
  const isBattle = currentDialogue?.situation === 'battle';
  const [battleLine, setBattleLine] = useState('');

  const showMic = (isSpeak || isBattle) && battlePhase === 'attack';
  const showDialogueBox = true;

  const isSavingRef = useRef(false);
  const transcriptRef = useRef("");

  // ✅ useVolume에서 객체로 받기
  const volumeData = useVolume(showMic && listening);

  const getRandomBattleLine = () => {
    const random = playerAttackLines[Math.floor(Math.random() * playerAttackLines.length)];
    setBattleLine(random);
    setTargetSpell(random); // ✅ 타겟 스펠도 업데이트
  };

  if (!currentDialogue) return null;

  // ✅ 인트로 타이머
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep(2);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ 배틀 시작 시 랜덤 대사 설정
  useEffect(() => {
    if (isBattle && battlePhase === 'intro') {
      getRandomBattleLine();
    }
  }, [isBattle, battlePhase]);

  // ✅ speak/battle 상황이 되면 idle로 전환
  useEffect(() => {
    if (currentDialogue.situation === 'speak' || currentDialogue.situation === 'battle') {
      setBattlePhase('idle');
      setBattleText(null);
    }
  }, [currentLine, currentDialogue.situation]);

  // ✅ idle 상태에서 speak/battle 상황이면 자동으로 녹음 시작
  useEffect(() => {
    if (battlePhase === 'idle' && (currentDialogue.situation === 'speak' || currentDialogue.situation === 'battle')) {
      transcriptRef.current = "";
      resetTranscript();
      setBattlePhase('attack');

      setTimeout(() => {
        start();
        console.log("🎤 음성 인식 시작");
      }, 300);
    }
  }, [battlePhase, currentDialogue.situation]);

  // ✅ transcript 업데이트
  useEffect(() => {
    if (transcript && battlePhase === 'attack') {
      transcriptRef.current = transcript;
      console.log("📝 현재 인식된 내용:", transcript);
    }
  }, [transcript, battlePhase]);

  // ✅ 승패 판정 (중복 방지)
  useEffect(() => {
    if (!isBattle) return;

    const isVictory = enemyHp <= 0;
    const isDefeat = playerHp <= 0;

    if (isVictory || isDefeat) {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      const finalHp = isDefeat ? 0 : playerHp;
      saveBattleResult(finalHp);

      if (isVictory) {
        const victoryIdx = dialogues.findIndex(d => d.situation === 'victory');
        if (victoryIdx !== -1) setCurrentLine(victoryIdx);
      } else {
        const defeatIdx = dialogues.findIndex(d => d.situation === 'defeat');
        if (defeatIdx !== -1) setCurrentLine(defeatIdx);
      }

      setBattlePhase('idle');
    }
  }, [enemyHp, playerHp, isBattle]);

  const saveBattleResult = async (hp: number) => {
    try {
      const res = await fetch(`${SERVER_URL}/attack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playerName, // ✅ 수정: speakerConfig.teachers → playerName
          enemy: speakerConfig.teachers.name,
          hp: hp
        })
      });

      if (res.ok) {
        console.log("✅ DB에 최종 HP 저장 성공");
      }
    } catch (err) {
      console.error("❌ DB 저장 실패:", err);
    }
  };

  // ✅ 마이크 클릭 핸들러
  const handleMicClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("🛑 사용자가 마이크 클릭 - 음성 인식 중지");

    await stop();
    await handleVoiceEnd();
  };

  // ✅ 음성 인식 종료 처리
  const handleVoiceEnd = async () => {
    console.log("🔍 handleVoiceEnd 실행");

    const finaltranscript = transcriptRef.current.trim();

    if (!finaltranscript) {
      const sebaschanDialogues = failMic[Math.floor(Math.random() * failMic.length)];
      console.log('❌ 인식된 내용이 없습니다.');
      setBattlePhase('failed');
      setBattleText(sebaschanDialogues);
      return;
    }

    console.log("🎯 목표 주문:", targetSpell);
    console.log("🗣️ 최종 인식된 주문:", finaltranscript);
    console.log("🔊 볼륨 데이터:", volumeData);

    try {
      setBattlePhase('processing');

      // ✅ 최대 볼륨 사용
      const volumeToSend = volumeData.max;

      const res = await fetch(`${SERVER_URL}/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: targetSpell,
          transcript: finaltranscript,
          volume: volumeToSend,
        }),
      });

      if (res.ok) {
        console.log("✅ 주문 성공");

        // ✅ 로컬에서 데미지 계산
        const localJudge = createSpellJson(targetSpell, finaltranscript, volumeToSend);

        if (isSpeak) {
          // 변신 성공
          setIsTransformed(true);
          setCurrentLine(prev => prev + 1);
          setBattlePhase('intro');
          setBattleText(null);
        } else if (isBattle) {
          // 전투 공격
          executeBattleTurn(localJudge.damage);
        }
      } else {
        throw new Error("주문 실패!");
      }
    } catch (err) {
      console.error("❌ 서버 통신 실패:", err);
      const sebaschanDialogues = failMic[Math.floor(Math.random() * failMic.length)];
      setBattlePhase('failed');
      setBattleText(sebaschanDialogues);
    }
  };

  // ✅ 전투 턴 실행
  const executeBattleTurn = (playerDamage: number) => {
    // 1. 플레이어 공격
    setIsHit(true);
    setEnemyHp(prev => Math.max(0, prev - playerDamage));
    setBattleText(`${playerDamage}의 데미지를 입혔다!`);

    // 2. 적의 반격 (1.2초 뒤)
    setTimeout(() => {
      setIsHit(false);

      setEnemyHp(currentEnemyHp => {
        if (currentEnemyHp > 0) {
          const enemy = Enemy.find(e => e.name === speakerConfig.teachers.name);
          const isHardAttack = Math.random() < 0.1;
          const enemyDamage = isHardAttack ? (enemy?.hardAttack || 0) : (enemy?.normalAttack || 0);
          setPlayerHp(prev => Math.max(0, prev - enemyDamage));
          setBattleText(`선생님들의 공격! ${enemyDamage}의 피해를 입었다...`);
        } else {
          setBattleText("선생님들을 쓰러뜨렸다!");
        }
        return currentEnemyHp;
      });

      setBattlePhase('idle');
    }, 1200);
  };

  // ✅ 화면 클릭 핸들러
  const handleScreenClick = () => {
    if (gameState !== 'playing') return;

    // ✅ 실패 상태에서 클릭하면 다시 idle로 전환 (재시도)
    if (battlePhase === 'failed' && (isSpeak || isBattle)) {
      console.log("🔄 재시도 - idle 상태로 전환");
      setBattlePhase('idle');
      setBattleText(null);
      if (isBattle) getRandomBattleLine();
      return;
    }

    // 공격/프로세싱 중에는 넘기기 불가
    if (battlePhase === 'attack' || battlePhase === 'processing') {
      console.log("⏸️ 음성 인식 중이거나 처리 중입니다.");
      return;
    }

    // idle 상태에서 speak/battle이면 마이크 다시 띄우기
    if (battlePhase === 'idle' && (isBattle || isSpeak)) {
      setBattleText(null);
      setBattlePhase('attack');
      if (isBattle) getRandomBattleLine();
      return;
    }

    // 일반 대화 넘기기
    if (currentLine < dialogues.length - 1) {
      const nextLine = currentLine + 1;
      setCurrentLine(nextLine);

      const nextSituation = dialogues[nextLine].situation;
      if (nextSituation === 'battle' || nextSituation === 'speak') {
        setBattlePhase('idle'); // ✅ idle로 설정하면 자동으로 attack으로 전환
      } else {
        setBattlePhase('intro');
      }
    } else {
      setTimeout(async () => {
        const data = {
          name: playerName,
          enemy: speakerConfig.teachers.name,
          hp: playerHp
        };
        const result = await fetch(`${SERVER_URL}/attack`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        if (result.ok) {
          navigate("/hallway");
        }
      }, 1000);
    }
  };

  let displayNpc = npc2_1;
  if (isHit) {
    displayNpc = npc2_3;
  } else if (isBattle) {
    displayNpc = npc2_2;
  }

  return (
    <Container $bg={background2} onClick={handleScreenClick}>
      <GlobalStyle />
      {isBattle && (
        <BattleHUD>
          <HpBarWrapper style={{ textAlign: 'left' }}>
            <HpBarBg>
              <EnemyhpBarFill $hp={enemyHpPercent} />
            </HpBarBg>
            <HpName>윤지&진하T</HpName>
          </HpBarWrapper>

          <HpBarWrapper style={{ textAlign: 'right' }}>
            <HpBarBg>
              <PlayerhpBarFill $hp={playerHpPercent} />
            </HpBarBg>
            <HpName>Player</HpName>
          </HpBarWrapper>
        </BattleHUD>
      )}
      {showMic && <SpeakOverlay />}
      {showMic && (
        <SpeakMicWrapper onClick={handleMicClick}>
          <PulseRing />
          <PulseRingDelay />
          <MicCircle>
            <MicImage src={mic} alt="mic" />
          </MicCircle>
        </SpeakMicWrapper>
      )}

      {step === 1 && (
        <IntroOverlay>
          <IntroText>실습실</IntroText>
        </IntroOverlay>
      )}

      {step === 2 && (
        <>
          <StandingCharacter src={isBattle ? playerbattle1 : playerImg} alt="Character" />
          <NpcCharacter2 src={displayNpc} alt="Character" />
          {showDialogueBox && (
            <DialogueSection>
              <ProfileWrapper>
                <ProfileInner>
                  <ProfileImage
                    src={battleText ? speakerConfig.sebaschan.profile : speakerConfig[currentDialogue.speaker].profile}
                    alt="Profile"
                  />
                </ProfileInner>
              </ProfileWrapper>

              <MessageBox>
                <NameTag>
                  {battleText ? speakerConfig.sebaschan.name : speakerConfig[currentDialogue.speaker].name}
                </NameTag>
                <DialogueText $speak={showMic}>
                  {isBattle
                    ? (battlePhase === 'attack' ? battleLine : battleText)
                    : (battleText || currentDialogue.text)
                  }
                </DialogueText>
              </MessageBox>
            </DialogueSection>
          )}
        </>
      )}
    </Container>
  );
};

export default ComputerLabPage;