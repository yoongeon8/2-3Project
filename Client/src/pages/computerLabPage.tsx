import React, { useState, useEffect, useRef } from 'react';
import styled,{ keyframes } from 'styled-components';
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

import {spells, failMic} from "../../../Server/src/tsFile/spells";
import {useSpeechToText} from "../tsFolder/speech";
import {useVolume} from "../tsFolder/audio";
import {createSpellJson, Enemy} from "../../../Server/serverFile/damage";
import { useNavigate } from 'react-router-dom';

import {SERVER_URL} from "./gardenPage";

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
  padding:20px;
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
  letter-spacing : -0.2rem;
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
  background: linear-gradient(
    180deg,
    #FF9A3B 0%,
    #FF27AC 100%
  );
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
  gap:550px;
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

  const { transcript, listening, start, stop } = useSpeechToText();
  const playerName = localStorage.getItem("player") ?? "미림이";

  const [step, setStep] = useState(1);
  const [currentLine, setCurrentLine] = useState(0);
  const [battlePhase, setBattlePhase] = useState<'intro' | 'idle' | 'attack' | 'processing'>('intro');
  const [targetSpell, setTargetSpell] = useState("치링치링 샤랄라 나날이 예뻐지는 나. 너무나도 소중해!"); //스펠
  const [gameState, setGameState] = useState<'playing' | 'victory_end' | 'defeat_end'>('playing'); //게임 변화 상태
  const [battleText, setBattleText] = useState<string | null>(null); //스펠 텍스트

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
  const isSpeak = currentDialogue.situation === 'speak';
  const isBattle = currentDialogue.situation === 'battle';
  const [battleLine, setBattleLine] = useState('');

  const showMic = (isSpeak || isBattle) && battlePhase === 'attack';
  const showDialogueBox = true;

  const isSavingRef = useRef(false);

  const volume = useVolume(showMic);


  const getRandomBattleLine = () => {
    const random =
      playerAttackLines[
        Math.floor(Math.random() * playerAttackLines.length)
      ];
    setBattleLine(random);
  };

  if (!currentDialogue) return null;
  const currentSpeaker = speakerConfig[currentDialogue.speaker];

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep(2);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isBattle) {
      getRandomBattleLine();
    }
  }, [isBattle]);

  const isRecordingRef = useRef(false);

  useEffect(() => {
    if (!showMic) {
      stop();
      isRecordingRef.current = false;
    }
  }, [showMic]);

  useEffect(() => {
    if (isBattle) {
      // 1. 승리 또는 패배 조건 확인
      const isVictory = enemyHp <= 0;
      const isDefeat = playerHp <= 0;

      if (isVictory || isDefeat) {
        // 중복 저장 방지
        if (isSavingRef.current) return;
        isSavingRef.current = true;

        // 서버에 HP 저장 함수 호출
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
    }
  }, [enemyHp, playerHp, isBattle]);

const saveBattleResult = async (hp: number) => {
  try {
    const res = await fetch("http://localhost:3000/attack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: speakerConfig.teachers,
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

  useEffect(() => {
    if (isBattle) {
      if (enemyHp <= 0) {
        // 적 체력이 0일 때: 'victory' 상황의 첫 번째 대사 인덱스 찾기
        const victoryIdx = dialogues.findIndex(d => d.situation === 'victory');
        if (victoryIdx !== -1) setCurrentLine(victoryIdx);
        setBattlePhase('idle'); // 배틀 페이즈 초기화
      } else if (playerHp <= 0) {
        // 플레이어 체력이 0일 때: 'defeat' 상황의 첫 번째 대사 인덱스 찾기
        const defeatIdx = dialogues.findIndex(d => d.situation === 'defeat');
        if (defeatIdx !== -1) setCurrentLine(defeatIdx);
        setBattlePhase('idle');
      }
    }
  }, [enemyHp, playerHp, isBattle]);

  const handleMicClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log("🎤 음성인식 중지 및 로컬 판정 시작");
    stop();

    // 1. transcript 업데이트 대기
    setTimeout(async () => {
      if (!transcript) {
        setBattleText(failMic[Math.floor(Math.random() * failMic.length)]);
        setBattlePhase('idle');
        return;
      }

      // 2. 프론트에서 자체적으로 계산한 데이터 (score, damage 등)
      const localJudge = createSpellJson(targetSpell, transcript, volume);
      
      // 서버에는 검증용으로만 전송
      const data = {
        target: targetSpell,
        transcript: transcript,
        volume: volume
      };

      try {
        setBattlePhase('processing');

        const res = await fetch(`${SERVER_URL}/voice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        
        if (res.ok) {
          console.log("✅ 판정 성공: HP 계산 시작");
          
          if (isSpeak) {
            // [변신 단계] 성공 시 바로 다음 대화로
            setIsTransformed(true);
            setCurrentLine(prev => prev + 1);
            setBattlePhase('intro'); 
          } 
          else if (isBattle) {
            // [전투 단계] 프론트에서 직접 HP 감소 로직 실행
            executeBattleTurn(localJudge.damage); 
          }
        } else {
          // 판정 실패 시
          console.log("❌ 판정 실패");
          if (isSpeak) {
            // 변신 실패
            setBattlePhase('idle');
            setBattleText("더 큰 목소리로 정확하게 외쳐야 해!");
          } else if (isBattle) {
            // 전투 실패 - 적 턴
            setBattleText("주문 실패! 적의 공격!");
            
            setTimeout(() => {
              const enemy = Enemy.find(e => e.name === speakerConfig.teachers.name);
              const isHardAttack = Math.random() < 0.1;
              const enemyDamage = isHardAttack 
                ? (enemy?.hardAttack ?? 20000) 
                : (enemy?.normalAttack ?? 10000);
              const attackType = isHardAttack ? "강력한 " : "";
              
              setPlayerHp(prev => Math.max(0, prev - enemyDamage));
              setBattleText(`선생님들의 ${attackType}공격! ${enemyDamage}의 피해를 입었다...`);
              
              setBattlePhase('idle');
            }, 1200);
          }
        }
      } catch (err) {
        console.error("❌ 서버 통신 실패:", err);
        setBattlePhase('idle');
      }
    }, 400);
  };

  const executeBattleTurn = (playerDamage: number) => {
    // 1. 플레이어 공격 (적 HP 감소)
    setIsHit(true);
    setEnemyHp(prev => Math.max(0, prev - playerDamage));
    setBattleText(`${playerDamage}의 데미지를 입혔다!`);
  
    // 2. 적의 반격 (1.2초 뒤)
    setTimeout(() => {
      setIsHit(false);
      
      // 적이 살아있을 때만 반격
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
  
      // 턴 종료 후 다시 마이크를 켤 수 있게 'idle' 상태로
      setBattlePhase('idle');
    }, 1200);
  };

const handleScreenClick = () => {
  if (gameState !== 'playing') return;

  // 1. 마이크가 사라진 상태(idle)에서 화면 클릭 시 마이크 다시 띄우기
  if (battlePhase === 'idle' && (isBattle || isSpeak)) {
    setBattleText(null);
    setBattlePhase('attack'); // 마이크 다시 보임
    if (isBattle) getRandomBattleLine();
    return;
  }

  // 2. 현재 마이크가 떠 있는 상태(attack)나 처리 중(processing)이면 클릭 무시
  if (battlePhase === 'attack' || battlePhase === 'processing') {
    return;
  }

  // 3. 일반 대화 넘기기
  if (currentLine < dialogues.length - 1) {
    const nextLine = currentLine + 1;
    setCurrentLine(nextLine);
    
    const nextSituation = dialogues[nextLine].situation;
    // 다음 대사가 마법을 외쳐야 하는 상황이면 바로 마이크 띄우기
    if (nextSituation === 'battle' || nextSituation === 'speak') {
      setBattlePhase('attack');
    } else {
      setBattlePhase('intro'); // 일반 대화는 intro나 별도 상태로
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
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
      });

      if(result.ok){
        navigate("/hallway");
      }
    }, 1000);
  }
};

let displayNpc = npc2_1;
if (isHit) {
  displayNpc = npc2_3; // 피격 시
} else if (isBattle) {
  displayNpc = npc2_2; // 전투 중
}

  return (
    <Container $bg={background2} onClick={handleScreenClick}>
      <GlobalStyle />
      {isBattle && (
        <BattleHUD>
          {/* 왼쪽 체력바 (적) */}
          <HpBarWrapper style={{ textAlign: 'left' }}>
            <HpBarBg>
            <EnemyhpBarFill $hp={enemyHpPercent} />
            </HpBarBg>
            <HpName>윤지&진하T</HpName>
          </HpBarWrapper>

          {/* 오른쪽 체력바 (플레이어) */}
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
      {/* STEP 1: 인트로 */}
      {step === 1 && (  
        <IntroOverlay>
          <IntroText>실습실</IntroText>
        </IntroOverlay> 
      )}

      {/* STEP 2: 대화창 */}
      {step === 2 && (
        <>
          <StandingCharacter
            src={isBattle ? playerbattle1 : playerImg}
            alt="Character"
          />
          <NpcCharacter2 src={displayNpc} alt="Character"/>      
          {showDialogueBox && (
          <DialogueSection>
            {/* 좌측 프로필 */}
            <ProfileWrapper>
              <ProfileInner>
                <ProfileImage 
                    src={battleText ? speakerConfig.sebaschan.profile : speakerConfig[currentDialogue.speaker].profile} 
                    alt="Profile" />
              </ProfileInner>
            </ProfileWrapper>

            {/* 우측 대화창 */}
            <MessageBox>
              <NameTag>
              {battleText ? speakerConfig.sebaschan.name : speakerConfig[currentDialogue.speaker].name}
              </NameTag>
              <DialogueText $speak={showMic}>
              {isBattle 
                ? (battlePhase === 'attack' ? battleLine : battleText)
                : currentDialogue.text
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
