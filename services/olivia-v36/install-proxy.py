"""Add the hotel's gateway prefix after health validation; retain a rollback copy."""
from pathlib import Path
import shutil
import subprocess
import urllib.request

root = Path('/opt/o7/apps/business-suites-sg-olivia36')
config = Path('/opt/o7/mailcow/data/conf/nginx/olivia-private-chat.conf')
backup = Path('/opt/o7/backups/business-suites-sg-olivia36/olivia-private-chat.before.conf')
assert urllib.request.urlopen('http://127.0.0.1:8137/health', timeout=5).status == 200
text = config.read_text()
assert 'server_name olivia.o7digitalgroup.com;' in text
if 'location ^~ /business-suites-sg/' not in text:
    backup.parent.mkdir(parents=True, exist_ok=True)
    assert not backup.exists(), 'Review the retained backup before changing routing again'
    shutil.copy2(config, backup)
    replacement = text.replace('    location / {', (root / 'proxy-location.conf').read_text() + '    location / {', 1)
    assert replacement != text
    config.write_text(replacement)
    result = subprocess.run(['docker', 'exec', 'mailcowdockerized-nginx-mailcow-1', 'nginx', '-t'], capture_output=True, text=True)
    if result.returncode:
        config.write_text(text)
        raise SystemExit('Nginx validation failed; original configuration restored.')
    reload = subprocess.run(['docker', 'exec', 'mailcowdockerized-nginx-mailcow-1', 'nginx', '-s', 'reload'], capture_output=True)
    if reload.returncode:
        config.write_text(text)
        subprocess.run(['docker', 'exec', 'mailcowdockerized-nginx-mailcow-1', 'nginx', '-s', 'reload'], capture_output=True)
        raise SystemExit('Nginx reload failed; original configuration restored.')
print('Hotel prefix installed and Nginx reloaded gracefully; original routes retained.')
