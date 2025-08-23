
import os
from typing import TypedDict, List
import typer
from rich.console import Console
from rich.logging import RichHandler
from rich.table import Table

console = Console()
import logging
logging.basicConfig(
    level="INFO",
    format="%(message)s",
    datefmt="[%X]",
    handlers=[RichHandler(console=console)]
)
log = logging.getLogger("rich")

app = typer.Typer(help="Task mAIstro Multi-Agent Workflow CLI")

IGNORE_DIRS = {"node_modules", ".venv", "__pycache__", ".git"}
PROJECT_PATH = os.environ.get("PROJECT_PATH", os.getcwd())

class AgentState(TypedDict, total=False):
    main_status: str
    refactor_status: str
    security_status: str
    test_status: str
    dependency_status: str
    documentation_status: str
    asset_status: str
    performance_status: str
    feedback_status: str
    refactor_long_lines: int
    security_secrets: int
    test_results: str
    dependency_results: str
    documentation_missing: int
    asset_results: str
    performance_results: str
    feedback_summary: str

def load_env():
    from dotenv import load_dotenv
    env_path = os.path.join(os.getcwd(), ".env")
    if not os.path.exists(env_path):
        log.error(f".env file not found at {env_path}")
        raise typer.Exit(1)
    load_dotenv(env_path)
    log.info(".env variables loaded")

def scan_files(ignore_dirs: set = IGNORE_DIRS) -> List[str]:
    files = []
    for root, dirs, filenames in os.walk(PROJECT_PATH):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for f in filenames:
            files.append(os.path.join(root, f))
    return files

def refactor_agent(state: AgentState) -> AgentState:
    log.info("[STEP] Refactor Agent: scanning code smells")
    long_lines = 0
    for f in scan_files():
        if f.endswith((".py", ".ts", ".js", ".tsx")):
            with open(f, errors="ignore") as fh:
                for line in fh:
                    if len(line) > 120:
                        long_lines += 1
    state["refactor_status"] = "done"
    state["refactor_long_lines"] = long_lines
    log.info(f"Found {long_lines} long lines")
    return state

def security_agent(state: AgentState) -> AgentState:
    log.info("[STEP] Security Agent: scanning for secrets")
    secrets = 0
    for f in scan_files():
        if f.endswith((".py", ".ts", ".js", ".tsx", ".env", ".json")):
            with open(f, errors="ignore") as fh:
                for line in fh:
                    if "SECRET" in line or "PASSWORD" in line or "token" in line:
                        secrets += 1
    state["security_status"] = "done"
    state["security_secrets"] = secrets
    log.info(f"Found {secrets} possible secrets")
    return state

def test_agent(state: AgentState) -> AgentState:
    log.info("[STEP] Test Agent: running tests (simulated)")
    state["test_status"] = "done"
    state["test_results"] = "Simulated: All tests passed."
    log.info("Test agent simulated test run.")
    return state

def dependency_agent(state: AgentState) -> AgentState:
    log.info("[STEP] Dependency Agent: checking dependencies (simulated)")
    state["dependency_status"] = "done"
    state["dependency_results"] = "Simulated: All dependencies up to date."
    log.info("Dependency agent simulated dependency check.")
    return state

def documentation_agent(state: AgentState) -> AgentState:
    log.info("[STEP] Documentation Agent: checking documentation")
    missing_docs = 0
    for f in scan_files():
        if f.endswith(".py"):
            with open(f, errors="ignore") as fh:
                first = next(fh, '').strip()
                if not (first.startswith('"""') or first.startswith("'''") ):
                    missing_docs += 1
    state["documentation_status"] = "done"
    state["documentation_missing"] = missing_docs
    log.info(f"Found {missing_docs} files missing docstrings")
    return state

def asset_agent(state: AgentState) -> AgentState:
    log.info("[STEP] Asset Agent: scanning for unused assets (simulated)")
    state["asset_status"] = "done"
    state["asset_results"] = "Simulated: No unused assets found."
    log.info("Asset agent simulated asset scan.")
    return state

def performance_agent(state: AgentState) -> AgentState:
    log.info("[STEP] Performance Agent: checking performance (simulated)")
    state["performance_status"] = "done"
    state["performance_results"] = "Simulated: No performance issues found."
    log.info("Performance agent simulated performance check.")
    return state

def feedback_agent(state: AgentState) -> AgentState:
    log.info("[STEP] Feedback Agent: summarizing findings")
    summary = []
    for k, v in state.items():
        if k.endswith('_status') or k.endswith('_results') or k.endswith('_missing') or k.endswith('_long_lines') or k.endswith('_secrets'):
            summary.append(f"{k}: {v}")
    state["feedback_status"] = "done"
    state["feedback_summary"] = "\n".join(summary)
    log.info("Feedback agent summary:")
    for line in summary:
        log.info(line)
    return state

@app.command("run-all")
def run_all():
    """
    Run the full multi-agent workflow:
    - Load .env
    - Run each agent node
    - Display a summary table
    """
    load_env()
    state: AgentState = {}
    state = refactor_agent(state)
    state = security_agent(state)
    state = test_agent(state)
    state = dependency_agent(state)
    state = documentation_agent(state)
    state = asset_agent(state)
    state = performance_agent(state)
    state = feedback_agent(state)

    table = Table(title="Agent Summary")
    table.add_column("Agent", style="cyan", no_wrap=True)
    table.add_column("Status", style="magenta")
    for k, v in state.items():
        if k.endswith("_status"):
            table.add_row(k, str(v))
    console.print(table)

if __name__ == "__main__":
    app()
