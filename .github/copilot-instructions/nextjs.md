STACK: Next.js 14 App Router, TypeScript, Tailwind
CONVENTIONS:
- Use server components by default; add "use client" only when required
- Co-locate components with their routes inside app/
- Name files page.tsx, layout.tsx, loading.tsx, error.tsx per Next.js convention
- Fetch data in server components using async/await; never useEffect for data fetching
- Use next/image for all images; never raw <img> tags
CODE STYLE:
- Functional components only, no class components
- Explicit return types on all exported functions
- Import order: react → next → third-party → internal → styles
NEVER:
- Use getServerSideProps or getStaticProps (App Router only)
- Mix "use client" and async server data fetching in the same component
- Hardcode environment values; always use process.env with a NEXT_PUBLIC_ prefix for client vars
