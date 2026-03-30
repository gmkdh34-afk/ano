# ano — Apple Notes Organizer

## 사용법
"정리해줘", "노트 정리", "셋업 해줘" 등으로 요청하면 아래 명령어를 실행한다.

## 명령어 실행 방법
```bash
# 초기 설정 (처음 1회)
node dist/index.js setup

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

# 자동 실행 등록/해제
node dist/index.js schedule
node dist/index.js unschedule

# 설정 변경
node dist/index.js reconfigure

# 업데이트
node dist/index.js update
```

## 대화 매핑
| 사용자 요청 | 실행 명령 |
|------------|----------|
| "셋업 해줘" / "초기 설정" | `node dist/index.js setup` |
| "정리해줘" / "노트 정리" | `node dist/index.js run` |
| "미리보기" | `node dist/index.js run --dry-run` |
| "상태 확인" | `node dist/index.js status` |
| "자동 실행 등록" | `node dist/index.js schedule` |
| "설정 바꿔줘" | `node dist/index.js reconfigure` |

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
