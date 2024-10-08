// src/routes/api/countup/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { writable } from 'svelte/store';

const count = writable(0)

export const GET: RequestHandler = async () => {
    let isClosed = false

    const stream = new ReadableStream({
        start(controller) {
            const send = (value: number) => {
                if (isClosed) {
                    console.log("Stream is already closed, skipping message")
                    return
                }
                const message = `data: ${JSON.stringify({ count: value })}\n\n`;
                try {
                    controller.enqueue(message);
                } catch (err) {
                    console.error("Error enqueuing message:", err);
                }
            }

            const unsubscribe = count.subscribe(value => {
                send(value)
            })

            const keepAliveInterval = setInterval(() => {
                if (isClosed) {
                    clearInterval(keepAliveInterval);
                } else {
                    try {
                        controller.enqueue(': keep-alive\n\n');
                    } catch (err) {
                        clearInterval(keepAliveInterval);
                        unsubscribe();
                        controller.close();
                        console.error("Stream closed, stopping keep-alive:", err);
                    }
                }
            }, 15000)

            controller.close = () => {
                unsubscribe()
                clearInterval(keepAliveInterval)
                isClosed = true
            }
        }
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        }
    })
}