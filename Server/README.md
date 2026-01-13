상태확인
```
git status
```

빌드 방법
```
./build.bat
```

실행 방법
```
./main.exe
```

pull 방법
```
git checkout dev
git pull origin dev
git checkout user/이름 ( 이름에 자기 이름 쓰기. 예시 : user/박재영 )
git merge dev
```

push 방법
```
git add .
git commit -m "커밋 메시지"
git push origin user/이름
```

push 후 Pull requests에 들어간 뒤
<br>
<img width="598" height="192" alt="image" src="https://github.com/user-attachments/assets/f1a29d29-2cf9-4b03-acf8-c92d0b8238eb" />
<br>
base = dev 고정
<br>
compare = user/이름
<br>
처음 Pull requests를 들어가면 main으로 되어 있을 수 있으니 주의
<h3>꼭 꼭 꼭 확인 해야함 main에 올리면 죽어요 ㅎㅎ</h3>
그럴일은 없겠지만
<h2>중간에 오류나면 꼭 지수민 혹은 박재영 호출...</h2>
