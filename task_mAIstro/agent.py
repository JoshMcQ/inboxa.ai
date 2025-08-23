import requests
import os
from termcolor import colored
from time import sleep, time, strftime, localtime
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv

def print_error(text):
    ts = strftime('%Y-%m-%d %H:%M:%S', localtime())
    print(colored(f"[{ts}] [ERROR] {text}", "red"))

def print_banner(text, color="cyan"):
    ts = strftime('%Y-%m-%d %H:%M:%S', localtime())
    print(colored(f"\n{'='*60}\n[{ts}] {text}\n{'='*60}", color))

def print_step(text, color="green"):
    ts = strftime('%Y-%m-%d %H:%M:%S', localtime())
    print(colored(f"[{ts}] [STEP] {text}", color))

def print_info(text):
    ts = strftime('%Y-%m-%d %H:%M:%S', localtime())
    print(colored(f"[{ts}] [INFO] {text}", "yellow"))

# Load .env from current directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
if not os.path.exists(env_path):
    print_error(f".env file not found at {env_path}. Please create it with required environment variables.")
else:
    load_dotenv(env_path)

# Check required env vars
required_vars = [
    "LANGSMITH_API_KEY",
    "LANGSMITH_PROJECT",
    "OPENAI_API_KEY"
]
missing = [v for v in required_vars if not os.getenv(v)]
if missing:
    print_error(f"Missing required environment variables: {', '.join(missing)}")
from typing import TypedDict, Any
import os
import langsmith

# Set LangSmith API key and project name (if not already set)
os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = "your-langsmith-api-key"  # Uncomment and set if needed
# os.environ["LANGCHAIN_PROJECT"] = "task_mAIstro-agent"      # Uncomment and set if needed

class AgentState(TypedDict, total=False):
    captain_status: str
    main_status: str
    critic_status: str
    ux_status: str
    logger_status: str
    refactor_status: str
    security_status: str
    test_status: str
    dependency_status: str
    documentation_status: str
    asset_status: str
    performance_status: str
    feedback_status: str
    # Add more fields as needed
    # ...existing code...

PROJECT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'task_mAIstro'))
API_URL = "http://127.0.0.1:8000"

def safe_request(method, url, **kwargs):
    max_retries = 3
    start_time = time()
    for attempt in range(max_retries):
        try:
            print_info(f"Requesting {method} {url} (attempt {attempt+1}/{max_retries})")
            # Separate timeout from other kwargs
            timeout = kwargs.get('timeout', 30)
            req_kwargs = {k: v for k, v in kwargs.items() if k != 'timeout'}
            resp = requests.request(method, url, timeout=timeout, **req_kwargs)
            resp.raise_for_status()
            elapsed = time() - start_time
            print_info(f"Response received from {url} in {elapsed:.2f}s")
            return resp
        except requests.exceptions.Timeout:
            elapsed = time() - start_time
            print_error(f"Timeout on {url} after {elapsed:.2f}s (attempt {attempt+1}/{max_retries})")
        except requests.exceptions.RequestException as e:
            elapsed = time() - start_time
            print_error(f"Request error on {url}: {e} after {elapsed:.2f}s (attempt {attempt+1}/{max_retries})")
        sleep(2)
    elapsed = time() - start_time
    print_error(f"Failed to reach {url} after {max_retries} attempts. Total elapsed: {elapsed:.2f}s")
    return None

def captain_agent_node(state):
    print_banner("Captain Agent Node: Orchestrating Workflow", "white")
    state['captain_status'] = 'done'
    return state

def logger_agent_node(state):
    print_banner("Logger Agent Node: Logging Results", "grey")
    # Example: Write summary to file
    try:
        with open("agent_log.txt", "a", encoding="utf-8") as f:
            f.write(str(state) + "\n")
        print_info("Logged state to agent_log.txt")
        state['logger_status'] = 'done'
    except Exception as e:
        print_error(f"Logger failed: {e}")
        state['logger_status'] = 'error'
    return state

def refactor_agent_node(state):
    print_banner("Refactor Agent Node: Scanning for Code Smells", "magenta")
    # Example: Count long lines
    long_lines = 0
    for dirpath, _, files in os.walk(PROJECT_PATH):
        for fname in files:
            if fname.endswith(('.py', '.ts', '.js', '.tsx')):
                fpath = os.path.join(dirpath, fname)
                try:
                    with open(fpath, encoding='utf-8', errors='ignore') as f:
                        for line in f:
                            if len(line) > 120:
                                long_lines += 1
                except Exception:
                    pass
    print_info(f"Refactor agent found {long_lines} long lines.")
    state['refactor_status'] = 'done'
    state['refactor_long_lines'] = long_lines
    return state

def security_agent_node(state):
    print_banner("Security Agent Node: Scanning for Secrets", "red")
    secrets = []
    for dirpath, _, files in os.walk(PROJECT_PATH):
        for fname in files:
            if fname.endswith(('.py', '.ts', '.js', '.tsx', '.env', '.json')):
                fpath = os.path.join(dirpath, fname)
                try:
                    with open(fpath, encoding='utf-8', errors='ignore') as f:
                        for i, line in enumerate(f, 1):
                            if 'SECRET' in line or 'PASSWORD' in line or 'token' in line:
                                secrets.append((fpath, i, line.strip()))
                except Exception:
                    pass
    print_info(f"Security agent found {len(secrets)} possible secrets.")
    state['security_status'] = 'done'
    state['security_secrets'] = secrets[:10]
    return state

def test_agent_node(state):
    print_banner("Test Agent Node: Running Tests", "blue")
    # Example: Simulate test run
    state['test_status'] = 'done'
    state['test_results'] = 'Simulated: All tests passed.'
    print_info("Test agent simulated test run.")
    return state

def dependency_agent_node(state):
    print_banner("Dependency Agent Node: Checking Dependencies", "yellow")
    # Example: Simulate dependency check
    state['dependency_status'] = 'done'
    state['dependency_results'] = 'Simulated: All dependencies up to date.'
    print_info("Dependency agent simulated dependency check.")
    return state

def documentation_agent_node(state):
    print_banner("Documentation Agent Node: Checking Documentation", "cyan")
    # Example: Count files missing docstrings
    missing_docs = 0
    for dirpath, _, files in os.walk(PROJECT_PATH):
        for fname in files:
            if fname.endswith('.py'):
                fpath = os.path.join(dirpath, fname)
                try:
                    with open(fpath, encoding='utf-8', errors='ignore') as f:
                        first = next(f, '').strip()
                        if not (first.startswith('"""') or first.startswith("'''") ):
                            missing_docs += 1
                except Exception:
                    pass
    print_info(f"Documentation agent found {missing_docs} files missing docstrings.")
    state['documentation_status'] = 'done'
    state['documentation_missing'] = missing_docs
    return state

def asset_agent_node(state):
    print_banner("Asset Agent Node: Scanning for Unused Assets", "green")
    # Example: Simulate asset scan
    state['asset_status'] = 'done'
    state['asset_results'] = 'Simulated: No unused assets found.'
    print_info("Asset agent simulated asset scan.")
    return state

def performance_agent_node(state):
    print_banner("Performance Agent Node: Checking Performance", "magenta")
    # Example: Simulate performance check
    state['performance_status'] = 'done'
    state['performance_results'] = 'Simulated: No performance issues found.'
    print_info("Performance agent simulated performance check.")
    return state

def feedback_agent_node(state):
    print_banner("Feedback Agent Node: Summarizing Findings", "white")
    # Example: Summarize all findings
    summary = []
    for k, v in state.items():
        if k.endswith('_status') or k.endswith('_results') or k.endswith('_issues') or k.endswith('_missing') or k.endswith('_long_lines') or k.endswith('_secrets') or k.endswith('_files'):
            summary.append(f"{k}: {v}")
    print_info("Feedback agent summary:")
    for line in summary:
        print_info(line)
    state['feedback_status'] = 'done'
    state['feedback_summary'] = summary
    return state

def main_agent_node(state):
    print_banner("Main Agent Node: Transformation Workflow", "magenta")
    try:
        print_step("Analyzing codebase for Inbox Zero references...")
        step_start = time()
        payload = {"projectPath": PROJECT_PATH}
        r = safe_request("POST", f"{API_URL}/transform/analyze", json=payload, timeout=60)
        print_info(f"Step 'analyze' took {time()-step_start:.2f}s")
        if not r:
            print_error("Analyze step failed")
            state['main_status'] = 'error'
            return state
        analysis = r.json()
        print_info(f"Found {analysis.get('filesWithReferences', 0)} files with references.")
        state['analysis'] = analysis
        if analysis.get('filesWithReferences', 0) == 0:
            print_info("No Inbox Zero references found. Skipping replacement.")
        else:
            print_step("Replacing Inbox Zero references with Inboxa AI...")
            step_start = time()
            replace_payload = {
                "projectPath": PROJECT_PATH,
                "dryRun": False,
                "replacements": [
                    {"from": "Inbox Zero", "to": "Inboxa AI"},
                    {"from": "inbox zero", "to": "inboxa ai"},
                    {"from": "InboxZero", "to": "InboxaAI"},
                    {"from": "inbox-zero", "to": "inboxa-ai"}
                ]
            }
            r = safe_request("POST", f"{API_URL}/transform/replace-text", json=replace_payload, timeout=60)
            print_info(f"Step 'replace-text' took {time()-step_start:.2f}s")
            if not r:
                print_error("Replace step failed")
                state['main_status'] = 'error'
                return state
            result = r.json()
            print_info(f"Modified {result.get('filesModified', 0)} files.")
            state['replace'] = result

        print_step("Updating theme and branding...")
        step_start = time()
        theme_payload = {
            "projectPath": PROJECT_PATH,
            "theme": {
                "colors": {"primary": "#6366F1", "secondary": "#8B5CF6", "background": "#0F172A"},
                "fonts": {"heading": "Inter", "body": "Inter"}
            }
        }
        r = safe_request("POST", f"{API_URL}/transform/update-theme", json=theme_payload, timeout=30)
        print_info(f"Step 'update-theme' took {time()-step_start:.2f}s")
        if r:
            print_info(f"Theme update response: {r.json()}")
            state['theme'] = r.json()
        else:
            print_error("Theme update failed.")

        print_step("Adding voice-to-email features...")
        step_start = time()
        voice_payload = {
            "projectPath": PROJECT_PATH,
            "features": ["voice-button", "speech-to-text"]
        }
        r = safe_request("POST", f"{API_URL}/transform/add-voice-features", json=voice_payload, timeout=30)
        print_info(f"Step 'add-voice-features' took {time()-step_start:.2f}s")
        if r:
            print_info(f"Voice features response: {r.json()}")
            state['voice'] = r.json()
        else:
            print_error("Voice features update failed.")

        print_step("Updating images and media assets...")
        step_start = time()
        images_payload = {"projectPath": PROJECT_PATH, "scanOnly": False}
        r = safe_request("POST", f"{API_URL}/transform/update-images", json=images_payload, timeout=60)
        print_info(f"Step 'update-images' took {time()-step_start:.2f}s")
        if r:
            print_info(f"Images update response: {r.json()}")
            state['images'] = r.json()
        else:
            print_error("Images update failed.")

        print_step("Checking transformation status...")
        step_start = time()
        status_params = {"projectPath": PROJECT_PATH}
        r = safe_request("GET", f"{API_URL}/transform/status", params=status_params, timeout=15)
        print_info(f"Step 'status' took {time()-step_start:.2f}s")
        if r:
            print_info(f"Status: {r.json()}")
            state['status'] = r.json()
        else:
            print_error("Status check failed.")

        print_banner("Main Agent Node Complete!", "magenta")
        state['main_status'] = 'done'
        return state
    except Exception as e:
        print_error(f"Main agent node failed: {e}")
        state['main_status'] = 'error'
        return state

def critic_agent_node(state):
    print_banner("Critic Agent Node: Reviewing Code Changes", "blue")
    try:
        issues = []
        max_issues = 50
        for dirpath, _, files in os.walk(PROJECT_PATH):
            for fname in files:
                if fname.endswith(('.py', '.ts', '.js', '.tsx')):
                    fpath = os.path.join(dirpath, fname)
                    try:
                        with open(fpath, encoding='utf-8', errors='ignore') as f:
                            for i, line in enumerate(f, 1):
                                if 'TODO' in line or 'FIXME' in line:
                                    issues.append((fpath, i, line.strip()))
                                    if len(issues) >= max_issues:
                                        break
                    except Exception:
                        pass
        if issues:
            print_error(f"Critic found {len(issues)} issues (showing up to {max_issues}):")
            for issue in issues[:max_issues]:
                print_error(f"{issue[0]}:{issue[1]}: {issue[2]}")
            if len(issues) > max_issues:
                print_error(f"...and {len(issues)-max_issues} more issues not shown.")
        else:
            print_info("Critic found no major issues.")
        print_banner("Critic Agent Node Complete!", "blue")
        state['critic_status'] = 'done'
        state['critic_issues'] = issues
        return state
    except Exception as e:
        print_error(f"Critic agent node failed: {e}")
        state['critic_status'] = 'error'
        return state

def ux_agent_node(state):
    print_banner("User Experience Agent Node: Checking UI/UX Files", "green")
    try:
        ui_files = []
        for dirpath, _, files in os.walk(PROJECT_PATH):
            for fname in files:
                if fname.endswith(('.tsx', '.jsx', '.mdx', '.css', '.scss', '.html')):
                    ui_files.append(os.path.join(dirpath, fname))
        print_info(f"Found {len(ui_files)} UI/UX related files.")
        for f in ui_files[:10]:
            print_info(f"UI File: {f}")
        if len(ui_files) > 10:
            print_info(f"...and {len(ui_files)-10} more UI/UX files not shown.")
        print_banner("User Experience Agent Node Complete!", "green")
        state['ux_status'] = 'done'
        state['ux_files'] = ui_files
        return state
    except Exception as e:
        print_error(f"UX agent node failed: {e}")
        state['ux_status'] = 'error'
        return state

# --- LangGraph Coordinator ---
from typing import Dict, Any
def run_langgraph():
    print_banner("Coordinator: Launching LangGraph Multi-Agent Workflow", "cyan")
    graph = StateGraph(AgentState)
    graph.add_node("captain", captain_agent_node)
    graph.add_node("main", main_agent_node)
    graph.add_node("critic", critic_agent_node)
    graph.add_node("ux", ux_agent_node)
    graph.add_node("logger", logger_agent_node)
    graph.add_node("refactor", refactor_agent_node)
    graph.add_node("security", security_agent_node)
    graph.add_node("test", test_agent_node)
    graph.add_node("dependency", dependency_agent_node)
    graph.add_node("documentation", documentation_agent_node)
    graph.add_node("asset", asset_agent_node)
    graph.add_node("performance", performance_agent_node)
    graph.add_node("feedback", feedback_agent_node)

    graph.add_edge("captain", "main")
    graph.add_edge("main", "critic")
    graph.add_edge("critic", "ux")
    graph.add_edge("ux", "logger")
    graph.add_edge("logger", "refactor")
    graph.add_edge("refactor", "security")
    graph.add_edge("security", "test")
    graph.add_edge("test", "dependency")
    graph.add_edge("dependency", "documentation")
    graph.add_edge("documentation", "asset")
    graph.add_edge("asset", "performance")
    graph.add_edge("performance", "feedback")
    graph.add_edge("feedback", END)

    graph.set_entry_point("captain")


    initial_state: AgentState = {}
    # LangSmith tracing is enabled via environment variables (LANGCHAIN_TRACING_V2, LANGCHAIN_API_KEY, LANGCHAIN_PROJECT)
    runnable_graph = graph.compile()
    final_state = runnable_graph.invoke(initial_state)

    print_banner("Coordinator: All Agent Nodes Complete", "cyan")
    print_info(f"Results Summary: {final_state}")

if __name__ == "__main__":
    run_langgraph()
```
