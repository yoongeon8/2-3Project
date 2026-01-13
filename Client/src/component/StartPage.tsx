import styled, {createGlobalStyle, css} from "styled-components";
import { useNavigate } from "react-router-dom";
import back1 from "../assets/back-1.svg";
import back2 from "../assets/back-2.svg";
import back3 from "../assets/back-3.svg";
import back4 from "../assets/back-4.svg";
 
export const GlobalStyle = createGlobalStyle`
    @font-face {
        font-family: 'Cafe24ClassicType';
        src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2210-2@1.0/Cafe24ClassicType-Regular.woff2') format('woff2');
        font-weight: normal;
        font-display: swap;
    }
    html, body, #root {
        height: 100%;
        width: 100%;;
    }
    body {
        padding: 0;
        margin: 0;
        background: #FF27AC;
        background: linear-gradient(0deg, rgba(255, 39, 172, 0.88) 0%, rgba(255, 255, 255, 1) 100%);
        background-repeat: no-repeat;
        background-attachment: fixed;
    }
`;
export const TitleContainer = styled.div`
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 0;
    margin-bottom: 200px;
    overflow: visible;
`;

interface ContainerProps{
    fadeBottom?: boolean;
}

export const Container = styled.div<ContainerProps>`
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    background-image: url(${back1}), url(${back2}), url(${back3}), url(${back4});
    background-size:
    352px 450px,
    365px 550px,
    360px 550px,
    364px 450px;

    background-position:
    5% calc(100% + 1px),
    33% calc(100% + 1px),
    63% calc(100% + 1px),
    90% calc(100% + 1px);

  background-repeat: no-repeat;
  ${({fadeBottom}) =>
    fadeBottom &&
    `
    &::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;

        width: 100%;
        height: 240px;

        background: radial-gradient(81.69% 57.1% at 50% 107.1%, #000 0%, rgba(102, 102, 102, 0.00) 100%);

        pointer-events: none;
        z-index: 1;
    }
    `}
`;
export const Wapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;
const Button = styled.button`
        display: inline-flex;
        width: 300px;
        height: 60px;
        margin: 20px;
        border: none;
        border-radius: 10px;
        background: #ffffff;
        text-align: center;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        margin-top: 80px;
    `;
    const Text = styled.span`
        font-size: 22px;
        font-family: 'Cafe24ClassicType';
        font-weight: 500;
        background-image: linear-gradient(90deg, #ff6344, #fc33a9);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    `;
    
    const Title = styled.span`
        position: relative;
        display: inline-block;
        text-align: center;
        margin: 2px;

        -webkit-text-stroke-width: 2px;
        -webkit-text-stroke-color: #FFF;
        font-family: "Cafe24ClassicType";
        font-size: 64px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        background: linear-gradient(90deg, #FC33A9 0%, #FF6344 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        isolation: isolate;
    `;
    const Title2 = styled.span`
        position: relative;
        display: inline-block;
        align-self: flex-end;
        margin: 2px;
        text-align: center;

        -webkit-text-stroke-width: 2px;
        -webkit-text-stroke-color: #FFF;
        font-family: "Cafe24ClassicType";
        font-size: 96px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        background: radial-gradient(102.17% 154.1% at 50% 85.47%, #FF6344 0%, #FFF583 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        isolation: isolate;
    `;

function StartPage(){

    const navigate = useNavigate();

    return(
    <>
        <GlobalStyle />
        <Container fadeBottom>
            <Wapper>
                <TitleContainer>
                    <Title data-text="마법소녀 카와이 러블리 즈큥도큥 바큥부큥 루루핑">
                        마법소녀 카와이 러블리 즈큥도큥 바큥부큥 루루핑
                    </Title>
                    <Title2 data-text=": 미림폭파작전">
                        : 미림폭파작전
                    </Title2>
                </TitleContainer>
            </Wapper>
            <Wapper>
                <Button onClick={() => navigate("/auth")}>
                    <Text>
                        시작하기
                    </Text>
                </Button>
            </Wapper>
        </Container>
    </>);
}

export default StartPage