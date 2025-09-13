# 📋 進捗まとめ

## ✅ 完了したこと（タスク1の一部）

1. プロジェクト基盤設定

- Prisma設定: 完了
- cuid ID戦略: 採用・実装完了
- SQLite開発環境: 設定完了

2. 認証システム設計

- OAuth + SIWE方針: 決定
- 複数プロバイダー対応: 設計完了
- システム内ウォレット: 設計完了（初回購入時生成）
- アカウント統合: OAuth認証のみで統合する方針決定

3. データベーススキーマ実装

完成したモデル:

- [x] User: OAuth情報、ウォレット情報、ロール管理
- [x] Account: 複数OAuth対応、統合機能準備
- [x] Event: 基本情報、厳密な価格管理（Decimal）、複数日対応
完成したEnum:

- [x] Role（CUSTOMER/ORGANIZER/STAFF）
- [x] Provider（GOOGLE/GITHUB）
- [x] EventStatus（DRAFT/PUBLISHED/CANCELLED/COMPLETED）
- [x] EventType（SINGLE_DAY/MULTI_DAY）

4. 設計方針決定

- 価格管理: Decimal(10, 2)で厳密管理（税込み、日本円）
- 在庫管理: 保存方式（availableTickets）
- 複数日イベント: EventTypeで分岐、将来拡張可能


## 🔄 次にやること

1. 残りのデータベースモデル

- Ticket: チケット基本情報、QRコード、セキュリティ
- Purchase: 購入記録、決済情報
- QuestionTemplate: セキュリティ質問テンプレート
- TicketSecurity: 質問・回答システム
- TicketVerification: 入場時検証記録