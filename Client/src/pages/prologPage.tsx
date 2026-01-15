import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { createGlobalStyle } from 'styled-components';

//image
import background5 from "../assets/background5.png";
import playerProfileImg from "../assets/player-start-profile.png";
import playerImg from "../assets/player-start-1.png";

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
    0% {transform: scale(0.3); opacity: 08.;}
    100% {transform: scale(2.5); opacity: 0;}
`;

const Container = styled.div<{$bg: string}>`
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


const PrologPage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [currentLine, setCurrentLine] = useState(0);

    const dialogues: {speaker: SpeakerKey; situation: string; text: string;}[] = [
        {speaker: 'system', situation: 'story', text: "오늘도 평범하게 등교를 하는 미림이"},
        {speaker: 'system', situation: 'story', text: "오늘 하루도 학교를 폭파시키고 싶다는 생각으로 가득 차 있다."},
        {speaker: 'player', situation: 'story', text: "오늘도 등교, 내일도 등교.. 오늘도 학교를 폭파시키고 싶다..!"},
    ];

    const speakerConfig = {
        player: {name: "미림이", profile: playerProfileImg},
        system: {name: "나레이션", profile: null},
    } as const;

    type SpeakerKey = keyof typeof speakerConfig;

    const currentDialogue = dialogues[currentLine];

    if(!currentDialogue) return null;
    const currentSpeaker = speakerConfig[currentDialogue.speaker];

    const handleScreenClick = () => {
        if(currentLine < dialogues.length - 1){
            setCurrentLine(prev => prev +1);
        }else{
            navigate('/garden');
        }
    }


    return(
        <Container $bg={background5} onClick={handleScreenClick}>
            <GlobalStyle />

            {step === 1 && (
                <IntroOverlay><IntroText>샤랄라 불만이 쌓이는 아침</IntroText></IntroOverlay>
            )}

            {step === 2 && (
                <>
                    <StandingCharacter src={playerImg} alt='Character' />

                    <DialogueSection>
                        <ProfileWrapper>
                            <ProfileInner>
                                <ProfileImage
                                    src={speakerConfig[currentDialogue.speaker].profile || ''}
                                    alt="Profile"
                                />
                            </ProfileInner>
                        </ProfileWrapper>
                        <MessageBox>
                            <NameTag>
                                {speakerConfig[currentDialogue.speaker].name}
                            </NameTag>
                            <DialogueText $speak={false}>
                                {currentDialogue.text}
                            </DialogueText>
                        </MessageBox>
                    </DialogueSection>
                </>
            )}
        </Container>
    )
};

export default PrologPage;