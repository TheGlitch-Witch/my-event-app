export function Tabs({ children }) { return <div>{children}</div> }
export function TabsList({ children }) { return <div className="flex gap-2">{children}</div> }
export function TabsTrigger({ children, onClick }) {
  return <button onClick={onClick} className="px-2 py-1 border rounded">{children}</button>
}
export function TabsContent({ children }) { return <div className="mt-2">{children}</div> }
