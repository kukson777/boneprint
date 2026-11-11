export default defineEventHandler(() => {
  throw createError({ statusCode: 500, statusMessage: 'Broken' })
})
