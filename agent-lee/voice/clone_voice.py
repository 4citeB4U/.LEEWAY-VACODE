import argparse
import os
import soundfile as sf
from f5_tts.api import F5TTS

def main():
    parser = argparse.ArgumentParser(description="Clone a voice using F5-TTS")
    parser.add_argument("--ref_audio", required=True, help="Path to reference audio file (.wav, .mp3)")
    parser.add_argument("--ref_text", required=True, help="Transcript of the reference audio")
    parser.add_argument("--text", required=True, help="Text to generate")
    parser.add_argument("--output", default="output.wav", help="Path to save the generated audio")
    parser.add_argument("--device", default="cpu", help="Torch device to use for inference, e.g. cpu or cuda")
    
    args = parser.parse_args()

    print(f"Loading F5-TTS model...")
    # Initialize the TTS model
    tts = F5TTS(device=args.device)
    
    print(f"Cloning voice from {args.ref_audio}...")
    print(f"Generating speech for text: '{args.text}'")
    
    # Generate speech
    wav, sr, _spec = tts.infer(
        ref_file=args.ref_audio,
        ref_text=args.ref_text,
        gen_text=args.text
    )
    
    # Save output
    sf.write(args.output, wav, sr)
    print(f"Audio saved to {args.output}")

if __name__ == "__main__":
    main()
