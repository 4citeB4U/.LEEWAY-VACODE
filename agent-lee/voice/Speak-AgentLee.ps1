param(
  [Parameter(Mandatory=$true)]
  [string]$Text
)

# Strip code blocks and inline code before speaking.
$clean = [regex]::Replace($Text, '```[\s\S]*?```', '[code omitted]')
$clean = [regex]::Replace($clean, '`[^`]+`', '[code omitted]')
$clean = [regex]::Replace($clean, 'https?://\S+', '[link omitted]')

if ($clean.Length -gt 900) {
  $clean = $clean.Substring(0, 900) + "..."
}

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0
$synth.Volume = 90
$synth.Speak($clean)
