import styled from "styled-components";
import {GlobalStyle, Container,} from "./StartPage";
import { useEffect, useState } from "react";

export const Background = styled.div`
    min-height: 100vh;
    background: rgba(0, 0, 0, 0.70);
`;
export const HeaderBar = styled.div`
    position: sticky;
    top: 0;
    z-index: 10;
    align-items: center;
    justify-content: center;
    margin: 0;
    border: none;
    display: grid;
    grid-template-columns: 150px 1fr 120px;
    padding: 16px 19%;
    background: #3A3A3A;
    font-weight: bold;
`;
export const BodyBar = styled.div`
    max-height: 100vh;
    overflow-y: auto;
`;

interface RowProps{
    rank: number;
}
export const Row = styled.div<RowProps>`
    height: 80px;
    display: grid;
    grid-template-columns: 150px 1fr 120px;
    padding: 14px 19%;
    align-items: center;

    background: ${({rank}) => {
        if(rank === 1) return "rgba(252, 194, 217, 0.40)";
        if(rank === 2) return "rgba(252, 194, 217, 0.30)";
        if(rank === 3) return "rgba(252, 194, 217, 0.20)";
        return "rgba(252, 194, 217, 0.10)";
    }};
`;
export const HeaderText = styled.span`
    color: #FFF;
    font-family: Pretendard;
    font-size: 32px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
`;

interface BodyTextProps{
    rankText?: boolean;
}

export const BodyText = styled.span<BodyTextProps>`
    color: #FFF;
    font-family: Pretendard;
    font-size: 32px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;

    ${({rankText}) => rankText && `
        color: #FC33A9;
        -webkit-text-stroke-width: 2px;
        -webkit-text-stroke-color: #FFF;
        font-family: "Cafe24ClassicType";
        font-size: 48px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
    `}
`;

interface RankingItems{
    rank: number;
    name: string;
    hp: number;
}


function RankPage(){
    const [ranking, setRanking] = useState<RankingItems[]>([]);
      

    useEffect(() => {
        fetch("http://localhost:3000/ranking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({})
        })
        .then(res => res.json())
        .then(data => {
            setRanking(data.ranking);
        })
        .catch(console.error);
    }, []);


    return(
        <>
            <GlobalStyle />
            <Container>
                <Background>
                    <HeaderBar>
                        <HeaderText>순위</HeaderText>
                        <HeaderText>닉네임</HeaderText>
                        <HeaderText>점수</HeaderText>
                    </HeaderBar>
                    <BodyBar>
                        {ranking.map(item => (
                            <Row key={item.rank} rank={item.rank}>
                                <BodyText rankText>{item.rank}</BodyText>
                                <BodyText>{item.name}</BodyText>
                                <BodyText>{item.hp.toLocaleString(  )}</BodyText>
                            </Row>
                        ))}
                    </BodyBar>
                </Background>
            </Container>
        </>
    )
}
export default RankPage;