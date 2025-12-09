import json
import urllib.request
import os
from pathlib import Path

# Load environment variables
def load_env():
    env_path = Path(__file__).parent.parent / '.env'
    env_vars = {}
    if env_path.exists():
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars

env = load_env()

# Configuration
ZOTERO_USER_ID = env.get('ZOTERO_USER_ID', '3161450')
ZOTERO_COLLECTION_ID = env.get('ZOTERO_COLLECTION_ID', 'FI8KEUSF')
ZOTERO_API_KEY = env.get('ZOTERO_API_KEY', '')

if not ZOTERO_API_KEY:
    raise ValueError("ZOTERO_API_KEY not found in .env file")

BASE_URL = f"https://api.zotero.org/users/{ZOTERO_USER_ID}/collections/{ZOTERO_COLLECTION_ID}/items/top"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '../src/lib/data/references.json')

def fetch_url(url):
    # Print URL without API key for security
    safe_url = url.split('&key=')[0] if '&key=' in url else url
    print(f"Fetching from {safe_url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        if response.status != 200:
            raise Exception(f"HTTP {response.status}")
        return json.loads(response.read().decode())

def fetch_all_items(format_type):
    """Fetch all items with pagination support."""
    all_items = []
    start = 0
    limit = 100
    
    while True:
        url = f"{BASE_URL}?format={format_type}&limit={limit}&start={start}&key={ZOTERO_API_KEY}"
        items = fetch_url(url)
        
        if isinstance(items, dict):
            items = items.get('items', [])
        
        if not items:
            break
            
        all_items.extend(items)
        print(f"  Retrieved {len(items)} items (total: {len(all_items)})")
        
        if len(items) < limit:
            break
            
        start += limit
    
    return all_items

def fetch_references():
    try:
        # 1. Fetch CSL JSON (all pages)
        print("\nFetching CSL JSON data...")
        csl_data = fetch_all_items('csljson')
        
        # 2. Fetch Zotero JSON (for tags, all pages)
        print("\nFetching Zotero JSON data for tags...")
        zotero_data = fetch_all_items('json')
        
        # Map keys to metadata we need beyond CSL (tags, DOI, URL)
        metadata_map = {}
        for item in zotero_data:
            key = item.get('key')
            data = item.get('data', {})
            # Filter out "Non lu" tags
            tags = [t.get('tag') for t in data.get('tags', []) if t.get('tag') != 'Non lu']
            doi = data.get('DOI')
            url = data.get('url')
            if key:
                metadata_map[key] = {
                    'tags': tags,
                    'doi': doi,
                    'url': url
                }

        # 3. Merge
        cleaned_data = []
        for item in csl_data:
            # CSL ID format for user library: "USERID_KEY" or "USERID/KEY"
            csl_id = item.get('id', '')
            # Handle both formats: split on '/' or '_' and take the last part
            if '/' in csl_id:
                key = csl_id.split('/')[-1]
            elif '_' in csl_id:
                key = csl_id.split('_')[-1]
            else:
                key = csl_id
            
            meta = metadata_map.get(key, {})

            # Inject tags
            item['tags'] = meta.get('tags', [])

            # Inject DOI/URL fallbacks
            doi = meta.get('doi') or item.get('DOI')
            url = meta.get('url') or item.get('URL')

            if doi:
                item['DOI'] = doi
            if url:
                item['URL'] = url
            else:
                # If a DOI exists but URL is missing, build a DOI URL for easier linking later
                if doi:
                    item['URL'] = f"https://doi.org/{doi}"
            
            # Ensure type
            if 'type' not in item:
                item['type'] = 'unknown'
                
            cleaned_data.append(item)

        # Save
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
            
        print(f"Successfully saved {len(cleaned_data)} references with tags to {OUTPUT_FILE}")

    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fetch_references()
