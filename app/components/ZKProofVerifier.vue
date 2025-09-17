<template>
  <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-2">ゼロ知識証明検証</h2>
      <p class="text-gray-600">
        プライバシーを保護しながらチケットの有効性を検証します。
      </p>
    </div>

    <!-- 証明生成セクション -->
    <div v-if="!proofGenerated" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">証明の生成</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            チケットID
          </label>
          <input 
            v-model="ticketId"
            type="text"
            class="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="チケットIDを入力"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            秘密の回答（セキュリティ質問の回答）
          </label>
          <input 
            v-model="secretAnswer"
            type="password"
            class="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="セキュリティ質問の回答"
          />
        </div>

        <button 
          @click="generateProof"
          :disabled="!ticketId || !secretAnswer || generating"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          <span v-if="generating">証明生成中...</span>
          <span v-else>ゼロ知識証明を生成</span>
        </button>
      </div>
    </div>

    <!-- 証明表示セクション -->
    <div v-else class="mb-8">
      <h3 class="text-lg font-semibold mb-4">生成された証明</h3>
      
      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            証明データ
          </label>
          <textarea 
            :value="JSON.stringify(proof, null, 2)"
            readonly
            rows="8"
            class="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm bg-white"
          />
        </div>

        <div class="flex space-x-2">
          <button 
            @click="copyProof"
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            コピー
          </button>
          <button 
            @click="resetProof"
            class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            リセット
          </button>
        </div>
      </div>
    </div>

    <!-- 検証セクション -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">証明の検証</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            証明データ
          </label>
          <textarea 
            v-model="verificationProof"
            rows="6"
            class="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
            placeholder="検証する証明データを貼り付けてください"
          />
        </div>

        <button 
          @click="verifyProof"
          :disabled="!verificationProof || verifying"
          class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
        >
          <span v-if="verifying">検証中...</span>
          <span v-else>証明を検証</span>
        </button>
      </div>
    </div>

    <!-- 検証結果 -->
    <div v-if="verificationResult" class="mb-6">
      <div 
        :class="verificationResult.valid ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'"
        class="p-4 border rounded-md"
      >
        <div class="flex items-center mb-2">
          <svg 
            v-if="verificationResult.valid"
            class="w-5 h-5 text-green-600 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <svg 
            v-else
            class="w-5 h-5 text-red-600 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span 
            :class="verificationResult.valid ? 'text-green-800' : 'text-red-800'"
            class="font-semibold"
          >
            {{ verificationResult.valid ? '検証成功' : '検証失敗' }}
          </span>
        </div>
        
        <p 
          :class="verificationResult.valid ? 'text-green-700' : 'text-red-700'"
          class="mb-3"
        >
          {{ verificationResult.message }}
        </p>

        <div v-if="verificationResult.details" class="text-sm space-y-1">
          <p><strong>チケット有効性:</strong> {{ verificationResult.details.ticketValid ? '有効' : '無効' }}</p>
          <p><strong>回答一致:</strong> {{ verificationResult.details.answerMatch ? '一致' : '不一致' }}</p>
          <p><strong>証明時刻:</strong> {{ formatDateTime(verificationResult.details.timestamp) }}</p>
        </div>
      </div>
    </div>

    <!-- 技術情報 -->
    <div class="bg-blue-50 p-4 rounded-lg">
      <h4 class="font-semibold text-blue-800 mb-2">ゼロ知識証明について</h4>
      <p class="text-sm text-blue-700">
        この機能では、チケットの有効性とセキュリティ質問の回答を知っていることを、
        実際の回答内容を明かすことなく証明できます。
        プライバシーを保護しながら本人確認が可能です。
      </p>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 rounded-md">
      <p class="text-red-700">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { createHash } from 'crypto'

const emit = defineEmits(['proof-verified'])

const ticketId = ref('')
const secretAnswer = ref('')
const proof = ref(null)
const proofGenerated = ref(false)
const verificationProof = ref('')
const verificationResult = ref(null)
const generating = ref(false)
const verifying = ref(false)
const error = ref('')

// 簡易的なゼロ知識証明の実装（実際の本番環境ではcircomなどを使用）
const generateProof = async () => {
  generating.value = true
  error.value = ''
  
  try {
    // チケット情報を取得
    const ticketResponse = await $fetch(`/api/tickets/${ticketId.value}`)
    const ticket = ticketResponse.ticket
    
    if (!ticket) {
      throw new Error('チケットが見つかりません')
    }

    // 秘密の値をハッシュ化
    const answerHash = createHash('sha256').update(secretAnswer.value.toLowerCase().trim()).digest('hex')
    
    // 証明データを生成（実際のZK証明では複雑な数学的計算を行う）
    const proofData = {
      ticketId: ticketId.value,
      commitment: createHash('sha256').update(`${ticketId.value}-${answerHash}`).digest('hex'),
      challenge: Math.random().toString(36).substring(2, 15),
      response: createHash('sha256').update(`${answerHash}-${Date.now()}`).digest('hex'),
      timestamp: Date.now(),
      publicInputs: {
        eventId: ticket.event.id,
        ticketStatus: ticket.status
      }
    }

    // 証明の署名を生成
    proofData.signature = createHash('sha256')
      .update(JSON.stringify(proofData))
      .digest('hex')

    proof.value = proofData
    proofGenerated.value = true
    
  } catch (err) {
    error.value = err.message || '証明の生成に失敗しました'
  } finally {
    generating.value = false
  }
}

const verifyProof = async () => {
  verifying.value = true
  error.value = ''
  verificationResult.value = null
  
  try {
    let proofData
    try {
      proofData = JSON.parse(verificationProof.value)
    } catch {
      throw new Error('無効な証明データ形式です')
    }

    // 証明データの検証
    const response = await $fetch('/api/zk/verify', {
      method: 'POST',
      body: { proof: proofData }
    })

    verificationResult.value = response
    
    if (response.valid) {
      emit('proof-verified', {
        ticketId: proofData.ticketId,
        verified: true,
        timestamp: proofData.timestamp
      })
    }
    
  } catch (err) {
    error.value = err.data?.message || err.message || '証明の検証に失敗しました'
    verificationResult.value = {
      valid: false,
      message: error.value
    }
  } finally {
    verifying.value = false
  }
}

const copyProof = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(proof.value, null, 2))
    // 成功フィードバック（簡易実装）
    const button = event.target
    const originalText = button.textContent
    button.textContent = 'コピー完了!'
    setTimeout(() => {
      button.textContent = originalText
    }, 2000)
  } catch (err) {
    error.value = 'クリップボードへのコピーに失敗しました'
  }
}

const resetProof = () => {
  proof.value = null
  proofGenerated.value = false
  ticketId.value = ''
  secretAnswer.value = ''
  verificationResult.value = null
}

const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>