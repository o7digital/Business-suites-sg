"""Provision only the new hotel service on VPS1; never print credentials."""
from pathlib import Path
import secrets
import os

root = Path('/opt/o7/apps/business-suites-sg-olivia36')
assert root.is_dir()
if (root / '.env').exists() or (root / '.env.db').exists():
    raise SystemExit('Existing credentials retained; provisioning not repeated.')
source = {}
for line in Path('/opt/o7/apps/vialterna3-olivia36/.env').read_text().splitlines():
    if '=' in line and not line.lstrip().startswith('#'):
        key, value = line.split('=', 1)
        source[key.strip()] = value.strip().strip('"').strip("'")
assert source.get('OPENAI_API_KEY'), 'The configured Olivia AI provider is required'
password = secrets.token_hex(32)
config = {
    'DATABASE_URL': f'postgresql+psycopg://business_sg:{password}@postgres:5432/business_sg',
    'HOTEL_GATEWAY_KEY': secrets.token_urlsafe(48),
    'EMBEDDING_PROVIDER': 'openai',
    'EMBEDDING_MODEL': source.get('EMBEDDING_MODEL', 'text-embedding-3-small'),
    'EMBEDDING_DIMENSIONS': source.get('EMBEDDING_DIMENSIONS', '1536'),
    'LOCAL_LLM_ENABLED': 'false',
    'CHAT_TIMEOUT_SECONDS': '45',
    'OPENAI_API_KEY': source['OPENAI_API_KEY'],
    'OPENAI_MODEL_BALANCED': source.get('OPENAI_MODEL_BALANCED', 'gpt-5.6-terra'),
}
if source.get('OPENAI_API_URL'):
    config['OPENAI_API_URL'] = source['OPENAI_API_URL']
database = {'POSTGRES_USER': 'business_sg', 'POSTGRES_PASSWORD': password, 'POSTGRES_DB': 'business_sg'}
for name, values in [('.env', config), ('.env.db', database)]:
    path = root / name
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as stream:
        stream.write('\n'.join(f'{key}={value}' for key, value in values.items()) + '\n')
print('Unique hotel gateway and database credentials provisioned; existing AI provider reused server-side.')
