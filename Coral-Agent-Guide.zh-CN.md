## Coral Server Agent 集成指南（InsightPilot 对齐版）

本指南面向使用 `coral-server` 开发与编排 Agent 的工程师，覆盖：如何创建并注册 Agent、如何通过会话 API 启动 Agent、Agent 进程如何以 MCP 方式连接 Coral、如何注入密钥与配置、以及如何按照 InsightPilot PRD 进行多 Agent 协作与串行策略落地。

### 适用范围
- 仓库：`coral-server`
- Agent 语言：不限（Node/Python/…），需作为 MCP 客户端连接 Coral
- 运行时：`executable` 或 `docker`（二选一）

---

## 核心概念速览
- 注册表（Registry）：Coral 通过 `src/main/resources/registry.toml` 引入一个或多个 Agent 目录。每个目录内必须含 `coral-agent.toml`，定义 Agent 元数据、选项（options）、运行时（runtimes）。
- 会话（Session）：`POST /api/v1/sessions` 创建。请求体携带 `AgentGraphRequest`，声明所需的 Agent、运行时与参数等。会话创建时 Coral 会拉起 Agent 进程，并通过 MCP 与其通信。
- MCP 连接：Agent 进程启动后，从环境变量读取 MCP 连接地址 `CORAL_CONNECTION_URL` 并连接，随后注册工具与资源。
- 选项（Options）：在 `coral-agent.toml` 的 `[options.*]` 中声明（如 API Key）。会话请求的 `options` 将以环境变量注入 Agent 进程。

---

## 1. 注册你的 Agent

### 1.1 新建目录与 `coral-agent.toml`
在项目中新建你的 Agent 目录（示例：`agents/insightpilot-analyzer/`），并创建 `coral-agent.toml`：

```toml
[agent]
name = "insightpilot-analyzer"
version = "0.0.1"

[options.MISTRAL_API_KEY]
type = "string"
description = "Mistral API key"

[options.ELEVENLABS_API_KEY]
type = "string"
description = "ElevenLabs API key (optional)"

[options.CROSSMINT_PROJECT_ID]
type = "string"
description = "Crossmint project id (optional)"

[options.CROSSMINT_CLIENT_SECRET]
type = "secret"
description = "Crossmint client secret (optional)"

[runtimes.executable]
# 推荐使用目录内启动脚本，以目录为工作目录启动
# 例如 Node: ["node", "run.js"] 或 Python: ["bash", "run.sh"]
command = ["node", "run.js"]
```

要点：
- `name`/`version` 组成注册表标识（`AgentRegistryIdentifier`），会话中以 `{ name, version }` 引用。
- `[options.*]` 声明的键名将作为同名环境变量注入 Agent 进程，值来自会话请求 `options`。
- 可选用 `runtimes.docker` 替代 `executable`，将镜像打包后在容器内运行（见 1.3）。

内置样例（供对照）：
```9:11:examples/camel-search-maths/interface/coral-agent.toml
[agent]
name = "interface"
version = "0.0.1"
```

### 1.2 在注册表中引入 Agent 目录
编辑 `src/main/resources/registry.toml`，新增一条 `[[local-agent]]` 指向你的 Agent 目录：

```toml
[[local-agent]]
path = "agents/insightpilot-analyzer"
```

现有样例（对照）：
```1:9:src/main/resources/registry.toml
[[local-agent]]
path = "examples/camel-search-maths/interface"
```

### 1.3 运行时选择
- `executable`：以当前 Agent 目录为工作目录执行 `command`。Coral 注入环境变量并管理进程生命周期。
- `docker`：在容器中运行；Coral 注入相同环境变量到容器。适合生产镜像分发与隔离。

运行时注入环境变量示例（代码参考）：
```1:29:src/main/kotlin/org/coralprotocol/coralserver/agent/runtime/CoralOrchestratedEnvs.kt
fun getCoralSystemEnvs(
    params: RuntimeParams,
    apiUrl: Url,
    mcpUrl: Url,
    orchestrationRuntime: String
): Map<String, String>
```

---

## 2. 启动与连接（会话 + MCP）

### 2.1 创建会话（POST /api/v1/sessions）
URL：`/api/v1/sessions`

请求体（`SessionRequest`）包含 `applicationId`、`privacyKey` 和 `agentGraphRequest`：
```json
{
  "applicationId": "insightpilot-demo",
  "privacyKey": "demo",
  "agentGraphRequest": {
    "agents": [
      {
        "id": { "name": "insightpilot-analyzer", "version": "0.0.1" },
        "name": "analyzer",
        "description": "InsightPilot analyzer",
        "options": {
          "MISTRAL_API_KEY": { "type": "string", "value": "sk-..." },
          "ELEVENLABS_API_KEY": { "type": "string", "value": "eleven-..." },
          "CROSSMINT_PROJECT_ID": { "type": "string", "value": "..." },
          "CROSSMINT_CLIENT_SECRET": { "type": "string", "value": "..." }
        },
        "systemPrompt": "You analyze X(Twitter) user data and produce profile+questions+insights.",
        "blocking": true,
        "customToolAccess": [],
        "coralPlugins": [ { "type": "close_session_tool" } ],
        "provider": { "type": "local", "runtime": "executable" }
      }
    ],
    "groups": [["analyzer"]],
    "customTools": {}
  }
}
```

相关数据结构（代码参考）：
```1:20:src/main/kotlin/org/coralprotocol/coralserver/routes/api/v1/SessionRoutes.kt
@Resource("/api/v1/sessions")
class Sessions
```
```1:20:src/main/kotlin/org/coralprotocol/coralserver/session/models/SessionRequest.kt
@Serializable
data class SessionRequest(
    val applicationId: String,
    val sessionId: String? = null,
    val privacyKey: String,
    val agentGraphRequest: AgentGraphRequest
)
```
```1:43:src/main/kotlin/org/coralprotocol/coralserver/agent/graph/GraphAgentRequest.kt
@Serializable
data class GraphAgentRequest(
    val id: AgentRegistryIdentifier,
    val name: String,
    val description: String?,
    val options: Map<String, AgentOptionValue>,
    val systemPrompt: String?,
    val blocking: Boolean?,
    val customToolAccess: Set<String>,
    @SerialName("coralPlugins")
    val plugins: Set<GraphAgentPlugin>,
    val provider: GraphAgentProvider
)
```

- `provider`：本地运行时 `{"type":"local","runtime":"executable"}` 或 `{"type":"local","runtime":"docker"}`。
- `groups`：二维集合限定允许互通的 Agent 组；同组内 Agent 在会话中互通。
- `customTools` 与 `customToolAccess`：注册自定义 MCP 工具供特定 Agent 使用（见 5.）。

### 2.2 Agent 进程如何连接 MCP
Agent 启动后，从以下环境变量读取连接与上下文信息，并连接 `CORAL_CONNECTION_URL`：
- `CORAL_CONNECTION_URL`：MCP 连接地址（SSE）。
- `CORAL_AGENT_ID`：会话内 Agent 名（`GraphAgentRequest.name`）。
- `CORAL_ORCHESTRATION_RUNTIME`：`executable` 或 `docker`。
- `CORAL_SESSION_ID`：会话 ID。
- `CORAL_SEND_CLAIMS`：本地为 `0`，远程为 `1`。
- `CORAL_API_URL`：当前 Coral API 基址。
- `CORAL_SSE_URL`：等同于连接地址（兼容性字段）。
- `CORAL_PROMPT_SYSTEM`：若 `systemPrompt` 提供则注入。

连接 URL 生成逻辑（代码参考）：
```31:64:src/main/kotlin/org/coralprotocol/coralserver/agent/runtime/ApplicationRuntimeContext.kt
fun getMcpUrl(params: RuntimeParams, addressConsumer: AddressConsumer): Url {
    val builder = URLBuilder(getApiUrl(addressConsumer))
    builder.parameters.append("agentId", params.agentName)
    when (params) { /* Local/Remote 路径差异 */ }
    return builder.build()
}
```

> MCP 侧需要实现：
> - 作为客户端连接 `CORAL_CONNECTION_URL`；
> - 注册你的 MCP Tools/Resources；
> - 响应 Coral 发起的工具调用与消息；
> - 可利用 `CORAL_PROMPT_SYSTEM` 作为系统提示词。

---

## 3. 选项与密钥管理（Options）
- 在 `coral-agent.toml` 的 `[options.*]` 声明可用选项，类型包括 `string`、`number`、`secret`。
- 会话请求中的 `options` 必须与声明匹配，否则 Coral 将拒绝（未知键、缺失必填）。
- 注入行为：会话请求 `options` → 转为字符串 → 写入同名环境变量到 Agent 进程/容器。

相关类型（代码参考）：
```1:61:src/main/kotlin/org/coralprotocol/coralserver/agent/registry/AgentOption.kt
sealed class AgentOption { /* string/number/secret，required 规则 */ }
```
```1:27:src/main/kotlin/org/coralprotocol/coralserver/agent/registry/AgentOptionValue.kt
sealed class AgentOptionValue { /* String/Number 封装 */ }
```

实践建议：将敏感密钥标注为 `secret`；非敏感默认值可用 `string` 带 `default`。

---

## 4. 多 Agent 编排与 InsightPilot 对齐
根据 PRD（参见 `InsightPilot - PRD.md`）：
- 单用户分析流程可由一个综合 Agent 完成（抓取→画像→提问→访谈→音频→NFT），也可拆分为多个专用 Agent：
  - `profile-analyst`：画像与兴趣/痛点抽取（Mistral）。
  - `product-expert`：基于历史洞察生成个性化问题与模拟访谈（串行学习）。
  - `voice-agent`：将问题/摘要转为音频（ElevenLabs）。
  - `nft-agent`：铸造 Insight 报告为 NFT（Crossmint）。
- 若选择多 Agent：
  - 在 `agentGraphRequest.agents` 中分别添加各 Agent；
  - 用 `groups` 将需要互通的 Agent 放入同组；
  - 使用 `customTools` 与 `customToolAccess` 限制工具可见范围。
- 串行策略与速率限制：
  - 在 Agent 实现层按 PRD 建议串行处理列表（例如批处理时 `await delay(1500)`），确保学习与速率安全。
  - 会话侧可将核心 Agent 标记 `blocking: true`，确保其先行初始化。
- 插件（Plugins）：
  - 可启用 `close_session_tool` 便于在任务完成后主动关闭会话资源。

---

## 5. 自定义工具与资源（可选）
- `customTools`：在 `AgentGraphRequest` 顶层注册可用工具。
- `customToolAccess`：在某个 `GraphAgentRequest` 中列出该 Agent 可用的自定义工具键。
- 内置插件：`close_session_tool` 可直接开启关闭会话的 MCP 工具。

相关入口（代码参考）：
```1:26:src/main/kotlin/org/coralprotocol/coralserver/agent/graph/plugin/GraphAgentPlugin.kt
sealed interface GraphAgentPlugin { /* CloseSessionTool 安装入口 */ }
```
```1:17:src/main/kotlin/org/coralprotocol/coralserver/server/CoralAgentIndividualMcp.kt
init {
    addThreadTools(); addMessageResource(); addInstructionResource(); addAgentResource()
}
```

---

## 6. 远程 Agent（可选）
- 若需从其他 Coral Server 租用 Agent：使用 `provider = { type: "remote_request", ... }`。
- 需结合导出设置、费用上限、远程服务器选择策略等（支付/索引特性涉及更多配置）。
- InsightPilot MVP 阶段通常使用本地 `local/executable` 或 `local/docker` 即可。

类型参考：
```1:71:src/main/kotlin/org/coralprotocol/coralserver/agent/graph/GraphAgentProvider.kt
sealed class GraphAgentProvider { /* local / remote_request / remote */ }
```

---

## 7. 端到端最小示例（Local Executable）
1) 新建 `agents/insightpilot-analyzer/coral-agent.toml`（见 1.1）。
2) 在 `src/main/resources/registry.toml` 增加：
```toml
[[local-agent]]
path = "agents/insightpilot-analyzer"
```
3) 发起会话：`POST /api/v1/sessions`，请求体示例见 2.1。
4) Agent 进程读取环境变量并连接 `CORAL_CONNECTION_URL`，注册工具并执行业务逻辑。

---

## 8. 常见问题（FAQ）
- 连接不上 MCP：
  - 检查 `CORAL_CONNECTION_URL` 是否可达；确认服务端口与路径参数无误；
  - 确认 Agent 进程以工作目录为 Agent 目录启动（相对路径脚本需注意）。
- 选项校验失败：
  - `options` 键名必须在 `coral-agent.toml` 的 `[options.*]` 中声明；缺失必填或含未知键会被拒绝。
- 速率限制：
  - 按 PRD 建议在 Agent 内实现串行与延迟；避免并行触发外部 API 限流。
- 会话 API 路径：
  - 以 `@Resource("/api/v1/sessions")` 为准（见代码），部分旧示例文件为历史格式，仅供参考。

---

## 9. 关键文件索引
- 注册/Graph 数据结构与路由：
  - `src/main/kotlin/org/coralprotocol/coralserver/agent/graph/GraphAgentRequest.kt`
  - `src/main/kotlin/org/coralprotocol/coralserver/agent/graph/AgentGraphRequest.kt`
  - `src/main/kotlin/org/coralprotocol/coralserver/routes/api/v1/SessionRoutes.kt`
- 运行时与注入：
  - `src/main/kotlin/org/coralprotocol/coralserver/agent/runtime/ExecutableRuntime.kt`
  - `src/main/kotlin/org/coralprotocol/coralserver/agent/runtime/DockerRuntime.kt`
  - `src/main/kotlin/org/coralprotocol/coralserver/agent/runtime/CoralOrchestratedEnvs.kt`
  - `src/main/kotlin/org/coralprotocol/coralserver/agent/runtime/ApplicationRuntimeContext.kt`
- 注册表与示例：
  - `src/main/resources/registry.toml`
  - `examples/camel-search-maths/**/coral-agent.toml`

---

## 10. 与 InsightPilot PRD 的直接映射
- 核心分析端点（PRD 5.1）：由前端/后端调用 Coral 的会话创建 + 消息流完成；Coral 不直接暴露业务 `/api/analyze`，而是通过会话与 MCP 工具协调业务链。
- 串行处理（PRD 重要设计 1）：在 Agent 侧落地；会话层可通过 `blocking` 与 `groups` 确保拓扑与初始化顺序。
- 智能体间对话（PRD 重要设计 2）：拆分为多个 Agent 并分组，或在单 Agent 内以 MCP 工具模拟子角色协作。
- 错误处理（PRD 重要设计 3）：在 Agent 侧实现降级（例如问题生成失败则回退通用问题）、重试与日志（标准输出将被 Coral 捕获）。
- 环境变量（PRD 环境配置）：在会话时传入 `options`，自动注入为同名环境变量；系统级变量由 Coral 注入（见 2.2）。

---

如需我为 InsightPilot 生成 `agents/insightpilot-analyzer/` 的最小 MCP 客户端脚手架（Node/Python）与示例启动脚本，可在此基础上继续补充。
