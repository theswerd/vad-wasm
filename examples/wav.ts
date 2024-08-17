
// Deno args

const args = Deno.args;
const filename = args[0];

// Read the file
const file = await Deno.readFile(filename);

import {VAD} from '../src/main.ts'

const vad = new VAD();
await vad.init();

for await(const speaking of vad.processAudio(file)){
    console.log(
        speaking ? "Speaking" : "Silence"
    );
}

