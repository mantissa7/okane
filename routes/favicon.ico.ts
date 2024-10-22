export default function favicon() {
    return new Response(Bun.file('./static/favicon.ico'));
}