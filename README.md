# 공사 사진관리 (Construction Photo Manager)

공사 현장 사진을 촬영일시·위치·공종·내용과 함께 기록하고, 앱 안에서 모아서 관리하는 PWA(웹앱)입니다.

## 주요 기능

- 카메라 촬영 또는 사진 업로드
- 촬영일시, 현장명, 동/호(위치), 공종, 내용 태그 입력
- GPS 위치 자동 기록(선택, 수동 재조회 가능)
- 현장·공종별 폴더 형태로 자동 분류 및 검색/필터(키워드, 현장, 공종, 기간)
- 사진 상세 조회, 수정, 삭제
- 사진대장(목록)을 워드(.docx) 문서로 내보내기 — 바탕체, 표 형식, 흑백
- 오프라인 사용 가능한 PWA (홈 화면에 앱처럼 설치 가능)

## 데이터 저장

모든 사진과 정보는 브라우저의 IndexedDB에 로컬로 저장됩니다(서버 전송 없음). 기기/브라우저를 바꾸면 데이터가 이전되지 않으니 주의하세요.

## 개발

```bash
npm install
npm run dev       # 개발 서버 (기본 http://localhost:5173)
npm run build      # 프로덕션 빌드 (dist/)
npm run preview    # 빌드 결과 미리보기
```

## 기술 스택

- React + TypeScript + Vite
- IndexedDB (idb)
- docx (워드 문서 생성)
- vite-plugin-pwa (PWA/오프라인 지원)
