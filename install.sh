#!/bin/bash
set -e

ANO_DIR="$HOME/.ano-app"
ZSHRC="$HOME/.zshrc"
BASHRC="$HOME/.bashrc"

echo "🍎 ano — Apple Notes Organizer 설치 시작"

# 1. Node.js 확인 및 설치
if ! command -v node &> /dev/null; then
  echo "📦 Node.js가 없습니다. nvm으로 설치합니다..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install --lts
  nvm use --lts
else
  echo "✓ Node.js $(node --version) 확인됨"
fi

# 2. 기존 설치 제거 후 클론
if [ -d "$ANO_DIR" ]; then
  echo "🔄 기존 설치 업데이트..."
  cd "$ANO_DIR" && git pull
else
  echo "📥 코드 다운로드..."
  git clone https://github.com/gmkdh34-afk/ano.git "$ANO_DIR"
  cd "$ANO_DIR"
fi

# 3. 의존성 설치 및 빌드
echo "📦 의존성 설치..."
npm install --silent
echo "🔨 빌드..."
npm run build

# 4. PATH 등록
ANO_BIN="$ANO_DIR/dist/index.js"
chmod +x "$ANO_BIN"

ALIAS_LINE="alias ano='node $ANO_BIN'"

if [ -f "$ZSHRC" ] && ! grep -q "alias ano=" "$ZSHRC"; then
  echo "$ALIAS_LINE" >> "$ZSHRC"
  echo "✓ ~/.zshrc에 ano 명령어 등록됨"
fi

if [ -f "$BASHRC" ] && ! grep -q "alias ano=" "$BASHRC"; then
  echo "$ALIAS_LINE" >> "$BASHRC"
fi

echo ""
echo "✅ 설치 완료!"
echo ""
echo "새 터미널을 열거나 다음을 실행한 뒤 시작하세요:"
echo "  source ~/.zshrc"
echo "  ano setup"
