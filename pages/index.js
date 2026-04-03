import { useState, useEffect, useRef } from "react";
import Head from "next/head";

const I18N = {
  en: {
    title: "Eduardo's Projects",
    subtitle: "Node.js Launcher",
    run: "Launch",
    kill: "Stop",
    status_idle: "Ready",
    status_running: "Running",
    status_done: "Completed",
    status_error: "Error",
    hint: "Protected under Brazilian Law nº 9,610/98",
    search: "Search projects…",
    all: "All",
    game: "Games",
    puzzle: "Puzzles",
    card: "Cards",
    no_results: "No projects match your search.",
    pid: "PID",
  },
  es: {
    title: "Proyectos de Eduardo",
    subtitle: "Lanzador Node.js",
    run: "Ejecutar",
    kill: "Detener",
    status_idle: "Listo",
    status_running: "Ejecutando",
    status_done: "Completado",
    status_error: "Error",
    hint: "Protegido por la Ley Brasileña nº 9.610/98",
    search: "Buscar proyectos…",
    all: "Todo",
    game: "Juegos",
    puzzle: "Puzzles",
    card: "Cartas",
    no_results: "No hay proyectos que coincidan.",
    pid: "PID",
  },
  pt: {
    title: "Projetos do Eduardo",
    subtitle: "Launcher Node.js",
    run: "Iniciar",
    kill: "Parar",
    status_idle: "Pronto",
    status_running: "Executando",
    status_done: "Finalizado",
    status_error: "Erro",
    hint: "Protegido pela Lei Brasileira nº 9.610/98",
    search: "Buscar projetos…",
    all: "Tudo",
    game: "Jogos",
    puzzle: "Puzzles",
    card: "Cartas",
    no_results: "Nenhum projeto encontrado.",
    pid: "PID",
  },
};

const CATEGORY_ICONS = { game: "◈", puzzle: "◎", card: "◆", default: "◉" };
const STATUS_COLORS = {
  idle: "var(--text-dim)",
  running: "var(--amber)",
  done: "var(--green)",
  error: "var(--red)",
};

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [lang, setLang] = useState("en");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [statuses, setStatuses] = useState({});
  const [pids, setPids] = useState({});
  const [loaded, setLoaded] = useState(false);

  const t = (key) => I18N[lang][key] || key;

  useEffect(() => {
    fetch("/launcher_projects.json")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        setLoaded(true);
      });
  }, []);

  const categories = ["all", ...new Set(projects.map((p) => p.category).filter(Boolean))];

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.category === filter;
    return matchSearch && matchFilter;
  });

  const launchProject = async (path) => {
    setStatuses((prev) => ({ ...prev, [path]: "running" }));
    try {
      const res = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const data = await res.json();
      if (data.success) {
        setStatuses((prev) => ({ ...prev, [path]: "done" }));
        if (data.pid) setPids((prev) => ({ ...prev, [path]: data.pid }));
      } else {
        setStatuses((prev) => ({ ...prev, [path]: "error" }));
        console.error(data.error);
      }
    } catch (e) {
      setStatuses((prev) => ({ ...prev, [path]: "error" }));
    }
  };

  const resetStatus = (path) => {
    setStatuses((prev) => ({ ...prev, [path]: "idle" }));
    setPids((prev) => { const n = { ...prev }; delete n[path]; return n; });
  };

  return (
    <>
      <Head>
        <title>Eduardo&apos;s Projects — Node.js Launcher</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.root}>
        {/* Background grid */}
        <div style={styles.grid} aria-hidden />

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logo}>
              <span style={styles.logoIcon}>⬡</span>
              <div>
                <div style={styles.logoTitle}>{t("title")}</div>
                <div style={styles.logoSub}>{t("subtitle")}</div>
              </div>
            </div>
          </div>
          <div style={styles.langBar}>
            {["en", "es", "pt"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{ ...styles.langBtn, ...(lang === l ? styles.langBtnActive : {}) }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* Controls */}
        <div style={styles.controls}>
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.filterBar}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{ ...styles.filterBtn, ...(filter === cat ? styles.filterBtnActive : {}) }}
              >
                {t(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <main style={styles.main}>
          {!loaded ? (
            <div style={styles.empty}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={styles.empty}>{t("no_results")}</div>
          ) : (
            <div style={styles.cardGrid}>
              {filtered.map((p, i) => {
                const status = statuses[p.path] || "idle";
                const pid = pids[p.path];
                const icon = CATEGORY_ICONS[p.category] || CATEGORY_ICONS.default;
                return (
                  <div key={p.path} style={{ ...styles.card, animationDelay: `${i * 60}ms` }} className="card-anim">
                    <div style={styles.cardTop}>
                      <span style={styles.cardIcon}>{icon}</span>
                      <span style={{ ...styles.statusDot, background: STATUS_COLORS[status] }} />
                    </div>
                    <h3 style={styles.cardName}>{p.name}</h3>
                    <p style={styles.cardDesc}>{p.description}</p>
                    <div style={styles.cardPath}>{p.path}</div>
                    <div style={styles.cardFooter}>
                      <button
                        onClick={() => status === "running" ? null : launchProject(p.path)}
                        disabled={status === "running"}
                        style={{
                          ...styles.launchBtn,
                          ...(status === "running" ? styles.launchBtnDisabled : {}),
                        }}
                      >
                        {status === "running" ? t("status_running") + "…" : t("run")}
                      </button>
                      <div style={styles.statusRow}>
                        <span style={{ ...styles.statusLabel, color: STATUS_COLORS[status] }}>
                          {t(`status_${status}`)}
                          {pid && status === "done" ? ` · ${t("pid")} ${pid}` : ""}
                        </span>
                        {(status === "done" || status === "error") && (
                          <button onClick={() => resetStatus(p.path)} style={styles.resetBtn}>↺</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <span style={styles.footerText}>{t("hint")}</span>
          <span style={styles.footerText}>Node.js Launcher v1.0</span>
        </footer>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-anim {
          animation: fadeUp 0.35s ease both;
        }
        .card-anim:hover {
          background: #1e1e38 !important;
          border-color: rgba(130, 100, 255, 0.35) !important;
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }
      `}</style>
    </>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(124,92,252,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,92,252,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 32px",
    borderBottom: "1px solid rgba(130,100,255,0.1)",
    background: "rgba(8,8,16,0.8)",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  logo: { display: "flex", alignItems: "center", gap: "12px" },
  logoIcon: { fontSize: "28px", color: "var(--accent)", lineHeight: 1 },
  logoTitle: { fontSize: "18px", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.3px" },
  logoSub: { fontSize: "11px", color: "var(--text-muted)", fontFamily: "'Space Mono', monospace", marginTop: "1px" },
  langBar: { display: "flex", gap: "6px" },
  langBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    borderRadius: "6px",
    padding: "5px 10px",
    fontSize: "11px",
    fontFamily: "'Space Mono', monospace",
    cursor: "pointer",
    letterSpacing: "0.5px",
    transition: "all 0.15s",
  },
  langBtnActive: {
    background: "rgba(124,92,252,0.15)",
    borderColor: "var(--accent)",
    color: "var(--accent2)",
  },
  controls: {
    display: "flex",
    gap: "12px",
    padding: "20px 32px 0",
    alignItems: "center",
    flexWrap: "wrap",
    position: "relative",
    zIndex: 1,
  },
  searchInput: {
    flex: "1",
    minWidth: "200px",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: "8px",
    padding: "10px 16px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    outline: "none",
  },
  filterBar: { display: "flex", gap: "6px", flexWrap: "wrap" },
  filterBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    borderRadius: "6px",
    padding: "7px 14px",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'DM Sans', sans-serif",
  },
  filterBtnActive: {
    background: "rgba(124,92,252,0.15)",
    borderColor: "var(--accent)",
    color: "var(--accent2)",
  },
  main: {
    flex: 1,
    padding: "24px 32px 40px",
    position: "relative",
    zIndex: 1,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    transition: "all 0.2s ease",
    cursor: "default",
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" },
  cardIcon: { fontSize: "18px", color: "var(--accent)", fontFamily: "'Space Mono', monospace" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%", transition: "background 0.3s" },
  cardName: { fontSize: "16px", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.2px" },
  cardDesc: { fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5", flex: 1 },
  cardPath: {
    fontSize: "11px",
    color: "var(--text-dim)",
    fontFamily: "'Space Mono', monospace",
    marginTop: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(130,100,255,0.08)",
    gap: "10px",
  },
  launchBtn: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: "7px",
    padding: "8px 18px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity 0.15s",
    whiteSpace: "nowrap",
  },
  launchBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    background: "var(--surface3)",
  },
  statusRow: { display: "flex", alignItems: "center", gap: "6px", flex: 1, justifyContent: "flex-end" },
  statusLabel: { fontSize: "12px", fontFamily: "'Space Mono', monospace", transition: "color 0.3s" },
  resetBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-dim)",
    cursor: "pointer",
    fontSize: "14px",
    padding: "2px 4px",
    borderRadius: "4px",
    lineHeight: 1,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    borderTop: "1px solid rgba(130,100,255,0.08)",
    background: "rgba(8,8,16,0.8)",
    position: "relative",
    zIndex: 1,
  },
  footerText: { fontSize: "11px", color: "var(--text-dim)", fontFamily: "'Space Mono', monospace" },
  empty: { textAlign: "center", color: "var(--text-muted)", padding: "60px 0", fontSize: "15px" },
};
