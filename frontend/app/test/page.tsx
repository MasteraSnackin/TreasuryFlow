export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>✅ Next.js is Working!</h1>
      <p>If you can see this, the server is running correctly.</p>
      <p>Server Time: {new Date().toISOString()}</p>
      <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        Go to Home Page
      </a>
    </div>
  )
}