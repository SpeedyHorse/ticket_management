# 全体

## DBとの情報交換について

```mermaid
sequenceDiagram
    box skyblue Client
        participant Pages
        participant Composables
    end

    box lightgreen Server
        participant API
        participant DB
    end

    Pages->>Composables: call use...
    Composables->>API: fetch api
    API->>DB: call with prisma

    DB-->>API: answer
    API-->>Composables: response
    Composables-->>Pages: return
```
