# v8-cli Integration Test Spec

## Prerequisites

1. g2-sync API 서버 실행 중 (기본 `localhost:3003`)
2. Admin role JWT 토큰 발급 완료
3. v8-cli 설치 및 설정 완료:
   ```bash
   v8 config set-env local
   v8 config set-token <admin-jwt>
   ```

---

## Test Cases

### 1. Auth

```bash
v8 auth
```
- [ ] `uid`, `handle`, `name`, `role`, `email` 출력
- [ ] `role: admin` 확인

### 2. Users

```bash
v8 users search michael
```
- [ ] 테이블 출력 (UID, Email, Handle, Name, Credit($), Seller)
- [ ] 검색 결과 1건 이상

```bash
v8 users search nonexistent_user_xyz
```
- [ ] `(no results)` 출력

### 3. Credits

```bash
v8 credits balance <admin-email>
```
- [ ] `uid  email  $금액` 형식 출력

```bash
v8 credits give <test-uid> 1
```
- [ ] `Gave $1 to user ...` 출력
- [ ] `v8 credits balance`로 잔액 $1 증가 확인

### 4. Comments - List

```bash
v8 comments list --limit 5
```
- [ ] 테이블 출력 (ID, Del, User, Email, Verse, Content)
- [ ] 5건 출력
- [ ] `total: N (page X/Y)` 표시

```bash
v8 comments list --limit 5 --filter deleted
```
- [ ] Del 컬럼 전부 `Y`

### 5. Comments - Search

```bash
v8 comments search --by userEmail <known-email> --filter all
```
- [ ] 해당 유저 댓글만 출력
- [ ] 삭제된 댓글 포함 (Del=Y)

```bash
v8 comments search --by verseTitle "Texas Hold'em Poker"
```
- [ ] 해당 verse 댓글만 출력

### 6. Comments - Delete / Restore

```bash
# 삭제할 테스트 댓글 ID 확인
v8 comments list --limit 1
# 해당 ID로 삭제
v8 comments delete <id>
```
- [ ] `Deleted 1 comment(s) (0 failed)` 출력

```bash
v8 comments restore <id>
```
- [ ] `Restored 1 comment(s) (0 failed)` 출력
- [ ] `v8 comments search`로 복원 확인

### 7. Verses

```bash
v8 verses search "Poker"
```
- [ ] 테이블 출력 (ID, ShortID, Title, Vis, Feat, Show)

```bash
v8 verses get <shortId>
```
- [ ] id, shortId, title, visibility, featured, showcase, creator 출력

```bash
v8 verses list --limit 3 --featured
```
- [ ] featured=true인 verse만 출력

### 8. Coupons

```bash
v8 coupons generate 1 3
```
- [ ] 쿠폰 코드 3줄 출력
- [ ] `Generated 3 coupons ($1 each)` 출력

### 9. JSON 모드

```bash
v8 --json comments list --limit 2
```
- [ ] raw JSON 출력 (파이프 가능)

### 10. Error Handling

```bash
v8 --token invalid_token auth
```
- [ ] `Error:` 메시지 출력, 비정상 종료

```bash
v8 comments search --by userEmail
```
- [ ] keyword 누락 에러 표시

---

## Notes

- credits give 테스트는 실제 잔액이 변경되므로 테스트용 계정에서만 실행
- comments delete/restore는 반드시 쌍으로 실행해서 원상복구
