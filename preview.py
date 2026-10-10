"""Python 3.8+ fallback for Windows / macOS / Linux; no third-party packages."""
import argparse
import functools
import http.server
from pathlib import Path
import webbrowser

base = Path(__file__).resolve().parent
root = base / 'dist' if (base / 'dist' / 'index.html').is_file() else base
if not (root / 'index.html').is_file():
    raise SystemExit('index.html not found. Extract the complete project first.')
parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int)
parser.add_argument('--no-open', action='store_true')
args = parser.parse_args()
if args.port is not None and not 1024 <= args.port <= 65535:
    parser.error('Port must be between 1024 and 65535.')

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.mjs': 'text/javascript', '.glb': 'model/gltf-binary'}
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def do_GET(self):
        if self.safe_path(): super().do_GET()
    def do_HEAD(self):
        if self.safe_path(): super().do_HEAD()
    def safe_path(self):
        path = Path(self.translate_path(self.path)).resolve()
        try: rel = path.relative_to(root.resolve())
        except ValueError:
            self.send_error(403); return False
        if any(p.startswith('.') for p in rel.parts):
            self.send_error(403); return False
        return True

handler = functools.partial(Handler, directory=str(root))
ports = [args.port] if args.port is not None else range(8765, 8775)
server = None
for port in ports:
    try: server = http.server.ThreadingHTTPServer(('127.0.0.1', port), handler); break
    except OSError as error:
        if error.errno not in (48, 98, 10048): raise
if server is None:
    raise SystemExit('Preview ports are occupied. Use --port 8800 to select another port.')
url = 'http://127.0.0.1:{}/'.format(server.server_address[1])
print('Local preview: {}\nRoot: {}\nCtrl+C stops the server.'.format(url, root), flush=True)
if not args.no_open: webbrowser.open(url)
try: server.serve_forever()
except KeyboardInterrupt: pass
finally: server.server_close()
