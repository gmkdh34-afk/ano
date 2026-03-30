# ano — Apple Notes Organizer

iPhone에서 날것으로 쓴 메모를 Mac에서 자동으로 정리해줍니다.

📱 iPhone 메모 → ☁️ iCloud → 🖥️ `ano run` → 🗂️ 폴더 자동 정리

## 설치

### 원클릭 설치 (권장)

```bash
curl -fsSL https://raw.githubusercontent.com/gmkdh34-afk/ano/main/install.sh | bash
```

### 수동 설치

```bash
git clone https://github.com/gmkdh34-afk/ano.git
cd ano && npm install && npm run build
alias ano="node $(pwd)/dist/index.js"
```

## 시작하기

```bash
ano setup          # 처음 1회 — 방식 선택 및 폴더 생성
ano run --dry-run  # 미리보기 (추천)
ano run            # 실제 정리 시작
ano schedule       # 자동 실행 예약
```

## 지원 정리 방식

| 방식 | 특징 |
|------|------|
| 5레벨 폴더법 | 번호+이름 계층 구조. 다양한 주제 관리에 적합. |
| PARA | Projects·Areas·Resources·Archive 4개 버킷. 단순하고 강력. |
| Zettelkasten | 지식 연결 네트워크. 연구/글쓰기에 적합. |
| Johnny.Decimal | 번호 ID 체계. 검색 없이 위치 암기. |
| 나만의 방식 | 대화형으로 직접 설계. |

## 요구사항

- macOS
- Apple Notes (iCloud 동기화 켜짐)
- Node.js 18+ (없으면 install.sh가 자동 설치)
- Claude Code CLI (선택 — 없으면 키워드 매칭 사용)

## 모든 명령어

```bash
ano setup          # 초기 설정
ano run            # 메모 정리 실행
ano run --dry-run  # 미리보기
ano schedule       # 자동 실행 등록
ano unschedule     # 자동 실행 해제
ano status         # 현재 상태 확인
ano reconfigure    # 설정 변경
ano update         # 최신 버전 업데이트
```

## 나만의 방식 기여하기

1. `methods/template.yaml` 복사 → 내용 작성
2. `methods/custom/` 폴더에 저장
3. GitHub PR 제출 → 검증 후 공식 방식으로 추가

## 보안

- 메모 **삭제 없음** — 이동만 허용
- 메모 내용 **저장 없음** — ID만 `~/.ano/processed.json`에 기록
