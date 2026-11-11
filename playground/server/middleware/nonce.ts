// A test fixture: real sites set a per-request value that their CSP header also carries
export default defineEventHandler((event) => {
  if (getQuery(event).nonce) event.context.nonce = 'test-nonce'
})
