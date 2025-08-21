import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Eye, EyeOff, History, Loader2, LogIn, QrCode, Search, Settings, Share2, Shuffle, Upload, UserPlus, Users, X } from "lucide-react";
import QRCode from "qrcode";

// -- Simple local storage helpers --
const load = (k, d) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
};
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
};

// -- Types --
/** RSVP record shape */
// { id, name, discord, email, event, code, ts, attended, claimed }

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const csv = {
  encode(rows){
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const esc = (s = "") => `"${String(s).replace(/"/g, '""')}"`;
    const body = rows.map(r => headers.map(h => esc(r[h])).join(",")).join("\n");
    return [headers.join(","), body].join("\n");
  },
};

function download(text, name, type="text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function useQR(data) {
  const [url, setUrl] = useState("");
  useEffect(() => { let mounted = true; (async () => {
    if (!data) { setUrl(""); return; }
    try { const u = await QRCode.toDataURL(String(data), { margin: 0 }); if (mounted) setUrl(u); } catch {}
  })(); return () => { mounted = false; } }, [data]);
  return url;
}

function Pill({children}) { return (
  <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{children}</span>
); }

function Section({title, children, actions}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex gap-2">{actions}</div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// -- RSVP Form --
function RSVPForm({ onSubmit, eventName }) {
  const [name, setName] = useState("");
  const [discord, setDiscord] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [record, setRecord] = useState(null);
  const qr = useQR(record?.code);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !discord.trim() || !agree) return;
    setBusy(true);
    const rec = {
      id: uid(),
      name: name.trim(),
      discord: discord.trim(),
      email: email.trim(),
      event: eventName,
      code: uid().slice(0, 8).toUpperCase(),
      ts: new Date().toISOString(),
      attended: false,
      claimed: false,
    };
    onSubmit(rec);
    setRecord(rec);
    setBusy(false);
  }

  if (record) {
    return (
      <div className="text-center space-y-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-green-800">🎉 You're all set!</h3>
          <p className="text-lg text-green-700">Your free ticket is ready!</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-green-300">
          <p className="text-sm text-gray-600 mb-3">Show this code when you arrive:</p>
          <div className="text-4xl font-bold font-mono tracking-wider text-green-800 mb-4">{record.code}</div>
          {qr && <img src={qr} alt="QR Code" className="h-32 w-32 mx-auto border rounded" />}
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <div>📝 {record.name}</div>
          <div>💬 {record.discord}</div>
          {record.email && <div>📧 {record.email}</div>}
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => window.print()} variant="secondary" size="lg">
            <PrinterIcon/> Print Ticket
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigator.clipboard.writeText(record.code)}>
            <Copy className="h-4 w-4 mr-2"/>Copy Code
          </Button>
          <Button variant="outline" size="lg" onClick={() => download(JSON.stringify(record, null, 2), `ticket_${record.code}.json`, "application/json")}>
            <Download className="h-4 w-4 mr-2"/>Save Ticket
          </Button>
        </div>
        
        <div className="text-sm text-gray-500 bg-yellow-50 p-3 rounded border">
          💡 <strong>Pro tip:</strong> Screenshot this page or save the code somewhere safe!
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-base font-medium">Your Name</Label>
          <Input value={name} onChange={e=>setName(e.target.value)} placeholder="What should we call you?" required className="text-lg py-3" />
        </div>
        <div>
          <Label className="text-base font-medium">Discord Username</Label>
          <Input value={discord} onChange={e=>setDiscord(e.target.value)} placeholder="@YourDiscordName" required className="text-lg py-3" />
        </div>
      </div>
      <div>
        <Label className="text-base font-medium">Email <span className="text-muted-foreground text-sm">(optional - for confirmation)</span></Label>
        <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" className="text-lg py-3" />
      </div>
      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded border">
        <Checkbox id="agree" checked={agree} onCheckedChange={v=>setAgree(Boolean(v))} />
        <Label htmlFor="agree" className="text-sm cursor-pointer">✅ I will attend <span className="font-medium">{eventName}</span> and understand I get a free item when I show up!</Label>
      </div>
      <Button type="submit" disabled={!agree || busy || !name.trim() || !discord.trim()} className="w-full text-lg py-6 bg-green-600 hover:bg-green-700">
        {busy ? (<><Loader2 className="h-4 w-4 animate-spin mr-2"/>Creating your ticket...</>) : (<><UserPlus className="h-4 w-4 mr-2"/>🎟️ GET MY FREE TICKET</>)}
      </Button>
    </form>
  );
}

function PrinterIcon(){return (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 mr-2 fill-current"><path d="M6 2h12v4H6V2zM6 14H4a2 2 0 0 1-2-2V9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v3a2 2 0 0 1-2 2h-2v6H6v-6zm2 0v4h8v-4H8z"/></svg>) }

// -- Admin Table --
function Admin({ passphrase, setPassphrase, rsvps, setRsvps }) {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [query, setQuery] = useState("");
  const [showCodes, setShowCodes] = useState(false);

  function mark(id, field){ 
    setRsvps(prev => prev.map(r => r.id===id ? { ...r, [field]: !r[field], [field+"_ts"]: !r[field] ? new Date().toISOString() : null } : r)); 
  }
  function remove(id){ 
    setRsvps(prev => prev.filter(r => r.id!==id)); 
  }

  const filtered = useMemo(()=> rsvps.filter(r => [r.name, r.discord, r.email, r.code].some(v => String(v||"").toLowerCase().includes(query.toLowerCase()))), [rsvps, query]);

  function exportCSV(){ download(csv.encode(filtered), `rsvp_export_${new Date().toISOString().slice(0,10)}.csv`, "text/csv"); }
  function exportJSON(){ download(JSON.stringify(filtered, null, 2), `rsvp_export.json`, "application/json"); }
  function importJSON(e){
    const f = e.target.files?.[0]; if(!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const arr = JSON.parse(rd.result);
        if (!Array.isArray(arr)) return;
        setRsvps(prev => {
          const byCode = new Map(prev.map(r => [r.code || r.id, r]));
          for (const rec of arr) {
            const key = rec.code || rec.id;
            const existing = byCode.get(key);
            const newer = (!existing || new Date(rec.ts||0) >= new Date(existing.ts||0)) ? rec : existing;
            byCode.set(key, { ...(existing||{}), ...newer });
          }
          return Array.from(byCode.values())
            .sort((a,b)=> new Date(b.ts||0) - new Date(a.ts||0));
        });
      } catch {}
    };
    rd.readAsText(f);
  }

  if (!authed) {
    return (
      <div className="grid gap-4 max-w-sm">
        <Label>Admin Passphrase</Label>
        <Input type="password" value={secret} onChange={e=>setSecret(e.target.value)} placeholder="Enter passphrase"/>
        <div className="flex gap-2">
          <Button onClick={()=> setAuthed(secret === passphrase)}><LogIn className="h-4 w-4 mr-2"/>Unlock</Button>
          <Button variant="outline" onClick={()=>{ setPassphrase(secret); setAuthed(true); }}><Settings className="h-4 w-4 mr-2"/>Set & Unlock</Button>
        </div>
        <p className="text-xs text-muted-foreground">Tip: Share this passphrase with staff to use the check‑in tools.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground"/>
            <Input className="pl-8" placeholder="Search name, Discord, code…" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>
          <Button variant="outline" onClick={()=>setShowCodes(s=>!s)}>{showCodes ? <EyeOff className="h-4 w-4 mr-2"/> : <Eye className="h-4 w-4 mr-2"/>}{showCodes?"Hide Codes":"Show Codes"}</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2"/>Export CSV</Button>
          <Button variant="outline" onClick={exportJSON}><Download className="h-4 w-4 mr-2"/>Export JSON</Button>
          <Button variant="outline" onClick={()=>document.getElementById("import-file").click()}><Upload className="h-4 w-4 mr-2"/>Import</Button>
          <input id="import-file" type="file" accept=".json" onChange={importJSON} className="hidden" />
        </div>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Discord</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Code</th>
              <th className="text-left p-2">RSVP</th>
              <th className="text-left p-2">Attended</th>
              <th className="text-left p-2">Free Item</th>
              <th className="text-left p-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2 font-medium">{r.name}</td>
                <td className="p-2">{r.discord}</td>
                <td className="p-2">{r.email}</td>
                <td className="p-2 font-mono">{showCodes? r.code : "••••••"}</td>
                <td className="p-2 text-xs text-muted-foreground">{new Date(r.ts).toLocaleString()}</td>
                <td className="p-2"><Button size="sm" variant={r.attended?"default":"outline"} onClick={()=>mark(r.id, "attended")}>{r.attended?"Yes":"No"}</Button></td>
                <td className="p-2"><Button size="sm" variant={r.claimed?"default":"outline"} onClick={()=>mark(r.id, "claimed")}>{r.claimed?"Claimed":"Unclaimed"}</Button></td>
                <td className="p-2"><Button size="icon" variant="ghost" onClick={()=>remove(r.id)}><X className="h-4 w-4"/></Button></td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No RSVPs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Separator/>
      <Section title="Quick Add RSVP" actions={<></>}>
        <RSVPForm onSubmit={rec => setRsvps(prev => [rec, ...prev])} eventName={load("eventName","Charity Night")} />
      </Section>
    </div>
  );
}

// -- App Shell --
export default function App(){
  const [eventName, setEventName] = useState(load("eventName", "Charity Night"));
  const [passphrase, setPassphrase] = useState(load("admin_pass", "checkin"));
  const [tab, setTab] = useState("rsvp");
  const [rsvps, setRsvps] = useState(load("rsvps", []));
  useEffect(()=> save("eventName", eventName), [eventName]);
  useEffect(()=> save("admin_pass", passphrase), [passphrase]);
  useEffect(()=> save("rsvps", rsvps), [rsvps]);

  // Add RSVP and keep data synced
  function addRSVP(rec) {
    setRsvps(prev => {
      const updated = [rec, ...prev];
      save("rsvps", updated); // Immediately save to localStorage
      return updated;
    });
  }

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{eventName}</h1>
            <p className="text-muted-foreground text-sm">Discord charity RSVP and Bingo toolkit</p>
          </div>
          <div className="flex gap-2">
            <Button variant={tab==="rsvp"?"default":"outline"} onClick={()=>setTab("rsvp")}><Users className="h-4 w-4 mr-2"/>RSVP</Button>
            <Button variant={tab==="admin"?"default":"outline"} onClick={()=>setTab("admin")}><Settings className="h-4 w-4 mr-2"/>Admin</Button>
          </div>
        </header>

        {tab === "rsvp" && (
          <div className="space-y-6">
            <Section title="🎟️ Get Your Free Ticket" actions={<Pill>{rsvps.length} people signed up</Pill>}>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">What you get:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>🎁 Free item when you attend</li>
                    <li>🎮 Join the Discord community</li>
                    <li>🤝 Meet awesome people</li>
                  </ul>
                </div>
                <RSVPForm onSubmit={addRSVP} eventName={eventName} />
              </div>
            </Section>
          </div>
        )}

        
        {tab === "admin" && (
          <div className="grid gap-6">
            <Section title="Event Settings" actions={<></>}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Event Name</Label>
                  <Input value={eventName} onChange={e=>setEventName(e.target.value)} />
                </div>
                <div>
                  <Label>Admin Passphrase</Label>
                  <Input value={passphrase} onChange={e=>setPassphrase(e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">The passphrase unlocks the check‑in table. Share with trusted helpers only.</p>
            </Section>
            <Section title="Check‑in & Fulfillment" actions={<></>}>
              <Admin passphrase={passphrase} setPassphrase={setPassphrase} rsvps={rsvps} setRsvps={setRsvps} />
            </Section>
          </div>
        )}

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          <Separator className="my-6"/>
          <p>No backend required. Data is stored in this browser. Use Export to move between devices.</p>
        </footer>
      </div>
    </div>
  );
}
