# ano — Apple Notes Organizer

## 사용법
"정리해줘", "노트 정리", "셋업 해줘" 등으로 요청하면 아래 명령어를 실행한다.

## 중요: 대화형 명령어는 사용자가 직접 실행해야 함
`setup`, `schedule`, `reconfigure`는 대화형 프롬프트(화살표 선택, 텍스트 입력)를 사용하므로 Bash 도구로 실행하면 TTY 에러가 발생한다.

**이 명령어들은 사용자에게 `!` 접두사로 직접 실행하도록 안내한다:**
```
! node dist/index.js setup
! node dist/index.js schedule
! node dist/index.js reconfigure
```

사용자에게 이렇게 말한다:
> 이 명령어는 대화형이라 제가 직접 실행할 수 없습니다. 아래를 프롬프트에 붙여넣어 주세요:
> `! node dist/index.js setup`

## Bash 도구로 실행 가능한 명령어 (비대화형)
```bash
# 메모 정리 실행
node dist/index.js run

# 미리보기 (실제 이동 없이 결과만 확인)
node dist/index.js run --dry-run

# 상세 로그 출력
node dist/index.js run --verbose

# 배치 크기 조절
node dist/index.js run --batch-size 100

# 현재 상태 확인
node dist/index.js status

# 자동 실행 해제
node dist/index.js unschedule

# 업데이트
node dist/index.js update
```

## 대화 매핑
| 사용자 요청 | 실행 방법 |
|------------|----------|
| "셋업 해줘" / "초기 설정" | 사용자에게 `! node dist/index.js setup` 입력 안내 |
| "정리해줘" / "노트 정리" | Bash로 `node dist/index.js run` 실행 |
| "미리보기" | Bash로 `node dist/index.js run --dry-run` 실행 |
| "상태 확인" | Bash로 `node dist/index.js status` 실행 |
| "자동 실행 등록" | 사용자에게 `! node dist/index.js schedule` 입력 안내 |
| "설정 바꿔줘" | 사용자에게 `! node dist/index.js reconfigure` 입력 안내 |

## 보안 규칙 (절대 위반 금지)
- **메모 삭제 금지**: AppleScript에서 `delete` 명령 실행 불가
- **메모 내용 저장 금지**: ID만 `~/.ano/processed.json`에 저장
- **허용 작업**: 읽기, 폴더 생성, 메모 이동만 허용

## 빌드
코드 수정 후에는 반드시 빌드 필요:
```bash
npm run build
```

## 테스트
```bash
npm test
```
