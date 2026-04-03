import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { path: projectPath } = req.body;
  if (!projectPath) return res.status(400).json({ success: false, error: "No path provided" });

  const targetPath = path.normalize(projectPath);
  const resolvedPath = path.resolve(process.cwd(), targetPath);
  const ext = path.extname(resolvedPath).toLowerCase();

  let child;

  if (fs.existsSync(resolvedPath) && fs.lstatSync(resolvedPath).isDirectory()) {
    // Directory: run npm start in that project folder
    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
    child = spawn(npmCmd, ["start"], {
      cwd: fullPath,
      detached: true,
      stdio: "ignore",
    });
  } else if (ext === ".js") {
    child = spawn("node", [targetPath], {
      cwd: path.dirname(resolvedPath),
      detached: true,
      stdio: "ignore",
    });
  } else if (ext === ".html" || ext === ".htm") {
    if (process.platform === "win32") {
      child = spawn("cmd", ["/c", "start", "", targetPath], { detached: true, stdio: "ignore" });
    } else if (process.platform === "darwin") {
      child = spawn("open", [targetPath], { detached: true, stdio: "ignore" });
    } else {
      child = spawn("xdg-open", [targetPath], { detached: true, stdio: "ignore" });
    }
  } else {
    // Fallback to node for unknown extension
    child = spawn("node", [targetPath], {
      cwd: path.dirname(resolvedPath),
      detached: true,
      stdio: "ignore",
    });
  }

  child.on("error", (err) => {
    return res.json({ success: false, error: err.message });
  });

  child.unref();
  res.json({ success: true, pid: child.pid });
}
