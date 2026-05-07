import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-12">
      <img src="/brand/Simbolo-coral.svg" alt="Lucsan Design" className="h-12" />
      <h1 className="text-6xl font-display">Lucsan Design</h1>
      <p className="text-lg text-muted-foreground">Foundations smoke test</p>
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Coral</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <div className="flex gap-2">
        <div className="h-12 w-12 rounded-md bg-brand-black" />
        <div className="h-12 w-12 rounded-md bg-brand-coral" />
        <div className="h-12 w-12 rounded-md bg-brand-blue" />
        <div className="h-12 w-12 rounded-md bg-brand-green" />
        <div className="h-12 w-12 rounded-md bg-brand-yellow" />
      </div>
    </main>
  )
}
