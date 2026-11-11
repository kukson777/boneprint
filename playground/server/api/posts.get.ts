export default defineEventHandler(async (event) => {
  if (getQuery(event).slow) await new Promise(resolve => setTimeout(resolve, 2000))
  return [
    { id: 1, title: 'The real post title', body: 'The real post body, long enough to wrap onto a second line in a narrow column.' },
    { id: 2, title: 'Second real post', body: 'Shorter.' },
  ]
})
