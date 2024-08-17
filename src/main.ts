import LibFvadModule from "../out/libfvad.js";


/**
 * Voice Activity Detector (VAD) using libfvad on WASM.
 */
export class VAD {
  _fvadPtr?: number;
  // deno-lint-ignore no-explicit-any
  _module?: any;
  _successfulyInitialized: boolean = false;

  /**
   * Initialize the Voice Activity Detector (VAD).
   * @param props - The properties to initialize the VAD with.
   * @param props.mode - The VAD operating mode (0 to 3).
   * @param props.sampleRate - The input audio sample rate in Hz (8000 to 48000).
   */
  async init(props?: { mode?: number; sampleRate?: number }): Promise<void> {
    const mode = props?.mode ?? 3;
    const sampleRate = props?.sampleRate ?? 8000;

    const Module = await LibFvadModule();
    this._module = Module;

    // Initialize libfvad
    const fvadPtr = Module._fvad_new();

    if (fvadPtr === 0) {
      throw new Error("Failed to initialize libfvad");
    } else {
      this._fvadPtr = fvadPtr;
    }

    // configure libfvad
    Module._fvad_set_mode(fvadPtr, mode);
    Module._fvad_set_sample_rate(fvadPtr, sampleRate);

    this._successfulyInitialized = true;
  }

  /**
   * Check if the VAD is initialized.
   */
  isInitialized(): boolean {
    return this._successfulyInitialized;
  }

  /**
   * Process an audio buffer and detect voice activity.
   * @param audioBuffer - The audio buffer to process.
   * @returns An async generator that yields `true` if speech is detected in the frame, `false` otherwise.
   */
  async *processAudio(audioBuffer: Uint8Array): AsyncGenerator<boolean> {
    if (!this.isInitialized()) {
      throw new Error("VAD not initialized");
    }

    // Convert the audio buffer to 16-bit samples
    const audioData = new Int16Array(audioBuffer.buffer);

    const Module = this._module!;
    const fvadPtr = this._fvadPtr;

    // Define the frame size (e.g., 160 samples for 20ms of audio at 8kHz)
    const frameSize = 160;

    // Process each frame
    for (let i = 0; i < audioData.length; i += frameSize) {
      const frame = audioData.subarray(i, i + frameSize);

      if (frame.length < frameSize) break; // Skip incomplete frames

      // Allocate memory for the frame in WebAssembly
      const framePtr = Module._malloc(frame.length * frame.BYTES_PER_ELEMENT);
      Module.HEAP16.set(frame, framePtr >> 1);

      // Process the frame with libfvad
      const result = Module._fvad_process(fvadPtr, framePtr, frameSize);
      yield result === 1;

      // Free the memory
      Module._free(framePtr);
    }
  }

  /**
   * Free the resources used by the Voice Activity Detector (VAD).
   */
  free() {
    if (this.isInitialized()) {
      this._module!._fvad_free(this._fvadPtr);
      this._fvadPtr = undefined;
      this._module = undefined;
      this._successfulyInitialized = false;
    }
  }
}
