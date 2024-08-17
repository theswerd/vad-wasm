import { Hono } from 'npm:hono'
import { VAD } from '../src/main.ts';
const app = new Hono()

const vad = new VAD();
await vad.init();

app.post('/', async (c) => {
    // posted file
    const body = await c.req.parseBody()
    console.log(body)
    const file = body.file;
    console.log(file)
    if (!file) {
        return c.text("No file uploaded", 400)
    }

    const isFile = file instanceof File 
    if (!isFile) {
        return c.text("Invalid file", 400)
    }

    // Read the file
    const fileData = await file.arrayBuffer()
    const audioBuffer = new Uint8Array(fileData)
    const result = []
    for await(const speaking of vad.processAudio(audioBuffer)){
        console.log(
            speaking ? "Speaking" : "Silence"
        );
        result.push(speaking ? "Speaking" : "Silence")
    }
    return c.json(result)
});

Deno.serve(app.fetch)