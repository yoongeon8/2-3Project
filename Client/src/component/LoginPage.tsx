import styled from "styled-components";
import { GlobalStyle, Container, Wapper, TitleContainer } from "./StartPage";
import {useState} from "react";
import Pencil from "../assets/pen.svg";
import { useNavigate } from "react-router-dom";

const Title = styled.h1`
    position: relative;
    display: inline-block;
    text-align: center;
    align-items: center;
    justify-content: center;
    margin: 0;

    -webkit-text-stroke-width: 2px;
    -webkit-text-stroke-color: #FFF;
    font-family: "Cafe24ClassicType";
    font-size: 64px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    background: linear-gradient(90deg, #EC5C5C 0%, #FF27AC 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;
const FormBorder = styled.div`
    width: 850px;
    height: 100px;
    padding: 4px;
    border-radius: 12px;
    background: linear-gradient(90deg, #ff27ac, #ff9d8c);
`;
const Form = styled.form`
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #ffffff;
    border-radius: 6px;
`;
const NameInput = styled.input`
    flex: 1;
    height: 90%;
    padding: 0 32px;
    font-size: 32px;
    color: #000000;
    background: #ffffff;
    border: none;
    outline: none;
    display: flex;
    align-items: center;
    &::placeholder{
        color: #999999;
    }
`;
const IconButton = styled.button`
    width: 96px;
    height: 100%;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
`;
const Icon = styled.img`
    width: 32px;
    height: 32px;
`;

function LoginPage(){
    const [name, setName] = useState("");
    const navigate = useNavigate();
    
    const getName = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if(!name.trim()){
            alert("이름을 입력해 주세요!");
            return;
        }
        try{
            const res = await fetch("http://localhost:3000/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"

                },
                body: JSON.stringify({name}),
            });

            if(!res.ok){
                const text = await res.text();
                console.error("error:", text);
                alert(text);
            }else{
                const text = await res.text();
                console.log("전송 성공");
                alert(text);
                localStorage.setItem("player", name);
                navigate("/prolog");
            }
        } catch(err){
            console.error(err);
        }
    };

    return(
        <>
            <GlobalStyle />
            <Container>
                <Wapper>
                    <TitleContainer>
                        <Title>
                            당신의 이름은 무엇인가요?
                        </Title>
                    </TitleContainer>
                </Wapper>
                <Wapper>
                    <FormBorder>
                        <Form onSubmit={getName}>
                            <NameInput
                                placeholder="이름을 작성해 주세요."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <IconButton type="submit">
                                <Icon src={Pencil} />
                            </IconButton>
                        </Form>
                    </FormBorder>
                </Wapper>

            </Container>
        </>
    );
}

export default LoginPage