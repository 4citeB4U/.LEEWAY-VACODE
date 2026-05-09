<#
LEEWAY_HEADER - DO NOT REMOVE

REGION: AI
TAG: CORE.AGENT_LEE.VOICE.TEST_SERVER
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Checks the local Agent Lee expressive voice server health endpoint.
#>

param(
  [string]$Url = "http://127.0.0.1:8765/api/v1/health"
)

try {
  $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5
  $response | ConvertTo-Json -Depth 5
  exit 0
} catch {
  Write-Error $_
  exit 1
}
