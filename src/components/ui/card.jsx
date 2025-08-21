export function Card({className='',...p}){return <div className={`rounded-2xl border bg-white ${className}`} {...p}/>;}
export function CardHeader({className='',...p}){return <div className={`p-4 ${className}`} {...p}/>;}
export function CardTitle({className='',...p}){return <h3 className={`text-xl ${className}`} {...p}/>;}
export function CardContent({className='',...p}){return <div className={`p-4 pt-0 ${className}`} {...p}/>;}
