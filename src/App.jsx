import { useState, useEffect } from "react";

const SUPABASE_URL = "https://lfrobwfyngpegwcsejvd.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffffB7voL-ReAtNuM6VWGA_vfDr5DGv";

const api = async (path, method = "GET", body = null) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": method === "POST" ? "return=representation" : "return=representation",
    },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const C = {
  navy: "#0B2545", navyMid: "#1A3A5C", teal: "#0D7E74", tealLt: "#12A093",
  cream: "#F7F9FB", slate: "#4A5568", border: "#D1DCE8",
  red: "#C53030", amber: "#B7791F", green: "#276749",
  redBg: "#FFF5F5", amberBg: "#FFFBEB", greenBg: "#F0FFF4",
};

const SEED_CLIENTS = [
  { name: "Ultra Medical Solutions", ref: "PMQ-2026-UMS-001", service: "ISO 13485 + SAHPRA Manufacturer Licence", phase: "Proposal Submitted", next_action: "Follow up on proposal decision", deadline: "2026-07-05", owner: "Pabi", rag: "amber", notes: "Proposal at R97k submitted. Awaiting response.", hours: 0, budget: 97000 },
  { name: "GMA", ref: "PMQ-2026-GMA-001", service: "ISO 13485 Compliance", phase: "Financial Assessment", next_action: "Await financial assessment outcome", deadline: "2026-07-10", owner: "Pabi", rag: "amber", notes: "Holding firm on pricing. Phasing/payment sequencing open.", hours: 0, budget: 0 },
  { name: "Mr First Aid", ref: "PMQ-2026-MFA-001", service: "ISO 13485 QMS Retainer", phase: "Active — Implementation", next_action: "Month 1 retainer kickoff", deadline: "2026-07-01", owner: "Pabi", rag: "green", notes: "R22,800/month retainer. Start date 1 July 2026.", hours: 0, budget: 273600 },
  { name: "Jalo Enterprises", ref: "PMQ-2026-JAL-001", service: "ISO 13485 + SAHPRA Manufacturer Licence (Diasol)", phase: "Active — Planning", next_action: "Confirm legal entity registration timeline", deadline: "2026-07-15", owner: "Pabi", rag: "green", notes: "21-month parallel-track roadmap. New entity, fresh cert required.", hours: 0, budget: 0 },
  { name: "Mayomann Integrated Healthcare", ref: "PMQ-2026-MAY-001", service: "ISO 13485 + ISO 14001", phase: "Proposal Submitted", next_action: "Follow up on proposal", deadline: "2026-07-08", owner: "Pabi", rag: "red", notes: "Cape Town distributor expanding into manufacturing. Dual scope.", hours: 0, budget: 0 },
  { name: "LinkedIn AR Enquiry", ref: "PMQ-2026-AR-001", service: "SAHPRA Authorised Representative", phase: "Lead — Qualification", next_action: "Send AR service overview and rate card", deadline: "2026-06-28", owner: "Pabi", rag: "red", notes: "Inbound LinkedIn enquiry. Foreign manufacturer, needs AR service.", hours: 0, budget: 0 },
];

const PHASES = ["Lead — Qualification","Discovery / Gap Analysis","Proposal Submitted","Financial Assessment","Active — Planning","Active — Implementation","Active — Audit Prep","Surveillance / Maintenance","Closed — Won","Closed — Lost"];
const SERVICES = ["ISO 13485 QMS Retainer","ISO 13485 + SAHPRA Manufacturer Licence","ISO 13485 + ISO 14001","SAHPRA Authorised Representative","SAHPRA Distributor Licence","Medicines Registration & Regulatory Strategy","Internal Audit Support","CAPA Facilitation","Gap Analysis Only"];
const RAG_CONFIG = {
  red: { label: "Urgent", bg: C.redBg, text: C.red, dot: C.red },
  amber: { label: "Monitor", bg: C.amberBg, text: C.amber, dot: C.amber },
  green: { label: "On Track", bg: C.greenBg, text: C.green, dot: C.green },
};

function daysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000); }
function fmtDate(d) { return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }); }
function fmtRand(n) { return n ? "R" + n.toLocaleString("en-ZA") : "—"; }

function RagBadge({ rag }) {
  const cfg = RAG_CONFIG[rag] || RAG_CONFIG.amber;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: cfg.bg, color: cfg.text }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

function PhaseTag({ phase }) {
  const isActive = phase.startsWith("Active"), isClosed = phase.startsWith("Closed");
  return (
    <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: isActive ? "#E6F4F1" : isClosed ? "#EDF2F7" : "#EBF4FF", color: isActive ? C.teal : isClosed ? C.slate : C.navyMid }}>
      {phase}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 22px", borderTop: `3px solid ${accent || C.teal}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.slate, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Modal({ client, onClose, onSave, saving }) {
  const [form, setForm] = useState({ ...client });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,37,69,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: "min(600px, 95vw)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{client.id ? "Edit Client" : "Add Client"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.slate }}>✕</button>
        </div>
        {[["Client Name","name","text"],["Reference No.","ref","text"],["Next Action","next_action","text"],["Deadline","deadline","date"],["Hours Logged","hours","number"],["Budget (R)","budget","number"]].map(([label, key, type]) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>{label}</label>
            <input type={type} value={form[key] || ""} onChange={e => set(key, type === "number" ? Number(e.target.value) : e.target.value)}
              style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, color: C.navy, boxSizing: "border-box" }} />
          </div>
        ))}
        {[["Service Line","service",SERVICES],["Phase","phase",PHASES],["RAG Status","rag",["green","amber","red"]]].map(([label, key, opts]) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>{label}</label>
            <select value={form[key] || ""} onChange={e => set(key, e.target.value)}
              style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, color: C.navy, background: "#fff", boxSizing: "border-box" }}>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Notes</label>
          <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={3}
            style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, color: C.navy, resize: "vertical", boxSizing: "border-box" }} />
        </div>
        <button onClick={() => onSave(form)} disabled={saving}
          style={{ width: "100%", padding: "12px", background: saving ? C.slate : C.teal, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Saving..." : "Save Client"}
        </button>
      </div>
    </div>
  );
}

export default function PMQualityOS() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("dashboard");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterRag, setFilterRag] = useState("all");
  const [filterPhase, setFilterPhase] = useState("all");

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    try {
      setLoading(true);
      const data = await api("clients?order=created_at.asc");
      if (data && data.length > 0) {
        setClients(data);
      } else {
        // Seed initial data
        const seeded = await api("clients", "POST", SEED_CLIENTS);
        setClients(seeded || []);
      }
    } catch (e) {
      setError("Could not connect to database. Check Supabase setup.");
    } finally {
      setLoading(false);
    }
  }

  async function saveClient(form) {
    setSaving(true);
    try {
      if (form.id) {
        const { id, created_at, ...updates } = form;
        const updated = await api(`clients?id=eq.${id}`, "PATCH", updates);
        setClients(cs => cs.map(c => c.id === id ? (updated?.[0] || form) : c));
      } else {
        const { id, ...newClient } = form;
        const created = await api("clients", "POST", [newClient]);
        if (created?.[0]) setClients(cs => [...cs, created[0]]);
      }
      setEditing(null);
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteClient(id) {
    if (!window.confirm("Remove this client?")) return;
    try {
      await api(`clients?id=eq.${id}`, "DELETE");
      setClients(cs => cs.filter(c => c.id !== id));
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  }

  const active = clients.filter(c => c.phase?.startsWith("Active")).length;
  const urgent = clients.filter(c => c.rag === "red").length;
  const pipeline = clients.filter(c => !c.phase?.startsWith("Closed")).length;
  const totalBudget = clients.filter(c => !c.phase?.startsWith("Closed")).reduce((s, c) => s + (c.budget || 0), 0);
  const actionsDue = clients.filter(c => !c.phase?.startsWith("Closed") && c.deadline && daysUntil(c.deadline) <= 3).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const filtered = clients.filter(c => (filterRag === "all" || c.rag === filterRag) && (filterPhase === "all" || c.phase === filterPhase));

  const navBtn = (key, label) => (
    <button onClick={() => setView(key)} style={{ padding: "8px 18px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700, background: view === key ? C.teal : "transparent", color: view === key ? "#fff" : "rgba(255,255,255,0.7)" }}>{label}</button>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, background: C.teal, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>PM</span>
      </div>
      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Loading PM Quality OS...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: 32, borderRadius: 12, maxWidth: 400, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontWeight: 800, color: C.navy, marginBottom: 8 }}>Database Setup Needed</div>
        <div style={{ color: C.slate, fontSize: 13 }}>{error}</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.navy, padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, background: C.teal, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>PM</span>
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, lineHeight: 1 }}>PM Quality</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>Operating System</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {navBtn("dashboard", "Dashboard")}
            {navBtn("tracker", "Client Tracker")}
            {navBtn("pipeline", "Pipeline")}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {view === "dashboard" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>Good day, Pabi 👋</div>
              <div style={{ fontSize: 13, color: C.slate, marginTop: 2 }}>Here's where PM Quality stands right now.</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
              <StatCard label="Active Clients" value={active} sub="delivering now" accent={C.teal} />
              <StatCard label="Total Pipeline" value={pipeline} sub="open engagements" accent={C.navy} />
              <StatCard label="Urgent Actions" value={urgent} sub="need attention today" accent={C.red} />
              <StatCard label="Pipeline Value" value={fmtRand(totalBudget)} sub="confirmed + proposals" accent={C.tealLt} />
              <StatCard label="Aug Target" value={`${active}/6`} sub="new clients by Aug 2026" accent={C.amber} />
            </div>
            <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 28 }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>⚡</span>
                <span style={{ fontWeight: 800, color: C.navy, fontSize: 14 }}>Actions Due in the Next 3 Days</span>
              </div>
              {actionsDue.length === 0
                ? <div style={{ padding: "20px", color: C.slate, fontSize: 13 }}>No urgent actions — you're clear.</div>
                : actionsDue.map(c => {
                  const days = daysUntil(c.deadline);
                  return (
                    <div key={c.id} style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>→ {c.next_action}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <RagBadge rag={c.rag} />
                        <div style={{ fontSize: 11, color: days <= 0 ? C.red : C.amber, marginTop: 4, fontWeight: 700 }}>
                          {days <= 0 ? "Overdue" : days === 1 ? "Due tomorrow" : `Due in ${days} days`}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontWeight: 800, color: C.navy, fontSize: 14 }}>All Open Engagements</span>
              </div>
              {clients.filter(c => !c.phase?.startsWith("Closed")).map(c => (
                <div key={c.id} style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: C.slate, marginTop: 1 }}>{c.service}</div>
                  </div>
                  <PhaseTag phase={c.phase} />
                  <RagBadge rag={c.rag} />
                  <button onClick={() => setEditing(c)} style={{ padding: "5px 12px", background: C.navyMid, color: "#fff", border: "none", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Edit</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "tracker" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>Client Tracker</div>
                <div style={{ fontSize: 13, color: C.slate }}>Every client, their phase, next action, and deadline.</div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <select value={filterRag} onChange={e => setFilterRag(e.target.value)} style={{ padding: "7px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, color: C.navy, background: "#fff" }}>
                  <option value="all">All Status</option>
                  <option value="red">Urgent</option>
                  <option value="amber">Monitor</option>
                  <option value="green">On Track</option>
                </select>
                <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)} style={{ padding: "7px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, color: C.navy, background: "#fff" }}>
                  <option value="all">All Phases</option>
                  {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button onClick={() => setEditing({ name: "", ref: "", service: SERVICES[0], phase: PHASES[0], next_action: "", deadline: "", owner: "Pabi", rag: "amber", notes: "", hours: 0, budget: 0 })}
                  style={{ padding: "7px 16px", background: C.teal, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  + Add Client
                </button>
              </div>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {filtered.map(c => {
                const days = c.deadline ? daysUntil(c.deadline) : null;
                return (
                  <div key={c.id} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 22px", borderLeft: `4px solid ${c.rag === "red" ? C.red : c.rag === "green" ? C.teal : C.amber}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>{c.name}</span>
                          <span style={{ fontSize: 11, color: C.slate, fontFamily: "monospace" }}>{c.ref}</span>
                          <PhaseTag phase={c.phase} />
                          <RagBadge rag={c.rag} />
                        </div>
                        <div style={{ fontSize: 12, color: C.teal, fontWeight: 600, marginTop: 4 }}>{c.service}</div>
                        <div style={{ marginTop: 10, padding: "10px 14px", background: "#F7FBFA", borderRadius: 6, border: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: "0.05em" }}>Next Action → </span>
                          <span style={{ fontSize: 13, color: C.navy, fontWeight: 600 }}>{c.next_action}</span>
                        </div>
                        {c.notes && <div style={{ fontSize: 12, color: C.slate, marginTop: 8, fontStyle: "italic" }}>{c.notes}</div>}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: C.slate, marginBottom: 2 }}>Deadline</div>
                        <div style={{ fontWeight: 700, color: days !== null && days <= 0 ? C.red : days !== null && days <= 3 ? C.amber : C.navy, fontSize: 13 }}>
                          {c.deadline ? fmtDate(c.deadline) : "—"}
                        </div>
                        <div style={{ fontSize: 11, color: C.slate, marginTop: 1 }}>
                          {days !== null ? (days <= 0 ? "Overdue" : `${days}d remaining`) : ""}
                        </div>
                        {c.budget > 0 && <div style={{ marginTop: 8, fontSize: 12, color: C.teal, fontWeight: 700 }}>{fmtRand(c.budget)}</div>}
                        <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "flex-end" }}>
                          <button onClick={() => setEditing(c)} style={{ padding: "5px 12px", background: C.navy, color: "#fff", border: "none", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Edit</button>
                          <button onClick={() => deleteClient(c.id)} style={{ padding: "5px 12px", background: "#fff", color: C.red, border: `1px solid ${C.red}`, borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Remove</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: C.slate }}>No clients match this filter.</div>}
            </div>
          </div>
        )}

        {view === "pipeline" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>Pipeline View</div>
              <div style={{ fontSize: 13, color: C.slate }}>Where every engagement sits in the journey.</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {["Lead — Qualification","Discovery / Gap Analysis","Proposal Submitted","Financial Assessment","Active — Planning","Active — Implementation","Active — Audit Prep","Surveillance / Maintenance"].map(phase => {
                const group = clients.filter(c => c.phase === phase);
                return (
                  <div key={phase} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", background: C.navy, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{phase}</span>
                      <span style={{ background: C.teal, color: "#fff", borderRadius: 10, padding: "1px 8px", fontSize: 11, fontWeight: 800 }}>{group.length}</span>
                    </div>
                    <div style={{ padding: 10, minHeight: 60 }}>
                      {group.length === 0
                        ? <div style={{ color: C.border, fontSize: 12, textAlign: "center", padding: "12px 0" }}>Empty</div>
                        : group.map(c => (
                          <div key={c.id} onClick={() => setEditing(c)}
                            style={{ padding: "10px 12px", borderRadius: 7, marginBottom: 8, cursor: "pointer", border: `1px solid ${c.rag === "red" ? C.red : c.rag === "green" ? C.teal : C.amber}`, background: c.rag === "red" ? C.redBg : c.rag === "green" ? C.greenBg : C.amberBg }}>
                            <div style={{ fontWeight: 700, fontSize: 12, color: C.navy }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>{c.next_action}</div>
                            <div style={{ marginTop: 6 }}><RagBadge rag={c.rag} /></div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {editing && <Modal client={editing} onClose={() => setEditing(null)} onSave={saveClient} saving={saving} />}
    </div>
  );
}
